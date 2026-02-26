# HawkHub Jekyll Structural Refactoring Guide
## Safe Deletion Order & Build Hook Management

**Generated**: February 26, 2026  
**Purpose**: Safely strip inherited educational platform to core infrastructure  
**Status**: Pre-execution analysis (no code changes recommended yet)

---

## CRITICAL: Build Hooks & Makefile Targets to DISABLE First

### 🔴 GitHub Actions Workflow (MUST DISABLE BEFORE DELETIONS)

**File**: `.github/workflows/jekyll-gh-pages.yml`

The workflow currently executes three Python conversion scripts on every push:

```yaml
1. python scripts/convert_notebooks.py  # ← NOTEBOOK CONVERSION
2. python scripts/convert_docx.py       # ← DOCX CONVERSION
3. python scripts/split_multi_course_files.py  # ← COURSE SPLITTING
```

**Action Required Before Any Deletions**:
You must comment out these three steps in the workflow, OR the build will fail when it tries to import deleted Python modules.

**Why This Matters**: The workflow runs BEFORE `jekyll build`, so if these scripts are missing but the workflow tries to execute them, the entire GitHub Pages deployment fails.

**Safe Approach**:
1. Comment out the three conversion/splitting steps (leave the rest)
2. Push this change to main FIRST (before deleting anything locally)
3. Verify the workflow passes
4. Then proceed with local deletions

---

### 🔴 Makefile Conversion Targets

The Makefile references classroom-specific conversion and splitting:

**Targets to comment out or simplify** (in order of dependency):

#### Phase 1: Scripts that will become obsolete
```makefile
# Line ~140: NOTEBOOK CONVERSION PIPELINE
convert: $(MARKDOWN_FILES) convert-docx    # ← Remove this line
                                            # Remove rule: $(DESTINATION_DIRECTORY)/%_IPYNB_2_.md

# Line ~160: DOCX CONVERSION  
convert-docx:                              # ← Comment out
# ... entire convert-docx target

# Line ~180: DOCX single-file
convert-docx-single:                       # ← Comment out
# ... entire convert-docx-single target

# Line ~195: DOCX cleanup
clean-docx:                               # ← Comment out
# ... entire clean-docx target

# Line ~220: COURSE SPLITTING
split-courses:                             # ← Comment out
clean-courses:                             # ← Comment out

# Line ~260: WATCH NOTEBOOKS
watch-notebooks:                           # ← Comment out
```

#### Phase 2: Update the default serve/build targets
```makefile
# Current (line ~80):
serve-current: stop convert split-courses jekyll-serve

# Should become:
serve-current: stop jekyll-serve

# Current (line ~115):
build-current: clean convert split-courses
	@bundle install
	@bundle exec jekyll clean
	@bundle exec jekyll build

# Should become:
build-current: clean
	@bundle install
	@bundle exec jekyll clean
	@bundle exec jekyll build
```

#### Phase 3: Simplify main targets
```makefile
# Current (line ~78):
default: serve-current
	@touch /tmp/.notebook_watch_marker
	@make watch-notebooks &           # ← Remove this
	@make watch-files &               # ← Can keep this

# Current (line ~290):
dev: stop clean jekyll-serve
	@make watch-notebooks &            # ← Remove this
	@make watch-files &

# Should become:
dev: stop clean jekyll-serve
	@make watch-files &
```

**Why This Matters**: If Makefile calls `convert` target but `convert_notebooks.py` is deleted, `make serve` fails immediately.

---

## Hidden Template Include Dependencies

### Master Layout Dependency Chain

```
Every page
  ↓
_layouts/opencs.html
  ↓
_includes/themes/minima/base.html  ← MASTER TEMPLATE
  ├─ {% include head.html %}
  ├─ {% include themes/minima/header.html %}
  │  └─ Includes /includes/nav/*.html (CONDITIONAL)
  ├─ {% if page.microblog %} → microblog_foundation.html
  ├─ {% if page.feedback %} → feedback_foundation.html
  ├─ {% if page.admin %} → admin_foundation.html
  ├─ {% if page.grading %} → grading_foundation.html
  ├─ <main>{{ content }}</main>
  ├─ {% include themes/minima/footer.html %}
  └─ {% include mermaid.html %}
```

