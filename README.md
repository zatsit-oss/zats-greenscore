# zats-greenscore 🌱

A dynamic, **Astro**-based web application designed to assess the eco-conception score of digital projects.  

This project is inspired by the [API Green Score](https://github.com/API-Green-Score/APIGreenScore) initiative, leveraging their questionnaire from the provided Excel file to create an interactive and user-friendly experience. Please read their README file to understand the project philosphy.

---

## 🚀 Features

- **Interactive Questionnaire:** A dynamic web interface based on the original questionnaire from the API Green Score Excel file.
- **Real-Time Scoring:** Instantly calculates the eco-conception score based on user inputs.
- **User-Friendly Design:** A modern, responsive UI powered by **Astro** for optimal usability.
- **Foundation for Future Enhancements:** Built to support additional features and integrations in future updates. For example, the initial version proposes local storage in your browser to record multiple projects. Some additionnal storage backend will come soon ⏭️.

---

## 🛠️ Technology Stack

- **Framework:** [Astro](https://astro.build) for a fast and content-focused website.
- **Data Source:** The eco-conception questionnaire is derived from the Excel file in the [API Green Score repository](https://github.com/API-Green-Score/APIGreenScore).
- **Styling:** Responsive design with CSS for cross-device compatibility.
- **Deployment:** Open-source and hosted on GitHub under the **zatsit** organization.

---

## 🌍 Why This Project?

The [API Green Score](https://github.com/API-Green-Score/APIGreenScore) project offers a comprehensive method for evaluating the eco-conception of digital projects through its detailed questionnaire. However, the original format in Excel limits accessibility and user engagement. It is necessary to maintain the eco-designed aspect of the project to remain consistent with the approach, no need to replace an Excel file with a too much heavy project.

**Goals of This Project:**

1. **Dynamic Interaction:** Transform the static Excel questionnaire into a dynamic web app.
2. **Improved Accessibility:** Make the eco-conception scoring process more user-friendly and intuitive.
3. **Future Evolution:** Lay the groundwork for adding advanced features like new criterias, project scoring versionning, additional storage backends...

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

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

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

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## 🚧 Roadmap

### Short-Term Goals

- Add Desktop support.
- Add export options (e.g., PDF reports of results).
- Optimize performance for mobile users.

### Long-Term Goals

- Multi-Language Support: Allow users to switch between multiple languages.
- Team Collaboration: Enable team members to contribute to a shared assessment, read report for a team.
- Analytics Integration: Provide insights into eco-conception improvements over time.
- Customizable Questionnaires: Support organization-specific adaptations of the questionnaire.

## 🤝 Contributing

Contributions are welcome! Contributing rules will come soon.

## 📝 License

This project is licensed under the MIT License. Feel free to use, modify, and share it.

## 📧 Contact

For questions, suggestions, or feedback, reach out to us at support@zatsit.fr.

## 🌟 Acknowledgments

We extend our gratitude to the API Green Score team for their foundational work in promoting eco-conception in digital projects.
