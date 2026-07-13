import { describe, it, expect } from 'vitest';
import { initialWordData } from './words';
import { WORD_CATEGORIES } from './wordSchema';

/**
 * Word-bank composition invariants. The zod schema already validates every
 * field at module load; these tests pin the CONTENT targets so the bank
 * can't silently shrink or drift thin in the difficulty bands the higher
 * levels draw from (hard/expert historically had only 27/19 words).
 */
describe('word bank composition', () => {
    it('ids are unique', () => {
        const ids = initialWordData.map(w => w.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('no duplicate English word within a category', () => {
        const pairs = initialWordData.map(w => `${w.category}:${w.word}`);
        expect(new Set(pairs).size).toBe(pairs.length);
    });

    it('bank holds at least 415 words', () => {
        expect(initialWordData.length).toBeGreaterThanOrEqual(415);
    });

    it('difficulty bands are deep enough for the level map', () => {
        const byLevel = {};
        for (const w of initialWordData) {
            byLevel[w.level] = (byLevel[w.level] || 0) + 1;
        }
        expect(byLevel.easy).toBeGreaterThanOrEqual(105);
        expect(byLevel.medium).toBeGreaterThanOrEqual(120);
        // Levels 10-11/15 (hard) and 12/16/21 (expert) draw from these bands
        expect(byLevel.hard).toBeGreaterThanOrEqual(95);
        expect(byLevel.expert).toBeGreaterThanOrEqual(60);
    });

    it('Cambridge YLE topic categories exist with a full pool each', () => {
        // clothes/weather/sports/toys close the gap vs the Pre-A1
        // Starters topic list; school/transport came in the 12-cat wave
        for (const cat of ['school', 'transport', 'clothes', 'weather', 'sports', 'toys']) {
            expect(WORD_CATEGORIES).toContain(cat);
        }
        const count = (cat) => initialWordData.filter(w => w.category === cat).length;
        expect(count('clothes')).toBeGreaterThanOrEqual(18);
        expect(count('weather')).toBeGreaterThanOrEqual(18);
        expect(count('sports')).toBeGreaterThanOrEqual(18);
        expect(count('toys')).toBeGreaterThanOrEqual(18);
    });

    it('every category holds at least 15 words', () => {
        for (const cat of WORD_CATEGORIES) {
            const count = initialWordData.filter(w => w.category === cat).length;
            expect(count, `category ${cat}`).toBeGreaterThanOrEqual(15);
        }
    });
});