**Key Finding**: The base template uses CONDITIONAL INCLUDES based on frontmatter flags:
- `page.microblog: true` → pulls in microblog_foundation.html
- `page.feedback: true` → pulls in feedback_foundation.html
- `page.admin: true` → pulls in admin_foundation.html
- `page.grading: true` → pulls in grading_foundation.html

**Critical for Safe Deletion**: Since NO existing posts use these flags (grep found zero `microblog: true` in frontmatter), removing these includes won't break any current pages.

**Safe to Delete**:
```html
<!-- These three lines can be SAFELY deleted from base.html -->
{% if page.microblog %}
  {% include microblog_foundation.html %}
  {% include inbox_foundation.html %}
{% endif %}

{% if page.feedback %}
  {% include feedback_foundation.html %}
{% endif %}

{% if page.admin %}
  {% include admin_foundation.html %}
{% endif %}

{% if page.grading %}
  {% include grading_foundation.html %}
{% endif %}
```

**Safe Because**: No posts reference these flags.

---

## Layout Dependencies & Safe Deletion Order

### Classroom-Specific Layouts (42 posts affected)

**Current situation**: 42 posts use these layouts:
- `bathroom/teacher`, `bathroom/scanner`, `bathroom/statistics`
- `calendar`, `student_toolkit`, `teaching`, `courses`
- `finance`, `fortunefinders`, `fortunefindersCasino`, `fortunefindersBank`
- `certchatbot`, `sprint`, `schedule`

### Safe Deletion Strategy

**PHASE 1: Delete Isolated Layouts (NO inheritance chain)**

These layouts don't inherit from other custom layouts and don't affect core functionality:

```
DELETE ENTIRE DIRECTORIES:
─ _layouts/bathroom/
   └─ teacher.html
   └─ scanner.html  
   └─ statistics.html

DELETE INDIVIDUAL FILES:
─ _layouts/certchatbot.html
─ _layouts/finance.html
─ _layouts/fortunefinders.html
─ _layouts/fortunefindersBank.html
─ _layouts/fortunefindersCasino.html
─ _layouts/schedule.html
```

**Why Safe**: These layouts inherit from `opencs`, which inherits from nothing custom. Deleting them breaks only their own posts, not the core system.

**Impact**: ✅ LOW - 15+ posts will 404, but Jekyll build succeeds

**Removal Impact**: STRAIGHTFORWARD - Just delete files

---

**PHASE 2: Delete Course-Heavy Layouts**

```
DELETE:
─ _layouts/courses.html
─ _layouts/sprint.html
─ _layouts/teaching.html
```

**Why Safe**: These three are independent; no other layouts reference them.

**Impact**: ✅ LOW - Only affects specific course content

---

**PHASE 3a: REFACTOR _layouts/post.html (LARGE FILE - 1549 LINES)**

**Status**: ⚠️ CRITICAL - This file has HEAVY COURSE DEPENDENCY

**Current Content**:
- Lines 1-30: Course context detection (CSP, CSA, CSSE, CWGU)
- Lines 31-150: Two-pane lesson player (course-specific course sidebar)
  - Sprint navigation with course data
  - Week filtering
  - Course progress tracking
- Remaining: Course-specific styling and state management

**What to Keep** (essential for non-course posts):
- Layout inheritance: `layout: opencs`
- Basic post metadata (title, author, date)
- Content rendering: `{{ content }}`
- User authentication checks (if present)

**What to Remove**:
- Lines 7-27: `{% if page.courses... %}` course detection logic
- Lines 31-200+: Entire two-pane lesson player div
- Course-specific sidebar JavaScript
- Sprint navigation logic
- Progress bar styling
- Week-based post filtering

