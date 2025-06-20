import { describe, it, expect } from 'vitest'
import { getFlowPoint, getRankingScore, getRankingColor } from '../utils/greenscore'
import type { FlowStep } from '@/type/flow.type'
import type { DataSurvey } from '@/type/dataStepSurvey.type'

describe('getFlowPoint', () => {
    it('should return 100 for toggle true', () => {
        expect(getFlowPoint('toggle', 100, true, undefined)).toBe(100)
    })

    it('should return 0 for toggle false', () => {
        expect(getFlowPoint('toggle', 100, false, undefined)).toBe(0)
    })

    it('should compute formula correctly', () => {
        expect(getFlowPoint('number', 200, 50, 'x')).toBe(100)
        expect(getFlowPoint('number', 300, 20, '100 - x')).toBe(240)
    })
})

describe('getRankingScore', () => {
    const mockDataSurvey: DataSurvey[] = [
        {
            section: 'section',
            id: 1,
            title: 'title',
            rules: [
                { description: 'description', id: 1, ruleId: 'ruleId', title: 'title', detail: 'detail', checked: true, value: null, point: 1000, type: 'toggle', formula: undefined },
                { description: 'description', id: 2, ruleId: 'ruleId', title: 'title', detail: 'detail', checked: true, value: null, point: 1000, type: 'toggle', formula: undefined }
            ]
        }
    ]

    it('should return C for high score', () => {
        const results: FlowStep[] = [{ id: 0, rules: [{ id: 0, value: true }, { id: 1, value: 100 }] }]
        expect(getRankingScore(mockDataSurvey, results)).toBe('C')
    })
})

describe('getRankingColor', () => {
    it('should return correct color', () => {
        expect(getRankingColor('A')).toBe('--excellentV2-rating-color')
        expect(getRankingColor('Z')).toBe('--showstopperv2-rating-color')
    })
})