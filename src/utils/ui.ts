import { ProjectRanking } from '../types/project'
import { EvaluationType, EVALUATION_TYPES } from '../types/evaluation'
import {
    getDashboardStats,
    getProjectsWithEvaluation,
    getAllProjectsWithAnyEvaluation,
    getChartData,
    type ProjectWithEvaluation,
    type ChartDataPoint
} from '../services/dashboard'

declare global {
    interface Window {
        initBarChart?: (canvasId: string, data: ChartDataPoint[]) => void;
    }
}

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

export const getRanking = (score: number): typeof RankingResult[keyof typeof RankingResult] => {
    if (score >= 90) return RankingResult.A;
    if (score >= 75) return RankingResult.B;
    if (score >= 50) return RankingResult.C;
    if (score >= 25) return RankingResult.D;
    return RankingResult.E;
}

/**
 * Get score color based on evaluation type
 * GreenScore: high score = good (green)
 * EROOM: high score = optimization potential (red/amber)
 */
export const getScoreColor = (score: number, evalType: EvaluationType): string => {
    if (evalType === EvaluationType.EROOM) {
        // EROOM: low score = mature (green), high score = needs work (red)
        if (score <= 25) return 'var(--color-score-excellent)';
        if (score <= 50) return 'var(--color-score-good)';
        if (score <= 75) return 'var(--color-score-average)';
        return 'var(--color-score-poor)';
    }
    // API Green Score: high score = good
    return getRanking(score).color;
}

export const formatDate = (dateString: string): string => {
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
    card: HTMLElement,
    data: ProjectWithEvaluation,
    onDelete?: OnDeleteCallback,
) => {
    const { project, evaluationType, allEvaluations } = data;

    // Set the link href on the stretched link inside the card
    const cardLink = card.querySelector('.project-card-link') as HTMLAnchorElement | null;
    if (cardLink) {
        cardLink.href = `/projects/view?id=${project.id}&evaluationType=${evaluationType}`;
    }

    // Text Content Updates
    const set = (selector: string, value: string) => {
        const el = card.querySelector(selector);
        if (el) el.textContent = value;
    };

    // Check if any evaluation is completed
    const completedEvaluations = allEvaluations.filter(e => e.isCompleted);
    const hasAnyCompleted = completedEvaluations.length > 0;

    // Status badge - show "Completed" if at least one evaluation is complete
    const statusText = hasAnyCompleted ? 'Completed' : 'In Progress';
    set(".status-badge", statusText);

    // Update status badge style
    const statusBadge = card.querySelector('.status-badge');
    if (statusBadge) {
        statusBadge.className = 'status-badge text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider border';
        if (hasAnyCompleted) {
            statusBadge.classList.add('bg-emerald-500/10', 'text-[var(--color-status-completed)]', 'border-emerald-500/20');
        } else {
            statusBadge.classList.add('bg-amber-500/10', 'text-[var(--color-status-inprogress)]', 'border-amber-500/20');
        }
    }

    // Progress counter - show for evaluations with progress tracking
    const progressEl = card.querySelector('.progress-counter') as HTMLElement;
    if (progressEl) {
        // Find an in-progress evaluation with progress data
        const evalWithProgress = allEvaluations.find(
            e => !e.isCompleted && e.answeredQuestions !== undefined && e.totalQuestions !== undefined
        );
        if (evalWithProgress) {
            progressEl.textContent = `Answers: ${evalWithProgress.answeredQuestions}/${evalWithProgress.totalQuestions}`;
            progressEl.classList.remove('hidden');
        }
    }

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

    // Score badges - show all completed evaluations
    const scorePending = card.querySelector('.score-pending') as HTMLElement;

    if (hasAnyCompleted) {
        // Hide pending badge
        if (scorePending) scorePending.classList.add('hidden');

        // Show score for each completed evaluation
        allEvaluations.forEach(evalSummary => {
            if (evalSummary.isCompleted && evalSummary.score !== null) {
                const scoreItem = card.querySelector(`.score-item[data-eval-type="${evalSummary.type}"]`) as HTMLElement;
                if (scoreItem) {
                    scoreItem.classList.remove('hidden');
                    const scoreBadge = scoreItem.querySelector('.score-badge') as HTMLElement;
                    if (scoreBadge) {
                        scoreBadge.textContent = evalSummary.score.toString();
                        const typeName = getEvaluationTypeName(evalSummary.type);
                        scoreBadge.setAttribute('aria-label', `${typeName}: ${evalSummary.score}`);
                        const color = getScoreColor(evalSummary.score, evalSummary.type);
                        scoreBadge.style.borderColor = color;
                        scoreBadge.style.color = color;
                    }
                }
            }
        });
    } else {
        // Show pending badge
        if (scorePending) scorePending.classList.remove('hidden');
    }
};

/**
 * Load and display projects filtered by evaluation type
 * @param evalType - The evaluation type to filter by, or null for all evaluations
 * @param onDelete - Optional callback when delete button is clicked
 */
export const loadProjects = (evalType: EvaluationType | null, onDelete?: OnDeleteCallback) => {
    const welcomeHero = document.getElementById("welcomeHero");
    const dashboardContent = document.getElementById("dashboardContent");

    // Check if there are any projects at all (regardless of filter)
    const globalStats = getDashboardStats(null);
    if (globalStats.totalProjects === 0) {
        // First visit / no projects: show welcome hero, hide dashboard
        if (welcomeHero) welcomeHero.classList.remove("hidden");
        if (dashboardContent) dashboardContent.classList.add("hidden");
        return;
    }

    // Projects exist: show dashboard, hide welcome hero
    if (welcomeHero) welcomeHero.classList.add("hidden");
    if (dashboardContent) dashboardContent.classList.remove("hidden");

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
                if (typeof window.initBarChart === "function") {
                    window.initBarChart("projectsBarChart", chartData);
                }
            });
        } else {
            chartSection.classList.add("hidden");
        }
    }

    // Render Grid - Projects with the selected evaluation type (or all if null)
    const grid = document.getElementById("projectsGrid");
    const template = document.getElementById("card-template") as HTMLTemplateElement;

    if (!grid || !template) return;

    grid.innerHTML = "";

    const projectsWithEval = evalType
        ? getProjectsWithEvaluation(evalType)
        : getAllProjectsWithAnyEvaluation();

    if (projectsWithEval.length === 0) {
        const typeName = evalType ? getEvaluationTypeName(evalType) : '';
        const message = evalType
            ? `No ${typeName} projects found. Start a new one!`
            : 'No projects found. Start a new one!';
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'col-span-full text-center text-[var(--color-text-muted)]';
        emptyMessage.textContent = message;
        grid.innerHTML = '';
        grid.appendChild(emptyMessage);
        return;
    }

    projectsWithEval.forEach((data) => {
        const clone = template.content.cloneNode(true) as DocumentFragment;
        const card = clone.querySelector(".project-card");

        if (card) {
            populateCard(card as HTMLElement, data, onDelete);
            grid.appendChild(clone);
        }
    });
};