**Safe Refactoring Approach**:
1. Create a backup: `_layouts/post.html.backup`
2. Find the first occurrence of `<main>` tag or `{{ content }}`
3. Delete everything before `<main>` except the YAML front matter
4. Keep everything from `{{ content }}` to end of file
5. Remove course-specific CSS/JS blocks

**Result**: ~50-100 line simple layout instead of 1549 lines

**Risk Level**: 🟡 MEDIUM - This affects ALL blog posts, so test heavily after changes

---

**PHASE 3b: DELETE _layouts/calendar.html**

```
DELETE:
─ _layouts/calendar.html
```

**Why Safe**: Self-contained classroom utility.

---

**PHASE 3c: DELETE _layouts/student_toolkit.html**

```
DELETE:
─ _layouts/student_toolkit.html
```

**Why Safe**: Self-contained classroom utility.

---

### Layouts to KEEP (Core Infrastructure)

```
KEEP (No changes):
─ _layouts/opencs.html          ← Wrapper for base template
─ _layouts/page.html            ← Standard Jekyll page layout
─ _layouts/post.html            ← REFACTOR (see above)
─ _layouts/default.html         ← If exists, preserve
─ _layouts/base.html            ← If exists, preserve

KEEP (Check but likely safe):
─ _layouts/error_page.html      ← 404 handling
─ _layouts/search.html          ← Search functionality
─ _layouts/profile.html         ← User profile (if used for auth)
─ _layouts/dashboard.html       ← Could be HawkHub admin dashboard
─ _layouts/gamebuilder.html     ← Only if repurposing for clubs
```

---

## Navigation Include Dependencies & Cleanup

### Navigation Files Requiring Refactoring

**File**: `_includes/nav/homejava.html`

**Current Content**:
```javascript
// Line ~23-40: Dynamic link generation
const calendarLink = document.getElementById('calendarLink');
const studentToolkitLink = document.getElementById('studentToolkitLink');
const teacherToolkitLink = document.getElementById('teacherToolkitLink');

// These create links to classroom features:
- /student/calendar → calendar.html layout
- /student → student_toolkit.html layout
- /teacher → teacher_toolkit.html layout
```

**Safe Removal**:
1. Delete lines that reference `calendarLink`, `studentToolkitLink`, `teacherToolkitLink`
2. Delete the HTML placeholders:
   ```html
   <td id="calendarLink"></td>
   <td id="studentToolkitLink"></td>
   <td id="teacherToolkitLink"></td>
   ```
3. Add HawkHub navigation links instead:
   ```html
   <td id="clubLink">
     <a href="{{site.baseurl}}/clubs">Club Directory</a>
   </td>
   <td id="myClubsLink">
     <a href="{{site.baseurl}}/my-clubs">My Clubs</a>
   </td>
   ```

**Impact**: ✅ LOW - just navigation changes, no build breakage

**Note**: Keep the role-based visibility logic (`ROLE_TEACHER`, `isTeacher` checks) — this is core RBAC.

---

**File**: `_includes/nav/home.html`

**Current Content**:
```html
<td><a href="{{site.baseurl}}/navigation/courses/csse">CSSE</a></td>
<td><a href="{{site.baseurl}}/navigation/courses/csp">CSP</a></td>
<td><a href="{{site.baseurl}}/navigation/courses/csa">CSA</a></td>
```

**Action**: Delete these three course links entirely.

**Impact**: ✅ LOW - classroom-specific navigation, no build impact

---

**Directory**: `_includes/nav/toolkits/` (classroom utilities)

**Current Content**:
- `productivity-frontend/menu.html` → references calendar, presentations, student confirmation
- Other toolkit menus

**Action**: Delete entire `_includes/nav/toolkits/` directory

**Impact**: ✅ LOW - classroom utilities, no build impact

---

### Navigation Files to KEEP

