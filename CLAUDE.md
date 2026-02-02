# Claude Code Guidelines

Project-specific guidelines for AI assistants working on this codebase.

## Quick Reference

| Topic | File |
|-------|------|
| Coding rules & conventions | [.claude/rules/rules.md](.claude/rules/rules.md) |
| Quality (perf, a11y, eco) | [.claude/rules/quality.md](.claude/rules/quality.md) |
| Security | [.claude/rules/security.md](.claude/rules/security.md) |
| Tauri & Desktop | [.claude/rules/tauri.md](.claude/rules/tauri.md) |

## Specifications

| Topic | File |
|-------|------|
| Project overview & goals | [docs/specs/overview.md](docs/specs/overview.md) |
| Glossary (Green Score terms) | [docs/specs/glossary.md](docs/specs/glossary.md) |
| Audit questionnaire | [docs/specs/features/audit.md](docs/specs/features/audit.md) |
| Scoring system | [docs/specs/features/scoring.md](docs/specs/features/scoring.md) |
| Project management | [docs/specs/features/projects.md](docs/specs/features/projects.md) |
| ADR: Tauri desktop | [docs/specs/adr/001-tauri-desktop.md](docs/specs/adr/001-tauri-desktop.md) |

## Commands

| Command | Description |
|---------|-------------|
| `/build` | Run production build (web) |
| `/build-desktop` | Build desktop app |
| `/dev` | Start dev server |
| `/dev-desktop` | Start desktop dev with hot reload |
| `/new-component` | Create a new Astro component |
| `/new-page` | Create a new page |
| `/review` | Perform code review |

## Project Overview

**zats-greenscore** is a hybrid web/desktop application for evaluating eco-design of digital projects. It implements the API Green Score questionnaire.

- **Repository**: https://github.com/zatsit-oss/zats-greenscore
- **License**: MIT

## Project Structure

```
src/
├── components/         # Astro components
│   └── audit/          # Audit questionnaire components
├── layouts/            # Page layouts
├── pages/              # File-based routing
│   └── projects/       # Project management pages
├── types/              # TypeScript interfaces
├── utils/              # Utility functions (scoring, toast, ui)
├── data/               # Static data (surveyQuestions.json)
└── styles/             # CSS styles

src-tauri/
├── src/                # Rust source code
│   ├── lib.rs          # Main library
│   └── main.rs         # Entry point
├── Cargo.toml          # Rust dependencies
├── tauri.conf.json     # Tauri configuration
├── icons/              # App icons (all platforms)
└── capabilities/       # Tauri permissions

public/                 # Static assets
```

## Key Rules Summary

1. **Language**: English for code/comments, French for user-facing content
2. **Components**: Keep small and focused, use TypeScript interfaces for props
3. **Styles**: Use Tailwind CSS, extract repeated patterns
4. **Data**: Store in `src/data/`, define types in `src/types/`
5. **Commits**: Angular convention (`type(scope): description`)
6. **Eco-design**: This project IS about eco-design, lead by example

## Tech Stack

### Web
- **Astro** 5.x - Static site generator
- **Tailwind CSS** 4.x - Utility CSS
- **TypeScript** - Type safety

### Desktop
- **Tauri** 2.x - Native desktop apps
- **Rust** - Backend logic

### Deployment
- **Firebase Hosting** - Web deployment
- **Docker** - Containerization
- **GitHub Actions** - CI/CD

## Data Model

### Project Interface
```typescript
interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  status: "InProgress" | "Completed"
  score?: number
  ranking?: "A" | "B" | "C" | "D" | "E"
  answers?: Record<string, boolean | string | number>
}
```

### Storage
- **Web**: LocalStorage (projects, answers)
- **Questions**: Static JSON (`src/data/surveyQuestions.json`)

## npm Scripts

```bash
npm run dev              # Dev server (localhost:4321)
npm run build            # Production build
npm run preview          # Preview production build
npm run dev:desktop      # Desktop dev with hot reload
npm run build:desktop    # Build desktop app
```
