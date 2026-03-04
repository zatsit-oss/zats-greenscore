import { vi, beforeEach } from 'vitest'

// Mock localStorage
const store: Record<string, string> = {}

const localStorageMock: Storage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key]
  }),
  clear: vi.fn(() => {
    Object.keys(store).forEach((key) => delete store[key])
  }),
  get length() {
    return Object.keys(store).length
  },
  key: vi.fn((index: number) => Object.keys(store)[index] ?? null)
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(() => '00000000-0000-0000-0000-000000000001')
  },
  writable: true
})

// Clear localStorage mock between tests
beforeEach(() => {
  Object.keys(store).forEach((key) => delete store[key])
  vi.clearAllMocks()
})
