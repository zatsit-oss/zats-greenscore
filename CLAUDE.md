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
| ADR: Clever Cloud Cellar hosting | [docs/specs/adr/002-clever-cloud-cellar-hosting.md](docs/specs/adr/002-clever-cloud-cellar-hosting.md) |

## Skills

| Skill | Description |
|-------|-------------|
| `/dev` | Start Astro dev server |
| `/build` | Run production build (web) |
| `/dev-desktop` | Start desktop dev with hot reload |
| `/build-desktop` | Build Tauri desktop app |
| `/new-component <Name>` | Create a new Astro component |
| `/new-page <path>` | Create a new page |
| `/review` | Perform code review |

## Project Overview

**zats-greenscore** is a hybrid web/desktop application for evaluating eco-design of digital projects. It supports multiple evaluation frameworks: API Green Score and EROOM.

- **Repository**: https://github.com/zatsit-oss/zats-greenscore
- **License**: MIT

## Project Structure

```
src/
├── components/         # Astro components
│   └── audit/          # Audit questionnaire components
│       └── eroom/      # EROOM-specific components
├── data/               # Static data (apigreenscore-survey-questions.json, eroom-data-model-1-1.json)
├── layouts/            # Page layouts
├── pages/              # File-based routing
│   └── projects/       # Project management pages
├── services/           # Business logic (hexagonal architecture)
├── types/              # TypeScript interfaces
├── utils/              # Scoring, storage, UI helpers
└── styles/             # Global CSS

src-tauri/
├── src/                # Rust source code
│   ├── lib.rs          # Main library
│   └── main.rs         # Entry point
├── Cargo.toml          # Rust dependencies
├── tauri.conf.json     # Tauri configuration
├── icons/              # App icons (all platforms)
└── capabilities/       # Tauri permissions

tests/                  # Unit tests (Vitest)
e2e/                    # E2E tests (Playwright)
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
- **Clever Cloud Cellar** - Web production hosting (sovereign, French)
- **Firebase Hosting** - PR preview deployments
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
  evaluations: Partial<Record<EvaluationType, Evaluation>>
  appVersion?: string
}
```

### Storage
- **Web**: LocalStorage (projects, evaluations)
- **Questions**: Static JSON (`src/data/apigreenscore-survey-questions.json`, `src/data/eroom-data-model-1-1.json`)

## npm Scripts

```bash
npm run dev              # Dev server (localhost:4321)
npm run build            # Production build
npm run preview          # Preview production build
npm run dev:desktop      # Desktop dev with hot reload
npm run build:desktop    # Build desktop app
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run test             # Unit tests (watch mode)
npm run test:run         # Unit tests (single run)
npm run test:e2e         # E2E tests (Playwright)
```

## Code graph

`graphify-out/graph.json` is a [Graphify](https://github.com/Graphify-Labs/graphify) call graph of this repository, rebuilt by CI on every push to `main` (`.github/workflows/code-graph.yml`). It is derived from the AST: every node is a symbol (function, class, type, file), every edge is an `imports`, `calls`, `extends` or `references` relation read from the source, with file and line. It contains no code.

Use it to orient yourself before reading files, through the Graphify CLI (`uv tool install graphifyy==0.9.80`, or `pipx`). Never run `graphify install`: the hook it registers is not wanted here.

- `graphify explain "<symbol>"`: who defines, calls and imports a symbol, with file and line. The right first step before changing a function.
- `graphify path "<A>" "<B>"`: how two symbols are connected.
- `graphify-out/GRAPH_REPORT.md`: the most connected symbols (hubs) and the detected clusters. A 5-minute read for a newcomer, human or agent.

Skip `graphify query "<question>"`: it is a keyword match and returns noise.

The graph reflects the last push to `main`. On a feature branch, symbols you added or renamed are not in it yet: read the files directly for those. Never feed `graph.json` to a prompt as is (several hundred KB); query it.
