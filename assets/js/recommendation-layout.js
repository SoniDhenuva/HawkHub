(function () {
  const questionSets = [
    {
      id: "grade",
      shortLabel: "Grade",
      icon: "✦",
      eyebrow: "Welcome",
      prompt: "What grade are you in?",
      minSelect: 1,
      maxSelect: 1,
      options: [
        { value: "9", label: "9th Grade" },
        { value: "10", label: "10th Grade" },
        { value: "11", label: "11th Grade" },
        { value: "12", label: "12th Grade" }
      ]
    },
    {
      id: "subjects",
      shortLabel: "Topics",
      icon: "⚡",
      eyebrow: "Interest Survey",
      prompt: "What topics do you naturally enjoy?",
      minSelect: 1,
      options: [
        { value: "math", label: "Math / logic" },
        { value: "science", label: "Science / health" },
        { value: "coding", label: "Coding / tech" },
        { value: "design", label: "Design / media" },
        { value: "english", label: "Writing / speaking" },
        { value: "history", label: "History / law" },
        { value: "business", label: "Business / leadership" },
        { value: "community", label: "Community impact" }
      ]
    },
    {
      id: "activities",
      shortLabel: "Activities",
      icon: "☄",
      eyebrow: "Interest Survey",
      prompt: "How do you like spending your time?",
      minSelect: 1,
      options: [
        { value: "build", label: "Building things" },
        { value: "research", label: "Research / analysis" },
        { value: "compete", label: "Competition" },
        { value: "create", label: "Creative projects" },
        { value: "perform", label: "Speaking / performing" },
        { value: "organize", label: "Planning events" },
        { value: "mentor", label: "Mentoring people" },
        { value: "lead", label: "Leading teams" }
      ]
    },
    {
      id: "vibes",
      shortLabel: "Vibe",
      icon: "⬢",
      eyebrow: "Interest Survey",
      prompt: "What kind of club energy fits you?",
      minSelect: 1,
      options: [
        { value: "technical", label: "Technical" },
        { value: "collaborative", label: "Collaborative" },
        { value: "competitive", label: "Competitive" },
        { value: "creative", label: "Creative" },
        { value: "social", label: "Social" },
        { value: "academic", label: "Academic / structured" }
      ]
    },
    {
      id: "commitment",
      shortLabel: "Time",
      icon: "◉",
      eyebrow: "Personalize",
      prompt: "How much time can you commit each week?",
      minSelect: 1,
      maxSelect: 1,
      options: [
        { value: "casual", label: "Casual (1–2 hrs)" },
        { value: "regular", label: "Regular (3–5 hrs)" },
        { value: "intensive", label: "Intensive (6+ hrs)" },
        { value: "flexible", label: "Flexible schedule" }
      ]
    },
    {
      id: "passion",
      shortLabel: "Passion",
      icon: "★",
      eyebrow: "Personalize",
      prompt: "What drives you most? Pick your top motivations.",
      minSelect: 1,
      options: [
        { value: "winning", label: "Winning & competing" },
        { value: "helping", label: "Helping others" },
        { value: "making", label: "Building & creating" },
        { value: "learning", label: "Learning & research" },
        { value: "expressing", label: "Performing & expressing" },
        { value: "leading", label: "Leading teams" }
      ]
    }
  ];

  const COMMITMENT_VIBE_MAP = {
    casual: ['social'],
    regular: ['collaborative'],
    intensive: ['competitive', 'technical'],
    flexible: ['collaborative'],
  };

  const PASSION_ACTIVITY_MAP = {
    winning: ['compete'],
    helping: ['mentor'],
    making: ['build', 'create'],
    learning: ['research'],
    expressing: ['perform'],
    leading: ['lead', 'organize'],
  };

  const state = {
    selections: {
      grade: new Set(),
      subjects: new Set(),
      activities: new Set(),
      vibes: new Set(),
      commitment: new Set(),
      passion: new Set()
    },
    currentStep: 0
  };

  const elements = {
    survey: document.getElementById("recommendationSurvey"),
    questions: document.getElementById("recommendationQuestions"),
    stepLabel: document.getElementById("recommendationStepLabel"),
    stepEyebrow: document.getElementById("recommendationStepEyebrow"),
    stepCounter: document.getElementById("recommendationStepCounter"),
    stepPrompt: document.getElementById("recommendationStepPrompt"),
    stepIcons: document.getElementById("recommendationStepIcons"),
    progressSteps: document.getElementById("recommendationProgressSteps"),
    back: document.getElementById("recommendationBack"),
    next: document.getElementById("recommendationNext"),
    submit: document.getElementById("recommendationSubmit"),
    reset: document.getElementById("recommendationReset"),
    validation: document.getElementById("recommendationValidation"),
    results: document.getElementById("recommendationResults")
  };

  if (
    !elements.survey
    || !elements.questions
    || !elements.stepLabel
    || !elements.stepEyebrow
    || !elements.stepCounter
    || !elements.stepPrompt
    || !elements.stepIcons
    || !elements.progressSteps
    || !elements.back
    || !elements.next
    || !elements.submit
    || !elements.reset
    || !elements.validation
    || !elements.results
  ) {
    return;
  }

  const backendUrl = (window.RECOMMENDATION_BACKEND_URL || "http://127.0.0.1:8587").replace(/\/$/, "");
  const baseUrl = (window.RECOMMENDATION_BASEURL || "").replace(/\/$/, "");

  let isSubmitting = false;

  function attachOptionHandlers() {
    elements.questions.querySelectorAll("input").forEach((input) => {
      input.addEventListener("change", (event) => {
        const target = event.currentTarget;
        const group = target.dataset.group;
        const value = target.dataset.value;
        const chip = target.closest(".recommendation-option");
        const currentQuestion = questionSets.find((set) => set.id === group);

        if (!group || !value || !state.selections[group]) {
          return;
        }

        if (currentQuestion && currentQuestion.maxSelect === 1) {
          state.selections[group].clear();
          elements.questions.querySelectorAll(`input[data-group='${group}']`).forEach((choice) => {
            const optionChip = choice.closest(".recommendation-option");
            if (optionChip) {
              optionChip.classList.remove("recommendation-option-selected");
            }
          });
        }

        if (target.checked) {
          state.selections[group].add(value);
          if (chip) {
            chip.classList.add("recommendation-option-selected");
          }
        } else {
          state.selections[group].delete(value);
          if (chip) {
            chip.classList.remove("recommendation-option-selected");
          }
        }

        elements.validation.textContent = "";
      });
    });
  }

  function renderStepIcons() {
    elements.stepIcons.innerHTML = questionSets
      .map((set, index) => {
        const isActive = index === state.currentStep;
        const isComplete = index < state.currentStep;
        const classes = ["recsys-step-icon"];

        if (isActive) {
          classes.push("is-active");
        } else if (isComplete) {
          classes.push("is-complete");
        }

        return `
          <div class="${classes.join(" ")}" aria-label="${set.shortLabel}">
            <span>${set.icon}</span>
          </div>
        `;
      })
      .join("");
  }

  function renderProgressSteps() {
    elements.progressSteps.innerHTML = questionSets
      .map((set, index) => {
        const classes = ["recsys-progress-step"];

        if (index < state.currentStep) {
          classes.push("is-complete");
        } else if (index === state.currentStep) {
          classes.push("is-active");
        }

        return `<span class="${classes.join(" ")}" aria-label="${set.shortLabel}"></span>`;
      })
      .join("");
  }

  function renderCurrentStep() {
    const set = questionSets[state.currentStep];
    const stepNumber = state.currentStep + 1;
    const selectedValues = state.selections[set.id];
    const inputType = set.maxSelect === 1 ? "radio" : "checkbox";
    const optionsMarkup = set.options
      .map((option) => {
        const value = typeof option === "string" ? option : option.value;
        const label = typeof option === "string" ? option : option.label;
        const optionId = `${set.id}-${value}`.replace(/[^a-z0-9-]/gi, "-");
        const selectedClass = selectedValues.has(value) ? " recommendation-option-selected" : "";
        const checked = selectedValues.has(value) ? " checked" : "";

        return `
          <label class="recommendation-option${selectedClass}" for="${optionId}">
            <input type="${inputType}" name="${set.id}" id="${optionId}" data-group="${set.id}" data-value="${value}"${checked}>
            <span>${label}</span>
          </label>
        `;
      })
      .join("");

    elements.stepLabel.textContent = `Step ${stepNumber} of ${questionSets.length}`;
    elements.stepEyebrow.textContent = set.eyebrow || "Interest Survey";
    elements.stepCounter.textContent = `Step ${stepNumber} of ${questionSets.length}`;
    elements.stepPrompt.textContent = set.prompt;
    elements.questions.dataset.step = set.id;
    elements.questions.innerHTML = `
      <div class="recommendation-question">
        <div class="recommendation-options">${optionsMarkup}</div>
      </div>
    `;

    attachOptionHandlers();
    renderStepIcons();
    renderProgressSteps();
    updateActionState();
  }

  function showSurvey() {
    elements.survey.classList.remove("is-hidden");
    elements.results.classList.add("is-empty");
  }

  function showResults() {
    elements.survey.classList.add("is-hidden");
    elements.results.classList.remove("is-empty");
    elements.results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function validateStep(stepIndex = state.currentStep) {
    const set = questionSets[stepIndex];

    if (state.selections[set.id].size < set.minSelect) {
      elements.validation.textContent = `Choose at least ${set.minSelect} option for this step before moving on.`;
      return false;
    }

    elements.validation.textContent = "";
    return true;
  }

  function validateSelections() {
    const missing = questionSets.find((set) => state.selections[set.id].size < set.minSelect);

    if (!missing) {
      elements.validation.textContent = "";
      return true;
    }

    state.currentStep = questionSets.findIndex((set) => set.id === missing.id);
    renderCurrentStep();
    elements.validation.textContent = `Choose at least ${missing.minSelect} option for this step before getting recommendations.`;
    return false;
  }

  function updateActionState() {
    const atFirstStep = state.currentStep === 0;
    const atLastStep = state.currentStep === questionSets.length - 1;

    elements.back.disabled = atFirstStep;
    elements.next.hidden = atLastStep;
    elements.submit.hidden = !atLastStep;
    elements.next.textContent = state.currentStep === 0 ? "Get Started" : "Next";
  }

  function flattenSelections() {
    return ["subjects", "activities", "vibes"].reduce((all, key) => {
      state.selections[key].forEach((value) => all.push(value));
      return all;
    }, []);
  }

  function renderResults(data) {
    if (!data.recommendations || data.recommendations.length === 0) {
      elements.results.innerHTML = '<p class="recsys-placeholder">No club recommendations available from backend.</p>';
      showResults();
      return;
    }

    const best = data.recommendations[0];
    const topList = data.recommendations.slice(0, 5);

    const tags = best.matched_tags
      .slice(0, 6)
      .map((tag) => `<span class="recommendation-tag">${tag}</span>`)
      .join("");

    const topCards = topList
      .map((item) => {
        const matched = item.matched_tags
          .slice(0, 4)
          .map((tag) => `<span class="recommendation-tag">${tag}</span>`)
          .join("");

        return `
          <article class="recommendation-ranked-card">
            <div class="recommendation-ranked-head">
              <h5>${item.club_name}</h5>
              <span class="recommendation-ranked-rank">Rank #${item.rank}</span>
            </div>
            <div class="recommendation-bar-wrap">
              <div class="recommendation-bar-row">
                <span>Match</span>
                <strong>${item.match_percentage}%</strong>
              </div>
              <div class="recommendation-bar">
                <div class="recommendation-bar-fill" style="width:${item.match_percentage}%"></div>
              </div>
            </div>
            <p>${item.summary}</p>
            <div class="recommendation-tags">${matched}</div>
          </article>
        `;
      })
      .join("");

    elements.results.innerHTML = `
      <div class="recommendation-result-header">
        <div>
          <p class="recsys-step-label">Results Ready</p>
          <h3>Your best club matches</h3>
          <p>Backend model complete. Saved to your profile.</p>
        </div>
        <button id="recommendationRetake" type="button" class="recsys-button">Retake Survey</button>
      </div>
      <article class="recommendation-top">
        <img class="recommendation-top-image" src="${baseUrl}/images/${best.image_filename || 'clubs/default.png'}" alt="${best.club_name}">
        <div class="recommendation-top-copy">
          <p class="recsys-step-label">Top Match</p>
          <h4>${best.club_name}</h4>
          <p>${best.summary}</p>
          <div class="recommendation-bar-wrap">
            <div class="recommendation-bar-row">
              <span>Confidence</span>
              <strong>${best.match_percentage}%</strong>
            </div>
            <div class="recommendation-bar">
              <div class="recommendation-bar-fill" style="width:${best.match_percentage}%"></div>
            </div>
          </div>
          <p><a class="recommendation-link" href="${best.href.startsWith("http") ? best.href : `${baseUrl}${best.href}`}" ${best.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>Explore this club</a></p>
          <div class="recommendation-tags">${tags}</div>
        </div>
      </article>
      <div class="recommendation-rank-grid">${topCards}</div>
    `;

    const retakeButton = document.getElementById("recommendationRetake");
    if (retakeButton) {
      retakeButton.addEventListener("click", resetSurvey);
    }

    showResults();
  }

  function postToBackend() {
    if (isSubmitting) return;
    isSubmitting = true;
    elements.submit.disabled = true;
    elements.submit.textContent = "Sending...";

    const username = localStorage.getItem("hawkhub_username") || prompt("Enter your username to save recommendations:");
    if (!username) {
      isSubmitting = false;
      elements.submit.disabled = false;
      elements.submit.textContent = "Get Recommendations";
      return;
    }

    localStorage.setItem("hawkhub_username", username);

    // Merge commitment → vibes and passion → activities
    const mergedVibes = new Set([...state.selections.vibes]);
    for (const c of state.selections.commitment) {
      (COMMITMENT_VIBE_MAP[c] || []).forEach((v) => mergedVibes.add(v));
    }
    const mergedActivities = new Set([...state.selections.activities]);
    for (const p of state.selections.passion) {
      (PASSION_ACTIVITY_MAP[p] || []).forEach((a) => mergedActivities.add(a));
    }

    const payload = {
      username: username,
      grade: Array.from(state.selections.grade)[0] || "",
      subjects: Array.from(state.selections.subjects),
      activities: Array.from(mergedActivities),
      vibes: Array.from(mergedVibes)
    };

    fetch(`${backendUrl}/api/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`Backend error: ${resp.status}`);
        }
        return resp.json();
      })
      .then((data) => {
        // Cache in localStorage so the home page can show the recommended row instantly
        if (data.recommendations && data.recommendations.length > 0) {
          try {
            localStorage.setItem("hawkhub_recommendations", JSON.stringify(data.recommendations));
          } catch {}

          // Backup to Spring (best-effort, no retry)
          const javaUrl = (window.RECOMMENDATION_JAVA_URL || "").replace(/\/$/, "");
          if (javaUrl) {
            fetch(`${javaUrl}/api/recommendations`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ recommendations: data.recommendations })
            }).catch(() => {});
          }
        }
        renderResults(data);
      })
      .catch((err) => {
        console.error("Backend POST failed:", err);
        elements.results.innerHTML = `<p class="recsys-placeholder">Error fetching recommendations. Ensure backend is running at ${backendUrl}</p>`;
        showResults();
      })
      .finally(() => {
        isSubmitting = false;
        elements.submit.disabled = false;
        elements.submit.textContent = "Get Recommendations";
      });
  }

  function resetSurvey() {
    Object.keys(state.selections).forEach((group) => state.selections[group].clear());
    state.currentStep = 0;
    elements.validation.textContent = "";
    elements.results.classList.add("is-empty");
    elements.results.innerHTML = '<p class="recsys-placeholder">Run the survey to generate ranked club matches.</p>';
    localStorage.removeItem("hawkhub_recommendations");
    showSurvey();
    renderCurrentStep();
  }

  renderCurrentStep();

  elements.back.addEventListener("click", () => {
    if (state.currentStep === 0) {
      return;
    }

    state.currentStep -= 1;
    elements.validation.textContent = "";
    renderCurrentStep();
  });

  elements.next.addEventListener("click", () => {
    if (!validateStep()) {
      return;
    }

    if (state.currentStep < questionSets.length - 1) {
      state.currentStep += 1;
      renderCurrentStep();
    }
  });

  elements.submit.addEventListener("click", () => {
    if (!validateSelections()) {
      return;
    }

    postToBackend();
  });

  elements.reset.addEventListener("click", resetSurvey);
})();
