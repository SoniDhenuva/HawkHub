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

  .home-shell {
    background: #0b1e34;
    min-height: 100vh;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    display: grid;
    grid-template-columns: 180px 1fr;
    color: #e8f0ff;
  }

  .home-sidebar {
    background: #0a182a;
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
    background: #0b1e34;
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
    flex: 1;
    background: linear-gradient(120deg, #2d6f87, #163849);
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
  }
</style>

<section class="home-shell">
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
        <option>SORT BY</option>
        <option>Newest</option>
        <option>Name</option>
      </select>
    </div>

    <div class="club-grid">
      <a class="club-card alt" href="{{site.baseurl}}/search">
        <div class="thumb"></div>
        <div class="name">FRC TEAM OPTIX 3749</div>
      </a>
      <a class="club-card" href="{{site.baseurl}}/search">
        <div class="thumb"></div>
        <div class="name">HOSA</div>
      </a>
      <a class="club-card alt" href="{{site.baseurl}}/search">
        <div class="thumb"></div>
        <div class="name">SPEECH &amp; DEBATE</div>
      </a>
      <a class="club-card" href="{{site.baseurl}}/search">
        <div class="thumb"></div>
        <div class="name">MOCK TRIAL</div>
      </a>
      <a class="club-card alt" href="{{site.baseurl}}/search">
        <div class="thumb"></div>
        <div class="name">DECA</div>
      </a>
      <a class="club-card" href="{{site.baseurl}}/search">
        <div class="thumb"></div>
        <div class="name">ADD CLUB</div>
      </a>
    </div>
  </main>
</section>
