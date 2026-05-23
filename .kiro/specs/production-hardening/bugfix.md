# Bugfix Requirements Document

## Introduction

The LegalLawAgent (न्यायASTRA) application has accumulated significant code quality debt that compromises production readiness. The codebase contains dead code, exposed secrets, inconsistent design patterns, missing error handling, debug/test artifacts shipped alongside production code, duplicate implementations, and security vulnerabilities. This production-hardening bugfix systematically addresses these quality defects while preserving all existing functionality, API contracts, UI/UX behavior, routes, database schema, and integrations.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the repository is inspected THEN the system contains dead files that serve no production purpose (debug.html, test-ai.html, signup-old.html, dashboard-simple.html, test-crewai.js, multiple unused markdown files like AUTHENTICATION_FIXED.md, BEARER_TOKEN_UPDATE.md, CREWAI_INTEGRATION_COMPLETE.md, FRONTEND_FIXED.md, IMPLEMENTATION_SUMMARY.md, PROJECT_RUNNING.md, READY_TO_USE.md, SYSTEM_READY.md, QUICK_TEST_GUIDE.md)

1.2 WHEN the .env file is committed to the repository THEN the system exposes sensitive secrets in version control including JWT_SECRET, JWT_REFRESH_SECRET, CREWAI_BEARER_TOKEN, and CREWAI_USER_BEARER_TOKEN with actual credential values

1.3 WHEN the frontend code is examined THEN the system contains hardcoded API base URLs (http://localhost:5000) scattered across multiple HTML files instead of using a centralized configuration

1.4 WHEN the frontend pages are compared THEN the system has duplicate dashboard implementations (dashboard.html and dashboard-simple.html) and duplicate signup implementations (signup.html and signup-old.html) with inconsistent design languages (old dark theme vs new cream/gold theme)

1.5 WHEN the frontend UI is rendered THEN the system uses emoji characters (📊, ✅, 📈, 📁, 📄, ⚖️, 🤖, 🔗, 📚) as icons in dashboard-simple.html and test pages instead of a consistent professional icon library

1.6 WHEN the backend server.js is examined THEN the system contains a duplicate connectDB function that duplicates logic already present in backend/config/database.js, creating maintenance confusion about which database connection logic is authoritative

1.7 WHEN API errors occur in the frontend THEN the system lacks consistent error handling, loading states, and fallback UI — errors are shown via basic alert() or inconsistent inline messages without retry mechanisms or graceful degradation

1.8 WHEN the backend encounters unhandled promise rejections or uncaught exceptions THEN the system immediately calls process.exit(1) without graceful shutdown, potentially leaving database connections open and in-flight requests unresolved

1.9 WHEN the frontend JavaScript files are examined THEN the system lacks input validation and sanitization on the client side before sending data to the API, relying solely on server-side validation

1.10 WHEN the backend logging is examined THEN the system uses console.log in some paths and winston logger in others, creating inconsistent observability and potential information leakage in production

1.11 WHEN the frontend translation system is examined THEN the system uses a fragile DOM-manipulation approach with hardcoded element IDs and querySelector selectors that break when HTML structure changes, rather than a proper i18n abstraction

1.12 WHEN the project dependencies are examined THEN the system includes unused or development-only artifacts in the production path (test-crewai.js at root, setup.bat/start.bat batch files with no CI/CD integration)

### Expected Behavior (Correct)

2.1 WHEN the repository is inspected THEN the system SHALL contain only production-necessary files, with all debug pages, test artifacts, old backups, and status documentation files removed or moved to a docs/ directory

2.2 WHEN the .env file is examined THEN the system SHALL use placeholder values for all secrets (e.g., `your_jwt_secret_here`) with a documented .env.example file, and the .env file SHALL be listed in .gitignore to prevent accidental commits of real credentials

2.3 WHEN the frontend code references the API THEN the system SHALL use a single centralized configuration module (e.g., frontend/js/config.js) that reads the API base URL from one location, making environment switching trivial

2.4 WHEN the frontend pages are examined THEN the system SHALL have exactly one dashboard implementation and one signup implementation using the current production design system (cream/gold theme), with no duplicate or legacy versions

2.5 WHEN the frontend UI is rendered THEN the system SHALL use Lucide icons consistently across all pages with no emoji characters used as UI icons

2.6 WHEN the backend starts THEN the system SHALL use a single authoritative database connection module (backend/config/database.js) with no duplicate connection logic in server.js

2.7 WHEN API errors occur in the frontend THEN the system SHALL display consistent error states with user-friendly messages, loading indicators during requests, empty states when no data exists, and retry options for transient failures

2.8 WHEN the backend encounters unhandled promise rejections or uncaught exceptions THEN the system SHALL perform graceful shutdown by closing database connections, completing in-flight requests where possible, and logging the error before exiting

2.9 WHEN user input is collected in the frontend THEN the system SHALL validate and sanitize inputs on the client side before submission, providing immediate feedback for invalid data while still maintaining server-side validation as the authoritative check

2.10 WHEN the backend logs events THEN the system SHALL use the winston logger exclusively with appropriate log levels (error, warn, info, debug) and SHALL NOT use console.log/console.error in any production code path

2.11 WHEN the frontend translation system is used THEN the system SHALL use a data-attribute-based or key-based i18n approach that is resilient to HTML structure changes and centralizes all translatable strings in the translations module

2.12 WHEN the project is prepared for deployment THEN the system SHALL have clean scripts in package.json, no root-level test/debug files, proper .gitignore coverage, and clear separation between development utilities and production code

### Unchanged Behavior (Regression Prevention)

3.1 WHEN authenticated users access the dashboard THEN the system SHALL CONTINUE TO display case management, AI assistant, IPC-BNS mapping, petition eligibility, reports, and analytics features with identical functionality

3.2 WHEN users register or login THEN the system SHALL CONTINUE TO use the same API endpoints (/api/v1/auth/register, /api/v1/auth/login) with identical request/response contracts and JWT token-based authentication flow

3.3 WHEN users upload case documents THEN the system SHALL CONTINUE TO accept PDF files, process them through the AI analysis pipeline (CrewAI integration), and return analysis results in the same response format

3.4 WHEN the AI assistant receives queries THEN the system SHALL CONTINUE TO route them through the orchestrator agent and return responses using the same API contract and response structure

3.5 WHEN reports are generated THEN the system SHALL CONTINUE TO produce PDF reports using the same pdf.service.js pipeline with identical output format and content structure

3.6 WHEN the IPC-BNS mapping is requested THEN the system SHALL CONTINUE TO return section mappings using the same data model (IpcBnsMapping) and response format

3.7 WHEN the backend serves the frontend THEN the system SHALL CONTINUE TO serve static files from the frontend directory and fall back to index.html for non-API routes (SPA-style routing)

3.8 WHEN the MongoDB database is accessed THEN the system SHALL CONTINUE TO use the same schema definitions (User, Case, Report, AIResult, Analytics, IpcBnsMapping) with no changes to field names, types, or relationships

3.9 WHEN the rate limiter is active THEN the system SHALL CONTINUE TO enforce the same rate limiting rules on API endpoints using the configured window and max request values

3.10 WHEN the application starts without a database connection THEN the system SHALL CONTINUE TO operate in a degraded "no-database" mode for testing purposes, as currently implemented
