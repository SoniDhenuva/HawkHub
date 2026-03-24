(function () {
  const questionSets = [
    {
      id: "subjects",
      prompt: "Favorite subjects",
      minSelect: 1,
      options: ["math", "science", "coding", "design", "english", "history", "business", "community"]
    },
    {
      id: "activities",
      prompt: "Preferred activities",
      minSelect: 1,
      options: ["build", "compete", "create", "lead", "research", "perform", "mentor", "organize"]
    },
    {
      id: "vibes",
      prompt: "Club vibes",
      minSelect: 1,
      options: ["competitive", "collaborative", "creative", "technical", "social", "academic"]
    }
  ];

  const categoryTagMap = {
    "STEM": ["coding", "math", "science", "build", "research"],
    "Competition": ["compete", "fast-paced", "structured"],
    "Charity/Volunteer": ["community", "impact", "mentor", "lead"],
    "Advocacy/Awareness": ["impact", "community", "lead"],
    "Cultural/Society": ["social", "perform", "community", "create"],
    "Arts": ["design", "create", "perform"],
    "Interest/Sport": ["social", "hands-on", "fast-paced"]
  };

  function inferTagsFromCategories(categories) {
    const inferred = [];

    (categories || []).forEach((category) => {
      const tags = categoryTagMap[category] || [];
      tags.forEach((tag) => {
        if (!inferred.includes(tag)) {
          inferred.push(tag);
        }
      });
    });

    return inferred;
  }

  const schoolClubs = Array.isArray(window.HAWKHUB_SCHOOL_CLUBS) ? window.HAWKHUB_SCHOOL_CLUBS : [];

  const clubs = schoolClubs.length
    ? schoolClubs.map((club) => {
        const categories = Array.isArray(club.categories) ? club.categories : [];
        const fallbackSummary = categories.length
          ? `School club focused on ${categories.join(", ").toLowerCase()}.`
          : "School club profile.";

        return {
          id: club.id || club.name,
          name: club.name,
          summary: club.summary || fallbackSummary,
          tags: Array.isArray(club.tags) && club.tags.length ? club.tags : inferTagsFromCategories(categories),
          href: club.href || "/search",
          image: club.image || "default.png"
        };
      })
    : [
        {
          id: "robotics",
          name: "Robotics",
          summary: "Design, build, and test bots for real competitions.",
          tags: ["coding", "science", "build", "compete", "hands-on", "fast-paced"],
          href: "/search",
          image: "clubs/optix.png"
        }
      ];

  const state = {
    selections: {
      subjects: new Set(),
      activities: new Set(),
      vibes: new Set()
    }
  };

  const elements = {
    questions: document.getElementById("recommendationQuestions"),
    submit: document.getElementById("recommendationSubmit"),
    reset: document.getElementById("recommendationReset"),
    validation: document.getElementById("recommendationValidation"),
    results: document.getElementById("recommendationResults")
  };

  if (!elements.questions || !elements.submit || !elements.reset || !elements.results) {
    return;
  }

  const baseUrl = (window.RECOMMENDATION_BASEURL || "").replace(/\/$/, "");

  function imageSrc(fileName) {
    return `${baseUrl}/images/${fileName}`;
  }

  function buildQuestions() {
    elements.questions.innerHTML = questionSets
      .map((set) => {
        const optionsMarkup = set.options
          .map((option) => {
            const optionId = `${set.id}-${option}`.replace(/[^a-z0-9-]/gi, "-");
            return `
              <label class="recommendation-option" for="${optionId}">
                <input type="checkbox" id="${optionId}" data-group="${set.id}" data-value="${option}">
                <span>${option}</span>
              </label>
            `;
          })
          .join("");

        return `
          <div class="recommendation-question">
            <h3>${set.prompt}</h3>
            <div class="recommendation-options">${optionsMarkup}</div>
          </div>
        `;
      })
      .join("");

    elements.questions.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
      checkbox.addEventListener("change", (event) => {
        const target = event.currentTarget;
        const group = target.dataset.group;
        const value = target.dataset.value;
        const chip = target.closest(".recommendation-option");

        if (!group || !value || !state.selections[group]) {
          return;
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
      });
    });
  }

  function validateSelections() {
    const missing = questionSets.filter((set) => state.selections[set.id].size < set.minSelect);

    if (missing.length) {
      const labels = missing.map((set) => set.prompt.toLowerCase()).join(", ");
      elements.validation.textContent = `Select at least one option for: ${labels}.`;
      return false;
    }

    elements.validation.textContent = "";
    return true;
  }

  function flattenSelections() {
    return Object.values(state.selections).reduce((all, currentSet) => {
      currentSet.forEach((value) => all.push(value));
      return all;
    }, []);
  }

  function scoreClub(selectionVector, club) {
    const weights = {
      subjects: 1.3,
      activities: 1.15,
      vibes: 1
    };

    let score = 0;
    const matchedTags = [];

    selectionVector.forEach((item) => {
      if (club.tags.includes(item)) {
        matchedTags.push(item);

        if (state.selections.subjects.has(item)) {
          score += weights.subjects;
        } else if (state.selections.activities.has(item)) {
          score += weights.activities;
        } else {
          score += weights.vibes;
        }
      }
    });

    score += Math.min(matchedTags.length * 0.18, 0.72);

    return {
      club,
      score,
      matchedTags
    };
  }

  function rankClubs() {
    const selectionVector = flattenSelections();

    return clubs
      .map((club) => scoreClub(selectionVector, club))
      .sort((a, b) => b.score - a.score)
      .map((item, index) => {
        const maxScore = 6.2;
        const confidence = Math.max(35, Math.min(98, Math.round((item.score / maxScore) * 100)));

        return {
          rank: index + 1,
          confidence,
          ...item
        };
      });
  }

  function renderResults() {
    const ranked = rankClubs();
    const best = ranked[0];
    const topList = ranked.slice(0, 5);

    const totalSelected = flattenSelections().length;

    const tags = best.matchedTags
      .slice(0, 6)
      .map((tag) => `<span class="recommendation-tag">${tag}</span>`)
      .join("");

    const topCards = topList
      .map((item) => {
        const matched = item.matchedTags.slice(0, 4).map((tag) => `<span class="recommendation-tag">${tag}</span>`).join("");

        return `
          <article class="recommendation-ranked-card">
            <div class="recommendation-ranked-head">
              <h5>${item.club.name}</h5>
              <span class="recommendation-ranked-rank">Rank #${item.rank}</span>
            </div>
            <div class="recommendation-bar-wrap">
              <div class="recommendation-bar-row">
                <span>Match</span>
                <strong>${item.confidence}%</strong>
              </div>
              <div class="recommendation-bar">
                <div class="recommendation-bar-fill" style="width:${item.confidence}%"></div>
              </div>
            </div>
            <p>${item.club.summary}</p>
            <div class="recommendation-tags">${matched}</div>
          </article>
        `;
      })
      .join("");

    elements.results.innerHTML = `
      <div class="recommendation-result-header">
        <h3>Your Ranked Matches</h3>
        <p>Model run complete using ${totalSelected} selected interests.</p>
      </div>
      <article class="recommendation-top">
        <img class="recommendation-top-image" src="${imageSrc(best.club.image)}" alt="${best.club.name}">
        <div>
          <h4>#1 Match: ${best.club.name}</h4>
          <p>${best.club.summary}</p>
          <div class="recommendation-bar-wrap">
            <div class="recommendation-bar-row">
              <span>Confidence</span>
              <strong>${best.confidence}%</strong>
            </div>
            <div class="recommendation-bar">
              <div class="recommendation-bar-fill" style="width:${best.confidence}%"></div>
            </div>
          </div>
          <p><a class="recommendation-link" href="${best.club.href.startsWith("http") ? best.club.href : `${baseUrl}${best.club.href}`}" ${best.club.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>Explore this club</a></p>
          <div class="recommendation-tags">${tags || ""}</div>
        </div>
      </article>
      <div class="recommendation-rank-grid">${topCards}</div>
    `;
  }

  function resetSurvey() {
    Object.keys(state.selections).forEach((group) => state.selections[group].clear());
    elements.questions.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
      checkbox.checked = false;
      const chip = checkbox.closest(".recommendation-option");
      if (chip) {
        chip.classList.remove("recommendation-option-selected");
      }
    });
    elements.validation.textContent = "";
    elements.results.innerHTML = '<p class="recommendation-placeholder">Run the survey to generate ranked club matches.</p>';
  }

  buildQuestions();

  elements.submit.addEventListener("click", () => {
    if (!validateSelections()) {
      return;
    }
    renderResults();
  });

  elements.reset.addEventListener("click", resetSurvey);
})();