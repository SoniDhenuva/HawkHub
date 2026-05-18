---
layout: opencs
title: Club Page Template
permalink: /club-template/
search_exclude: true
---

<link rel="stylesheet" href="{{ '/assets/css/club-template.css' | relative_url }}">

<section class="home-shell club-shell">
  <aside class="home-sidebar">
    <h2>MENU</h2>

    <div class="home-nav-group">
      <p class="home-nav-label">NAVIGATE</p>
      <a class="home-nav-link" href="{{site.baseurl}}/">CLUBS</a>
      <a class="home-nav-link" href="{{site.baseurl}}/search">FEED</a>
      <a class="home-nav-link" href="{{site.baseurl}}/profile">CALENDAR</a>
    </div>

    <div class="home-nav-group">
      <p class="home-nav-label">PERSONAL</p>
      <a class="home-nav-link" href="{{site.baseurl}}/recommendations">RECOMMENDATIONS</a>
      <a class="home-nav-link is-active" href="{{site.baseurl}}/club-template/">YOUR CLUB</a>
    </div>

    <a class="home-new-club" href="#editor-panel">EDIT CLUB</a>
  </aside>

  <main class="home-main club-main">
    <section class="club-template" aria-labelledby="club-title">
      <header class="club-template-header">
        <div>
          <p class="eyebrow" id="club-name-banner">Club Name</p>
          <h1 id="club-title" data-field="clubName">Club Name</h1>
          <p class="subtitle" data-field="tagline">Replace this line with a one-sentence pitch for your club.</p>
        </div>
        <div class="join-quick">
          <a class="join-button" href="#join">Jump To Join</a>
          <button id="toggle-editor" type="button" class="join-button secondary">Edit Info</button>
        </div>
      </header>

      <div class="club-template-grid">
        <section class="card media-card" aria-labelledby="club-pics-title">
          <h2 id="club-pics-title">Club Pics</h2>
          <div class="photo-grid">
            <img id="club-photo-1" data-default-src="{{ '/images/clubs/sample_image_1.png' | relative_url }}" src="{{ '/images/clubs/sample_image_1.png' | relative_url }}" alt="Club photo 1">
            <img id="club-photo-2" data-default-src="{{ '/images/clubs/sample_image_2.png' | relative_url }}" src="{{ '/images/clubs/sample_image_2.png' | relative_url }}" alt="Club photo 2">
            <img id="club-photo-3" data-default-src="{{ '/images/clubs/sample_image_3.png' | relative_url }}" src="{{ '/images/clubs/sample_image_3.png' | relative_url }}" alt="Club photo 3">
            <img id="club-photo-4" data-default-src="{{ '/images/clubs/sample_image_4.png' | relative_url }}" src="{{ '/images/clubs/sample_image_4.png' | relative_url }}" alt="Club photo 4">
          </div>
          <p class="hint">Use the editor below to update text, links, and image URLs.</p>
        </section>

        <section class="card info-card" aria-labelledby="club-summary-title">
          <h2 id="club-summary-title">Club Summary</h2>
          <p id="club-summary">
            Write a short overview of what your club does, who it is for, and what new members can expect.
            Keep it to 3-5 sentences for best readability.
          </p>

          <h3>Club Stats</h3>
          <ul>
            <li id="club-members"># of members: 42</li>
            <li id="club-frequency">Meeting frequency: Weekly (Fridays)</li>
            <li id="club-activity">Activity level: High during competition season</li>
            <li id="club-awards">Awards/Accomplishments: 2 regional placements</li>
          </ul>

          <h3>Join the Community</h3>
          <div class="social-links">
            <a id="social-1" href="#" target="_blank" rel="noopener">Instagram</a>
            <a id="social-2" href="#" target="_blank" rel="noopener">Discord</a>
            <a id="social-3" href="#" target="_blank" rel="noopener">Website</a>
          </div>

          <div id="join" class="join-row">
            <a class="join-button large" id="join-link" href="#">Join Club</a>
            <p class="approval-note" id="join-note">Sends a join request for a club admin to approve.</p>
          </div>
        </section>
      </div>

      <section class="card editor-panel" id="editor-panel" aria-label="Club info editor" hidden>
        <div class="editor-header">
          <h2>Edit Club Info</h2>
          <p>Changes save in this browser via local storage. No backend required.</p>
        </div>

        <form id="club-editor-form" class="editor-grid">
          <label>Club Name<input type="text" name="clubName" required></label>
          <label>Tagline<input type="text" name="tagline"></label>
          <label class="full">Summary<textarea name="summary" rows="4"></textarea></label>

          <label>Members<input type="text" name="members"></label>
          <label>Meeting Frequency<input type="text" name="frequency"></label>
          <label>Activity Level<input type="text" name="activity"></label>
          <label>Awards/Accomplishments<input type="text" name="awards"></label>

          <label>Social 1 Label<input type="text" name="social1Label"></label>
          <label>Social 1 URL<input type="text" name="social1Url"></label>
          <label>Social 2 Label<input type="text" name="social2Label"></label>
          <label>Social 2 URL<input type="text" name="social2Url"></label>
          <label>Social 3 Label<input type="text" name="social3Label"></label>
          <label>Social 3 URL<input type="text" name="social3Url"></label>

          <label>Photo 1 URL<input type="text" name="photo1"></label>
          <label>Photo 2 URL<input type="text" name="photo2"></label>
          <label>Photo 3 URL<input type="text" name="photo3"></label>
          <label>Photo 4 URL<input type="text" name="photo4"></label>

          <label>Join Button URL<input type="text" name="joinUrl"></label>
          <label class="full">Join Note<input type="text" name="joinNote"></label>

          <div class="editor-actions full">
            <button type="submit" class="join-button">Save Changes</button>
            <button id="reset-template" type="button" class="join-button secondary">Reset To Defaults</button>
          </div>
        </form>
      </section>
    </section>
  </main>
</section>

<script type="module">
  import { javaURI, pythonURI, fetchOptions } from '{{site.baseurl}}/assets/js/api/config.js';

  window.clubTemplateApi = { javaURI, pythonURI, fetchOptions };
</script>
<script src="{{ '/assets/js/club-template-editor.js' | relative_url }}"></script>
