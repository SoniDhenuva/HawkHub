# HawkHub Codebase Analysis

## Overview
This is a Jekyll-based fullstack web application inherited from an Open Coding Society educational platform. It includes dual backends (Flask + Spring), a GitHub Pages frontend, and extensive classroom utilities.

---

## Architecture Summary

### Frontend
- **Framework**: Jekyll (Ruby-based static site generator)
- **Location**: `/` (root)
- **Structure**: Markdown posts, Liquid templates, SASS styling
- **API Integration**: JavaScript modules fetch from backends

### Backends
Two separate backend servers:
1. **Flask (Python)** 
   - Local: `http://localhost:8587`
   - Production: `https://flask.opencodingsociety.com`
   - Endpoints: `/api/user/*`, `/authenticate`, `/api/feedback/*`, `/api/id`

2. **Spring (Java)**
   - Local: `http://localhost:8585`
   - Production: `https://spring.opencodingsociety.com`
   - Endpoints: `/api/assignments`, `/api/grades`, `/api/challenge-submission/*`

### WebSocket Server
- **Node.js + Socket.IO** in `/node_backend/`
- Basic connection/disconnect handler
- Used for real-time state updates

---

## CORE INFRASTRUCTURE (Must Preserve)

### 1. Authentication System ✅ CRITICAL
**Files**: 
- `/assets/js/api/config.js` - Centralized backend URI config and login function
- References throughout: `microblog_foundation.html`, `feedback_foundation.html`

**Features**:
- JWT/Session-based login function (multimethod GET/POST)
- Guest account creation: `POST /api/user/guest`
- Login endpoint: `POST /authenticate`
- User object stored in `window.user` with `uid` property
- CORS-enabled fetch with credentials

**Why Critical**: All features depend on authentication state; removing breaks the entire app.

---

### 2. User Accounts & User Model ✅ CRITICAL
**Evidence**: 
- `window.user` object with `uid`, `password` fields
- User identification in feedback: `window.user?.uid || "Anonymous"`
- Role-based navigation checks in `/includes/nav/homejava.html`

**What's Stored**:
- Username/UID
- Password (hashed on backend)
- Roles array (e.g., `ROLE_TEACHER`)

**Why Critical**: Every feature requires knowing who is logged in and their permissions.

---

### 3. Role-Based Access Control (RBAC) ✅ CRITICAL
**Evidence**:
- Role dropdown in admin panel: `<select id="role" name="role">`
- Navigation conditional: `const isTeacher = data.roles.some(role => role.name === 'ROLE_TEACHER');`
- Admin role management in `admin_foundation.html` line 440+

**Current Roles Detected**:
- `ROLE_TEACHER` (used in navigation)
- Unknown others (likely Student, Admin, etc.)

**Why Critical**: HawkHub requires 4 roles (Admin, Advisor, Club Leader, Student); this infrastructure exists and must be reused.

---

### 4. Frontend Infrastructure ✅ CRITICAL
**Files**:
- `/assets/js/api/config.js` - Backend routing (must update URIs)
- `/assets/js/` - General JavaScript utilities
- `/_includes/themes/minima/base.html` - Master layout
- `/_sass/` - SCSS styling framework
- `/Gemfile`, `/_config.yml` - Jekyll configuration

**Why Critical**: The entire website is built on this; removing breaks rendering.

---

### 5. Navigation & Layout Structure ✅ CRITICAL
**Files**:
- `/_includes/nav/` - Navigation components
- `/_includes/themes/` - Layout templates (.html layouts)
- `/_layouts/` - Jekyll layout system
- `/_data/navigation.yml` - Navigation configuration
- `/_data/submenu.yml` - Submenu structure

**Why Critical**: Defines how pages are organized; HawkHub needs club directory here.

---

### 6. Database Models & Backend Storage ⚠️ EXISTS ELSEWHERE
**Status**: Models are NOT in this repository—they're in private Flask/Spring backend repositories

