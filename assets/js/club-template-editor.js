(async function () {
  const defaults = {
    clubId: "",
    clubName: "Club Name",
    tagline: "Replace this line with a one-sentence pitch for your club.",
    summary: "Write a short overview of what your club does, who it is for, and what new members can expect. Keep it to 3-5 sentences for best readability.",
    primaryCategory: "All Clubs",
    secondaryCategories: "",
    tags: "",
    imageAlt: "Club image",
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
  const editorStatus = document.getElementById("editor-status");

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
      baseurl: "",
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

  function getSiteUrlPrefix() {
    const { baseurl = "" } = getApiConfig();
    const normalizedBaseurl = String(baseurl || "").trim().replace(/\/$/, "");
    return normalizedBaseurl ? `${window.location.origin}${normalizedBaseurl}` : window.location.origin;
  }

  function buildUrl(path) {
    const rawPath = String(path || "").replace(/^\/+/, "");
    return `${getSiteUrlPrefix()}/${rawPath}`;
  }

  function resolveHref(value, fallback) {
    const raw = String(value || "").trim();
    if (!raw) {
      return fallback || "#";
    }

    if (raw.startsWith("#")) {
      return raw;
    }

    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:") || raw.startsWith("mailto:") || raw.startsWith("tel:")) {
      return raw;
    }

    return buildUrl(raw);
  }

  function resolveImageUrl(value, fallback) {
    return resolveHref(value, fallback || "");
  }

  function slugify(value) {
    const cleaned = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return cleaned || "club";
  }

  function splitList(value) {
    return String(value || "")
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function uniqueList(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function normalizeClubName(name) {
    return String(name || "").trim().toLowerCase();
  }

  function getCurrentClubId() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("id") || "").trim();
  }

  function setStatus(message, isError = false) {
    if (!editorStatus) {
      return;
    }

    editorStatus.textContent = message;
    editorStatus.classList.toggle("is-error", Boolean(isError));
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
    link.href = resolveHref(href, "#");
  }

  function setPhoto(id, value) {
    const image = document.getElementById(id);
    if (!image) {
      return;
    }

    const fallback = image.getAttribute("data-default-src") || image.src;
    image.src = resolveImageUrl(value, fallback);
  }

  function loadJoinRequests() {
    try {
      const saved = localStorage.getItem("hawkhub.clubTemplate.joinRequests.v1");
      if (!saved) {
        return {};
      }

      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveJoinRequests(requests) {
    localStorage.setItem("hawkhub.clubTemplate.joinRequests.v1", JSON.stringify(requests));
  }

  function hasRequestedJoin(clubName) {
    const key = normalizeClubName(clubName);
    if (!key) {
      return false;
    }

    return loadJoinRequests()[key] === true;
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

  function setJoinMessage(message) {
    if (joinNote) {
      joinNote.textContent = message;
    }
  }

  function updateJoinButtonAvailability(clubName) {
    const alreadyRequested = hasRequestedJoin(clubName);
    joinLink.setAttribute("aria-disabled", alreadyRequested ? "true" : "false");
    joinLink.classList.toggle("is-disabled", alreadyRequested);

    if (alreadyRequested) {
      setJoinMessage(`Join request already sent for ${clubName}. Waiting for approval.`);
    }
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

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
      ...getApiConfig().fetchOptions,
      ...options
    });

    const contentType = response.headers.get("content-type") || "";
    let data = null;

    if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      try {
        data = await response.text();
      } catch {
        data = null;
      }
    }

    return { response, data };
  }

  function normalizeClubRecord(club) {
    const categories = Array.isArray(club?.categories)
      ? club.categories.map((value) => String(value).trim()).filter(Boolean)
      : splitList(club?.categories);
    const tags = Array.isArray(club?.tags)
      ? club.tags.map((value) => String(value).trim()).filter(Boolean)
      : splitList(club?.tags);
    const clubName = String(club?.clubName || club?.name || club?.home_label || defaults.clubName).trim();
    const clubId = String(club?.id || club?.slug || slugify(clubName)).trim();

    return {
      ...defaults,
      clubId,
      clubName,
      tagline: String(club?.tagline || club?.summary || defaults.tagline).trim(),
      summary: String(club?.summary || defaults.summary).trim(),
      members: String(club?.members || club?.memberCount || club?.member_count || defaults.members).trim(),
      frequency: String(club?.frequency || defaults.frequency).trim(),
      activity: String(club?.activity || defaults.activity).trim(),
      awards: String(club?.awards || defaults.awards).trim(),
      social1Label: String(club?.social1Label || defaults.social1Label).trim(),
      social1Url: String(club?.social1Url || defaults.social1Url).trim(),
      social2Label: String(club?.social2Label || defaults.social2Label).trim(),
      social2Url: String(club?.social2Url || defaults.social2Url).trim(),
      social3Label: String(club?.social3Label || defaults.social3Label).trim(),
      social3Url: String(club?.social3Url || defaults.social3Url).trim(),
      photo1: String(club?.photo1 || club?.image || "").trim(),
      photo2: String(club?.photo2 || "").trim(),
      photo3: String(club?.photo3 || "").trim(),
      photo4: String(club?.photo4 || "").trim(),
      joinUrl: String(club?.joinUrl || defaults.joinUrl).trim() || defaults.joinUrl,
      joinNote: String(club?.joinNote || defaults.joinNote).trim(),
      primaryCategory: String(club?.primaryCategory || categories[0] || "All Clubs").trim(),
      secondaryCategories: categories.slice(1).join(", "),
      tags: tags.join(", "),
      imageAlt: String(club?.image_alt || club?.imageAlt || clubName).trim()
    };
  }

  async function loadState() {
    const clubId = getCurrentClubId();
    const { javaURI } = getApiConfig();

    if (!clubId) {
      return { ...defaults };
    }

    try {
      const direct = await fetchJson(`${javaURI}/api/clubs/${encodeURIComponent(clubId)}`);
      if (direct.response.ok && direct.data) {
        return normalizeClubRecord(direct.data);
      }
    } catch (error) {
      console.warn("Direct club fetch failed:", error);
    }

    try {
      const list = await fetchJson(`${javaURI}/api/clubs`);
      if (list.response.ok && Array.isArray(list.data)) {
        const club = list.data.find((item) => {
          const itemId = String(item?.id || item?.slug || "").trim();
          const itemName = normalizeClubName(item?.name || item?.home_label || "");
          return itemId === clubId || itemName === normalizeClubName(clubId);
        });

        if (club) {
          return normalizeClubRecord(club);
        }
      }
    } catch (error) {
      console.warn("Club list fetch failed:", error);
    }

    return {
      ...defaults,
      clubId
    };
  }

  function writeFormData(state) {
    Object.keys(defaults).forEach((key) => {
      if (form.elements[key]) {
        form.elements[key].value = state[key] || "";
      }
    });
  }

  function readFormData() {
    const formData = new FormData(form);
    const next = { ...defaults };

    Object.keys(defaults).forEach((key) => {
      const value = formData.get(key);
      next[key] = typeof value === "string" ? value.trim() : defaults[key];
    });

    next.clubId = (next.clubId || getCurrentClubId() || "").trim();
    return next;
  }

  function buildPayload(state) {
    const clubName = String(state.clubName || "").trim();
    const clubId = state.clubId || slugify(clubName);
    const primaryCategory = String(state.primaryCategory || "").trim();
    const categories = uniqueList([primaryCategory, ...splitList(state.secondaryCategories)]).filter(Boolean);

    if (categories.length === 0) {
      categories.push("All Clubs");
    }

    const tags = uniqueList(splitList(state.tags));
    const image = [state.photo1, state.photo2, state.photo3, state.photo4]
      .map((value) => String(value || "").trim())
      .find(Boolean) || "";
    const editUrl = `${getSiteUrlPrefix()}/club-template/?id=${encodeURIComponent(clubId)}`;

    return {
      id: clubId,
      slug: clubId,
      clubId,
      name: clubName,
      home_label: clubName,
      tagline: String(state.tagline || "").trim(),
      summary: String(state.summary || "").trim(),
      members: String(state.members || "").trim(),
      frequency: String(state.frequency || "").trim(),
      activity: String(state.activity || "").trim(),
      awards: String(state.awards || "").trim(),
      social1Label: String(state.social1Label || "").trim(),
      social1Url: String(state.social1Url || "").trim(),
      social2Label: String(state.social2Label || "").trim(),
      social2Url: String(state.social2Url || "").trim(),
      social3Label: String(state.social3Label || "").trim(),
      social3Url: String(state.social3Url || "").trim(),
      image,
      image_alt: String(state.imageAlt || clubName).trim(),
      href: editUrl,
      joinUrl: String(state.joinUrl || defaults.joinUrl).trim(),
      joinNote: String(state.joinNote || defaults.joinNote).trim(),
      categories,
      primaryCategory,
      secondaryCategories: categories.slice(1),
      tags,
      alt: false
    };
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

    joinLink.href = resolveHref(state.joinUrl || defaults.joinUrl, "#");
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

  async function saveClubToBackend(state) {
    const clubName = String(state.clubName || "").trim();

    if (!clubName || normalizeClubName(clubName) === normalizeClubName(defaults.clubName)) {
      setStatus("Enter a real club name before saving.", true);
      return null;
    }

    const { javaURI } = getApiConfig();
    const payload = buildPayload(state);
    const isUpdate = Boolean(state.clubId);
    const endpoint = isUpdate
      ? `${javaURI}/api/clubs/${encodeURIComponent(payload.id)}`
      : `${javaURI}/api/clubs`;

    setStatus(isUpdate ? "Updating club in the backend..." : "Creating club in the backend...");

    const { response, data } = await fetchJson(endpoint, {
      method: isUpdate ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = typeof data === "string" && data.trim() ? data : `status ${response.status}`;
      throw new Error(`Club save failed with ${errorText}`);
    }

    const savedRecord = data && typeof data === "object" ? data : payload;
    return normalizeClubRecord(savedRecord);
  }

  async function requestJoinClub(currentState) {
    const { javaURI, fetchOptions } = getApiConfig();
    const clubName = String(currentState.clubName || defaults.clubName).trim();

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
      const { response } = await fetchJson(`${javaURI}/api/club-memberships`, {
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

  let currentState = await loadState();
  writeFormData(currentState);
  render(currentState);
  setEditorOpen(false);
  setStatus(currentState.clubId ? `Loaded ${currentState.clubName} from the backend.` : "Create a new club and save it to the backend.");

  toggleEditor.addEventListener("click", function () {
    setEditorOpen(panel.hidden);
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    try {
      const draft = readFormData();
      const savedState = await saveClubToBackend(draft);
      if (!savedState) {
        return;
      }

      currentState = savedState;
      writeFormData(currentState);
      render(currentState);

      if (currentState.clubId) {
        window.history.replaceState({}, "", `${window.location.pathname}?id=${encodeURIComponent(currentState.clubId)}`);
      }

      setEditorOpen(false);
      setStatus(`Saved ${currentState.clubName} to the backend.`);
    } catch (error) {
      console.error("Failed to save club:", error);
      setStatus("Could not save the club right now. Please try again.", true);
    }
  });

  joinLink.addEventListener("click", function (event) {
    event.preventDefault();
    if (joinLink.getAttribute("aria-disabled") === "true") {
      return;
    }

    requestJoinClub(currentState);
  });

  form.elements.clubName.addEventListener("input", function (event) {
    const liveName = event.target.value.trim() || defaults.clubName;
    setText("club-name-banner", liveName.toUpperCase());
    setText("club-title", liveName);
  });

  resetButton.addEventListener("click", function () {
    currentState = { ...defaults };
    writeFormData(currentState);
    render(currentState);
    window.history.replaceState({}, "", window.location.pathname);
    setEditorOpen(true);
    setStatus("Reset the form to a new-club draft.");
  });
})();