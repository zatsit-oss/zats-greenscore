export const getEcoLabel = (score: number) => {
    if (score >= 90)
        return { text: "A", class: "text-emerald-400" };
    if (score >= 75)
        return { text: "B", class: "text-lime-400" };
    if (score >= 50)
        return { text: "C", class: "text-amber-400" };
    return { text: "D", class: "text-red-400" };
};

export const getScoreColor = (score: number) => {
    if (score >= 90) return "var(--color-score-excellent)";
    if (score >= 75) return "var(--color-score-good)";
    if (score >= 50) return "var(--color-score-average)";
    return "var(--color-score-poor)";
};

export const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

/* 
 * Helper to populate a card element with project data.
 */
export const populateCard = (
    card: HTMLAnchorElement,
    project: any,
    isCompleted: boolean,
) => {
    const score = project.score || 0;
    const ranking = project.ranking || "E";

    // Core Attributes
    card.href = isCompleted
        ? `/projects/view?id=${project.id}`
        : `/audit?projectId=${project.id}&projectName=${encodeURIComponent(project.name)}&projectDesc=${encodeURIComponent(project.description || "")}`;

    // Text Content Updates
    const set = (selector: string, value: string) => {
        const el = card.querySelector(selector);
        if (el) el.textContent = value;
    };

    set(".status-badge", project.status);
    set(".project-name", project.name);
    set(".project-desc", project.description || "");
    set(".project-date", formatDate(project.updatedAt));

    // Visualization Updates (Score/Colors)
    if (isCompleted) {
        const scoreBadge = card.querySelector(
            ".score-badge-completed",
        ) as HTMLElement;
        if (scoreBadge) {
            scoreBadge.textContent = score.toString();
            const color = getScoreColor(score);
            scoreBadge.style.borderColor = color;
            scoreBadge.style.color = color;
        }

        const ecoLabel = card.querySelector(".eco-label");
        if (ecoLabel) {
            const labelData = getEcoLabel(score);
            ecoLabel.textContent = labelData.text;
            // Preserve base classes, add dynamic one
            ecoLabel.className = `eco-label text-xs font-semibold mt-1 ${labelData.class}`;
        }

        const leafHighlight = card.querySelector(`.leaf.leaf-${ranking}`);
        if (leafHighlight) {
            leafHighlight.classList.add("highlighted");
        }
    }
};

export const loadProjects = () => {
    const inProgress = JSON.parse(
        localStorage.getItem("inProgress") || "[]",
    );
    const completed = JSON.parse(
        localStorage.getItem("Completed") || "[]",
    );
    const allProjects = [...inProgress, ...completed];

    // Update Stats
    const totalProjectsEl = document.getElementById("totalProjects");
    if (totalProjectsEl)
        totalProjectsEl.textContent = allProjects.length.toString();

    const completedProjects = allProjects.filter(
        (p: any) => p.score !== null,
    );
    const avgScore =
        completedProjects.length > 0
            ? Math.round(
                completedProjects.reduce(
                    (acc: number, p: any) => acc + (p.score || 0),
                    0,
                ) / completedProjects.length,
            )
            : 0;
    const avgScoreEl = document.getElementById("avgScore");
    if (avgScoreEl) avgScoreEl.textContent = avgScore.toString();

    // Render Grid
    const grid = document.getElementById("projectsGrid");
    const tplCompleted = document.getElementById(
        "card-template-completed",
    ) as HTMLTemplateElement;
    const tplPending = document.getElementById(
        "card-template-pending",
    ) as HTMLTemplateElement;

    if (!grid || !tplCompleted || !tplPending) return;

    grid.innerHTML = "";

    if (allProjects.length === 0) {
        grid.innerHTML =
            '<p class="col-span-full text-center text-[var(--color-text-muted)]">No projects found. Start a new one!</p>';
        return;
    }

    allProjects.forEach((project: any) => {
        const isCompleted = project.status === "Completed";
        const template = isCompleted ? tplCompleted : tplPending;

        const clone = template.content.cloneNode(
            true,
        ) as DocumentFragment;
        const card = clone.querySelector("a");

        if (card) {
            populateCard(card, project, isCompleted);
            grid.appendChild(clone);
        }
    });
};
