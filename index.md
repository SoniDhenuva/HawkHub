---
layout: page
title: Home
permalink: /
search_exclude: true
---

<section id="logged-out-home">
  <div class="welcome-center">
    <div class="welcome-panel">
      <p class="welcome-overline">WELCOME TO</p>
      <h1 class="welcome-title">
        <span class="welcome-hawk">HAWK</span>
        <span class="welcome-hub">Hub</span>
      </h1>
      <p class="welcome-tagline">Find your Flock.</p>
    </div>
  </div>
</section>

<section id="logged-in-home" class="home-shell">
  <aside class="home-sidebar">
    <h2>MENU</h2>

    <div class="home-nav-group">
      <p class="home-nav-label">NAVIGATE</p>
      <a class="home-nav-link is-active" href="{{site.baseurl}}/">CLUBS</a>
      <a class="home-nav-link" href="{{site.baseurl}}/student/club-feed">FEED</a>
      <a class="home-nav-link" href="{{site.baseurl}}/profile">CALENDAR</a>
    </div>

    <div class="home-nav-group">
      <p class="home-nav-label">PERSONAL</p>
      <a class="home-nav-link" href="{{site.baseurl}}/recommendations">RECOMMENDATIONS</a>
      <a class="home-nav-link" href="{{site.baseurl}}/profile">YOUR CLUBS</a>
    </div>

    <a class="home-new-club" href="{{site.baseurl}}/club-template">+ NEW CLUB</a>
  </aside>

  <main class="home-main">
    <section id="rec-section" style="display:none">
      <div class="club-divider"><span>// RECOMMENDED FOR YOU</span></div>
      <div id="recGrid" class="club-grid rec-grid"></div>
    </section>

    <div class="home-main-header">
      <h3 class="home-main-title"><span class="home-title-dot"></span> ALL CLUBS</h3>
      <div class="home-filter-bar" role="group" aria-label="Filter clubs">
        <button type="button" class="filter-chip is-active" data-filter="ALL">All Clubs</button>
        <button type="button" class="filter-chip" data-filter="Advocacy/Awareness">Advocacy/Awareness</button>
        <button type="button" class="filter-chip" data-filter="STEM">STEM</button>
        <button type="button" class="filter-chip" data-filter="Charity/Volunteer">Charity/Volunteer</button>
        <button type="button" class="filter-chip" data-filter="Arts">Arts</button>
        <button type="button" class="filter-chip" data-filter="Competition">Competition</button>
        <button type="button" class="filter-chip" data-filter="Cultural/Society">Cultural/Society</button>
        <button type="button" class="filter-chip" data-filter="Interest/Sport">Interest/Sport</button>
      </div>
    </div>

    <div class="club-grid club-grid-primary"></div>

    <div class="club-divider"><span>// MORE CLUBS</span></div>

    <div class="club-grid club-grid-more"></div>

    <div id="no-clubs" class="no-clubs-msg">No clubs in this category yet!</div>
  </main>
</section>

