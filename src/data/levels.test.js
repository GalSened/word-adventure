import { describe, it, expect } from 'vitest';
import { LEVELS, getLevelById, getLevelWords } from './levels';

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
