import { describe, it, expect } from 'vitest'
import {
  EvaluationType,
  EvaluationStatus,
  getAvailableEvaluationTypes,
  getEvaluationTypeInfo,
  createEmptyEvaluation
} from '../../../src/types/evaluation'

// ============================================================================
// getAvailableEvaluationTypes
// ============================================================================

describe('getAvailableEvaluationTypes', () => {
  it('returns all evaluation types', () => {
    const types = getAvailableEvaluationTypes()
    expect(types).toHaveLength(2)
    expect(types.map(t => t.id)).toContain(EvaluationType.API_GREEN_SCORE)
    expect(types.map(t => t.id)).toContain(EvaluationType.EROOM)
  })

  it('each type has required fields', () => {
    const types = getAvailableEvaluationTypes()
    types.forEach(type => {
      expect(type.id).toBeDefined()
      expect(type.name).toBeDefined()
      expect(type.shortName).toBeDefined()
      expect(type.description).toBeDefined()
      expect(type.source).toBeDefined()
      expect(type.version).toBeDefined()
    })
  })
})

// ============================================================================
// getEvaluationTypeInfo
// ============================================================================

describe('getEvaluationTypeInfo', () => {
  it('returns info for API_GREEN_SCORE', () => {
    const info = getEvaluationTypeInfo(EvaluationType.API_GREEN_SCORE)
    expect(info.name).toBe('API Green Score')
    expect(info.id).toBe(EvaluationType.API_GREEN_SCORE)
  })

  it('returns info for EROOM', () => {
    const info = getEvaluationTypeInfo(EvaluationType.EROOM)
    expect(info.name).toBe('EROOM')
    expect(info.source).toBe('Boavizta')
  })
})

// ============================================================================
// createEmptyEvaluation
// ============================================================================

describe('createEmptyEvaluation', () => {
  it('creates an evaluation with correct type', () => {
    const evaluation = createEmptyEvaluation(EvaluationType.API_GREEN_SCORE)
    expect(evaluation.type).toBe(EvaluationType.API_GREEN_SCORE)
  })

  it('starts with IN_PROGRESS status', () => {
    const evaluation = createEmptyEvaluation(EvaluationType.EROOM)
    expect(evaluation.status).toBe(EvaluationStatus.IN_PROGRESS)
  })

  it('starts with empty answers', () => {
    const evaluation = createEmptyEvaluation(EvaluationType.API_GREEN_SCORE)
    expect(evaluation.answers).toEqual({})
  })

  it('starts with null score and ranking', () => {
    const evaluation = createEmptyEvaluation(EvaluationType.API_GREEN_SCORE)
    expect(evaluation.score).toBeNull()
    expect(evaluation.ranking).toBeNull()
  })

  it('sets startedAt to current time', () => {
    const before = new Date().toISOString()
    const evaluation = createEmptyEvaluation(EvaluationType.API_GREEN_SCORE)
    const after = new Date().toISOString()
    expect(evaluation.startedAt >= before).toBe(true)
    expect(evaluation.startedAt <= after).toBe(true)
  })
})
