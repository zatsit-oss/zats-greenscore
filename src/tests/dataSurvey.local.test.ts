import { describe, it, expect } from 'vitest'
import DETAILS from '../config/fields-detail.json'
import { DataSurvey, buildDataSurvey, buildRules } from '@/modules/rank/infrastructure/controllers/dataSurvey/dataSurvey.local'

describe('buildRules', () => {
    it('should set checked and value properly for toggle and number', () => {
        const rules = [
            { id: 1, title: 'title', description: 'description', point: 100, ruleId: 'US01', type: 'toggle' },
            { id: 2, title: 'title', description: 'description', point: 100, ruleId: 'US02', type: 'number' },
            { id: 3, title: 'title', description: 'description', point: 100, ruleId: 'UNKNOWN', type: 'toggle' }
        ]
        const result = buildRules(rules)

        expect(result[0].checked).toBe(false)
        expect(result[0].value).toBe(null)
        expect(result[0].detail).toBe(DETAILS['US01'])

        expect(result[1].checked).toBe(null)
        expect(result[1].value).toBe(0)
        expect(result[1].detail).toBe(DETAILS['US02'])

        expect(result[2].checked).toBe(false)
        expect(result[2].value).toBe(null)
        expect(result[2].detail).toBe('')
    })
})

describe('buildDataSurvey', () => {
    it('should sort steps by id and build rules', () => {

        const response = [
            { id: 2, section: 'section', title: 'title', rules: [{ description: 'des', id: 0, point: 100, title: 'title', ruleId: 'US01', type: 'toggle' }] },
            { id: 1, section: 'section', title: 'title', rules: [{ description: 'des', id: 1, point: 100, title: 'title', ruleId: 'US02', type: 'number' }] }
        ]
        const result = buildDataSurvey(response)

        expect(result[0].id).toBe(1)
        expect(result[1].id).toBe(2)

        expect(result[0].rules[0].checked).toBe(null)
        expect(result[1].rules[0].checked).toBe(false)
    })
})

describe('DataSurvey', () => {
    it('getDataSurvey returns built data survey', () => {
        const ds = new DataSurvey()
        const data = ds.getDataSurvey()
        expect(data).toBeDefined()
        expect(Array.isArray(data)).toBe(true)
    })
})