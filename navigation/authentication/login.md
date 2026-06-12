---
layout: page
title: Login
permalink: /login
search_exclude: true
show_reading_time: false
---

<script src="https://accounts.google.com/gsi/client" async defer></script>

<style>
/* ── Signup step indicator ──────────────────────────── */
.signup-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.6rem;
}
.s-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.s-dot {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .78rem; font-weight: 700;
  background: rgba(90,138,176,.15);
  color: #5a8ab0;
  border: 2px solid #2a4a6a;
  transition: all .3s;
}
.s-dot.active { background: rgba(0,216,255,.18); color: #00d8ff; border-color: #00d8ff; box-shadow: 0 0 10px rgba(0,216,255,.3); }
.s-dot.done   { background: rgba(0,240,139,.15); color: #00f08b; border-color: #00f08b; }
.s-label { font-size: .68rem; color: #5a8ab0; white-space: nowrap; }
.s-label.active { color: #00d8ff; }
.s-label.done   { color: #00f08b; }
.s-line {
  height: 2px; width: 56px;
  background: #2a4a6a;
  margin: 0 4px; margin-bottom: 18px;
  transition: background .3s;
}
.s-line.done { background: #00f08b; }

/* ── Signup status message ──────────────────────────── */
#signupMsg {
  margin-top: .6rem; font-size: .88rem; min-height: 1.4em;
}
.msg-ok  { color: #00f08b; }
.msg-err { color: #f87171; }
.msg-inf { color: #00d8ff; }
</style>


<div class="login-container">

  <!-- ════════════════ LOGIN FORM ════════════════ -->
  <div class="login-card">
    <h1 id="pythonTitle">User Login</h1>
    <hr>
    <form id="pythonForm" onsubmit="loginBoth(); return false;">
      <div class="form-group">
        <input type="text" id="uid" placeholder="Username" required autocomplete="username">
      </div>
      <div class="form-group">
        <input type="password" id="password" placeholder="Password" required autocomplete="current-password">
      </div>
      <p>
        <button type="submit" class="large primary submit-button">Login</button>
      </p>
      <p id="message" style="color:red"></p>
    </form>
  </div>

  <!-- ════════════════ SIGNUP WIZARD ════════════ -->
  <div class="signup-card">
    <h1 id="signupTitle">Sign Up</h1>
    <hr>

    <!-- Step indicator (2 steps) -->
    <div class="signup-steps">
      <div class="s-step">
        <div class="s-dot active" id="dot1">1</div>
        <span class="s-label active" id="lbl1">Your Info</span>
      </div>
      <div class="s-line" id="line12"></div>
      <div class="s-step">
        <div class="s-dot" id="dot2">2</div>
        <span class="s-label" id="lbl2">PUSD Verify</span>
      </div>
    </div>

    <!-- ── STEP 2: PUSD Google OAuth ── -->
    <div id="oauth-verification" style="display:none; text-align:center; margin-bottom:2rem">
      <h3 style="color:#6366f1; margin-bottom:1rem">🎓 School Email Verification</h3>
      <p style="margin-bottom:1.5rem; color:#d1d5db">
        Sign in with your Poway USD Google account.<br>
        <strong>Must end in @stu.powayusd.com or @powayusd.com</strong>
      </p>
      <div id="g_id_onload"
           data-client_id="65827797404-ccjleg7jg4g2an8ddpmhnlca4ii2gk8q.apps.googleusercontent.com"
           data-callback="handleGoogleSignIn"
           data-auto_prompt="false">
      </div>
      <div class="g_id_signin"
           data-type="standard" data-size="large" data-theme="filled_blue"
           data-text="signin_with" data-shape="rectangular" data-logo_alignment="left"
           style="margin-bottom:1rem">
      </div>
      <button type="button" class="large secondary" onclick="showSignupForm()"
              style="background-color:#6b7280">← Back to Form</button>
      <div id="oauth-status" style="margin-top:1rem"></div>
      <!-- Backend creation status -->
      <div class="backend-status" id="backendStatusRow" style="display:none; margin-top:1rem">
        <div id="flaskStatus" class="status-item">
          <span class="status-icon">⏳</span>
          <span class="status-text">Flask</span>
        </div>
        <div id="springStatus" class="status-item">
          <span class="status-icon">⏳</span>
          <span class="status-text">Spring</span>
        </div>
      </div>
      <div id="overallStatus" class="overall-status hidden"></div>
    </div>

    <!-- ── STEP 1: Signup form ── -->
    <form id="signupForm" onsubmit="handleSignupSubmit(event)">
      <div class="form-group">
        <input type="text" id="name" placeholder="Full Name" required>
      </div>
      <div class="form-group">
        <input type="text" id="signupUid" placeholder="Username" required>
      </div>
      <div class="form-group">
        <input type="text" id="signupSid" placeholder="Student ID" required>
      </div>
      <div class="form-group">
        <input type="email" id="signupEmail" placeholder="Personal (not school) Email" required>
      </div>
      <div class="form-group">
        <input type="password" id="signupPassword" placeholder="Password" required>
      </div>
      <div class="form-group">
        <input type="password" id="confirmPassword" placeholder="Confirm Password" required>
        <div id="password-validation-message" class="validation-message"></div>
      </div>
      <p>
        <button type="submit" class="large primary submit-button">Continue →</button>
      </p>
      <div id="signupMsg"></div>
    </form>

  </div><!-- /.signup-card -->
</div><!-- /.login-container -->


<script type="module">
  import { login, pythonURI, javaURI, fetchOptions } from '{{site.baseurl}}/assets/js/api/config.js';

  const GOOGLE_CLIENT_ID = "65827797404-ccjleg7jg4g2an8ddpmhnlca4ii2gk8q.apps.googleusercontent.com";
  let signupFormData = {};
  let verifiedSchoolEmail = null;
  let validationTimeout = null;

  // ── Step indicator ───────────────────────────────────────

  function setStep(n) {
    [1,2].forEach(i => {
      const dot = document.getElementById(`dot${i}`);
      const lbl = document.getElementById(`lbl${i}`);
      const cls = i < n ? 'done' : i === n ? 'active' : '';
      dot.className = 's-dot' + (cls ? ' ' + cls : '');
      lbl.className = 's-label' + (cls ? ' ' + cls : '');
    });
    document.getElementById('line12').className = 's-line' + (n > 1 ? ' done' : '');
  }

  // ── Password validation ──────────────────────────────────

  function validatePasswords() {
    const pw  = document.getElementById('signupPassword').value;
    const cpw = document.getElementById('confirmPassword').value;
    const cf  = document.getElementById('confirmPassword');
    const msg = document.getElementById('password-validation-message');
    cf.classList.remove('password-match','password-mismatch','password-length');
    msg.classList.remove('success','error');
    if (!cpw) { msg.textContent = ''; return; }
    if (pw.length < 8) {
      cf.classList.add('password-length'); msg.classList.add('error');
      msg.textContent = '✗ Password must be at least 8 characters'; return;
    }
    if (pw === cpw) {
      cf.classList.add('password-match'); msg.classList.add('success');
      msg.textContent = '✓ Passwords match';
    } else {
      cf.classList.add('password-mismatch'); msg.classList.add('error');
      msg.textContent = '✗ Passwords do not match';
    }
  }

  // ── Status helpers ───────────────────────────────────────

  function showSignupMsg(text, type='inf') {
    const el = document.getElementById('signupMsg');
    el.textContent = text;
    el.className = type === 'ok' ? 'msg-ok' : type === 'err' ? 'msg-err' : 'msg-inf';
  }

  function showOAuthStatus(msg, isError=false) {
    const el = document.getElementById('oauth-status');
    el.innerHTML = `<div class="${isError ? 'oauth-error' : 'oauth-success'}">${msg}</div>`;
  }

  function updateOverallStatus(flaskOk, springOk, flaskErr, springErr) {
    const el = document.getElementById('overallStatus');
    el.classList.remove('hidden', 'success', 'partial', 'error');

    const anyExists = [flaskErr, springErr].some(e =>
      e && (e.toLowerCase().includes('already exists') || e.toLowerCase().includes('conflict') || e.includes('409'))
    );

    if (flaskOk || springOk) {
      el.classList.add('success');
      el.textContent = 'Account created! You can now log in.';
    } else if (anyExists) {
      el.classList.add('error');
      el.innerHTML = 'An account with this username or email already exists. <a href="{{site.baseurl}}/login" style="color:inherit;text-decoration:underline">Log in instead?</a>';
    } else {
      el.classList.add('error');
      el.textContent = 'Sign up failed — please check your information and try again.';
    }
  }

  // ── Show/hide sections ───────────────────────────────────

  window.showSignupForm = function() {
    document.getElementById('oauth-verification').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('oauth-status').innerHTML = '';
    setStep(1);
  };

  function showOAuthStep() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('oauth-verification').style.display = 'block';
    document.getElementById('oauth-status').innerHTML = '';
    document.getElementById('backendStatusRow').style.display = 'none';
    document.getElementById('overallStatus').className = 'overall-status hidden';
    setStep(2);
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: window.handleGoogleSignIn });
      window.google.accounts.id.renderButton(document.querySelector('.g_id_signin'), {
        type:'standard', size:'large', theme:'filled_blue', text:'signin_with', shape:'rectangular', logo_alignment:'left'
      });
    }
  }

  // ── Step 1: form submit ──────────────────────────────────

  window.handleSignupSubmit = function(event) {
    event.preventDefault();
    const form = document.getElementById('signupForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const pw  = document.getElementById('signupPassword').value;
    const cpw = document.getElementById('confirmPassword').value;
    if (pw.length < 8) { showSignupMsg('Password must be at least 8 characters.', 'err'); return; }
    if (pw !== cpw)    { showSignupMsg('Passwords do not match.', 'err'); return; }
    signupFormData = {
      name:               document.getElementById('name').value.trim(),
      uid:                document.getElementById('signupUid').value.trim(),
      sid:                document.getElementById('signupSid').value.trim(),
      email:              document.getElementById('signupEmail').value.trim(),
      password:           pw,
      kasm_server_needed: false,
    };
    showSignupMsg('');
    showOAuthStep();
  };

  // ── Step 2: PUSD OAuth → create accounts ─────────────────

  window.handleGoogleSignIn = function(response) {
    try {
      const info  = parseJwt(response.credential);
      const email = info.email;
      if (!email.endsWith('@stu.powayusd.com') && !email.endsWith('@powayusd.com')) {
        showOAuthStatus('❌ Must use a @stu.powayusd.com or @powayusd.com school email.', true);
        return;
      }
      verifiedSchoolEmail = email;
      showOAuthStatus(`✅ School email verified: ${email}`);
      setTimeout(() => signup(), 1000);
    } catch (err) {
      showOAuthStatus('❌ Google Sign-In error. Please try again.', true);
    }
  };

  // ── Account creation ─────────────────────────────────────

  async function signup() {
    document.getElementById('backendStatusRow').style.display = 'none';
    document.getElementById('overallStatus').classList.add('hidden');

    const flaskPayload = {
      name:               signupFormData.name,
      uid:                signupFormData.uid,
      sid:                signupFormData.sid,
      email:              signupFormData.email,
      password:           signupFormData.password,
      kasm_server_needed: signupFormData.kasm_server_needed,
    };
    const springPayload = {
      uid:              signupFormData.uid,
      sid:              signupFormData.sid,
      email:            signupFormData.email,
      dob:              '11-01-2024',
      name:             signupFormData.name,
      password:         signupFormData.password,
      kasmServerNeeded: signupFormData.kasm_server_needed,
    };

    const [flaskRes, springRes] = await Promise.allSettled([
      fetch(`${pythonURI}/api/user`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flaskPayload)
      }).then(async r => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.message || body.error || `HTTP ${r.status}`);
        }
        return r.json();
      }),
      fetch(`${javaURI}/api/person/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(springPayload)
      }).then(async r => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error || body.message || `HTTP ${r.status}`);
        }
        return r.json();
      }),
    ]);

    const flaskOk  = flaskRes.status  === 'fulfilled';
    const springOk = springRes.status === 'fulfilled';
    const flaskErr  = flaskRes.reason?.message  || '';
    const springErr = springRes.reason?.message || '';
    console.log('[signup] flask:', flaskOk ? 'ok' : flaskErr, '| spring:', springOk ? 'ok' : springErr);
    updateOverallStatus(flaskOk, springOk, flaskErr, springErr);
  }

  // ── Login (both backends) ────────────────────────────────

  window.loginBoth = function() {
    localStorage.removeItem('forceLoggedOut');
    window._pythonLoginError = null;
    window._javaLoginFailed  = false;

    const clearFlask = fetch(`${pythonURI}/api/authenticate`, {
      ...fetchOptions, method: 'DELETE'
    }).catch(() => {});

    clearFlask.finally(() => {
      Promise.allSettled([
        new Promise(r => window.javaLogin(r)),
        new Promise(r => window.pythonLogin(r))
      ]).then(() => {
        if (window._pythonLoginError && window._javaLoginFailed) {
          document.getElementById('message').textContent = window._pythonLoginError;
        } else {
          window.location.href = '{{site.baseurl}}/profile';
        }
      });
    });
  };

  window.pythonLogin = function(done) {
    fetch(`${pythonURI}/api/authenticate`, {
      ...fetchOptions, method: 'POST',
      body: JSON.stringify({
        uid:      document.getElementById('uid').value,
        password: document.getElementById('password').value,
      })
    })
    .then(r => { if (!r.ok) window._pythonLoginError = 'Login error: ' + r.status; done(); })
    .catch(e => { window._pythonLoginError = 'Service error: ' + e; done(); });
  };

  window.javaLogin = function(done) {
    const creds = JSON.stringify({
      uid:      document.getElementById('uid').value,
      password: document.getElementById('password').value,
    });
    const opts = { ...fetchOptions, method: 'POST', body: creds };
    fetch(`${javaURI}/authenticate`, opts)
      .then(r => { if (!r.ok) throw new Error('Invalid login'); return r.text(); })
      .then(() => fetch(`${javaURI}/api/person/get`, fetchOptions))
      .then(r => { if (!r.ok) throw new Error('DB error'); return r.json(); })
      .then(() => done())
      .catch(err => {
        if (err.message === 'Invalid login') window._javaLoginFailed = true;
        done();
      });
  };

  // ── Helpers ──────────────────────────────────────────────

  function parseJwt(token) {
    const b64 = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
    return JSON.parse(decodeURIComponent(
      atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    ));
  }

  document.addEventListener('DOMContentLoaded', () => {
    ['signupPassword','confirmPassword'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => {
        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(validatePasswords, 900);
      });
    });
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: window.handleGoogleSignIn });
    }
  });
</script>