```
KEEP (No changes):
─ _includes/nav/*.html (except those listed above)
─ _includes/nav/homejava.html (but REFACTOR as described)
─ _includes/head.html            ← Authentication scripts
─ _data/navigation.yml           ← Navigation data
─ _data/submenu.yml              ← Submenu structure
```

---

## Post Deletion Guide

### Which _posts Subdirectories to Delete

**SAFE TO DELETE ENTIRELY** (no cross-references):

```
_posts/gamify/                    ← ~300 files - Stock/crypto/casino games
_posts/GameLessons/               ← ~100 files - Game-based curriculum
_posts/student_toolkit/           ← ~80 files - Bathroom pass, calendar, etc.
_posts/teacher_toolkit/           ← ~40 files - Student management
_posts/Maps_Persona/              ← Unknown - likely classroom content
_posts/Foundation/                ← ~500+ files - CSA/CSP/CSSE curriculum
  (subdirectories):
  ├─ delete: A-agile_classroom/
  ├─ delete: B-tools_and_equipment/
  ├─ delete: D-sass_aesthetihawk-guides/
  ├─ delete: E-linux_cyber/
  ├─ delete: F-projects/
  ├─ delete: G-sprints/
  ├─ delete: H-Help/
  └─ KEEP: C-github_pages/ (some general Jekyll content)
```

**Why Safe**: No other posts reference them in frontmatter links or includes.

**Total Deletion**: ~1000+ files

**Build Impact**: ✅ NONE - Jekyll only processes existing posts

---

### Which _posts Content to KEEP

```
KEEP:
_posts/*                          ← General blog/content posts (if any)
_posts/Foundation/C-github_pages/ ← GitHub Pages documentation
                                    (keep only if relevant to HawkHub)
```

---

## Stylesheet & Asset Cleanup

### SCSS Files Requiring Attention

**File**: `_sass/open-coding/`

**Classroom-Specific Styles to Remove** (identifies classroom features):

```
_sass/:
├─ find all files that reference:
│  ├─ .bathroom { ... }
│  ├─ .calendar { ... }
│  ├─ .gamify { ... }
│  ├─ .course { ... }
│  ├─ .sprint { ... }
│  ├─ .student-toolkit { ... }
│  ├─ .grading { ... }
│  ├─ .csa-*, .csp-*, .csse-* { ... }
│  └─ .lesson-player { ... }
```

**Action**:
1. Search `_sass/` for classroom class names
2. Remove or comment out those style blocks (but keep cascade intact)
3. Test that site still renders after cleanup

**Safe Approach**: Comment first, delete later after visual verification

---

### Assets Directory Cleanup

**Safe to Delete**:
```
assets/Bathroom/              ← Bathroom pass sounds/styles
images/notebooks/             ← Notebook-related assets
```

**Safe to Keep**:
```
assets/badges/                ← Deployment badges (keep)
assets/css/                   ← Core styling (review then keep)
assets/js/api/                ← ✅ CRITICAL - Keep all auth/API code
  ├─ config.js                ← ✅ Backend URI configuration
  ├─ login.js                 ← ✅ Authentication
  └─ *.js                     ← Review individually
assets/icons/                 ← Keep
assets/sounds/                ← Review (may be classroom specific)
```

---

## Data Files (_data/) Cleanup

### Safe to Review

```
_data/:
├─ adventureGame.yml          ← Delete (gamify)
├─ alienWorld.yml             ← Delete (classroom)
├─ algorithms.yml             ← Delete (classroom curriculum)
├─ breakoutHacks.yml          ← Delete
├─ Connect4infographic.yml    ← Delete (gamify)
├─ cs.yml, csa.yml, csp.yml, csse.yml, cwgu.yml  ← Delete (course data)
├─ gamify_cards.yml           ← Delete
├─ navigation.yml             ← ✅ KEEP (but update for HawkHub)
├─ submenu.yml                ← ✅ KEEP (but update for HawkHub)
├─ school_calendar.yml        ← Delete
└─ *.yml (courses, lessons)   ← Delete if classroom-specific
```

