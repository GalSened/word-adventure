import { describe, it, expect, afterEach, vi } from 'vitest'
import { generateChallenge, buildNounsFromWordBank } from './grammarEngine'

describe('buildNounsFromWordBank', () => {
  it('returns an array of noun objects with en, he, gender, emoji', () => {
    const nouns = buildNounsFromWordBank()
    expect(nouns.length).toBeGreaterThan(0)
    for (const noun of nouns) {
      expect(noun).toHaveProperty('en')
      expect(noun).toHaveProperty('he')
      expect(noun).toHaveProperty('gender')
      expect(noun).toHaveProperty('emoji')
      expect(['m', 'f']).toContain(noun.gender)
    }
  })

  it('includes both masculine and feminine nouns', () => {
    const nouns = buildNounsFromWordBank()
    expect(nouns.some(n => n.gender === 'm')).toBe(true)
    expect(nouns.some(n => n.gender === 'f')).toBe(true)
  })

  it('only includes nouns from animals, family, and professions categories', () => {
    // Verify indirectly: known word from animals should be present
    const nouns = buildNounsFromWordBank()
    expect(nouns.some(n => n.en === 'CAT')).toBe(true)
    expect(nouns.some(n => n.en === 'DOG')).toBe(true)
    // Known word from food category should NOT be present
    expect(nouns.some(n => n.en === 'APPLE')).toBe(false)
  })
})

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
    it('produces correct gender agreement for a masculine noun', () => {
      const nouns = buildNounsFromWordBank()
      const mascNoun = nouns.find(n => n.gender === 'm')
      const mascIndex = nouns.indexOf(mascNoun)
      // Template 0/3 -> 0.0, noun mascIndex/length, adjective 0
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.0) // template index 0
        .mockReturnValueOnce(mascIndex / nouns.length) // first masculine noun
        .mockReturnValueOnce(0.0) // adjective index 0 (BIG -> גדול)
      const result = generateChallenge()
      expect(result.word).toBe(`THE ${mascNoun.en} IS BIG`)
      expect(result.hebrew).toBe(`ה${mascNoun.he} גדול`)
    })

    it('uses feminine adjective form for feminine noun', () => {
      const nouns = buildNounsFromWordBank()
      const femNoun = nouns.find(n => n.gender === 'f')
      const femIndex = nouns.indexOf(femNoun)
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.0) // template index 0
        .mockReturnValueOnce(femIndex / nouns.length) // first feminine noun
        .mockReturnValueOnce(0.0) // adjective index 0 (BIG -> גדולה)
      const result = generateChallenge()
      expect(result.word).toBe(`THE ${femNoun.en} IS BIG`)
      expect(result.hebrew).toBe(`ה${femNoun.he} גדולה`)
    })
  })

  describe('template 2: Subject + Intransitive Verb', () => {
    it('produces correct gender agreement for masculine noun', () => {
      const nouns = buildNounsFromWordBank()
      const mascNoun = nouns.find(n => n.gender === 'm')
      const mascIndex = nouns.indexOf(mascNoun)
      // Template 1/3 -> ~0.334
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.334) // template index 1
        .mockReturnValueOnce(mascIndex / nouns.length)
        .mockReturnValueOnce(0.0)   // verb index 0 (SLEEPS)
      const result = generateChallenge()
      expect(result.word).toBe(`THE ${mascNoun.en} SLEEPS`)
      expect(result.hebrew).toBe(`ה${mascNoun.he} ישן`)
    })

    it('uses feminine verb form for feminine noun', () => {
      const nouns = buildNounsFromWordBank()
      const femNoun = nouns.find(n => n.gender === 'f')
      const femIndex = nouns.indexOf(femNoun)
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.334) // template index 1
        .mockReturnValueOnce(femIndex / nouns.length)
        .mockReturnValueOnce(0.0)   // verb index 0 (SLEEPS)
      const result = generateChallenge()
      expect(result.word).toBe(`THE ${femNoun.en} SLEEPS`)
      expect(result.hebrew).toBe(`ה${femNoun.he} ישנה`)
    })
  })

  describe('template 3: Subject + Transitive Verb + Object', () => {
    it('produces correct sentence with masculine noun', () => {
      const nouns = buildNounsFromWordBank()
      const mascNoun = nouns.find(n => n.gender === 'm')
      const mascIndex = nouns.indexOf(mascNoun)
      // Template 2/3 -> ~0.667
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.667) // template index 2
        .mockReturnValueOnce(mascIndex / nouns.length)
        .mockReturnValueOnce(0.0)   // verb index 0 (LOVES)
        .mockReturnValueOnce(0.0)   // object index 0 (THE BALL)
      const result = generateChallenge()
      expect(result.word).toBe(`THE ${mascNoun.en} LOVES THE BALL`)
      expect(result.hebrew).toBe(`ה${mascNoun.he} אוהב את הכדור`)
    })

    it('uses feminine verb form for feminine noun in transitive sentence', () => {
      const nouns = buildNounsFromWordBank()
      const femNoun = nouns.find(n => n.gender === 'f')
      const femIndex = nouns.indexOf(femNoun)
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.667) // template index 2
        .mockReturnValueOnce(femIndex / nouns.length)
        .mockReturnValueOnce(0.0)   // verb index 0 (LOVES)
        .mockReturnValueOnce(0.0)   // object index 0 (THE BALL)
      const result = generateChallenge()
      expect(result.word).toBe(`THE ${femNoun.en} LOVES THE BALL`)
      expect(result.hebrew).toBe(`ה${femNoun.he} אוהבת את הכדור`)
    })
  })
})
