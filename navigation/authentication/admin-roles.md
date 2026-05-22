---
layout: page
title: Admin — Manage User Roles
permalink: /admin/roles
search_exclude: true
show_reading_time: false
---


<style>
 #role-mgmt-container { max-width: 960px; margin: 0 auto; }


 #status-banner {
   display: none;
   padding: 10px 16px;
   border-radius: 6px;
   margin-bottom: 16px;
   font-weight: 500;
 }
 #status-banner.success { background: #1a3d2b; color: #4caf86; border: 1px solid #2d6647; }
 #status-banner.error   { background: #3d1a1a; color: #f87171; border: 1px solid #662d2d; }


 #access-denied {
   display: none;
   padding: 32px;
   text-align: center;
   color: #f87171;
   font-size: 1.2rem;
 }


 #users-table {
   width: 100%;
   border-collapse: collapse;
   font-size: 0.95rem;
 }
 #users-table th {
   text-align: left;
   padding: 10px 12px;
   border-bottom: 2px solid #444;
   color: #aaa;
   font-weight: 600;
   text-transform: uppercase;
   font-size: 0.78rem;
   letter-spacing: 0.05em;
 }
 #users-table td {
   padding: 10px 12px;
   border-bottom: 1px solid #333;
   vertical-align: middle;
 }
 #users-table tr:last-child td { border-bottom: none; }


 .role-select {
   background: #1e1e2e;
   color: #e2e8f0;
   border: 1px solid #555;
   border-radius: 5px;
   padding: 5px 10px;
   font-size: 0.9rem;
   cursor: pointer;
   min-width: 130px;
 }
 .role-select:focus { outline: 2px solid #4c8bf5; }


 .row-status {
   font-size: 0.82rem;
   padding-left: 8px;
   white-space: nowrap;
 }
 .row-status.ok  { color: #4caf86; }
 .row-status.err { color: #f87171; }


 #loading-msg { color: #aaa; padding: 20px 0; }
</style>


<div id="role-mgmt-container">
 <div id="status-banner"></div>
 <div id="access-denied">
   <p>&#128683; Access Denied</p>
   <p style="font-size:0.95rem; color:#aaa;">This page is only accessible to admins.</p>
 </div>
 <p id="loading-msg">Loading users&hellip;</p>
 <table id="users-table" style="display:none;">
   <thead>
     <tr>
       <th>Name</th>
       <th>Email</th>
       <th>UID</th>
       <th>Role</th>
       <th></th>
     </tr>
   </thead>
   <tbody id="users-tbody"></tbody>
 </table>
</div>


<script type="module">
 import { javaURI, fetchOptions } from '{{ site.baseurl }}/assets/js/api/config.js';


 // ── Backend base URL ──────────────────────────────────────────────────────
 const BASE_URL = javaURI;   // swap here for a different environment


 // Ordered highest → lowest so getManagedRole returns the most privileged role
 const MANAGED_ROLES = ['ROLE_ADMIN', 'ROLE_LEADERSHIP', 'ROLE_STUDENT'];


 // Map Spring role name → display label (and vice-versa for the PUT body)
 const ROLE_DISPLAY = {
   ROLE_STUDENT:    'STUDENT',
   ROLE_LEADERSHIP: 'LEADERSHIP',
   ROLE_ADMIN:      'ADMIN',
 };


 const banner   = document.getElementById('status-banner');
 const denied   = document.getElementById('access-denied');
 const loading  = document.getElementById('loading-msg');
 const table    = document.getElementById('users-table');
 const tbody    = document.getElementById('users-tbody');


 function showBanner(msg, type) {
   banner.textContent = msg;
   banner.className = type;   // 'success' | 'error'
   banner.style.display = 'block';
   setTimeout(() => { banner.style.display = 'none'; }, 4000);
 }


 function getManagedRole(roles) {
   // Iterate priority list so highest role wins (Admin > Leadership > Student)
   for (const r of MANAGED_ROLES) {
     if (roles.includes(r)) return r;
   }
   return null;
 }


 async function loadUsers() {
   try {
     const res = await fetch(`${BASE_URL}/api/users`, { ...fetchOptions });


     if (res.status === 401) {
       // Not logged in to Spring Boot — redirect to Java login
       window.location.href = '{{ site.baseurl }}/loginDebugJava';
       return;
     }
     if (res.status === 403) {
       loading.style.display = 'none';
       denied.style.display = 'block';
       return;
     }
     if (!res.ok) {
       loading.textContent = `Error loading users (${res.status}).`;
       return;
     }


     const users = await res.json();
     renderTable(users);
   } catch (err) {
     loading.textContent = 'Network error — is the backend running?';
     console.error(err);
   }
 }


 function renderTable(users) {
   loading.style.display = 'none';
   tbody.innerHTML = '';


   for (const user of users) {
     const currentRole = getManagedRole(user.roles);   // e.g. "ROLE_STUDENT"
     const currentDisplay = currentRole ? ROLE_DISPLAY[currentRole] : 'STUDENT';


     const tr = document.createElement('tr');
     tr.innerHTML = `
       <td>${escHtml(user.name)}</td>
       <td>${escHtml(user.email)}</td>
       <td><code>${escHtml(user.uid)}</code></td>
       <td>
         <select class="role-select" data-id="${user.id}">
           <option value="STUDENT"    ${currentDisplay === 'STUDENT'    ? 'selected' : ''}>Student</option>
           <option value="LEADERSHIP" ${currentDisplay === 'LEADERSHIP' ? 'selected' : ''}>Leadership</option>
           <option value="ADMIN"      ${currentDisplay === 'ADMIN'      ? 'selected' : ''}>Admin</option>
         </select>
       </td>
       <td><span class="row-status"></span></td>
     `;
     tbody.appendChild(tr);


     const sel    = tr.querySelector('.role-select');
     const rowMsg = tr.querySelector('.row-status');


     sel.addEventListener('change', async () => {
       const newRole = sel.value;
       sel.disabled = true;
       rowMsg.textContent = 'Saving…';
       rowMsg.className = 'row-status';


       try {
         const res = await fetch(`${BASE_URL}/api/users/${user.id}/role`, {
           ...fetchOptions,
           method: 'PUT',
           body: JSON.stringify({ role: newRole }),
         });


         if (res.ok) {
           rowMsg.textContent = '✓ Saved';
           rowMsg.className = 'row-status ok';
           showBanner(`Role updated for ${user.name} → ${newRole}`, 'success');
         } else {
           const errData = await res.json().catch(() => ({}));
           const msg = errData.error || `Error ${res.status}`;
           rowMsg.textContent = `✗ ${msg}`;
           rowMsg.className = 'row-status err';
           showBanner(`Failed to update ${user.name}: ${msg}`, 'error');
           // Revert the dropdown
           sel.value = currentDisplay;
         }
       } catch (err) {
         rowMsg.textContent = '✗ Network error';
         rowMsg.className = 'row-status err';
         showBanner('Network error — role not saved.', 'error');
         sel.value = currentDisplay;
         console.error(err);
       } finally {
         sel.disabled = false;
         setTimeout(() => { rowMsg.textContent = ''; }, 5000);
       }
     });
   }


   table.style.display = 'table';
 }


 function escHtml(str) {
   return String(str)
     .replace(/&/g, '&amp;')
     .replace(/</g, '&lt;')
     .replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;');
 }


 loadUsers();
</script>



