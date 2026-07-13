import { describe, it, expect } from 'vitest';
import { buildClozeSentence, supportsCloze } from './cloze';
import { initialWordData } from '../data/words';

describe('buildClozeSentence', () => {
    it('blanks the target word out of its example sentence', () => {
        const parts = buildClozeSentence({ word: 'CAT', exampleSentence: 'The cat drinks milk.' });
        expect(parts).toEqual({ before: 'The ', after: ' drinks milk.' });
    });

    it('matches case-insensitively and only on whole words', () => {
        // 'art' must not blank the middle of 'start'
        const parts = buildClozeSentence({ word: 'ART', exampleSentence: 'We start art class now.' });
        expect(parts).toEqual({ before: 'We start ', after: ' class now.' });
    });

    it('blanks only the first occurrence', () => {
        const parts = buildClozeSentence({ word: 'DOG', exampleSentence: 'A dog sees a dog.' });
        expect(parts).toEqual({ before: 'A ', after: ' sees a dog.' });
    });

    it('returns null when the sentence does not contain the word', () => {
        expect(buildClozeSentence({ word: 'CAT', exampleSentence: 'Something else entirely.' })).toBeNull();
        expect(buildClozeSentence({ word: 'CAT', exampleSentence: '' })).toBeNull();
        expect(buildClozeSentence({ word: 'CAT' })).toBeNull();
    });
});

describe('supportsCloze', () => {
    it('rejects sentences that repeat the word — the remainder would leak the answer', () => {
        expect(supportsCloze({ word: 'DOG', exampleSentence: 'A dog sees a dog.' })).toBe(false);
        expect(supportsCloze({ word: 'DOG', exampleSentence: 'The dog is happy.' })).toBe(true);
    });

    it('rejects sentence-type entries and words missing from their sentence', () => {
        expect(supportsCloze({ word: 'I EAT', type: 'sentence', exampleSentence: 'I eat lunch.' })).toBe(false);
        expect(supportsCloze({ word: 'CAT', exampleSentence: 'No felines here.' })).toBe(false);
    });
});

describe('cloze data coverage', () => {
    it('every word either supports a cloze or is safely detected as unsupported', () => {
        const wordTypes = initialWordData.filter((w) => w.type !== 'sentence');
        const supported = wordTypes.filter(supportsCloze);
        // Characterization: log the real coverage so regressions in the word
        // data (sentences that stop containing their word) get noticed.
        console.log(`cloze coverage: ${supported.length}/${wordTypes.length}`);
        for (const w of supported) {
            const parts = buildClozeSentence(w);
            expect(parts).not.toBeNull();
            expect(parts.before + parts.after).not.toMatch(new RegExp(`\\b${w.word}\\b`, 'i'));
        }
        // The overwhelming majority of the vocabulary must support cloze —
        // it is a core challenge type, not an occasional treat.
        expect(supported.length / wordTypes.length).toBeGreaterThan(0.9);
    });
});
