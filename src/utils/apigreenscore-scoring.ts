import { ProjectRanking } from '../types/project'

export interface Question {
  section: string;
  id: string;
  question: string;
  description: string;
  points: number;
  formula?: string;
}

export interface Answers {
  [key: string]: boolean | string | number;
}

const safeEvaluate = (formula: string, x: number): number => {
  try {
    // Basic safety check: allow only numbers, x, basic operators, and parens
    if (!/^[\d\s\.\+\-\*\/\(\)x]+$/.test(formula)) {
      console.error(`Invalid formula format: ${formula}`)
      return 0
    }

    // Replace 'x' with the value
    const expression = formula.replace(/x/g, x.toString())

    // Use Function constructor for evaluation (safer than eval, but still requires sanitized input)
    // We know expression only contains safe chars due to regex check above
    return new Function(`return ${expression}`)()
  } catch (e) {
    console.error(`Error evaluating formula: ${formula} with x=${x}`, e)
    return 0
  }
}

export const calculateProjectScore = (answers: Answers, questions: Question[]): { avg: number; points: number } => {
  let totalPointsCapped = 0
  let maxPossiblePoints = 0

  questions.forEach((q) => {
    // Calculate max possible points for normalization
    maxPossiblePoints += q.points

    const answer = answers[q.id]

    // 1. Boolean / Checkbox Handling
    if (typeof answer === 'boolean' && answer) {
      totalPointsCapped += q.points
    }
    // 2. Number / Formula Handling
    else if (q.formula && (typeof answer === 'string' || typeof answer === 'number')) {
      const x = Number(answer)
      if (!isNaN(x)) {
        let calculatedPoints = (q.points * Math.max(0, Math.min(100, safeEvaluate(q.formula, x)))) / 100
        totalPointsCapped += calculatedPoints
      }
    }
  })

  if (maxPossiblePoints === 0) return {
    avg: 0,
    points: 0
  }

  // Return point and normalized score out of 100
  return {
    avg: Math.round((totalPointsCapped / maxPossiblePoints) * 100),
    points: totalPointsCapped
  }
}

// Point thresholds for API Green Score rankings
const RANKING_THRESHOLDS = {
  A: 6000,
  B: 3000,
  C: 2000,
  D: 1000
} as const

export const getRankingScore = (answers: Answers, questions: Question[]) => {
  const { points } = calculateProjectScore(answers, questions)
  if (points >= RANKING_THRESHOLDS.A) return ProjectRanking.A
  if (points >= RANKING_THRESHOLDS.B) return ProjectRanking.B
  if (points >= RANKING_THRESHOLDS.C) return ProjectRanking.C
  if (points >= RANKING_THRESHOLDS.D) return ProjectRanking.D
  return ProjectRanking.E
}

export interface SectionScore {
  section: string;
  score: number;
  maxPoints: number;
  earnedPoints: number;
}

/**
 * Calculate scores by section for radar chart visualization
 */
export const calculateScoresBySection = (answers: Answers, questions: Question[]): SectionScore[] => {
  const sectionMap = new Map<string, { earned: number; max: number }>()

  questions.forEach((q) => {
    if (!sectionMap.has(q.section)) {
      sectionMap.set(q.section, { earned: 0, max: 0 })
    }

    const sectionData = sectionMap.get(q.section)!
    sectionData.max += q.points

    const answer = answers[q.id]

    if (typeof answer === 'boolean' && answer) {
      sectionData.earned += q.points
    } else if (q.formula && (typeof answer === 'string' || typeof answer === 'number')) {
      const x = Number(answer)
      if (!isNaN(x)) {
        const calculatedPoints = (q.points * Math.max(0, Math.min(100, safeEvaluate(q.formula, x)))) / 100
        sectionData.earned += calculatedPoints
      }
    }
  })

  // Convert to array with percentage scores
  const result: SectionScore[] = []
  sectionMap.forEach((data, section) => {
    result.push({
      section,
      score: data.max > 0 ? Math.round((data.earned / data.max) * 100) : 0,
      maxPoints: data.max,
      earnedPoints: Math.round(data.earned)
    })
  })

  // Sort by predefined order
  const sectionOrder = ['Architecture', 'Design', 'Usage', 'Logs']
  result.sort((a, b) => sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section))

  return result
}

