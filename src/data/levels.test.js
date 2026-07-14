import { describe, it, expect } from 'vitest';
import { LEVELS, getLevelById, getLevelWords } from './levels';
import { WORD_CATEGORIES } from './wordSchema';

describe('level word pools', () => {
    it('every level can serve exactly its configured wordCount', () => {
        // Level 5 (colors, easy, 15 words) historically shorted to 13 because
        // the difficulty fallback never cascaded past 'medium'.
        for (const level of LEVELS) {
            const words = getLevelWords(level);
            expect(words, `level ${level.id} (${level.subtitle})`).toHaveLength(level.wordCount);
        }
    });

    it('level words are unique within a session', () => {
        for (const level of LEVELS) {
            const ids = getLevelWords(level).map(w => w.id);
            expect(new Set(ids).size).toBe(ids.length);
        }
    });

    it('level words come only from the level categories', () => {
        for (const level of LEVELS) {
            const words = getLevelWords(level);
            for (const w of words) {
                expect(level.categories).toContain(w.category);
            }
        }
    });

    it('getLevelById resolves all defined levels', () => {
        for (const level of LEVELS) {
            expect(getLevelById(level.id)).toBe(level);
        }
    });
});

describe('level map shape', () => {
    it('defines 21 sequential levels', () => {
        expect(LEVELS).toHaveLength(21);
        expect(LEVELS.map(l => l.id)).toEqual(
            Array.from({ length: 21 }, (_, i) => i + 1)
        );
    });

    it('the capstone level draws from every category in the bank', () => {
        const capstone = LEVELS[LEVELS.length - 1];
        expect(new Set(capstone.categories)).toEqual(new Set(WORD_CATEGORIES));
    });

    it('unlock chain is contiguous — each level unlocks by completing the previous one', () => {
        for (const level of LEVELS) {
            expect(level.unlockRequirement, `level ${level.id}`).toBe(level.id - 1);
        }
    });

    it('grammar is enabled only where categories include grammar-capable nouns', () => {
        const NOUN_CATEGORIES = ['animals', 'family', 'professions'];
        for (const level of LEVELS) {
            if (level.grammarEnabled) {
                expect(
                    level.categories.some(c => NOUN_CATEGORIES.includes(c)),
                    `level ${level.id} enables grammar without noun categories`
                ).toBe(true);
            }
        }
    });
});
