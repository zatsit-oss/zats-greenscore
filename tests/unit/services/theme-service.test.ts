import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getStoredTheme, getEffectiveTheme, setTheme, toggleTheme } from '../../../src/services/theme-service'

// Mock document.documentElement.setAttribute
const setAttributeMock = vi.fn()
Object.defineProperty(globalThis, 'document', {
  value: {
    documentElement: {
      setAttribute: setAttributeMock
    }
  },
  writable: true
})

// Mock window.matchMedia
const matchMediaMock = vi.fn()
Object.defineProperty(globalThis, 'window', {
  value: {
    ...globalThis.window,
    matchMedia: matchMediaMock
  },
  writable: true
})

describe('theme-service', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    matchMediaMock.mockReturnValue({ matches: false })
  })

  // ==========================================================================
  // getStoredTheme
  // ==========================================================================

  describe('getStoredTheme', () => {
    it('returns null when no theme is stored', () => {
      expect(getStoredTheme()).toBeNull()
    })

    it('returns "light" when stored', () => {
      localStorage.setItem('theme', 'light')
      expect(getStoredTheme()).toBe('light')
    })

    it('returns "dark" when stored', () => {
      localStorage.setItem('theme', 'dark')
      expect(getStoredTheme()).toBe('dark')
    })

    it('returns null for invalid stored value', () => {
      localStorage.setItem('theme', 'rainbow')
      expect(getStoredTheme()).toBeNull()
    })
  })

  // ==========================================================================
  // getEffectiveTheme
  // ==========================================================================

  describe('getEffectiveTheme', () => {
    it('returns stored theme when available', () => {
      localStorage.setItem('theme', 'dark')
      expect(getEffectiveTheme()).toBe('dark')
    })

    it('returns "dark" when system prefers dark and no stored theme', () => {
      matchMediaMock.mockReturnValue({ matches: true })
      expect(getEffectiveTheme()).toBe('dark')
    })

    it('falls back to "light" when no stored theme and system prefers light', () => {
      matchMediaMock.mockReturnValue({ matches: false })
      expect(getEffectiveTheme()).toBe('light')
    })
  })

  // ==========================================================================
  // setTheme
  // ==========================================================================

  describe('setTheme', () => {
    it('persists theme in localStorage', () => {
      setTheme('dark')
      expect(localStorage.getItem('theme')).toBe('dark')
    })

    it('sets data-theme attribute on document', () => {
      setTheme('light')
      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'light')
    })
  })

  // ==========================================================================
  // toggleTheme
  // ==========================================================================

  describe('toggleTheme', () => {
    it('toggles from light to dark', () => {
      localStorage.setItem('theme', 'light')
      const result = toggleTheme()
      expect(result).toBe('dark')
      expect(localStorage.getItem('theme')).toBe('dark')
    })

    it('toggles from dark to light', () => {
      localStorage.setItem('theme', 'dark')
      const result = toggleTheme()
      expect(result).toBe('light')
      expect(localStorage.getItem('theme')).toBe('light')
    })
  })
})
