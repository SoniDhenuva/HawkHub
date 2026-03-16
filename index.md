---
layout: page
title: Home
permalink: /
search_exclude: true
---

<style>
  .page-content {
    padding-top: 0 !important;
  }

  .post > .post-title {
    display: none;
  }

  .post,
  .post-content {
    margin: 0 !important;
    padding: 0 !important;
    max-width: none !important;
  }

  #logged-out-home {
    min-height: 100vh;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    position: relative;
    background:
      radial-gradient(circle at 82% 18%, rgba(26, 104, 182, 0.18), transparent 32%),
      radial-gradient(circle at 12% 88%, rgba(23, 140, 82, 0.16), transparent 30%),
      linear-gradient(180deg, #030918 0%, #020612 58%, #01040d 100%);
    overflow: hidden;
    color: #ecf4ff;
    font-family: "Orbitron", "Exo 2", sans-serif;
  }

  #logged-out-home::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(30deg, rgba(41, 107, 194, 0.22) 12%, transparent 12.5%, transparent 87%, rgba(41, 107, 194, 0.22) 87.5%, rgba(41, 107, 194, 0.22)),
      linear-gradient(150deg, rgba(41, 107, 194, 0.22) 12%, transparent 12.5%, transparent 87%, rgba(41, 107, 194, 0.22) 87.5%, rgba(41, 107, 194, 0.22)),
      linear-gradient(90deg, rgba(7, 24, 52, 0.82) 2%, transparent 2.5%, transparent 97%, rgba(7, 24, 52, 0.82) 97.5%, rgba(7, 24, 52, 0.82));
    background-size: 96px 166px;
    background-position: 0 0, 0 0, 48px 83px;
    opacity: 0.38;
    pointer-events: none;
  }

  #logged-out-home::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(3, 9, 23, 0.05) 0%, rgba(16, 83, 151, 0.18) 52%, rgba(37, 140, 77, 0.10) 100%);
    pointer-events: none;
  }

  .welcome-center {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    box-sizing: border-box;
  }

  .welcome-panel {
    width: min(92vw, 780px);
    min-height: 350px;
    background: linear-gradient(145deg, rgba(2, 11, 33, 0.82), rgba(2, 8, 24, 0.76));
    border: 1px solid rgba(63, 166, 236, 0.30);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.38), inset 0 0 0 1px rgba(41, 185, 214, 0.08);
    border-radius: 10px;
    padding: 2.4rem 2.2rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .welcome-overline {
    margin: 0 0 0.7rem;
    font-size: clamp(1rem, 2.8vw, 2rem);
    letter-spacing: 0.09em;
    color: #dfecff;
    font-weight: 500;
  }

  .welcome-title {
    margin: 0;
    line-height: 0.95;
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .welcome-hawk {
    font-size: clamp(3rem, 10vw, 6.2rem);
    color: #59c42f;
    font-weight: 800;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    text-shadow: 0 0 24px rgba(77, 201, 49, 0.18);
  }

  .welcome-hub {
    font-size: clamp(2.7rem, 9vw, 5.8rem);
    color: #2ca1d7;
    font-family: "Brush Script MT", cursive;
    font-weight: 400;
    line-height: 1;
    transform: translateY(0.2em);
    text-shadow: 0 0 20px rgba(44, 161, 215, 0.2);
  }

  .welcome-tagline {
    margin: 2rem 0 0;
    color: #e6f2ff;
    font-size: clamp(1.2rem, 3.4vw, 2rem);
    letter-spacing: 0.03em;
    font-weight: 700;
  }

  #logged-in-home {
    display: none;
  }

  .home-shell {
    background: #091a2e;
    min-height: 100vh;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    display: grid;
    grid-template-columns: 180px 1fr;
    color: #e8f0ff;
  }

  .home-sidebar {
    background: #081526;
    padding: 1.3rem 0.8rem;
  }

  .home-sidebar h2 {
    font-size: 2rem;
    margin: 0 0 1.5rem 0;
    letter-spacing: 0.03em;
    line-height: 1;
  }

  .home-sidebar a {
    display: block;
    color: #5ec2ff;
    text-decoration: none;
    font-weight: 700;
    margin: 0.75rem 0;
    font-size: 1.05rem;
  }

  .home-main {
    padding: 2rem;
    background: #091a2e;
  }

  .home-top {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .home-sort {
    border: 0;
    background: #f2f4f8;
    color: #1a1f2b;
    padding: 0.4rem 0.7rem;
    font-weight: 700;
    font-size: 0.8rem;
  }

  .club-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(180px, 1fr));
    gap: 1.6rem;
  }

  .club-card {
    background: #154f66;
    min-height: 180px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    overflow: hidden;
    text-decoration: none;
  }

  .club-card .thumb {
    height: 300px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .club-card .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .club-card .name {
    background: #39b226;
    color: #eef8ff;
    text-align: center;
    padding: 0.6rem 0.5rem;
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  .club-card.alt .name {
    background: #17536a;
  }

  .club-card.hidden {
    display: none !important;
  }

  .no-clubs-msg {
    grid-column: 1 / -1;
    text-align: center;
    padding: 2rem;
    color: #ccc;
    font-size: 1.2rem;
    font-weight: 500;
  }

  @media (max-width: 900px) {
    .home-shell {
      grid-template-columns: 1fr;
      width: 100%;
      margin-left: 0;
    }

    .home-sidebar {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .home-sidebar h2 {
      margin: 0;
      width: 100%;
      font-size: 1.5rem;
    }

    .club-grid {
      grid-template-columns: 1fr;
    }

    .welcome-panel {
      padding: 1.5rem 1.1rem;
      min-height: 260px;
    }

    .welcome-tagline {
      margin-top: 1.4rem;
    }
  }
</style>

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
    <a href="{{site.baseurl}}/">CLUBS</a>
    <a href="{{site.baseurl}}/search">FEED</a>
    <a href="{{site.baseurl}}/profile">CALENDAR</a>
    <a href="{{site.baseurl}}/profile">RECOMMENDATIONS</a>
    <a href="{{site.baseurl}}/profile">YOUR CLUBS</a>
    <a href="{{site.baseurl}}/profile">NEW CLUB +</a>
  </aside>

  <main class="home-main">
    <div class="home-top">
      <select class="home-sort" aria-label="Sort clubs">
        <option>All Clubs</option>
        <option>Advocacy/Awareness</option>
        <option>STEM</option>
        <option>Charity/Volunteer</option>
        <option>Arts</option>
        <option>Competition</option>
        <option>Cultural/Society</option>
        <option>Interest/Sport</option>
      </select>
    </div>

  <div class="club-grid">
      <a class="club-card alt" href="{{site.baseurl}}/search" data-category="STEM,Competition,All Clubs">
        <div class="thumb"><img src="{{site.baseurl}}/images/clubs/optix.png" alt="FRC Team Optix 3749"></div>
        <div class="name">FRC TEAM OPTIX 3749</div>
      </a>
      <a class="club-card" href="{{site.baseurl}}/search" data-category="STEM,Competition,All Clubs">
        <div class="thumb"><img src="{{site.baseurl}}/images/clubs/hosa.png" alt="HOSA"></div>
        <div class="name">HOSA</div>
      </a>
      <a class="club-card alt" href="{{site.baseurl}}/search" data-category="Competition,All Clubs">
        <div class="thumb"><img src="{{site.baseurl}}/images/clubs/speech_and_debate.png" alt="Speech and Debate"></div>
        <div class="name">SPEECH &amp; DEBATE</div>
      </a>
      <a class="club-card" href="{{site.baseurl}}/search" data-category="Competition,All Clubs">
        <div class="thumb"><img src="{{site.baseurl}}/images/clubs/mock_trial.png" alt="Mock Trial"></div>
        <div class="name">MOCK TRIAL</div>
      </a>
      <a class="club-card alt" href="{{site.baseurl}}/search" data-category="Competition,All Clubs">
        <div class="thumb"><img src="{{site.baseurl}}/images/clubs/deca.png" alt="DECA"></div>
        <div class="name">DECA</div>
      </a>
      <a class="club-card" href="{{site.baseurl}}/search" data-category="STEM,All Clubs">
        <div class="thumb"><img src="{{site.baseurl}}/images/clubs/girls_in_cs.png" alt="Girls In CS"></div>
        <div class="name">Girls In CS</div>
      </a>
      <a class="club-card alt" href="{{site.baseurl}}/search" data-category="Cultural/Society,All Clubs">
        <div class="thumb"><img src="{{site.baseurl}}/images/clubs/sacs.png" alt="South Asian Cultural Show"></div>
        <div class="name">South Asian Cultural Show</div>
      </a>
      <a class="club-card" href="{{site.baseurl}}/search" data-category="Advocacy/Awareness,All Clubs">
        <div class="thumb"><img src="{{site.baseurl}}/images/clubs/acs.png" alt="American Cancer Society"></div>
        <div class="name">American Cancer Society</div>
      </a>
      <a class="club-card alt" href="{{site.baseurl}}/search" data-category="Charity/Volunteer,All Clubs">
        <div class="thumb"><img src="{{site.baseurl}}/images/clubs/link_crew.png" alt="Link Crew"></div>
        <div class="name">Link Crew</div>
      </a>
    </div>
    <div id="no-clubs" class="no-clubs-msg" style="display: none; grid-column: 1 / -1; text-align: center; padding: 2rem; color: #ccc; font-size: 1.2rem;">No clubs in this category yet!</div>
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
    const sortSelect = document.querySelector('.home-sort');
    const clubGrid = document.querySelector('.club-grid');
    const noClubsMsg = document.getElementById('no-clubs');
    const clubCards = document.querySelectorAll('.club-card');

    function filterClubs(category) {
      let visibleCount = 0;
      clubCards.forEach(card => {
        card.classList.remove('hidden');
        if (category && category !== 'SORT BY') {
          const categories = card.dataset.category ? card.dataset.category.split(',').map(c => c.trim()) : [];
          if (!categories.includes(category)) {
            card.classList.add('hidden');
          } else {
            visibleCount++;
          }
        } else {
          visibleCount += clubCards.length;
        }
      });
      noClubsMsg.style.display = (visibleCount === 0) ? 'block' : 'none';
    }

    sortSelect.addEventListener('change', (e) => {
      filterClubs(e.target.value);
    });

    // Initial state: show all
    filterClubs('SORT BY');
  }

  // Init filter after DOM ready (async safe)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClubFilter);
  } else {
    initClubFilter();
  }
</script>
