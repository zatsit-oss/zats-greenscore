# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.1.0] - 2026-05-29

### Added

- EROOM preliminary step support via generic `PreliminaryConfig` on evaluation types (label, thresholds, blocking flag, recommendations)
- Dedicated Quick Diagnosis card on project view, distinct from the advanced score
- `preliminaryScore` persisted on evaluations

### Changed

- Separated EROOM Quick Diagnosis (category 0) from Advanced Diagnosis (categories 1-6)
- Advanced score, interpretation and radar chart now stay hidden until at least one advanced question is answered
- Advanced summary cards explicitly labeled "Advanced Diagnosis"
- CC BY-SA 4.0 attribution added for EROOM data
- README updated with badges and new information

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
