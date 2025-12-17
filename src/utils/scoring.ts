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
            console.error(`Invalid formula format: ${formula}`);
            return 0;
        }

        // Replace 'x' with the value
        const expression = formula.replace(/x/g, x.toString());

        // Use Function constructor for evaluation (safer than eval, but still requires sanitized input)
        // We know expression only contains safe chars due to regex check above
        return new Function(`return ${expression}`)();
    } catch (e) {
        console.error(`Error evaluating formula: ${formula} with x=${x}`, e);
        return 0;
    }
};

export const calculateProjectScore = (answers: Answers, questions: Question[]): { avg: number; points: number } => {
    let totalPointsCapped = 0;
    let maxPossiblePoints = 0;

    questions.forEach((q) => {
        // Calculate max possible points for normalization
        maxPossiblePoints += q.points;

        const answer = answers[q.id];

        // 1. Boolean / Checkbox Handling
        if (typeof answer === 'boolean' && answer === true) {
            totalPointsCapped += q.points;
        }
        // 2. Number / Formula Handling
        else if (q.formula && (typeof answer === 'string' || typeof answer === 'number')) {
            const x = Number(answer);
            if (!isNaN(x)) {
                let calculatedPoints = (q.points * Math.max(0, Math.min(100, safeEvaluate(q.formula, x)))) / 100;
                totalPointsCapped += calculatedPoints;
            }
        }
    });

    if (maxPossiblePoints === 0) return {
        avg: 0,
        points: 0
    };

    // Return poinst and normalized score out of 100
    return {
        avg: Math.round((totalPointsCapped / maxPossiblePoints) * 100),
        points: totalPointsCapped
    };
};

export const getRankingScore = (answers: Answers, questions: Question[]) => {
    const { points } = calculateProjectScore(answers, questions);
    if (points >= 6000) {
        return 'A'
    }
    if (points >= 3000 && points < 6000) {
        return 'B'
    }
    if (points >= 2000 && points < 3000) {
        return 'C'
    }
    if (points >= 1000 && points < 2000) {
        return 'D'
    }
    return 'E'
};