**Safe to Keep**:
```
_data/navigation.yml          ← Update navigation structure
_data/submenu.yml             ← Update submenu structure
```

---

## Scripts to Delete or Keep

### Safe to DELETE

```bash
# Remove conversion scripts entirely
scripts/convert_notebooks.py    ← Delete (notebooks)
scripts/convert_docx.py         ← Delete (DOCX files)
scripts/split_multi_course_files.py  ← Delete (course splitting)
scripts/check_conversion_warnings.py ← Delete (notebook diagnostics)
scripts/md2ipynb.py            ← Delete (markdown to notebook)

# Remove classroom/game API scripts
scripts/github_api_funcs.py    ← Delete (GitHub classroom integration)
scripts/kasm_api_funcs.py      ← Delete (classroom VM management)
scripts/prs_issues.py          ← Delete (PR/issue management)
scripts/prs_issues_summary.py  ← Delete
scripts/pull_issues.py         ← Delete
```

### Safe to KEEP

```bash
scripts/activate*.sh           ← Keep (environment setup)
scripts/setup_*.sh             ← Keep (system setup)
scripts/create_local_color_map.py  ← Keep (theme colors)
scripts/frontmatter_manager.py     ← Keep (post metadata)
scripts/progress_bar.py            ← Keep (utility)
scripts/tilt.js                    ← Keep (build utility)
scripts/uncomment_tool.sh          ← Keep (utility)
scripts/theme_colors.json          ← Keep (theme config)
scripts/switch-theme.sh            ← Keep (theme switching)
```

---

## requirements.txt Cleanup

**Current content**: Likely includes packages for notebook conversion and DOCX parsing.

**After removing conversion scripts**, you can simplify:

**Safe to Remove**:
- nbconvert (notebook conversion)
- nbformat (notebook format handling)
- python-docx (DOCX file parsing)
- markdownify (HTML to markdown)
- mammoth (DOCX library)

**Must Keep**:
- Any Flask/Django packages (if Flask backend repo references)
- pyyaml (Jekyll data files)
- Pillow (image processing)
- python-dotenv (environment variables)
- requests (HTTP requests)
- pandas, scikit-learn (if keeping any data-related posts)

---

## Safe Deletion Order (Step-by-Step)

### STEP 1: Prepare & Protect (Do NOT push yet)

```bash
# Backup current state
git commit -m "Pre-refactoring backup"
git branch backup/pre-hawkhub-refactor

# Create feature branch
git checkout -b feat/hawkhub-cleanup
```

### STEP 2: Update GitHub Actions FIRST (Push this immediately)

**File**: `.github/workflows/jekyll-gh-pages.yml`

Comment out three conversion steps:
```yaml
# - name: Execute notebook conversion script
#   run: |
#     source venv/bin/activate
#     python scripts/convert_notebooks.py

# - name: Execute DOCX conversion script
#   run: |
#     source venv/bin/activate
#     if [ -d "_docx" ] && [ "$(ls -A _docx 2>/dev/null)" ]; then
#       echo "Converting DOCX files..."
#       python scripts/convert_docx.py
#     else
#       echo "No DOCX files found, skipping conversion"
#     fi

# - name: Split multi-course files
#   run: |
#     source venv/bin/activate
#     python scripts/split_multi_course_files.py
```

**Push this change alone**:
```bash
git add .github/workflows/jekyll-gh-pages.yml
git commit -m "Disable classroom-specific conversion scripts"
git push origin feat/hawkhub-cleanup
```

**Wait for GitHub Actions to succeed** before proceeding.

---

### STEP 3: Update Makefile

**File**: `Makefile`

Comment out conversion/splitting/watching targets and update serve/build targets.

```bash
git add Makefile
git commit -m "Disable Makefile conversion targets"
```

---

### STEP 4: Delete _layouts Directory Files (PHASE 1)

**Delete these files** (bathroom, finance, gamify, etc.):

