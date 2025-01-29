![project logo with zatsit logo and the name zats-greenscore](project-logo.webp)

# zats-greenscore 🌱

A dynamic, Vue.js-based web application designed to assess the eco-conception score of digital projects.  

This project is inspired by the [API Green Score](https://github.com/API-Green-Score/APIGreenScore) initiative, leveraging their questionnaire from the provided Excel file to create an interactive and user-friendly experience. Please read their README file to understand the project philosphy.

---

## 🚀 Features

- **Interactive Questionnaire:** A dynamic web interface based on the original questionnaire from the API Green Score Excel file.
- **Real-Time Scoring:** Instantly calculates the eco-conception score based on user inputs.
- **User-Friendly Design:** A modern, responsive UI powered by Vue.js for optimal usability.
- **Foundation for Future Enhancements:** Built to support additional features and integrations in future updates. For example, the initial version proposes local storage in your browser to record multiple projects. Some additionnal storage backend will come soon ⏭️.

---

## 🛠️ Technology Stack

- **Framework:** [Vue.js](https://vuejs.org/) for a reactive and maintainable front-end.
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

3. Compile and Hot-Reload for Development
```sh
npm run dev
```

4. Type-Check, Compile and Minify for Production
```sh
npm run build
```

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## 🚧 Roadmap

### Short-Term Goals

- Improve UI and UX for a more seamless experience.
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