import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { calculateNextReview, getDueWords, addJitter, buildReviewSession } from './srs'

describe('calculateNextReview', () => {
  const FAKE_NOW = new Date('2025-01-01T00:00:00Z').getTime()
  const ONE_DAY_MS = 24 * 60 * 60 * 1000

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('sets interval=1 and repetition=1 on first successful review (quality=5)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5) // neutral jitter
    const result = calculateNextReview(null, 5)
    expect(result.interval).toBe(1)
    expect(result.repetition).toBe(1)
  })

  it('sets interval=1 and repetition=1 on first review with minimum passing quality (quality=3)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const result = calculateNextReview(null, 3)
    expect(result.interval).toBe(1)
    expect(result.repetition).toBe(1)
  })

  it('sets interval=6 and repetition=2 on second successful review', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const result = calculateNextReview(
      { interval: 1, repetition: 1, easeFactor: 2.5 },
      4
    )
    expect(result.interval).toBe(6)
    expect(result.repetition).toBe(2)
  })

  it('calculates interval=15 and repetition=3 on third successful review', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const result = calculateNextReview(
      { interval: 6, repetition: 2, easeFactor: 2.5 },
      4
    )
    expect(result.interval).toBe(Math.round(6 * 2.5)) // 15
    expect(result.repetition).toBe(3)
  })

  it('resets repetition=0 and interval=1 on failed review (quality=2)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const result = calculateNextReview(
      { interval: 6, repetition: 2, easeFactor: 2.5 },
      2
    )
    expect(result.repetition).toBe(0)
    expect(result.interval).toBe(1)
  })

  it('resets repetition=0 and interval=1 on blackout (quality=0)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const result = calculateNextReview(
      { interval: 15, repetition: 3, easeFactor: 2.5 },
      0
    )
    expect(result.repetition).toBe(0)
    expect(result.interval).toBe(1)
  })

  it('does not push easeFactor below 1.3', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    // Start with ef=1.3, quality=0 should try to drop it further
    const result = calculateNextReview(
      { interval: 1, repetition: 1, easeFactor: 1.3 },
      0
    )
    expect(result.easeFactor).toBe(1.3)
  })

  it('increases easeFactor by 0.1 for quality=5', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const result = calculateNextReview(null, 5)
    // ef = 2.5 + (0.1 - (5-5)*(0.08+(5-5)*0.02)) = 2.5 + 0.1 = 2.6
    expect(result.easeFactor).toBe(2.6)
  })

  it('decreases easeFactor for quality=3', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const result = calculateNextReview(null, 3)
    // ef = 2.5 + (0.1 - (5-3)*(0.08+(5-3)*0.02)) = 2.5 + (0.1 - 0.24) = 2.36
    expect(result.easeFactor).toBeCloseTo(2.36, 10)
  })

  it('keeps easeFactor unchanged for quality=4', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const result = calculateNextReview(null, 4)
    // ef = 2.5 + (0.1 - (5-4)*(0.08+(5-4)*0.02)) = 2.5 + (0.1 - 0.1) = 2.5
    expect(result.easeFactor).toBe(2.5)
  })

  it('calculates nextReviewDate with no jitter for interval=1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const result = calculateNextReview(null, 5)
    // interval = 1, no jitter applied, nextReviewDate = FAKE_NOW + 1 day
    expect(result.nextReviewDate).toBe(FAKE_NOW + 1 * ONE_DAY_MS)
  })

  it('applies jitter to nextReviewDate for intervals > 1', () => {
    // Math.random = 1.0 means +10% jitter
    vi.spyOn(Math, 'random').mockReturnValue(1.0)
    const result = calculateNextReview(
      { interval: 1, repetition: 1, easeFactor: 2.5 },
      4
    )
    // interval = 6, jittered = 6 + round(6 * 0.1 * (2*1.0 - 1)) = 6 + round(0.6) = 7
    // nextReviewDate = FAKE_NOW + 7 * ONE_DAY_MS
    expect(result.interval).toBe(6) // base interval stays un-jittered
    expect(result.nextReviewDate).toBe(FAKE_NOW + 7 * ONE_DAY_MS)
  })

  it('applies negative jitter to nextReviewDate when Math.random is 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.0)
    const result = calculateNextReview(
      { interval: 6, repetition: 2, easeFactor: 2.5 },
      4
    )
    // interval = 15, jittered = 15 + round(15 * 0.1 * (2*0 - 1)) = 15 + round(-1.5) = 15 + (-1) = 14
    // (Math.round(-1.5) is -1 in JS)
    expect(result.interval).toBe(15) // base interval un-jittered
    expect(result.nextReviewDate).toBe(FAKE_NOW + 14 * ONE_DAY_MS)
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

  it('excludes unseen words (no SRS state) - PROG-01', () => {
    // Words with no srs property are UNSEEN and should NOT be due
    const words = [{ word: 'hello' }, { word: 'world' }]
    expect(getDueWords(words)).toEqual([])
  })

  it('returns words with SRS state and nextReviewDate in the past', () => {
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

  it('returns only learned overdue words from a mixed array', () => {
    const newWord = { word: 'new' } // unseen - should be EXCLUDED
    const pastWord = {
      word: 'past',
      srs: { nextReviewDate: Date.now() - 1000 },
    }
    const futureWord = {
      word: 'future',
      srs: { nextReviewDate: Date.now() + 86400000 },
    }
    const result = getDueWords([newWord, pastWord, futureWord])
    // Only pastWord should be returned (newWord excluded as unseen)
    expect(result).toEqual([pastWord])
  })

  it('includes words with nextReviewDate exactly equal to now', () => {
    const nowWord = {
      word: 'now',
      srs: { nextReviewDate: Date.now() },
    }
    expect(getDueWords([nowWord])).toEqual([nowWord])
  })
})

describe('addJitter', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 1 unchanged for interval of 1 (no jitter)', () => {
    expect(addJitter(1)).toBe(1)
  })

  it('applies +10% jitter when Math.random returns 1.0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(1.0)
    // 10 + round(10 * 0.1 * (2*1.0 - 1)) = 10 + round(1) = 11
    expect(addJitter(10)).toBe(11)
  })

  it('applies -10% jitter when Math.random returns 0.0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.0)
    // 10 + round(10 * 0.1 * (2*0 - 1)) = 10 + round(-1) = 9
    expect(addJitter(10)).toBe(9)
  })

  it('applies no jitter when Math.random returns 0.5', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    // 10 + round(10 * 0.1 * (2*0.5 - 1)) = 10 + round(0) = 10
    expect(addJitter(10)).toBe(10)
  })

  it('handles large intervals correctly (100 +/- 10%)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(1.0)
    // 100 + round(100 * 0.1 * 1) = 100 + 10 = 110
    expect(addJitter(100)).toBe(110)
  })

  it('result is always >= 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.0)
    // Even with negative jitter on small interval, result clamps to >= 1
    expect(addJitter(2)).toBeGreaterThanOrEqual(1)
  })

  it('result is always an integer', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3)
    const result = addJitter(7)
    expect(Number.isInteger(result)).toBe(true)
  })
})