```bash
rm -rf _layouts/bathroom/
rm _layouts/certchatbot.html
rm _layouts/finance.html
rm _layouts/fortunefinders*.html
rm _layouts/schedule.html
git add -A
git commit -m "Remove classroom-specific layouts (phase 1)"
```

**Test locally**:
```bash
make stop
make dev
# Visit http://localhost:4500
# Verify non-course pages still render
```

---

### STEP 5: Delete _layouts Directory Files (PHASE 2)

```bash
rm _layouts/courses.html
rm _layouts/sprint.html
rm _layouts/teaching.html
rm _layouts/calendar.html
rm _layouts/student_toolkit.html
git add -A
git commit -m "Remove course/toolkit layouts (phase 2)"
```

---

### STEP 6: Refactor _layouts/post.html (PHASE 3 - CAREFUL!)

1. Backup:
```bash
cp _layouts/post.html _layouts/post.html.backup
```

2. Edit post.html:
   - Delete lines 7-27 (course detection logic)
   - Delete lines 31-650 (two-pane lesson player div)
   - Delete course-specific CSS blocks
   - Keep basic layout structure

3. Verify content still renders:
```bash
make stop
make dev
# Visit any blog post
# Verify title, date, content all appear
```

4. Commit:
```bash
git add _layouts/post.html
git commit -m "Refactor post.html to remove course-specific lesson player"
```

---

### STEP 7: Delete Template Includes from base.html

**File**: `_includes/themes/minima/base.html`

Remove the four conditional include blocks:

```bash
git add _includes/themes/minima/base.html
git commit -m "Remove unused conditional template includes (feedback, grading, etc.)"
```

---

### STEP 8: Update Navigation Includes

**Files**:
- `_includes/nav/homejava.html` (refactor)
- `_includes/nav/home.html` (remove course links)
- `_includes/nav/toolkits/` (delete directory)

```bash
# Refactor homejava.html
git add _includes/nav/homejava.html

# Remove course links from home.html
git add _includes/nav/home.html

# Delete toolkits directory
rm -rf _includes/nav/toolkits/
git add -A

git commit -m "Refactor navigation: remove classroom utilities, prepare for clubs"
```

---

### STEP 9: Delete _posts Directories

**Phase A - Delete Large Directories First**:

```bash
rm -rf _posts/gamify/
rm -rf _posts/GameLessons/
rm -rf _posts/Maps_Persona/
rm -rf _posts/student_toolkit/
rm -rf _posts/teacher_toolkit/
rm -rf _posts/Foundation/        # (or selectively delete subdirs)
git add -A
git commit -m "Remove educational/classroom content posts"
```

**Before pushing**: `make build` to verify Jekyll build succeeds

---

### STEP 10: Delete Conversion Scripts

```bash
rm scripts/convert_notebooks.py
rm scripts/convert_docx.py
rm scripts/split_multi_course_files.py
rm scripts/check_conversion_warnings.py
rm scripts/md2ipynb.py
rm scripts/github_api_funcs.py
rm scripts/kasm_api_funcs.py
rm scripts/prs_issues*.py
rm scripts/pull_issues.py
git add -A
git commit -m "Delete classroom conversion and API scripts"
```

---

### STEP 11: Cleanup _data Files

```bash
rm _data/adventureGame.yml
rm _data/alienWorld.yml
rm _data/cs.yml _data/csa.yml _data/csp.yml _data/csse.yml _data/cwgu.yml
# ... (delete all course-specific YAML files)
git add -A
git commit -m "Remove course and gamify data files"
```

---

### STEP 12: Simplify requirements.txt

Edit `requirements.txt` to remove:
- nbconvert
- nbformat
- python-docx
- markdownify
- mammoth

Keep minimal set for remaining features.

```bash
git add requirements.txt
git commit -m "Simplify requirements: remove notebook/DOCX conversion deps"
```

---

### STEP 13: Final Build Test & Push

```bash
make clean
make build
# Verify _site/ is generated without errors

# If successful:
git push origin feat/hawkhub-cleanup

# Create pull request **DO NOT MERGE YET**
# Review all changes before merging
```

