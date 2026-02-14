import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { calculateNextReview, getDueWords } from './srs'

describe('calculateNextReview', () => {
  const FAKE_NOW = new Date('2025-01-01T00:00:00Z').getTime()
  const ONE_DAY_MS = 24 * 60 * 60 * 1000

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sets interval=1 and repetition=1 on first successful review (quality=5)', () => {
    const result = calculateNextReview(null, 5)
    expect(result.interval).toBe(1)
    expect(result.repetition).toBe(1)
  })

  it('sets interval=1 and repetition=1 on first review with minimum passing quality (quality=3)', () => {
    const result = calculateNextReview(null, 3)
    expect(result.interval).toBe(1)
    expect(result.repetition).toBe(1)
  })

  it('sets interval=6 and repetition=2 on second successful review', () => {
    const result = calculateNextReview(
      { interval: 1, repetition: 1, easeFactor: 2.5 },
      4
    )
    expect(result.interval).toBe(6)
    expect(result.repetition).toBe(2)
  })

  it('calculates interval=15 and repetition=3 on third successful review', () => {
    const result = calculateNextReview(
      { interval: 6, repetition: 2, easeFactor: 2.5 },
      4
    )
    expect(result.interval).toBe(Math.round(6 * 2.5)) // 15
    expect(result.repetition).toBe(3)
  })

  it('resets repetition=0 and interval=1 on failed review (quality=2)', () => {
    const result = calculateNextReview(
      { interval: 6, repetition: 2, easeFactor: 2.5 },
      2
    )
    expect(result.repetition).toBe(0)
    expect(result.interval).toBe(1)
  })

  it('resets repetition=0 and interval=1 on blackout (quality=0)', () => {
    const result = calculateNextReview(
      { interval: 15, repetition: 3, easeFactor: 2.5 },
      0
    )
    expect(result.repetition).toBe(0)
    expect(result.interval).toBe(1)
  })

  it('does not push easeFactor below 1.3', () => {
    // Start with ef=1.3, quality=0 should try to drop it further
    const result = calculateNextReview(
      { interval: 1, repetition: 1, easeFactor: 1.3 },
      0
    )
    expect(result.easeFactor).toBe(1.3)
  })

  it('increases easeFactor by 0.1 for quality=5', () => {
    const result = calculateNextReview(null, 5)
    // ef = 2.5 + (0.1 - (5-5)*(0.08+(5-5)*0.02)) = 2.5 + 0.1 = 2.6
    expect(result.easeFactor).toBe(2.6)
  })

  it('decreases easeFactor for quality=3', () => {
    const result = calculateNextReview(null, 3)
    // ef = 2.5 + (0.1 - (5-3)*(0.08+(5-3)*0.02)) = 2.5 + (0.1 - 0.24) = 2.36
    expect(result.easeFactor).toBeCloseTo(2.36, 10)
  })

  it('keeps easeFactor unchanged for quality=4', () => {
    const result = calculateNextReview(null, 4)
    // ef = 2.5 + (0.1 - (5-4)*(0.08+(5-4)*0.02)) = 2.5 + (0.1 - 0.1) = 2.5
    expect(result.easeFactor).toBe(2.5)
  })

  it('calculates nextReviewDate as Date.now() + interval * 86400000', () => {
    const result = calculateNextReview(null, 5)
    // interval = 1, so nextReviewDate = FAKE_NOW + 1 day
    expect(result.nextReviewDate).toBe(FAKE_NOW + 1 * ONE_DAY_MS)
  })

  it('calculates nextReviewDate correctly for multi-day intervals', () => {
    const result = calculateNextReview(
      { interval: 1, repetition: 1, easeFactor: 2.5 },
      4
    )
    // interval = 6
    expect(result.nextReviewDate).toBe(FAKE_NOW + 6 * ONE_DAY_MS)
  })
})

describe('getDueWords', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns words with no srs property (new words are always due)', () => {
    const words = [{ word: 'hello' }, { word: 'world' }]
    expect(getDueWords(words)).toEqual(words)
  })

  it('returns words with nextReviewDate in the past', () => {
    const pastWord = {
      word: 'past',
      srs: { nextReviewDate: Date.now() - 1000 },
    }
    expect(getDueWords([pastWord])).toEqual([pastWord])
  })

  it('excludes words with nextReviewDate in the future', () => {
    const futureWord = {
      word: 'future',
      srs: { nextReviewDate: Date.now() + 86400000 },
    }
    expect(getDueWords([futureWord])).toEqual([])
  })

  it('returns empty array for empty input', () => {
    expect(getDueWords([])).toEqual([])
  })

  it('returns only due words from a mixed array', () => {
    const newWord = { word: 'new' }
    const pastWord = {
      word: 'past',
      srs: { nextReviewDate: Date.now() - 1000 },
    }
    const futureWord = {
      word: 'future',
      srs: { nextReviewDate: Date.now() + 86400000 },
    }
    const result = getDueWords([newWord, pastWord, futureWord])
    expect(result).toEqual([newWord, pastWord])
  })

  it('includes words with nextReviewDate exactly equal to now', () => {
    const nowWord = {
      word: 'now',
      srs: { nextReviewDate: Date.now() },
    }
    expect(getDueWords([nowWord])).toEqual([nowWord])
  })
})
