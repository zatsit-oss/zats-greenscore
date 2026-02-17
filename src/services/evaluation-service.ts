/**
 * Evaluation Service - Score interpretation and chart data preparation
 *
 * Extracts pure functions from projects/view.astro for score interpretation
 * and radar chart data preparation.
 *
 * Architecture: Pages (DOM) → evaluation-service (business) → scoring utils
 */

import { EvaluationType } from '../types/evaluation';
import { calculateScoresBySection, type Question, type Answers } from '../utils/apigreenscore-scoring';
import { calculateEroomGlobalScore, getScoreInterpretation } from '../utils/eroom-scoring';
import type { EroomCategory, EroomAnswerValue } from '../types/eroom';

// ============================================================================
// TYPES
// ============================================================================

export interface ScoreDetails {
  text: string;
  color: string;
  shadow: string;
}

export interface ChartDataPoint {
  label: string;
  score: number;
}

// ============================================================================
// SCORE INTERPRETATION
// ============================================================================

/**
 * Get score interpretation for API Green Score (high = good)
 */
export function getApiGreenScoreDetails(score: number): ScoreDetails {
  if (score >= 90) return { text: 'Excellent', color: '#10b981', shadow: 'rgba(16, 185, 129, 0.2)' };
  if (score >= 75) return { text: 'Good', color: '#84cc16', shadow: 'rgba(132, 204, 22, 0.2)' };
  if (score >= 50) return { text: 'Needs Improvement', color: '#f59e0b', shadow: 'rgba(245, 158, 11, 0.2)' };
  return { text: 'Poor', color: '#ef4444', shadow: 'rgba(239, 68, 68, 0.2)' };
}

/**
 * Get score interpretation for EROOM (high = more optimization potential)
 */
export function getEroomScoreDetails(score: number): ScoreDetails {
  const interpretation = getScoreInterpretation(score);
  return {
    text: interpretation.level,
    color: interpretation.color,
    shadow: `${interpretation.color}33`
  };
}

/**
 * Get score details by evaluation type
 */
export function getScoreDetailsByType(score: number, evalType: EvaluationType): ScoreDetails {
  if (evalType === EvaluationType.EROOM) {
    return getEroomScoreDetails(score);
  }
  return getApiGreenScoreDetails(score);
}

// ============================================================================
// CHART DATA PREPARATION
// ============================================================================

/**
 * Prepare radar chart data for API Green Score (section-based)
 */
export function prepareApiGreenScoreChartData(
  answers: Answers,
  questions: Question[]
): ChartDataPoint[] {
  const sectionScores = calculateScoresBySection(answers, questions);
  return sectionScores.map(s => ({ label: s.section, score: s.score }));
}

/**
 * Prepare radar chart data for EROOM (category-based)
 */
export function prepareEroomChartData(
  answers: Record<string, EroomAnswerValue>,
  categories: EroomCategory[]
): ChartDataPoint[] {
  const { categoryScores } = calculateEroomGlobalScore(answers, categories);
  return categoryScores.map(cs => ({ label: cs.categoryName, score: cs.score }));
}

/**
 * Prepare radar chart data for any evaluation type
 */
export function prepareChartData(
  answers: Record<string, boolean | string | number>,
  evalType: EvaluationType,
  questions?: Question[],
  categories?: EroomCategory[]
): ChartDataPoint[] {
  if (evalType === EvaluationType.EROOM && categories) {
    return prepareEroomChartData(
      answers as Record<string, EroomAnswerValue>,
      categories
    );
  }
  if (questions) {
    return prepareApiGreenScoreChartData(answers, questions);
  }
  return [];
}
