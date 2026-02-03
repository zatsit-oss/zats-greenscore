import { type Project, ProjectRanking } from '../types/project'
import { EvaluationType, EVALUATION_TYPES } from '../types/evaluation'
import {
    getDashboardStats,
    getProjectsWithEvaluation,
    getChartData,
    type ProjectWithEvaluation
} from '../services/dashboard'

/**
 * Get the display name for an evaluation type
 */
export const getEvaluationTypeName = (type: EvaluationType): string => {
    return EVALUATION_TYPES[type]?.name || type;
};

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
    data: ProjectWithEvaluation,
    evalType: EvaluationType,
) => {
    const { project, evaluation, isCompleted } = data;
    const score = evaluation.score || 0;

    // Core Attributes - link to view if completed, audit if in progress
    if (isCompleted) {
        card.href = `/projects/view?id=${project.id}&evaluationType=${evalType}`;
    } else {
        card.href = `/audit?projectId=${project.id}&evaluationType=${evalType}`;
    }

    // Text Content Updates
    const set = (selector: string, value: string) => {
        const el = card.querySelector(selector);
        if (el) el.textContent = value;
    };

    // Status badge - show evaluation status
    const statusText = isCompleted ? 'Completed' : 'In Progress';
    set(".status-badge", statusText);
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

/**
 * Load and display projects filtered by evaluation type
 * @param evalType - The evaluation type to filter by (required)
 */
export const loadProjects = (evalType: EvaluationType) => {
    // Get dashboard stats from service
    const stats = getDashboardStats(evalType);

    // Update Stats
    const totalProjectsEl = document.getElementById("totalProjects");
    if (totalProjectsEl)
        totalProjectsEl.textContent = stats.totalProjects.toString();

    const avgScoreEl = document.getElementById("avgScore");
    if (avgScoreEl) avgScoreEl.textContent = stats.avgScore.toString();

    // Update Avg Score label
    const avgScoreLabelEl = document.getElementById("avgScoreLabel");
    if (avgScoreLabelEl) {
        avgScoreLabelEl.textContent = `Avg ${getEvaluationTypeName(evalType)} Score`;
    }

    // Bar Chart - Show only if there are completed projects
    const chartSection = document.getElementById("chartSection");
    if (chartSection) {
        const chartData = getChartData(evalType);
        if (chartData.length > 0) {
            chartSection.classList.remove("hidden");
            // Initialize chart after DOM is ready
            requestAnimationFrame(() => {
                if (typeof (window as any).initBarChart === "function") {
                    (window as any).initBarChart("projectsBarChart", chartData);
                }
            });
        } else {
            chartSection.classList.add("hidden");
        }
    }

    // Render Grid - Only projects with the selected evaluation type
    const grid = document.getElementById("projectsGrid");
    const tplCompleted = document.getElementById(
        "card-template-completed",
    ) as HTMLTemplateElement;
    const tplPending = document.getElementById(
        "card-template-pending",
    ) as HTMLTemplateElement;

    if (!grid || !tplCompleted || !tplPending) return;

    grid.innerHTML = "";

    const projectsWithEval = getProjectsWithEvaluation(evalType);

    if (projectsWithEval.length === 0) {
        grid.innerHTML =
            `<p class="col-span-full text-center text-[var(--color-text-muted)]">No ${getEvaluationTypeName(evalType)} projects found. Start a new one!</p>`;
        return;
    }

    projectsWithEval.forEach((data) => {
        const template = data.isCompleted ? tplCompleted : tplPending;

        const clone = template.content.cloneNode(
            true,
        ) as DocumentFragment;
        const card = clone.querySelector("a");

        if (card) {
            populateCard(card, data, evalType);
            grid.appendChild(clone);
        }
    });
};
