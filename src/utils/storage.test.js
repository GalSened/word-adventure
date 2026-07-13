import { describe, it, expect, beforeEach, vi } from 'vitest'
import { safeGetJSON, safeSetJSON } from './storage'

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

