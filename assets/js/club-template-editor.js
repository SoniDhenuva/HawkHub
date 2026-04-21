(function () {
  const STORAGE_KEY = "hawkhub.clubTemplate.v1";
  const JOIN_REQUESTS_KEY = "hawkhub.clubTemplate.joinRequests.v1";

  const defaults = {
    clubName: "Club Name",
    tagline: "Replace this line with a one-sentence pitch for your club.",
    summary: "Write a short overview of what your club does, who it is for, and what new members can expect. Keep it to 3-5 sentences for best readability.",
    members: "42",
    frequency: "Weekly (Fridays)",
    activity: "High during competition season",
    awards: "2 regional placements",
    social1Label: "Instagram",
    social1Url: "#",
    social2Label: "Discord",
    social2Url: "#",
    social3Label: "Website",
    social3Url: "#",
    photo1: "",
    photo2: "",
    photo3: "",
    photo4: "",
    joinUrl: "#",
    joinNote: "Sends a join request for a club admin to approve."
  };

  const form = document.getElementById("club-editor-form");
  const panel = document.getElementById("editor-panel");
  const toggleEditor = document.getElementById("toggle-editor");
  const resetButton = document.getElementById("reset-template");
  const joinLink = document.getElementById("join-link");
  const joinNote = document.getElementById("join-note");

  if (!form || !panel || !toggleEditor || !resetButton || !joinLink) {
    return;
  }

  function getApiConfig() {
    const fallbackJavaURI = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:8585"
      : "https://spring.opencodingsociety.com";

    const fallbackPythonURI = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:8587"
      : "https://flask.opencodingsociety.com";

    return window.clubTemplateApi || {
      javaURI: fallbackJavaURI,
      pythonURI: fallbackPythonURI,
      fetchOptions: {
        method: "GET",
        mode: "cors",
        cache: "default",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Origin": "client"
        }
      }
    };
  }

  function toAbsoluteUrl(value, fallback) {
    const raw = (value || "").trim();
    if (!raw) {
      return fallback || "";
    }

    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) {
      return raw;
    }

    if (raw.startsWith("/")) {
      return `${window.location.origin}${raw}`;
    }

    return `${window.location.origin}/${raw.replace(/^\/+/, "")}`;
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return { ...defaults };
      }

      const parsed = JSON.parse(saved);
      return { ...defaults, ...parsed };
    } catch {
      return { ...defaults };
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function normalizeClubName(name) {
    return (name || "").trim().toLowerCase();
  }

  function loadJoinRequests() {
    try {
      const saved = localStorage.getItem(JOIN_REQUESTS_KEY);
      if (!saved) {
        return {};
      }

      const parsed = JSON.parse(saved);
      if (!parsed || typeof parsed !== "object") {
        return {};
      }

      return parsed;
    } catch {
      return {};
    }
  }

  function saveJoinRequests(requests) {
    localStorage.setItem(JOIN_REQUESTS_KEY, JSON.stringify(requests));
  }

  function hasRequestedJoin(clubName) {
    const key = normalizeClubName(clubName);
    if (!key) {
      return false;
    }

    const requests = loadJoinRequests();
    return requests[key] === true;
  }

  function markJoinRequested(clubName) {
    const key = normalizeClubName(clubName);
    if (!key) {
      return;
    }

    const requests = loadJoinRequests();
    requests[key] = true;
    saveJoinRequests(requests);
  }

  function updateJoinButtonAvailability(clubName) {
    const alreadyRequested = hasRequestedJoin(clubName);
    joinLink.setAttribute("aria-disabled", alreadyRequested ? "true" : "false");
    joinLink.classList.toggle("is-disabled", alreadyRequested);

    if (alreadyRequested) {
      setJoinMessage(`Join request already sent for ${clubName}. Waiting for approval.`);
    }
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  function setLink(id, label, href) {
    const link = document.getElementById(id);
    if (!link) {
      return;
    }

    link.textContent = label || "Link";
    link.href = (href || "#").trim() || "#";
  }

  function setPhoto(id, value) {
    const image = document.getElementById(id);
    if (!image) {
      return;
    }

    const fallback = image.getAttribute("data-default-src") || image.src;
    image.src = toAbsoluteUrl(value, fallback);
  }

  async function getCurrentUsername() {
    const cachedUser = window.user || null;

    if (cachedUser?.uid) {
      return cachedUser.uid;
    }

    if (cachedUser?.name) {
      return cachedUser.name;
    }

    return null;
  }

  function setJoinMessage(message) {
    if (joinNote) {
      joinNote.textContent = message;
    }
  }

  async function requestJoinClub() {
    const { javaURI, fetchOptions } = getApiConfig();
    const currentState = loadState();
    const clubName = (currentState.clubName || defaults.clubName).trim();

    if (!clubName) {
      setJoinMessage("Set a club name before sending a join request.");
      return;
    }

    if (hasRequestedJoin(clubName)) {
      updateJoinButtonAvailability(clubName);
      return;
    }

    const personName = await getCurrentUsername();
    if (!personName) {
      setJoinMessage("Sign in first so we can attach your name to the request.");
      return;
    }

    joinLink.setAttribute("aria-busy", "true");
    joinLink.classList.add("is-loading");
    setJoinMessage("Sending your approval request...");

    try {
      const response = await fetch(`${javaURI}/api/club-memberships`, {
        ...fetchOptions,
        method: "POST",
        body: JSON.stringify({
          personName,
          clubName,
          status: "PENDING"
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      markJoinRequested(clubName);
      updateJoinButtonAvailability(clubName);
      setJoinMessage(`Join request sent for ${clubName}. It is now pending approval.`);
    } catch (error) {
      console.error("Failed to send club join request:", error);
      setJoinMessage("Could not send the join request right now. Please try again.");
    } finally {
      joinLink.removeAttribute("aria-busy");
      joinLink.classList.remove("is-loading");
    }
  }

  function readFormData() {
    const formData = new FormData(form);
    const next = { ...defaults };

    Object.keys(defaults).forEach((key) => {
      const value = formData.get(key);
      next[key] = typeof value === "string" ? value.trim() : defaults[key];
    });

    return next;
  }

  function writeFormData(state) {
    Object.keys(defaults).forEach((key) => {
      if (form.elements[key]) {
        form.elements[key].value = state[key] || "";
      }
    });
  }

  function render(state) {
    const resolvedClubName = state.clubName || defaults.clubName;
    setText("club-name-banner", resolvedClubName.toUpperCase());
    setText("club-title", resolvedClubName);
    setText("club-summary", state.summary || defaults.summary);

    const tagline = document.querySelector(".subtitle");
    if (tagline) {
      tagline.textContent = state.tagline || defaults.tagline;
    }

    setText("club-members", `# of members: ${state.members || defaults.members}`);
    setText("club-frequency", `Meeting frequency: ${state.frequency || defaults.frequency}`);
    setText("club-activity", `Activity level: ${state.activity || defaults.activity}`);
    setText("club-awards", `Awards/Accomplishments: ${state.awards || defaults.awards}`);

    setLink("social-1", state.social1Label || defaults.social1Label, state.social1Url || defaults.social1Url);
    setLink("social-2", state.social2Label || defaults.social2Label, state.social2Url || defaults.social2Url);
    setLink("social-3", state.social3Label || defaults.social3Label, state.social3Url || defaults.social3Url);

    if (joinLink) {
      joinLink.href = (state.joinUrl || defaults.joinUrl).trim() || "#";
    }

    setText("join-note", state.joinNote || defaults.joinNote);

    setPhoto("club-photo-1", state.photo1);
    setPhoto("club-photo-2", state.photo2);
    setPhoto("club-photo-3", state.photo3);
    setPhoto("club-photo-4", state.photo4);

    updateJoinButtonAvailability(resolvedClubName);
  }

  function setEditorOpen(isOpen) {
    panel.hidden = !isOpen;
    toggleEditor.textContent = isOpen ? "Close Editor" : "Edit Info";
  }

  let currentState = loadState();
  writeFormData(currentState);
  render(currentState);
  setEditorOpen(false);

  toggleEditor.addEventListener("click", function () {
    setEditorOpen(panel.hidden);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    currentState = readFormData();
    saveState(currentState);
    render(currentState);
    setEditorOpen(false);
  });

  joinLink.addEventListener("click", function (event) {
    event.preventDefault();
    if (joinLink.getAttribute("aria-disabled") === "true") {
      return;
    }
    requestJoinClub();
  });

  form.elements.clubName.addEventListener("input", function (event) {
    const liveName = event.target.value.trim() || defaults.clubName;
    setText("club-name-banner", liveName.toUpperCase());
    setText("club-title", liveName);
  });

  resetButton.addEventListener("click", function () {
    localStorage.removeItem(STORAGE_KEY);
    currentState = { ...defaults };
    writeFormData(currentState);
    render(currentState);
  });
})();
