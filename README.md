# zats-greenscore 🌱

[![GitHub release](https://img.shields.io/github/v/release/zatsit-oss/zats-greenscore)](https://github.com/zatsit-oss/zats-greenscore/releases)
[![License](https://img.shields.io/github/license/zatsit-oss/zats-greenscore)](LICENSE)
[![Deploy to Firebase Hosting](https://img.shields.io/github/actions/workflow/status/zatsit-oss/zats-greenscore/firebase-hosting-merge.yml?label=deploy)](https://github.com/zatsit-oss/zats-greenscore/actions)
[![Release Desktop App](https://img.shields.io/github/actions/workflow/status/zatsit-oss/zats-greenscore/release-desktop.yml?label=desktop%20build)](https://github.com/zatsit-oss/zats-greenscore/actions)
[![Astro](https://img.shields.io/badge/Astro-5.x-bc52ee?logo=astro&logoColor=white)](https://astro.build)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-24c8d8?logo=tauri&logoColor=white)](https://tauri.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Playwright](https://img.shields.io/badge/Playwright-e2e-2ead33?logo=playwright&logoColor=white)](https://playwright.dev)
[![Vitest](https://img.shields.io/badge/Vitest-165%20tests-6e9f18?logo=vitest&logoColor=white)](https://vitest.dev)
[![WCAG](https://img.shields.io/badge/WCAG-AA%20compliant-228b22)](https://www.w3.org/WAI/WCAG21/quickref/)

A hybrid **web + desktop** application for evaluating the eco-design of digital projects. Manage multiple projects, run evaluations, and track your scores over time.

---

## 🚀 Features

- **Multi-Evaluation Support:** Run different evaluation types on a single project
  - [API Green Score](https://github.com/API-Green-Score/APIGreenScore) : API eco-design assessment
  - [EROOM](https://eroom.greenspector.com/) : Optimization Framework for digital services (based on EROOM 1.1)
- **Project Management:** Create, track, and compare multiple projects from a dashboard
- **Real-Time Scoring:** Instantly calculates scores with ranking (A to E) and radar/bar chart visualizations
- **Score Interpretation:** Contextual feedback on your results with improvement guidance
- **Desktop App:** Native application via Tauri (macOS, Windows, Linux)
- **Accessible:** WCAG AA compliant, keyboard navigable, dark/light theme
- **Eco-Designed:** Lightweight static pages, no external scripts, minimal JavaScript

---

## 🛠️ Technology Stack

- **Framework:** [Astro](https://astro.build) 5.x — Static site generator
- **Desktop:** [Tauri](https://tauri.app) 2.x — Native desktop apps with Rust
- **Styling:** [Tailwind CSS](https://tailwindcss.com) 4.x — Utility-first CSS
- **Language:** [TypeScript](https://www.typescriptlang.org) — Type safety
- **Testing:** [Vitest](https://vitest.dev) (unit) + [Playwright](https://playwright.dev) (e2e)
- **Deployment:** Firebase Hosting (web), GitHub Actions (CI/CD)
- **Storage:** LocalStorage (browser), with future backend planned

---

## 🌍 Why This Project?

Evaluating eco-design of digital projects often relies on spreadsheets or fragmented tools. This project brings multiple evaluation frameworks into a single, accessible, and eco-designed application.

**Goals:**

1. **Unified Evaluations:** Combine API Green Score, EROOM, and future frameworks in one tool.
2. **Accessible & User-Friendly:** Modern UI with accessibility built in, available as web and desktop app.
3. **Lead by Example:** The app itself follows eco-design principles — lightweight, minimal dependencies, static-first.

---

## 📦 Installation and Setup

Follow these steps to set up the project locally:

### Prerequisites

- Node.js and npm installed on your machine (respectively **v20** and **v10** minimum version).

### Steps

1. Clone the repository:
```sh
git clone https://github.com/zatsit-oss/zats-greenscore
cd zats-greenscore
````

2. Project Setup
```sh
npm install
```

3. Start the development server
```sh
npm run dev
```

4. Build for Production
```sh
npm run build
```

5. Preview the build
```sh
npm run preview
```

## 🧞 Commands

| Command                   | Action                                            |
| :------------------------ | :------------------------------------------------ |
| `npm install`             | Install dependencies                              |
| `npm run dev`             | Start local dev server at `localhost:4321`         |
| `npm run build`           | Build production site to `./dist/`                |
| `npm run preview`         | Preview production build locally                  |
| `npm run dev:desktop`     | Start desktop app in dev mode (hot reload)        |
| `npm run build:desktop`   | Build native desktop app (DMG, EXE, DEB)          |
| `npm run test:run`        | Run unit tests (Vitest)                           |
| `npm run test:e2e`        | Run e2e tests (Playwright)                        |
| `npm run lint`            | Run ESLint check                                  |
| `npm run lint:fix`        | Run ESLint with auto-fix                          |

## 🚀 Project Structure

```text
src/
├── components/         # Astro components
│   └── audit/          # Audit questionnaire (API Green Score & EROOM)
├── data/               # Static data (survey questions, EROOM model)
├── layouts/            # Page layouts
├── pages/              # File-based routing
│   └── projects/       # Project management pages
├── services/           # Business logic (hexagonal architecture)
├── types/              # TypeScript interfaces
├── utils/              # Scoring, storage, UI helpers
└── styles/             # Global CSS

src-tauri/              # Tauri desktop app (Rust)
tests/                  # Unit tests (Vitest)
e2e/                    # E2E tests (Playwright)
```

## 🖥️ Desktop Application (Tauri)

This project is a hybrid **Web + Desktop** application. It uses [Tauri](https://tauri.app/) to wrap the Astro static build into a lightweight native executable.

### Why in the same repo?
We follow the **Integrated Repo** pattern. The benefits are:
- **Shared Codebase**: One source of truth for UI/logic.
- **Unified Versioning**: Web and Desktop versions evolve together.
- **Simplified CI/CD**: A single pipeline tests and builds all targets.

### Desktop Commands

| Command | Action |
| :--- | :--- |
| `npm run tauri` | Run Tauri CLI |
| `npm run dev:desktop` | Start App in **Development Mode** (Hot Reload) |
| `npm run build:desktop` | specific **Production Build** (DMG, EXE, DEB) |

> **Note**: The desktop build process automatically triggers `npm run build` (Astro) before packaging the native app.

## 🚧 Roadmap

### Short-Term Goals

- Add export options (e.g., PDF reports of results)
- Add more evaluation frameworks
- Optimize performance for mobile users

### Long-Term Goals

- Multi-language support (FR/EN)
- Team collaboration: shared assessments and reports
- Backend storage: replace LocalStorage with a server-side solution
- Analytics: track eco-design improvements over time

## 🤝 Contributing

Contributions are welcome! Contributing rules will come soon.

## 📝 License

This project uses a dual licensing model:

- **Source code** is licensed under the [MIT License](LICENSE).
- **EROOM evaluation data** (`src/data/eroom-data-model-1-1.json`) is based on the [EROOM Optimization Framework](https://boavizta.org/eroom/la-genese) by [Boavizta](https://boavizta.org/), licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). 
The original content (questions, answers, and scoring methodology) has been kept as-is — only the format was changed, from the original Google Sheets to a web application. Any derivative work using this data must be shared under the same CC BY-SA 4.0 license.

## 📧 Contact

For questions, suggestions, or feedback, reach out to us at support@zatsit.fr.

## 🌟 Acknowledgments

- [API Green Score](https://github.com/API-Green-Score/APIGreenScore) for their foundational work in promoting eco-design of APIs.
- [Boavizta](https://boavizta.org/) for the [EROOM](https://boavizta.org/eroom/la-genese) Optimization Framework used in this project.
