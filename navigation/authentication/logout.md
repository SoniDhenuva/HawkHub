---
layout: opencs
title: Logout
permalink: /logout
search_exclude: true
---

<script type="module">
    import { handleLogout } from '{{site.baseurl}}/assets/js/api/logout.js';
    localStorage.setItem('forceLoggedOut', '1');
    // logout
    const result = await handleLogout();
    console.log('Logout result:', result);
    // redirect to login page
    window.location.href = `{{site.baseurl}}/login?logout=1&ts=${Date.now()}`;
</script>