<script type="module">
  import { pythonURI, javaURI, fetchOptions } from "{{site.baseurl}}/assets/js/api/config.js";

  const loggedOutHome = document.getElementById("logged-out-home");
  const loggedInHome = document.getElementById("logged-in-home");
  const primaryGrid = document.querySelector(".club-grid-primary");
  const moreGrid = document.querySelector(".club-grid-more");
  const clubDivider = document.querySelector(".club-divider");
  const noClubsMsg = document.getElementById("no-clubs");
  const fallbackClubs = {{ site.data.school_clubs | jsonify }};
  let clubCards = [];

  async function isLoggedIn() {
    if (localStorage.getItem('forceLoggedOut') === '1') {
      return false;
    }

    const [flaskRes, springRes] = await Promise.allSettled([
      fetch(`${pythonURI}/api/id`, fetchOptions)
        .then(r => { if (!r.ok) throw new Error('flask auth failed'); return r.json(); })
        .then(data => Boolean(data && (data.uid || data.name))),
      fetch(`${javaURI}/api/person/get`, fetchOptions)
        .then(r => { if (!r.ok) throw new Error('spring auth failed'); return r.json(); })
        .then(data => Boolean(data && (data.uid || data.name))),
    ]);

    const flaskOk  = flaskRes.status  === 'fulfilled' && flaskRes.value  === true;
    const springOk = springRes.status === 'fulfilled' && springRes.value === true;
    return flaskOk || springOk;
  }

  function normalizeClub(club, index) {
    const categories = Array.isArray(club?.categories)
      ? club.categories.map((value) => String(value).trim()).filter(Boolean)
      : [];
    const name = String(club?.name || club?.home_label || `Club ${index + 1}`).trim();
    const image = String(club?.image || "").trim();
    const memberCount = club?.members ?? club?.memberCount ?? club?.member_count ?? null;

    return {
      id: club?.id ?? club?.slug ?? `club-${index + 1}`,
      name,
      categories,
      image,
      imageAlt: String(club?.image_alt || name).trim(),
      membersText: memberCount !== null && String(memberCount).trim() !== ""
        ? `${memberCount} members`
        : (categories.length ? `${categories.length} categories` : "No categories"),
    };
  }

  function imageToUrl(image) {
    const value = String(image || "").trim();
    if (!value) {
      return "{{site.baseurl}}/images/default.png";
    }

    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
      return value;
    }

    const cleanValue = value.replace(/^\/+/, "");
    if (cleanValue.startsWith("images/")) {
      return `{{site.baseurl}}/${cleanValue}`;
    }

    return `{{site.baseurl}}/images/${cleanValue}`;
  }

  function createClubCard(club, index, isFeatured = false, matchPercent = null) {
    const card = document.createElement("a");
    card.className = `club-card${isFeatured ? " is-featured" : ""}`;
    const rawHref = String(club.href || "").trim();
    if (rawHref && rawHref !== "/search") {
      card.href = rawHref.startsWith("/") ? `{{site.baseurl}}${rawHref}` : rawHref;
    } else {
      card.href = `${"{{site.baseurl}}/club-template/"}${club.id ? `?id=${encodeURIComponent(String(club.id))}` : ""}`;
    }
    card.dataset.category = club.categories.join(",");

    if (isFeatured) {
      const badge = document.createElement("span");
      badge.className = "club-active-badge";
      badge.textContent = "ACTIVE";
      card.appendChild(badge);
    }

    if (matchPercent !== null) {
      const badge = document.createElement("span");
      badge.className = "club-match-badge";
      badge.textContent = `${matchPercent}% MATCH`;
      card.appendChild(badge);
    }

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    const img = document.createElement("img");
    img.src = imageToUrl(club.image);
    img.alt = club.imageAlt;
    thumb.appendChild(img);

    const overlay = document.createElement("div");
    overlay.className = "club-overlay";

    const titleRow = document.createElement("div");
    titleRow.className = "club-title-row";
    const name = document.createElement("span");
    name.className = "club-name";
    name.textContent = club.name;
    const kind = document.createElement("span");
    kind.className = "club-kind";
    kind.textContent = (club.categories[0] || "Club").toUpperCase();
    titleRow.appendChild(name);
    titleRow.appendChild(kind);

    const metaRow = document.createElement("div");
    metaRow.className = "club-meta-row";
    const firstMeta = document.createElement("span");
    firstMeta.textContent = club.membersText;
    const secondMeta = document.createElement("span");
    secondMeta.textContent = isFeatured ? "FEATURED CLUB" : (club.categories[1] || "OPEN TO JOIN").toUpperCase();
    metaRow.appendChild(firstMeta);
    metaRow.appendChild(secondMeta);

    overlay.appendChild(titleRow);
    overlay.appendChild(metaRow);

    card.appendChild(thumb);
    card.appendChild(overlay);
    return card;
  }

  function renderClubs(clubs) {
    const normalized = clubs.map(normalizeClub);
    const primaryClubs = normalized.slice(0, 3);
    const moreClubs = normalized.slice(3);

    primaryGrid.innerHTML = "";
    moreGrid.innerHTML = "";

    primaryClubs.forEach((club, index) => {
      primaryGrid.appendChild(createClubCard(club, index, index === 0));
    });

    moreClubs.forEach((club, index) => {
      moreGrid.appendChild(createClubCard(club, index + 3, false));
    });

    clubCards = Array.from(document.querySelectorAll(".club-card"));
    if (clubDivider) {
      clubDivider.style.display = clubCards.length > 3 ? "flex" : "none";
    }

    if (noClubsMsg) {
      noClubsMsg.style.display = clubCards.length === 0 ? "block" : "none";
    }
  }

  async function loadClubs() {
    try {
      const response = await fetch(`${javaURI}/api/clubs`, fetchOptions);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return Array.isArray(fallbackClubs) ? fallbackClubs : [];
    }
  }

  async function loadRecommendedClubs() {
    // 1. Try localStorage (instant — set after completing the survey)
    try {
      const cached = localStorage.getItem("hawkhub_recommendations");
      if (cached) {
        const recs = JSON.parse(cached);
        if (Array.isArray(recs) && recs.length > 0) return recs;
      }
    } catch {}

    const username = localStorage.getItem("hawkhub_username");
    if (!username) return [];

    // 2. Try Flask
    try {
      const r = await fetch(`${pythonURI}/api/recommendations/${username}`, fetchOptions);
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
          localStorage.setItem("hawkhub_recommendations", JSON.stringify(data.recommendations));
          return data.recommendations;
        }
      }
    } catch {}

    // 3. Try Spring
    try {
      const r = await fetch(`${javaURI}/api/recommendations/${username}`, fetchOptions);
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
          localStorage.setItem("hawkhub_recommendations", JSON.stringify(data.recommendations));
          return data.recommendations;
        }
      }
    } catch {}

    return [];
  }

  function renderRecommendedSection(recs) {
    if (!recs || recs.length === 0) return;
    const recSection = document.getElementById("rec-section");
    const recGrid = document.getElementById("recGrid");
    if (!recSection || !recGrid) return;

    recGrid.innerHTML = "";
    recs.slice(0, 5).forEach((rec, i) => {
      const club = {
        id: rec.club_id,
        name: rec.club_name,
        categories: [],
        image: rec.image_filename || "",
        imageAlt: rec.club_name,
        membersText: Array.isArray(rec.matched_tags) ? rec.matched_tags.slice(0, 3).join(", ") : "",
        href: rec.href || "",
      };
      recGrid.appendChild(createClubCard(club, i, false, rec.match_percentage));
    });

    recSection.style.display = "block";
  }

  const authenticated = await isLoggedIn();
  if (authenticated) {
    loggedOutHome.style.display = "none";
    loggedInHome.style.display = "grid";

    const [clubs, recs] = await Promise.all([loadClubs(), loadRecommendedClubs()]);
    renderRecommendedSection(recs);
    renderClubs(clubs);

    if (clubs.length === 0 && noClubsMsg) {
      noClubsMsg.textContent = "No clubs were returned from the backend.";
      noClubsMsg.style.display = "block";
    }
  } else {
    loggedOutHome.style.display = "block";
    loggedInHome.style.display = "none";
  }

  // Club filtering functionality
  function initClubFilter() {
    const chips = document.querySelectorAll('.filter-chip');
    const activeClubCards = () => Array.from(document.querySelectorAll('.club-card'));

    function clubMatchesFilter(card, filterValue) {
      if (filterValue === 'ALL') return true;
      const categories = card.dataset.category ? card.dataset.category.split(',').map(c => c.trim()) : [];
      return categories.includes(filterValue);
    }

    function filterClubs(filterValue) {
      let visibleCount = 0;

      activeClubCards().forEach(card => {
        if (clubMatchesFilter(card, filterValue)) {
          card.classList.remove('hidden');
          visibleCount += 1;
        } else {
          card.classList.add('hidden');
        }
      });

      if (clubDivider) {
        clubDivider.style.display = visibleCount > 3 ? 'flex' : 'none';
      }

      if (noClubsMsg) {
        noClubsMsg.style.display = (visibleCount === 0) ? 'block' : 'none';
      }
    }

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        filterClubs(chip.dataset.filter || 'ALL');
      });
    });

    filterClubs('ALL');
  }

  // Init filter after DOM ready (async safe)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClubFilter);
  } else {
    initClubFilter();
  }
</script>