---

## Testing Checklist After Each Phase

After each step, run:

```bash
make stop
make clean
make dev
# Test in browser:
```

Verify:
- [ ] Homepage renders without errors
- [ ] Navigation links work (don't 404)
- [ ] Login page accessible at /login
- [ ] No JavaScript errors in browser console
- [ ] No Jekyll build warnings
- [ ] Responsive design still works

---

## Estimated File Reduction

```
Before:
  - _layouts: ~30 files
  - _includes: ~100+ files
  - _posts: ~1500+ files
  - scripts: ~27 Python scripts
  - TOTAL: ~2000+ files

After HawkHub cleanup:
  - _layouts: ~8 core files ✅
  - _includes: ~30 core + auth files ✅
  - _posts: ~100-200 general posts
  - scripts: ~10 utility scripts
  - TOTAL: ~300-400 files ✅

Reduction: ~1600-1700 files deleted (80-85% reduction)
```

---

## Key Files That MUST NOT Be Deleted

```
✅ CRITICAL (core infrastructure):
.env                                  ← Backend API config
.github/workflows/                    ← CI/CD (modified only)
.gitignore                            ← Git config
_config.yml                           ← Jekyll config (review only)
Gemfile                               ← Ruby dependencies
Makefile                              ← Build system (modified)
assets/js/api/config.js               ← ✅✅✅ IRREPLACEABLE
assets/js/api/login.js                ← ✅✅✅ IRREPLACEABLE
_includes/head.html                   ← Main head template
_includes/themes/minima/base.html     ← ✅ Master layout
_includes/themes/minima/header.html   ← Navigation
_includes/themes/minima/footer.html   ← Footer
_layouts/opencs.html                  ← Core layout wrapper
_layouts/page.html                    ← Standard page layout
_data/navigation.yml                  ← Navigation data
_data/submenu.yml                     ← Submenu data
```

---

## Rollback Strategy

If something breaks:

```bash
# Option 1: Rollback single commit
git revert <commit-hash>

# Option 2: Restart from backup branch
git reset --hard backup/pre-hawkhub-refactor
git checkout -b feat/hawkhub-cleanup-v2

# Option 3: Cherry-pick safe commits
git log origin/main..HEAD --oneline  # See all commits
git cherry-pick <safe-commit-hash>
```

---

## Summary

| Phase | Action | Risk | Testing Required |
|-------|--------|------|------------------|
| 1 | Disable GitHub Actions | 🟢 LOW | Run workflow, verify it passes |
| 2 | Update Makefile | 🟢 LOW | Test `make dev`, `make build` |
| 3 | Delete classroom layouts | 🟡 MEDIUM | Verify non-classroom posts render |
| 4 | Refactor post.html | 🟡 MEDIUM | Test blog posts carefully |
| 5 | Remove template includes | 🟢 LOW | Check base.html still renders |
| 6 | Update navigation | 🟢 LOW | Click navigation links |
| 7 | Delete posts | 🟢 LOW | Verify Jekyll build succeeds |
| 8 | Delete scripts | 🟢 LOW | No build/runtime impact |
| 9 | Cleanup data files | 🟢 LOW | No build/runtime impact |
| 10 | Simplify requirements | 🟢 LOW | Verify pip dependencies still work |

---

## Final Notes

1. **Do NOT delete** in random order — the sequence matters for build integrity
2. **Test constantly** — run `make dev` after each phase
3. **Commit frequently** — each step is a separate commit for easy rollback
4. **Push strategically** — push GitHub Actions changes FIRST, get confirmation they pass
5. **Never delete** authentication or API configuration files
6. **Review carefully** before pushing to main — these are irreversible changes

---

**Next Action**: 
Start with uncommitted edits to `.github/workflows/jekyll-gh-pages.yml` and `Makefile`, then push those changes alone to verify the workflow stil works without the conversion scripts.
