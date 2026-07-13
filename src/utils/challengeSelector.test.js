import { describe, it, expect } from 'vitest';
import { CHALLENGE_POOLS, selectChallengeType } from './challengeSelector';

const MASTERED = { repetition: 8 };

const CLOZE_WORD = {
    id: 'w1', word: 'CAT', type: 'word',
    exampleSentence: 'The cat drinks milk.',
};
const NO_CLOZE_WORD = {
    id: 'w2', word: 'CAT', type: 'word',
    exampleSentence: 'No felines in this sentence.',
};
const SENTENCE_WORD = {
    id: 's1', word: 'I EAT LUNCH', type: 'sentence',
    exampleSentence: 'I eat lunch.',
};

describe('cloze in the challenge pools', () => {
    it('is offered to familiar and mastered words, not to beginners', () => {
        expect(CHALLENGE_POOLS.familiar).toContain('cloze');
        expect(CHALLENGE_POOLS.mastered).toContain('cloze');
        expect(CHALLENGE_POOLS.new).not.toContain('cloze');
        expect(CHALLENGE_POOLS.learning).not.toContain('cloze');
    });

    it('is actually selectable for a mastered word whose sentence supports it', () => {
        const seen = new Set();
        for (let i = 0; i < 200; i++) {
            seen.add(selectChallengeType(CLOZE_WORD, MASTERED, []));
        }
        expect([...seen]).toContain('cloze');
    });

    it('is never selected when the sentence cannot be blanked', () => {
        for (let i = 0; i < 200; i++) {
            expect(selectChallengeType(NO_CLOZE_WORD, MASTERED, [])).not.toBe('cloze');
        }
    });

    it('is never selected for sentence-type entries', () => {
        for (let i = 0; i < 200; i++) {
            expect(selectChallengeType(SENTENCE_WORD, MASTERED, [])).not.toBe('cloze');
        }
    });
});
