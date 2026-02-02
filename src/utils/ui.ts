import { type Project, ProjectRanking, ProjectStatus } from '../types/project.ts'
import { StorageKeys } from '../types/storage.ts'

export const RankingResult = {
    A: { text: ProjectRanking.A, minScore: 90, color: 'var(--color-score-excellent)', ecoLabelClass: 'text-emerald-400' },
    B: { text: ProjectRanking.B, minScore: 75, color: 'var(--color-score-good)', ecoLabelClass: 'text-lime-400' },
    C: { text: ProjectRanking.C, minScore: 50, color: 'var(--color-score-average)' , ecoLabelClass: 'text-amber-400' },
    D: { text: ProjectRanking.D, minScore: 25, color: 'var(--color-score-poor)' , ecoLabelClass: 'text-orange-400' },
    E: { text: ProjectRanking.E, minScore: 0, color: 'var(--color-score-poor)', ecoLabelClass: 'text-red-400' }
};

export const getRanking= (score: number) => {
    if (score >= 90) return RankingResult.A;
    if (score >= 75) return RankingResult.B;
    if (score >= 50) return RankingResult.C;
    if (score >= 25) return RankingResult.D;
    return RankingResult.E;
}

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
    project: Project,
    isCompleted: boolean,
) => {
    const score = project.score || 0;

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

    const rankingResult = getRanking(score);
    // Visualization Updates (Score/Colors)
    if (isCompleted) {
        const scoreBadge = card.querySelector(
            ".score-badge-completed",
        ) as HTMLElement;
        if (scoreBadge) {
            scoreBadge.textContent = score.toString();
            const color = rankingResult.color;
            scoreBadge.style.borderColor = color;
            scoreBadge.style.color = color;
        }

        const ecoLabel = card.querySelector(".eco-label");
        if (ecoLabel) {
            ecoLabel.textContent = rankingResult.text;
            // Preserve base classes, add dynamic one
            ecoLabel.className = `eco-label text-xs font-semibold mt-1 ${rankingResult.ecoLabelClass}`;
        }

        const leafHighlight = card.querySelector(`.leaf.leaf-${rankingResult.text}`);
        if (leafHighlight) {
            leafHighlight.classList.add("highlighted");
        }
    }
};

export const loadProjects = () => {
    const inProgress = JSON.parse(
        localStorage.getItem(StorageKeys.IN_PROGRESS) || "[]",
    );
    const completed = JSON.parse(
        localStorage.getItem(StorageKeys.COMPLETED) || "[]",
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

    // Bar Chart - Show only if there are completed projects
    const chartSection = document.getElementById("chartSection");
    if (chartSection && completedProjects.length > 0) {
        chartSection.classList.remove("hidden");
        const chartData = completedProjects.map((p: Project) => ({
            label: p.name,
            value: p.score || 0,
            id: p.id
        }));
        // Initialize chart after DOM is ready
        requestAnimationFrame(() => {
            if (typeof (window as any).initBarChart === "function") {
                (window as any).initBarChart("projectsBarChart", chartData);
            }
        });
    }

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
        const isCompleted = project.status === ProjectStatus.COMPLETED;
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
