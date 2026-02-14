import { describe, it, expect, afterEach, vi } from 'vitest'
import { generateChallenge } from './grammarEngine'

describe('generateChallenge', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('return shape', () => {
    it('returns an object with id, word, hebrew, hint, level, and type', () => {
      const result = generateChallenge()
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('word')
      expect(result).toHaveProperty('hebrew')
      expect(result).toHaveProperty('hint')
      expect(result).toHaveProperty('level')
      expect(result).toHaveProperty('type')
    })

    it('has an id starting with "gen_"', () => {
      const result = generateChallenge()
      expect(result.id).toMatch(/^gen_/)
    })

    it('level is always "master"', () => {
      const result = generateChallenge()
      expect(result.level).toBe('master')
    })

    it('type is always "sentence"', () => {
      const result = generateChallenge()
      expect(result.type).toBe('sentence')
    })
  })

  describe('template 1: Subject + Adjective', () => {
    it('produces correct English and Hebrew for masculine noun (CAT + BIG)', () => {
      // Sequence: template 0 (0.0), noun 0 (0.0), adjective 0 (0.0)
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.0)  // template index 0
        .mockReturnValueOnce(0.0)  // noun index 0 (CAT, m)
        .mockReturnValueOnce(0.0)  // adjective index 0 (BIG)
      // Also mock for the id generation
      const result = generateChallenge()
      expect(result.word).toBe('THE CAT IS BIG')
      expect(result.hebrew).toBe('החתול גדול')
    })

    it('uses feminine form for feminine noun (PRINCESS + BIG)', () => {
      // PRINCESS is index 5 of 10 nouns -> Math.random = 0.5
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.0)  // template index 0
        .mockReturnValueOnce(0.5)  // noun index 5 (PRINCESS, f)
        .mockReturnValueOnce(0.0)  // adjective index 0 (BIG)
      const result = generateChallenge()
      expect(result.word).toBe('THE PRINCESS IS BIG')
      expect(result.hebrew).toBe('הנסיכה גדולה')
    })
  })

  describe('template 2: Subject + Intransitive Verb', () => {
    it('produces correct English and Hebrew for masculine noun (CAT + SLEEPS)', () => {
      // Template 1 of 3 -> Math.random = 1/3 ~= 0.334
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.334) // template index 1
        .mockReturnValueOnce(0.0)   // noun index 0 (CAT, m)
        .mockReturnValueOnce(0.0)   // verb index 0 (SLEEPS)
      const result = generateChallenge()
      expect(result.word).toBe('THE CAT SLEEPS')
      expect(result.hebrew).toBe('החתול ישן')
    })

    it('uses feminine verb form for feminine noun (PRINCESS + SLEEPS)', () => {
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.334) // template index 1
        .mockReturnValueOnce(0.5)   // noun index 5 (PRINCESS, f)
        .mockReturnValueOnce(0.0)   // verb index 0 (SLEEPS)
      const result = generateChallenge()
      expect(result.word).toBe('THE PRINCESS SLEEPS')
      expect(result.hebrew).toBe('הנסיכה ישנה')
    })
  })

  describe('template 3: Subject + Transitive Verb + Object', () => {
    it('produces correct English and Hebrew (CAT + LOVES + THE BALL)', () => {
      // Template 2 of 3 -> Math.random = 2/3 ~= 0.667
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.667) // template index 2
        .mockReturnValueOnce(0.0)   // noun index 0 (CAT, m)
        .mockReturnValueOnce(0.0)   // verb index 0 (LOVES)
        .mockReturnValueOnce(0.0)   // object index 0 (THE BALL)
      const result = generateChallenge()
      expect(result.word).toBe('THE CAT LOVES THE BALL')
      expect(result.hebrew).toBe('החתול אוהב את הכדור')
    })

    it('uses feminine verb form for feminine noun in transitive sentence', () => {
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.667) // template index 2
        .mockReturnValueOnce(0.5)   // noun index 5 (PRINCESS, f)
        .mockReturnValueOnce(0.0)   // verb index 0 (LOVES)
        .mockReturnValueOnce(0.0)   // object index 0 (THE BALL)
      const result = generateChallenge()
      expect(result.word).toBe('THE PRINCESS LOVES THE BALL')
      expect(result.hebrew).toBe('הנסיכה אוהבת את הכדור')
    })
  })
})
