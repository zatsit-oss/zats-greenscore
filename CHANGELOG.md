# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-03-04

### Added

- Multi-evaluation support with dashboard filtering
- EROOM Optimization Framework evaluation type
- EROOM score interpretation context on project view
- Status icons on EROOM questions
- Answers counter on audit questionnaire
- About and documentation pages
- Welcome hero with info when no project exists
- Light theme contrast improvements on quick diagnosis
- Multiple scores display on project card
- Project deletion from dashboard
- Unit tests with Vitest (165 tests)
- E2E tests with Playwright (navigation, theme, projects, audits)

### Changed

- Hexagonal architecture: services layer (audit, dashboard, evaluation, project, theme)
- Score calculation updated to match EROOM 1.1 sheet
- Extracted reusable CSS classes
- Renamed app to Zats Green Score
- Moved Question and Answers interfaces to `src/types/apigreenscore`
- Updated all API Green Score question descriptions
- Translated documentation to English
- Improved question UI for mobile

### Fixed

- XSS vulnerabilities: replaced innerHTML with safe DOM manipulation
- WCAG AA contrast compliance (stepper labels, text fields, footer icons)
- Accessibility improvements across all pages and components
- Theme contrast in light and dark mode
- Dashboard always redirects to project view page
- Score calculation no longer only based on API Green Score
- Type compatibility for EROOM answer values

### Security

- Removed all innerHTML usage in favor of DOM API
- Code review corrections for security and types
