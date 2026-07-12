import { describe, it, expect } from 'vitest';
import { generateDistractors } from './distractorGenerator';
import { initialWordData } from '../data/words';

describe('generateDistractors', () => {
    const anyWord = initialWordData[0];

    it('never includes the correct word itself', () => {
        for (let i = 0; i < 20; i++) {
            const distractors = generateDistractors(anyWord, 3, 'word');
            expect(distractors.some(d => d.id === anyWord.id)).toBe(false);
        }
    });

    it('returns the requested count', () => {
        expect(generateDistractors(anyWord, 3, 'word')).toHaveLength(3);
        expect(generateDistractors(anyWord, 5, 'word')).toHaveLength(5);
    });

    it('never shows a distractor whose displayed field equals the correct answer', () => {
        // If two data entries share a hebrew translation, an id-only filter would
        // let the "wrong" option render identically to the right one.
        for (const word of initialWordData) {
            for (const field of ['word', 'hebrew']) {
                const distractors = generateDistractors(word, 3, field);
                for (const d of distractors) {
                    expect(d[field]).not.toBe(word[field]);
                }
            }
        }
    });

    it('never returns two distractors with the same displayed text', () => {
        for (const word of initialWordData) {
            for (const field of ['word', 'hebrew']) {
                const texts = generateDistractors(word, 3, field).map(d => d[field]);
                expect(new Set(texts).size).toBe(texts.length);
            }
        }
    });
});