**Evidence**:
- No Python models in root directory
- No Java entity classes committed to GitHub Pages repo
- Backend URIs point to external services

**Actions Needed**:
- Flask backend: Add User, Club, Role, Permission models
- Spring backend: Consider for advanced features (chat, posts, calendar)

---

## FEATURE-SPECIFIC SYSTEMS (Safe to Remove)

### 1. 🧹 Bathroom Pass System
**Files**:
- `/_includes/bathroom_pass.html` (basic form)
- `/_layouts/bathroom/` directory
- `/_posts/student_toolkit/BathroomPass/` (2 posts)

**What it does**: Generates digital bathroom passes for classroom management
**Data**: Student name, destination (bathroom, office, etc.), timestamp
**Why Remove**: Unrelated to club management

**Removal Impact**: LOW - isolated component, no cross-dependencies

---

### 2. 🗨️ Microblog System
**Files**:
- `/_includes/microblog_foundation.html` (511 lines)
- Guest signup + post creation + rendering
- Styles in `_sass/`

**What it does**: Real-time blogging/messaging for authenticated users
**Backend**: Flask API at `/api/` endpoints

**Why Partial**: Valuable for future HawkHub posts/announcements, but current implementation is classroom-specific

**Removal Impact**: MEDIUM - integrated into base.html template; removing requires template refactoring

---

### 3. 📊 Grading System
**Files**:
- `/_includes/grading_foundation.html` (294 lines)
- Rubric panel, assignment tracking
- Backend: Spring at `/api/assignments`, `/api/grades`

**What it does**: Teachers grade assignments with rubric criteria
**Features**: Rubric scoring (4-point scale), per-student tracking

**Why Remove**: Not applicable to club directory

**Removal Impact**: MEDIUM - independent component, safe to delete

---

### 4. 📝 Feedback System
**Files**:
- `/_includes/feedback_foundation.html` (285 lines)
- Lesson feedback/comments per page

**What it does**: Collect inline feedback on lessons/content
**Backend**: Flask at `/api/feedback/`

**Why Remove**: Classroom-specific; chat/comments would replace this in HawkHub

**Removal Impact**: LOW - fully self-contained

---

### 5. 🔔 Inbox System
**Files**:
- `/_includes/inbox_foundation.html` (341 lines)
- Message management interface
- Backend: Flask at `/api/id`

**What it does**: Centralized notification/message panel
**Why Keep?**: Could evolve into HawkHub member messages (medium-term feature)

**Removal Impact**: LOW - self-contained, but requires message backend

---

### 6. 🎮 Admin Panel (Extensive)
**Files**:
- `/_includes/admin_foundation.html` (815 lines - largest component)
- Student/score management, data import/export
- Backend: Spring API integration

**Current Features**:
- User creation / role assignment
- Assignment/score management and editing
- CSV import/export of student data

**Why Customizable**: This admin infrastructure could adapt to club management; moderately relevant for HawkHub

**Removal Impact**: HIGH - large file; architecture is reusable for club admin

---

### 7. 🎰 Gamify Features (Extensive)
**Files**:
- `/_posts/gamify/` - Entire directory (stocks, crypto, casino, games)
- `GameLessons/` directory
- Associated styles and assets

**What it does**: Educational gamification with stock trading, crypto mining, casino games, etc.

**Why Remove**: Completely unrelated to HawkHub

**Removal Impact**: VERY HIGH - multiple deep subdirectories, large asset footprint (~1000+ files estimated)

---

### 8. 📚 Student/Teacher Toolkit
**Files**:
- `/_posts/student_toolkit/` - Productivity tools, calendar, assignments, casino
- `/_posts/teacher_toolkit/` - Student management, groups
- Nested sub-features

**What it does**: Comprehensive classroom management utilities

**Subcomponents**:
- Calendar system (CSA/CSP/CSSE course calendars)
- Screen Queue (classroom queue management)
- Student/Class grouping tools
- Assignment tracking

**Why Remove**: Classroom-specific utilities

