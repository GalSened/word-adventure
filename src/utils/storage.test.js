import { describe, it, expect, beforeEach, vi } from 'vitest'
import { safeGetJSON, safeSetJSON, safeGetNumber, STORAGE_KEYS } from './storage'

describe('safeGetJSON', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('returns null (default) when key does not exist', () => {
    expect(safeGetJSON('nonexistent')).toBeNull()
  })

  it('returns custom defaultValue when key does not exist', () => {
    expect(safeGetJSON('nonexistent', { fallback: true })).toEqual({
      fallback: true,
    })
  })

  it('returns parsed object when valid JSON is stored', () => {
    localStorage.setItem('testObj', JSON.stringify({ name: 'test', value: 42 }))
    expect(safeGetJSON('testObj')).toEqual({ name: 'test', value: 42 })
  })

  it('returns parsed array when valid JSON is stored', () => {
    localStorage.setItem('testArr', JSON.stringify([1, 2, 3]))
    expect(safeGetJSON('testArr')).toEqual([1, 2, 3])
  })

  it('returns defaultValue when localStorage contains corrupted JSON', () => {
    localStorage.setItem('corrupt', '{not valid json!!!')
    expect(safeGetJSON('corrupt', 'fallback')).toBe('fallback')
  })

  it('returns defaultValue when localStorage.getItem throws', () => {
    const spy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('Storage access denied')
    })
    expect(safeGetJSON('anyKey', 'safe')).toBe('safe')
    spy.mockRestore()
  })
})

describe('safeSetJSON', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('returns true on successful save', () => {
    expect(safeSetJSON('key', { data: 'value' })).toBe(true)
  })

  it('stores valid JSON that can be retrieved', () => {
    const data = { name: 'test', items: [1, 2, 3] }
    safeSetJSON('key', data)
    expect(JSON.parse(localStorage.getItem('key'))).toEqual(data)
  })

  it('returns false when localStorage.setItem throws (quota exceeded)', () => {
    const spy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError')
    })
    expect(safeSetJSON('key', { data: 'value' })).toBe(false)
    spy.mockRestore()
  })
})

describe('safeGetNumber', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('returns 0 (default) when key does not exist', () => {
    expect(safeGetNumber('nonexistent')).toBe(0)
  })

  it('returns custom defaultValue when key does not exist', () => {
    expect(safeGetNumber('nonexistent', 99)).toBe(99)
  })

  it('returns parsed integer from string', () => {
    localStorage.setItem('num', '42')
    expect(safeGetNumber('num')).toBe(42)
  })

  it('returns defaultValue for non-numeric string', () => {
    localStorage.setItem('str', 'abc')
    expect(safeGetNumber('str', 5)).toBe(5)
  })

  it('returns defaultValue for NaN-producing values', () => {
    localStorage.setItem('nan', 'NaN')
    expect(safeGetNumber('nan', 10)).toBe(10)
  })

  it('returns defaultValue when localStorage.getItem throws', () => {
    const spy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('Storage access denied')
    })
    expect(safeGetNumber('anyKey', 7)).toBe(7)
    spy.mockRestore()
  })
})

describe('STORAGE_KEYS', () => {
  it('exports the expected keys', () => {
    const expectedKeys = [
      'USER_PROFILE',
      'SCORE',
      'STARS',
      'USER_PROGRESS',
      'HIGH_SCORES',
      'INVENTORY',
      'DAILY_STATS',
      'AVATAR',
    ]
    expect(Object.keys(STORAGE_KEYS).sort()).toEqual(expectedKeys.sort())
  })

  it('has correct string values', () => {
    expect(STORAGE_KEYS.USER_PROFILE).toBe('userProfile')
    expect(STORAGE_KEYS.SCORE).toBe('score')
    expect(STORAGE_KEYS.STARS).toBe('stars')
    expect(STORAGE_KEYS.USER_PROGRESS).toBe('userProgress')
    expect(STORAGE_KEYS.HIGH_SCORES).toBe('highScores')
    expect(STORAGE_KEYS.INVENTORY).toBe('inventory')
    expect(STORAGE_KEYS.DAILY_STATS).toBe('dailyStats')
    expect(STORAGE_KEYS.AVATAR).toBe('avatar')
  })
})
