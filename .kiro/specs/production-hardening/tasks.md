# Implementation Plan

## Overview

This task list implements the production-hardening bugfix using the exploratory bugfix workflow. Tasks are ordered: (1) write bug condition exploration test to confirm defects exist, (2) write preservation tests to capture baseline behavior, (3) implement all 12 fix areas, (4) verify tests pass.

## Tasks

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Production Readiness Defects Present
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the production-readiness defects exist
  - **Scoped PBT Approach**: Scope the property to concrete failing cases for each defect category
  - Test that dead files do NOT exist (assert `frontend/debug.html`, `frontend/test-ai.html`, `frontend/pages/signup-old.html`, `frontend/pages/dashboard-simple.html` are absent) — will FAIL on unfixed code because they exist
  - Test that `.env` does NOT contain real secret values (assert JWT_SECRET, CREWAI_BEARER_TOKEN are placeholders) — will FAIL on unfixed code because real secrets are present
  - Test that `frontend/js/api.js` does NOT contain hardcoded `http://localhost:5000` — will FAIL on unfixed code
  - Test that `backend/server.js` does NOT define its own `connectDB` function — will FAIL on unfixed code because duplicate exists
  - Test that `backend/server.js` does NOT call `process.exit(1)` directly in unhandled rejection handler without graceful shutdown — will FAIL on unfixed code
  - Test that backend source files do NOT use `console.log` or `console.error` — will FAIL on unfixed code
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the defects exist)
  - Document counterexamples found (e.g., "debug.html exists at frontend/debug.html", ".env contains CREWAI_BEARER_TOKEN=e7ff9dba24b1")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.8, 1.10_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing API Contracts and Functionality Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: All API endpoints (`/api/v1/auth/*`, `/api/v1/cases/*`, `/api/v1/analysis/*`, `/api/v1/analytics/*`, `/api/v1/reports/*`, `/api/v1/assistant/*`, `/api/v1/users/*`) respond with current response structure on unfixed code
  - Observe: JWT authentication flow (login → accessToken + refreshToken → refresh → logout) works on unfixed code
  - Observe: Static file serving from `frontend/` directory works and SPA fallback routes non-API paths to index.html on unfixed code
  - Observe: MongoDB schema definitions (User, Case, Report, AIResult, Analytics, IpcBnsMapping) are unchanged
  - Observe: Rate limiter enforces configured limits on unfixed code
  - Write property-based test: for all valid API route patterns, the Express router resolves to the same handler and middleware chain
  - Write property-based test: for all authentication requests with valid credentials, the response contains accessToken and refreshToken with correct JWT structure
  - Write property-based test: for all static file requests to existing frontend files, the server returns 200 with correct content-type
  - Write property-based test: for all non-API route requests, the server falls back to index.html (SPA routing)
  - Verify tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [ ] 3. Fix for production-hardening defects

  - [ ] 3.1 Remove dead files and debug artifacts
    - Delete `frontend/debug.html`, `frontend/test-ai.html`
    - Delete `frontend/pages/signup-old.html`, `frontend/pages/dashboard-simple.html`
    - Delete `test-crewai.js` from project root (if present)
    - Delete root markdown files: `AUTHENTICATION_FIXED.md`, `BEARER_TOKEN_UPDATE.md`, `CREWAI_INTEGRATION_COMPLETE.md`, `FRONTEND_FIXED.md`, `IMPLEMENTATION_SUMMARY.md`, `PROJECT_RUNNING.md`, `READY_TO_USE.md`, `SYSTEM_READY.md`, `QUICK_TEST_GUIDE.md`
    - Delete `setup.bat` and `start.bat` if present
    - Verify no internal links reference deleted pages
    - _Bug_Condition: deadFilesExist(fileTree, [...]) from design_
    - _Expected_Behavior: noDeadFiles(result.fileTree) — only production-necessary files remain_
    - _Preservation: Static file serving continues for remaining files, SPA fallback unaffected_
    - _Requirements: 2.1, 2.4, 2.12_

  - [ ] 3.2 Secure secrets and create .env.example
    - Replace all secret values in `.env` with placeholders: `JWT_SECRET=your_jwt_secret_here_change_in_production`, `JWT_REFRESH_SECRET=your_refresh_secret_here_change_in_production`, `CREWAI_BEARER_TOKEN=your_crewai_bearer_token_here`, `CREWAI_USER_BEARER_TOKEN=your_crewai_user_bearer_token_here`
    - Create `.env.example` at project root documenting all required environment variables with placeholder values and comments
    - Verify `.env` is listed in `.gitignore`
    - _Bug_Condition: secretsExposed(envFile, ['JWT_SECRET', 'CREWAI_BEARER_TOKEN', ...]) from design_
    - _Expected_Behavior: noExposedSecrets(result.envFile) — all secrets are placeholders_
    - _Preservation: Application still reads env vars at runtime; no functional change when real values are set_
    - _Requirements: 2.2_

  - [ ] 3.3 Create centralized API configuration module
    - Create `frontend/js/config.js` exporting `API_BASE_URL` derived from `window.location.origin` with override support
    - Pattern: `const API_BASE_URL = window.__APP_CONFIG__?.apiBaseUrl || window.location.origin + '/api/v1'`
    - Update `frontend/js/api.js` to remove hardcoded `http://localhost:5000/api/v1` and reference centralized config
    - Remove `debug.html` and `test-ai.html` from `publicPages` array in `checkAuth()` if present
    - Add `<script src="/js/config.js"></script>` to all HTML pages before api.js
    - _Bug_Condition: hardcodedURLsExist(frontendSource, 'http://localhost:5000') from design_
    - _Expected_Behavior: centralizedAPIConfig(result.frontendSource) — single config source for API URL_
    - _Preservation: API calls resolve to same backend; no change in request/response behavior_
    - _Requirements: 2.3_

  - [ ] 3.4 Replace emoji icons with Lucide
    - Add Lucide icons CDN link (`<script src="https://unpkg.com/lucide@latest"></script>`) to HTML pages using emoji icons
    - Replace emoji characters with Lucide icon elements: 📊→`<i data-lucide="bar-chart-2"></i>`, ✅→`<i data-lucide="check-circle"></i>`, 📈→`<i data-lucide="trending-up"></i>`, 📁→`<i data-lucide="folder"></i>`, 📄→`<i data-lucide="file-text"></i>`, ⚖️→`<i data-lucide="scale"></i>`, 🤖→`<i data-lucide="bot"></i>`, 🔗→`<i data-lucide="link"></i>`, 📚→`<i data-lucide="book-open"></i>`
    - Call `lucide.createIcons()` after DOM load in each affected page
    - _Bug_Condition: emojiIconsUsed(htmlFiles) from design_
    - _Expected_Behavior: noEmojiIcons(result.htmlFiles) — professional Lucide icons throughout_
    - _Preservation: Visual representation of features unchanged; no functional behavior change_
    - _Requirements: 2.5_

  - [ ] 3.5 Remove duplicate connectDB from server.js
    - Remove the inline `connectDB` function from `backend/server.js` (lines ~113-134)
    - Add `const { connectDB } = require('./config/database')` or equivalent import at top of server.js
    - Update `startServer()` to use the imported function
    - Wrap in try/catch to preserve "no-database mode" fallback behavior
    - _Bug_Condition: duplicateConnectDB(serverJs, configDatabase) from design_
    - _Expected_Behavior: singleConnectDB(result.backendSource) — one authoritative DB connection module_
    - _Preservation: Database connection behavior identical; no-database degraded mode still works (Req 3.10)_
    - _Requirements: 2.6_

  - [ ] 3.6 Implement consistent error handling, loading states, and retry
    - Create `frontend/js/ui-helpers.js` with reusable functions: `showLoading(container)`, `hideLoading(container)`, `showError(container, message, retryCallback)`, `showEmpty(container, message)`, `showToast(message, type)`
    - Add retry mechanism with exponential backoff to `frontend/js/api.js` for transient failures (network errors, 5xx responses); configurable retry count (default: 2)
    - Do NOT retry on 4xx client errors
    - Replace `alert()` calls with `showToast()` or inline error displays
    - Add `<script src="/js/ui-helpers.js"></script>` to HTML pages before page-specific scripts
    - _Bug_Condition: inconsistentErrorHandling(frontendSource) from design_
    - _Expected_Behavior: consistentErrorHandling(result.frontendSource) — unified UX patterns_
    - _Preservation: API request/response contracts unchanged; only UI presentation of errors improves_
    - _Requirements: 2.7_

  - [ ] 3.7 Add graceful shutdown to backend
    - Store HTTP server reference from `app.listen()` in `backend/server.js`
    - Replace immediate `process.exit(1)` in `unhandledRejection` and `uncaughtException` handlers with graceful shutdown sequence: stop accepting new connections (`server.close()`), close mongoose connection (`mongoose.connection.close()`), log shutdown reason via winston, exit with appropriate code after cleanup
    - Add timeout fallback (e.g., 10 seconds) to force exit if cleanup hangs
    - Add `SIGTERM` and `SIGINT` handlers for container orchestration compatibility
    - _Bug_Condition: abruptShutdown(serverJs) from design_
    - _Expected_Behavior: gracefulShutdown(result.serverProcess) — clean resource release on exit_
    - _Preservation: Normal request handling unaffected; only shutdown behavior changes_
    - _Requirements: 2.8_

  - [ ] 3.8 Create client-side input validation module
    - Create `frontend/js/validators.js` with functions: `validateEmail(email)`, `validatePassword(password)` (min length, complexity), `validateRequired(value, fieldName)`, `validateFIRNumber(fir)`, `sanitizeInput(value)` (trim, strip dangerous chars)
    - Apply validators to signup form (email, password, name fields)
    - Apply validators to login form (email, password fields)
    - Apply validators to case upload form (required fields)
    - Apply validators to assistant chat input (non-empty, sanitized)
    - Display inline validation errors before form submission
    - Add `<script src="/js/validators.js"></script>` to relevant HTML pages
    - _Bug_Condition: missingClientValidation(frontendForms) from design_
    - _Expected_Behavior: clientValidationPresent(result.frontendForms) — immediate user feedback_
    - _Preservation: Server-side validation remains authoritative; API contracts unchanged_
    - _Requirements: 2.9_

  - [ ] 3.9 Standardize all backend logging to Winston
    - Audit all backend files for `console.log`, `console.error`, `console.warn` usage
    - Replace with appropriate `logger.info()`, `logger.error()`, `logger.warn()` calls from `backend/utils/logger.js`
    - Ensure `const logger = require('../utils/logger')` (or correct relative path) is imported in all files that need logging
    - Files to audit: `server.js`, all controllers, all services, all middleware, all routes, all utils
    - _Bug_Condition: mixedLogging(backendSource) from design_
    - _Expected_Behavior: winstonOnlyLogging(result.backendSource) — no console.* in production paths_
    - _Preservation: Log content semantically equivalent; only output channel changes_
    - _Requirements: 2.10_

  - [ ] 3.10 Improve i18n with data-attribute approach
    - Ensure ALL translatable text in HTML files uses `data-i18n="keyName"` attributes
    - Add `data-i18n-placeholder` support for input placeholders
    - Add `data-i18n-title` support for tooltips
    - Update `applyTranslations()` in `frontend/js/translations.js` to handle `data-i18n-placeholder` and `data-i18n-title` attribute types
    - Remove any hardcoded translatable text that should use the i18n system
    - _Bug_Condition: fragileI18n(translationSystem) from design_
    - _Expected_Behavior: resilientI18n(result.translationSystem) — structure-change-resilient translations_
    - _Preservation: Displayed text content identical in both languages; translation keys map to same strings_
    - _Requirements: 2.11_

  - [ ] 3.11 Clean project structure and configuration
    - Verify `package.json` scripts are clean; add `"start:prod": "NODE_ENV=production node backend/server.js"` script
    - Update `.gitignore` to ensure coverage of: `.env`, `node_modules/`, `logs/`, `uploads/`, `reports-output/`, `*.bat`
    - Verify no root-level test/debug files remain after dead file removal
    - _Bug_Condition: debugArtifactsInRoot(rootFiles) from design_
    - _Expected_Behavior: Clean deployment-ready project structure_
    - _Preservation: Build and start scripts continue to work identically_
    - _Requirements: 2.12_

  - [ ] 3.12 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Production Readiness Defects Resolved
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior (no dead files, no exposed secrets, centralized config, single connectDB, graceful shutdown, winston-only logging)
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms all production-readiness defects are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.8, 2.10_

  - [ ] 3.13 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing API Contracts and Functionality Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all API endpoints, authentication flows, static file serving, SPA routing, and database operations work identically after fix
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Run full test suite (bug condition test + preservation tests)
  - Verify bug condition exploration test PASSES (all defects resolved)
  - Verify preservation property tests PASS (no regressions)
  - Manually verify: server starts successfully, frontend loads, login/signup works, dashboard renders
  - Ensure all tests pass, ask the user if questions arise.

## Task Dependency Graph

```json
{
  "waves": [
    ["1", "2"],
    ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "3.10", "3.11"],
    ["3.12", "3.13"],
    ["4"]
  ]
}
```

## Notes

- Tasks 1 and 2 MUST be completed before any implementation tasks (3.x) begin
- Task 1 is expected to FAIL on unfixed code — this confirms the defects exist
- Task 2 is expected to PASS on unfixed code — this captures baseline behavior
- Implementation tasks (3.1–3.11) can be done in the listed order or parallelized where independent
- Tasks 3.12 and 3.13 re-run the same tests from tasks 1 and 2 — do NOT write new tests
- The graceful shutdown (3.7) must preserve the no-database degraded mode (Req 3.10)
- The centralized config (3.3) must work for both localhost development and production deployment
- Secrets replacement (3.2) means the developer must set real values in their local .env after pulling