**Removal Impact**: VERY HIGH - extensive feature set; multiple nested dependencies

---

### 9. 🧩 Code/Game/UI Runners
**Files**:
- `/_includes/code-runner.html` - Execute JavaScript/Python inline
- `/_includes/game-runner.html` - Embed games
- `/_includes/ui-runner.html` - Run UI demos
- `/_includes/challenge-submit-button.html` - Submit solutions

**What it does**: Interactive code execution and grading

**Why Remove**: Educational tool, not club-related

**Removal Impact**: MEDIUM - affects notebook posts but isolated from core

---

### 10. 📓 Jupyter Notebook Integration
**Files**:
- `/_notebooks/` - Raw notebook sources
- `/_includes/notebook_*.html` - Links to Colab, Binder, GitHub
- Conversion scripts in `/scripts/`

**What it does**: Converts `.ipynb` files to Jekyll posts

**Why Remove**: Educational content system

**Removal Impact**: HIGH - conversion system is wired into Makefile and build process

---

### 11. 🎓 Student CSA/CSP/CSSE Content
**Files**:
- `/_posts/Foundation/` - Extensive curriculum content
- References throughout: courses: `{'csa': {...}, 'csp': {...}, ...}`
- Flashcard systems, lesson hierarchies

**Why Remove**: Course-specific educational material

**Removal Impact**: VERY HIGH - thousands of files/references

---

### 12. 🎨 Other Classroom Utilities
**Files**:
- Flashcard systems (various)
- Certificate system
- Whiteboard tool
- Theme selector
- Utterances comment system (can reuse)

**Removal Impact**: VARIES - most are isolated

---

## Recommended Removal Priority

### PHASE 1: REMOVE IMMEDIATELY (Safe, Low Impact)
- [ ] **Bathroom Pass System**: `_includes/bathroom_pass.html` + `_posts/student_toolkit/BathroomPass/`
- [ ] **Grading System**: `_includes/grading_foundation.html`
- [ ] **Feedback System**: `_includes/feedback_foundation.html`
- [ ] **Flashcard Systems**: Various flashcard YAML configs

### PHASE 2: REMOVE NEXT (Feature-Specific Content)
- [ ] **Gamify Directory**: `_posts/gamify/` (entire folder)
- [ ] **GameLessons**: `_posts/GameLessons/`
- [ ] **Classroom Content**: Most of `_posts/Foundation/`, `_posts/GameLessons/`
- [ ] **Calendar/Queue Systems**: `_posts/student_toolkit/ProductivityFrontend/`
- [ ] **Code/Game Runners**: If not using interactive features

### PHASE 3: REFACTOR/ADAPT (Reusable Infrastructure)
- [ ] **Admin Panel**: Refactor for club management instead of student grading
- [ ] **Microblog**: Adapt for club posts/announcements
- [ ] **Inbox**: Adapt for club member messaging
- [ ] **Navigation**: Add club directory pages
- [ ] **Stylesheet**: Migrate to HawkHub branding

### PHASE 4: KEEP UNCHANGED (Core Infrastructure)
- ✅ `/.env` - Backend config (update URIs)
- ✅ `/assets/js/api/config.js` - Backend routing
- ✅ `/_config.yml` - Site configuration
- ✅ `/_includes/themes/` - Layout system
- ✅ `/Gemfile`, `Makefile` - Build system
- ✅ `/_data/navigation.yml` - Navigation structure
- ✅ `/node_backend/` - WebSocket server (may be useful)
- ✅ All RBAC/Auth-related code

---

## HawkHub-Specific Next Steps

### 1. Backend Infrastructure
**Flask Backend (Required)**:
- User model with 4 roles: Admin, Advisor, Club Leader, Student
- Club model (100+ clubs)
- Club membership model (student → clubs)
- Permission system for role-based routes

**Java/Spring Backend (Optional, Future)**:
- Posts system
- Chat system
- Calendar events
- Club recommendations