describe('buildReviewSession', () => {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty array when no words have SRS state', () => {
    const allWords = [
      { id: 'w1', word: 'hello' },
      { id: 'w2', word: 'world' },
    ]
    const userProgress = {} // no progress for any word
    expect(buildReviewSession(allWords, userProgress)).toEqual([])
  })

  it('never includes unseen words (no progress entry)', () => {
    const allWords = [
      { id: 'w1', word: 'hello' },
      { id: 'w2', word: 'world' },
    ]
    const userProgress = {} // none learned
    const result = buildReviewSession(allWords, userProgress)
    expect(result).toEqual([])
  })

  it('returns max 7 overdue words from learned pool', () => {
    const allWords = []
    const userProgress = {}
    // Create 10 overdue words
    for (let i = 0; i < 10; i++) {
      const id = `w${i}`
      allWords.push({ id, word: `word${i}` })
      userProgress[id] = {
        nextReviewDate: Date.now() - (i + 1) * ONE_DAY_MS,
        repetition: 5, // high rep so they don't count as "low-rep"
        interval: 10,
        easeFactor: 2.5,
      }
    }
    const result = buildReviewSession(allWords, userProgress)
    // Should have at most 7 overdue (review slots) + up to 3 low-rep
    // All have high rep, so only 7 review slots used
    const overdueCount = result.filter(w => {
      const progress = userProgress[w.id]
      return progress && progress.nextReviewDate <= Date.now()
    }).length
    expect(overdueCount).toBeLessThanOrEqual(7)
  })

  it('returns overdue words sorted by nextReviewDate ascending (most overdue first)', () => {
    const allWords = [
      { id: 'w1', word: 'slightly_overdue' },
      { id: 'w2', word: 'very_overdue' },
      { id: 'w3', word: 'moderately_overdue' },
    ]
    const userProgress = {
      w1: { nextReviewDate: Date.now() - 1 * ONE_DAY_MS, repetition: 5, interval: 10, easeFactor: 2.5 },
      w2: { nextReviewDate: Date.now() - 10 * ONE_DAY_MS, repetition: 5, interval: 10, easeFactor: 2.5 },
      w3: { nextReviewDate: Date.now() - 5 * ONE_DAY_MS, repetition: 5, interval: 10, easeFactor: 2.5 },
    }
    const result = buildReviewSession(allWords, userProgress)
    // Most overdue first: w2 (-10d), w3 (-5d), w1 (-1d)
    expect(result[0].id).toBe('w2')
    expect(result[1].id).toBe('w3')
    expect(result[2].id).toBe('w1')
  })

  it('caps total session at 10 words (7 review + 3 low-rep)', () => {
    const allWords = []
    const userProgress = {}
    // 10 overdue high-rep words
    for (let i = 0; i < 10; i++) {
      const id = `overdue${i}`
      allWords.push({ id, word: `overdue${i}` })
      userProgress[id] = {
        nextReviewDate: Date.now() - (i + 1) * ONE_DAY_MS,
        repetition: 5,
        interval: 10,
        easeFactor: 2.5,
      }
    }
    // 5 low-rep learned words (not overdue)
    for (let i = 0; i < 5; i++) {
      const id = `lowrep${i}`
      allWords.push({ id, word: `lowrep${i}` })
      userProgress[id] = {
        nextReviewDate: Date.now() + 10 * ONE_DAY_MS, // not overdue
        repetition: 1, // low repetition
        interval: 1,
        easeFactor: 2.5,
      }
    }
    const result = buildReviewSession(allWords, userProgress)
    expect(result.length).toBeLessThanOrEqual(10)
  })

  it('returns words with low repetition count as "new" slots (max 3)', () => {
    const allWords = []
    const userProgress = {}
    // 5 low-rep learned words (not overdue)
    for (let i = 0; i < 5; i++) {
      const id = `lowrep${i}`
      allWords.push({ id, word: `lowrep${i}` })
      userProgress[id] = {
        nextReviewDate: Date.now() + 10 * ONE_DAY_MS, // not overdue
        repetition: 1, // low repetition
        interval: 1,
        easeFactor: 2.5,
      }
    }
    const result = buildReviewSession(allWords, userProgress)
    // Max 3 low-rep "new" slots
    expect(result.length).toBeLessThanOrEqual(3)
    expect(result.length).toBeGreaterThan(0)
  })

  it('combines overdue and low-rep words in session', () => {
    const allWords = [
      { id: 'overdue1', word: 'overdue1' },
      { id: 'lowrep1', word: 'lowrep1' },
    ]
    const userProgress = {
      overdue1: {
        nextReviewDate: Date.now() - ONE_DAY_MS,
        repetition: 5,
        interval: 10,
        easeFactor: 2.5,
      },
      lowrep1: {
        nextReviewDate: Date.now() + 10 * ONE_DAY_MS,
        repetition: 1,
        interval: 1,
        easeFactor: 2.5,
      },
    }
    const result = buildReviewSession(allWords, userProgress)
    expect(result.length).toBe(2)
    const ids = result.map(w => w.id)
    expect(ids).toContain('overdue1')
    expect(ids).toContain('lowrep1')
  })
})
