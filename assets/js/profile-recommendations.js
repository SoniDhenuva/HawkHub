(function () {
  const backendUrl = (window.RECOMMENDATION_BACKEND_URL || "http://127.0.0.1:8587").replace(/\/$/, "");
  const username = localStorage.getItem("hawkhub_username");
  const container = document.getElementById("profileRecommendationsContainer");

  if (!container) {
    return;
  }

  if (!username) {
    container.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">Complete the club recommendation survey to see your personalized matches here.</p>';
    return;
  }

  function renderRecommendations(data) {
    if (!data.recommendations || data.recommendations.length === 0) {
      container.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">No club recommendations available.</p>';
      return;
    }

    const tableHtml = `
      <table class="rec-table" style="width: 100%; border-collapse: collapse; color: #e8f0ff;">
        <thead>
          <tr style="border-bottom: 2px solid rgba(0, 216, 255, 0.22); text-align: left;">
            <th style="padding: 0.75rem; font-weight: 600;">Rank</th>
            <th style="padding: 0.75rem; font-weight: 600;">Club Name</th>
            <th style="padding: 0.75rem; font-weight: 600;">Match %</th>
            <th style="padding: 0.75rem; font-weight: 600;">Summary</th>
            <th style="padding: 0.75rem; font-weight: 600;">Matched Tags</th>
          </tr>
        </thead>
        <tbody>
          ${data.recommendations
            .map((rec) => {
              const tags = rec.matched_tags.map((tag) => `<span style="display: inline-block; background: rgba(0, 216, 255, 0.08); border: 1px solid rgba(0, 216, 255, 0.32); border-radius: 999px; padding: 0.2rem 0.5rem; font-size: 0.75rem; color: #d7f5ff; margin-right: 0.4rem;">${tag}</span>`).join("");

              return `
                <tr style="border-bottom: 1px solid rgba(0, 216, 255, 0.12);">
                  <td style="padding: 0.75rem; font-weight: 600; color: #00d8ff;">#${rec.rank}</td>
                  <td style="padding: 0.75rem; font-weight: 600;">${rec.club_name}</td>
                  <td style="padding: 0.75rem;">
                    <span style="display: inline-block; background: rgba(0, 216, 255, 0.18); border: 1px solid rgba(0, 216, 255, 0.82); border-radius: 999px; padding: 0.35rem 0.7rem; font-weight: 600; font-size: 0.85rem;">${rec.match_percentage}%</span>
                  </td>
                  <td style="padding: 0.75rem; color: #7aa5ca; font-size: 0.95rem;">${rec.summary}</td>
                  <td style="padding: 0.75rem;">${tags}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    `;

    container.innerHTML = `
      <p style="color: #7aa5ca; font-size: 0.85rem; margin: 0 0 1rem 0;">Saved recommendations for <strong>${username}</strong></p>
      ${tableHtml}
    `;
  }

  function fetchRecommendations() {
    container.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">Loading recommendations...</p>';

    fetch(`${backendUrl}/api/recommendations/${username}`)
      .then((resp) => {
        if (resp.status === 404) {
          container.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">No saved recommendations yet. Complete the survey first.</p>';
          return null;
        }
        if (!resp.ok) {
          throw new Error(`Backend error: ${resp.status}`);
        }
        return resp.json();
      })
      .then((data) => {
        if (data) {
          renderRecommendations(data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch recommendations from backend:", err);
        container.innerHTML = `<p style="color: #999; text-align: center; padding: 2rem;">Could not load recommendations. Ensure the backend is running at ${backendUrl}</p>`;
      });
  }

  fetchRecommendations();
})();