### 2. Frontend Pages to Create
- **Club Directory**: Browse all clubs
- **Club Profile**: View club info, join/leave
- **My Clubs**: Dashboard showing student's clubs
- **Admin Dashboard**: Manage clubs, users, roles (adapt existing admin panel)

### 3. Frontend Cleanup
1. Remove classroom utilities from navigation
2. Update color scheme/branding
3. Modify login page to be HawkHub-focused
4. Remove course filters (CSA/CSP references)

### 4. File Structure Recommendation
```
HawkHub/
├── _posts/
│   ├── clubs/           # NEW: Club-related content
│   ├── Foundation/      # KEEP: General guides only
│   └── (remove others)
├── _includes/
│   ├── microblog_foundation.html  # ADAPT: For club posts
│   ├── admin_foundation.html      # ADAPT: For club admin
│   ├── inbox_foundation.html      # ADAPT: For club messages
│   └── (remove grading, feedback, etc.)
├── assets/
│   └── js/api/config.js           # UPDATE: Backend URIs
└── (everything else: KEEP)
```

---

## Summary Table

| Component | Status | Files | Recommendation |
|-----------|--------|-------|-----------------|
| **Authentication** | ✅ CRITICAL | api/config.js | KEEP - Core infrastructure |
| **RBAC/Roles** | ✅ CRITICAL | admin_foundation.html | KEEP - Adapt for 4 roles |
| **User Model** | ✅ CRITICAL | Backend only | KEEP - Extend in Flask |
| **Navigation** | ✅ CRITICAL | nav/, _data/ | KEEP - Refactor for clubs |
| **Jekyll Build** | ✅ CRITICAL | Makefile, Gemfile | KEEP - No changes needed |
| **Microblog** | ⚠️ ADAPT | microblog_foundation.html | ADAPT → Club posts |
| **Admin Panel** | ⚠️ ADAPT | admin_foundation.html | ADAPT → Club admin |
| **Inbox** | ⚠️ ADAPT | inbox_foundation.html | ADAPT → Club DMs |
| **Grading** | 🗑️ REMOVE | grading_foundation.html | DELETE |
| **Feedback** | 🗑️ REMOVE | feedback_foundation.html | DELETE |
| **Bathroom Pass** | 🗑️ REMOVE | bathroom_pass.html | DELETE |
| **Gamify** | 🗑️ REMOVE | _posts/gamify/ | DELETE (entire dir) |
| **GameLessons** | 🗑️ REMOVE | GameLessons/ | DELETE (entire dir) |
| **Student Toolkit** | 🗑️ REMOVE | _posts/student_toolkit/ | DELETE (most) |
| **Teacher Toolkit** | 🗑️ REMOVE | _posts/teacher_toolkit/ | DELETE |
| **CSA/CSP Content** | 🗑️ REMOVE | _posts/Foundation/ (mostly) | DELETE course content |

---

## File Count Summary

**Estimated sizes**:
- Core infrastructure: ~50-100 files (keep all)
- Classroom utilities: ~200+ files (remove)
- Educational content: ~1000+ files (remove)
- Assets/Media: ~500+ files (selective cleanup)

**Recommended final size**: 300-400 files (from ~2000+)

---

## Appendix: Key File Locations

### Keep These
```
.env
.github/
.gitignore
Gemfile
Makefile
README.md
_config.yml
_data/
_includes/themes/
_includes/nav/
_layouts/
_sass/
assets/
favicon.* 
manifest.json
service-worker.js
node_backend/
```

### Remove These Dir
```
_posts/gamify/
_posts/GameLessons/
_posts/student_toolkit/
_posts/teacher_toolkit/
_posts/Foundation/ (selectively)
hacks/ (educational exercises)
```

### Adapter These
```
_includes/admin_foundation.html → club admin
_includes/microblog_foundation.html → club posts
_includes/inbox_foundation.html → club messaging
_layouts/  → update to HawkHub branding
```

---

**Generated**: February 26, 2026  
**Analysis Type**: Inheritance Codebase Assessment  
**Confidence**: HIGH (physical code inspection)
