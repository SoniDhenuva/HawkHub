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
      <a class="home-nav-link" href="{{site.baseurl}}/search">FEED</a>
      <a class="home-nav-link" href="{{site.baseurl}}/profile">CALENDAR</a>
    </div>

    <div class="home-nav-group">
      <p class="home-nav-label">PERSONAL</p>
      <a class="home-nav-link" href="{{site.baseurl}}/recommendations">RECOMMENDATIONS</a>
      <a class="home-nav-link" href="{{site.baseurl}}/profile">YOUR CLUBS</a>
    </div>

    <a class="home-new-club" href="{{site.baseurl}}/profile">+ NEW CLUB</a>
  </aside>

  <main class="home-main">
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

    <div class="club-grid club-grid-primary">
      {% for club in site.data.school_clubs limit:3 %}
      {% assign members = club.members | default: 20 | plus: forloop.index | plus: 8 %}
      {% assign primary_category = club.categories[0] | default: 'Academic' %}
      <a class="club-card {% if forloop.first %}is-featured{% endif %}" href="{{site.baseurl}}{{ club.href | default: '/search' }}" data-category="{{ club.categories | join: ',' }}">
        {% if forloop.first %}
        <span class="club-active-badge">ACTIVE</span>
        {% endif %}
        <div class="thumb"><img src="{{site.baseurl}}/images/{{ club.image }}" alt="{{ club.image_alt | default: club.name }}"></div>
        <div class="club-overlay">
          <div class="club-title-row">
            <span class="club-name">{{ club.home_label | default: club.name }}</span>
            <span class="club-kind">{{ primary_category | upcase }}</span>
          </div>
          <div class="club-meta-row">
            <span>{{ members }} members</span>
            {% if forloop.first %}
            <span>SAN DIEGO, CA</span>
            {% endif %}
          </div>
        </div>
      </a>
      {% endfor %}
    </div>

    <div class="club-divider"><span>// MORE CLUBS</span></div>

    <div class="club-grid club-grid-more">
      {% for club in site.data.school_clubs offset:3 %}
      {% assign members = club.members | default: 18 | plus: forloop.index | plus: 5 %}
      {% assign primary_category = club.categories[0] | default: 'Academic' %}
      <a class="club-card" href="{{site.baseurl}}{{ club.href | default: '/search' }}" data-category="{{ club.categories | join: ',' }}">
        <div class="thumb"><img src="{{site.baseurl}}/images/{{ club.image }}" alt="{{ club.image_alt | default: club.name }}"></div>
        <div class="club-overlay">
          <div class="club-title-row">
            <span class="club-name">{{ club.home_label | default: club.name }}</span>
            <span class="club-kind">{{ primary_category | upcase }}</span>
          </div>
          <div class="club-meta-row">
            <span>{{ members }} members</span>
            <span>{{ primary_category | upcase }}</span>
          </div>
        </div>
      </a>
      {% endfor %}
    </div>

    <div id="no-clubs" class="no-clubs-msg">No clubs in this category yet!</div>
  </main>
</section>

<script type="module">
  import { pythonURI, fetchOptions } from "{{site.baseurl}}/assets/js/api/config.js";

  const loggedOutHome = document.getElementById("logged-out-home");
  const loggedInHome = document.getElementById("logged-in-home");

  async function isLoggedIn() {
    if (localStorage.getItem('forceLoggedOut') === '1') {
      return false;
    }

    try {
      const response = await fetch(`${pythonURI}/api/id`, fetchOptions);
      if (!response.ok) return false;
      const data = await response.json();
      return Boolean(data && (data.uid || data.name));
    } catch {
      return false;
    }
  }

  const authenticated = await isLoggedIn();
  if (authenticated) {
    loggedOutHome.style.display = "none";
    loggedInHome.style.display = "grid";
  } else {
    loggedOutHome.style.display = "block";
    loggedInHome.style.display = "none";
  }

  // Club filtering functionality
  function initClubFilter() {
    const chips = document.querySelectorAll('.filter-chip');
    const clubDivider = document.querySelector('.club-divider');
    const noClubsMsg = document.getElementById('no-clubs');
    const clubCards = document.querySelectorAll('.club-card');

    function clubMatchesFilter(card, filterValue) {
      if (filterValue === 'ALL') return true;
      const categories = card.dataset.category ? card.dataset.category.split(',').map(c => c.trim()) : [];
      return categories.includes(filterValue);
    }

    function filterClubs(filterValue) {
      let visibleCount = 0;

      clubCards.forEach(card => {
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

      noClubsMsg.style.display = (visibleCount === 0) ? 'block' : 'none';
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
