import { describe, it, expect } from 'vitest'
import { interpolate, interpolateContent } from '../../../src/utils/template'

describe('interpolate', () => {
  it('replaces known placeholders', () => {
    expect(interpolate('EOF v{{eroom.version}}', { 'eroom.version': '1.1' })).toBe('EOF v1.1')
  })

  it('tolerates spaces inside braces', () => {
    expect(interpolate('v{{ eroom.version }}', { 'eroom.version': '1.1' })).toBe('v1.1')
  })

  it('leaves unknown placeholders untouched', () => {
    expect(interpolate('v{{unknown.key}}', {})).toBe('v{{unknown.key}}')
  })
})

describe('interpolateContent', () => {
  it('interpolates nested strings and keeps other values', () => {
    const content = {
      title: 'Doc',
      types: [{ name: 'EROOM (EOF v{{eroom.version}})', weight: 3, enabled: true }]
    }
    expect(interpolateContent(content, { 'eroom.version': '1.1' })).toEqual({
      title: 'Doc',
      types: [{ name: 'EROOM (EOF v1.1)', weight: 3, enabled: true }]
    })
  })
})
