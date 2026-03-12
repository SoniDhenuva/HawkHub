import { baseurl, pythonURI, fetchOptions } from './config.js';

console.log("login.js loaded");

document.addEventListener('DOMContentLoaded', function () {
    console.log("Base URL:", baseurl); // Debugging line
    waitForElement('#loginArea', 20, 100).then(loginArea => {
        getCredentials(baseurl)
            .then(data => {
                console.log("Guest mode activated");
                window.user = data; // Guest data
                loginArea.innerHTML = `
                    <div class="dropdown">
                        <button class="dropbtn page-link" style="border:none; background:none; cursor:pointer; color:inherit; font-size:inherit; font-family:inherit; padding:0;">Guest</button>
                        <div class="dropdown-content hidden">
                            <a href="${baseurl}/login">Login</a>
                            <a href="${baseurl}/profile">Profile</a>
                        </div>
                    </div>
                `;

                // Dropdown toggle
                const dropdownButton = loginArea.querySelector('.dropbtn');
                const dropdownContent = loginArea.querySelector('.dropdown-content');
                if (dropdownButton && dropdownContent) {
                    dropdownButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        dropdownContent.classList.toggle('hidden');
                    });
                    if (!window._loginDropdownListener) {
                        document.addEventListener('click', (e) => {
                            if (!dropdownButton.contains(e.target) && !dropdownContent.contains(e.target)) {
                                dropdownContent.classList.add('hidden');
                            }
                        });
                        window._loginDropdownListener = true;
                    }
                }

                // Update nav
                waitForElement('.trigger', 20, 100).then(() => {
                    updateNavigation(true);
                });
                loginArea.style.opacity = "1";
            });

    });
});

// Wait for an element to exist in the DOM, retrying up to maxAttempts (delay between attempts)
function waitForElement(selector, maxAttempts = 20, interval = 100) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        function check() {
            const el = document.querySelector(selector);
            if (el) {
                resolve(el);
            } else if (++attempts < maxAttempts) {
                setTimeout(check, interval);
            } else {
                reject(new Error('Element not found: ' + selector));
            }
        }
        check();
    });
}

function getCredentials(baseurl) {
    // Bypass auth: simulate guest user for public access
    console.log("Using guest user mode");
    return Promise.resolve({ name: 'Guest', uid: 'guest', roles: [] });
}

// Update navigation based on login status and courses
async function updateNavigation(isLoggedIn) {
    const trigger = document.querySelector('.trigger');
    if (!trigger) {
        console.error("Navigation trigger not found!");
        return;
    }

    // Find all page links in navigation
    const links = trigger.querySelectorAll('.page-link');
    console.log("Found links:", links.length);
    
    // Guest/public mode: default to Clubs/Blogs (skip !isLoggedIn block since always logged-in sim)
    const defaultHref = `${baseurl}/navigation/blogs/`;
    const defaultText = 'Clubs'; // or 'Blogs'
    updateNavLink(links, defaultHref, defaultText);
    console.log("Nav updated for guest: Clubs");

    // Guest mode: no course fetch, use defaults
    console.log("Guest nav: no course fetch needed");
}

// Helper function to update a single nav link
function updateNavLink(links, url, text) {
    console.log("Updating nav link to:", text, url);
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.includes('/navigation/blog') || href.includes('/navigation/courses'))) {
            link.setAttribute('href', url);
            link.textContent = text;
            console.log("Link updated successfully");
        }
    });
}