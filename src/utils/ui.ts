import { type Project, ProjectRanking } from '../types/project'
import { EvaluationType, EVALUATION_TYPES } from '../types/evaluation'
import {
    getDashboardStats,
    getProjectsWithEvaluation,
    getAllProjectsWithAnyEvaluation,
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


/**
 * Callback for delete button click
 */
export type OnDeleteCallback = (projectId: string, projectName: string) => void;

/*
 * Helper to populate a card element with project data.
 */
export const populateCard = (
    card: HTMLAnchorElement,
    data: ProjectWithEvaluation,
    onDelete?: OnDeleteCallback,
) => {
    const { project, evaluation, evaluationType, isCompleted } = data;
    const score = evaluation.score || 0;

    // Core Attributes - link to view if completed, audit if in progress
    const auditPage = evaluationType === EvaluationType.EROOM ? '/audit-eroom' : '/audit';
    if (isCompleted) {
        card.href = `/projects/view?id=${project.id}&evaluationType=${evaluationType}`;
    } else {
        card.href = `${auditPage}?projectId=${project.id}`;
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

    // Delete button
    const deleteBtn = card.querySelector('.delete-project-btn');
    if (deleteBtn && onDelete) {
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(project.id, project.name);
        });
    }

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
 * @param evalType - The evaluation type to filter by, or null for all evaluations
 * @param onDelete - Optional callback when delete button is clicked
 */
export const loadProjects = (evalType: EvaluationType | null, onDelete?: OnDeleteCallback) => {
    // Get dashboard stats from service
    const stats = getDashboardStats(evalType);

    // Update Stats
    const totalProjectsEl = document.getElementById("totalProjects");
    if (totalProjectsEl)
        totalProjectsEl.textContent = stats.totalProjects.toString();

    const avgScoreEl = document.getElementById("avgScore");
    if (avgScoreEl) {
        if (stats.isAverageScoreMeaningful && stats.avgScore !== null) {
            avgScoreEl.textContent = stats.avgScore.toString();
            avgScoreEl.setAttribute('aria-label', `Average score: ${stats.avgScore}`);
        } else {
            avgScoreEl.textContent = "-";
            avgScoreEl.setAttribute('aria-label', 'Average score not available when viewing all evaluation types');
        }
    }

    // Update Avg Score label
    const avgScoreLabelEl = document.getElementById("avgScoreLabel");
    if (avgScoreLabelEl) {
        const label = evalType ? `Avg ${getEvaluationTypeName(evalType)} Score` : 'Avg Score';
        avgScoreLabelEl.textContent = label;
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

    // Render Grid - Projects with the selected evaluation type (or all if null)
    const grid = document.getElementById("projectsGrid");
    const tplCompleted = document.getElementById(
        "card-template-completed",
    ) as HTMLTemplateElement;
    const tplPending = document.getElementById(
        "card-template-pending",
    ) as HTMLTemplateElement;

    if (!grid || !tplCompleted || !tplPending) return;

    grid.innerHTML = "";

    const projectsWithEval = evalType
        ? getProjectsWithEvaluation(evalType)
        : getAllProjectsWithAnyEvaluation();

    if (projectsWithEval.length === 0) {
        const typeName = evalType ? getEvaluationTypeName(evalType) : '';
        const message = evalType
            ? `No ${typeName} projects found. Start a new one!`
            : 'No projects found. Start a new one!';
        grid.innerHTML = `<p class="col-span-full text-center text-[var(--color-text-muted)]">${message}</p>`;
        return;
    }

    projectsWithEval.forEach((data) => {
        const template = data.isCompleted ? tplCompleted : tplPending;

        const clone = template.content.cloneNode(
            true,
        ) as DocumentFragment;
        const card = clone.querySelector("a");

        if (card) {
            populateCard(card, data, onDelete);
            grid.appendChild(clone);
        }
    });
};
