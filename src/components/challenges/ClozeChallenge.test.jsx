import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ClozeChallenge from './ClozeChallenge';

const WORD = {
    id: 'w_cat',
    word: 'CAT',
    hebrew: 'חתול',
    category: 'animals',
    level: 'easy',
    exampleSentence: 'The cat drinks milk.',
    exampleSentence_he: 'החתול שותה חלב.',
};

const t = (m) => m;

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('ClozeChallenge', () => {
    it('shows the sentence with the word blanked, never the answer itself', () => {
        render(<ClozeChallenge word={WORD} onAnswer={() => {}} disabled={false} t={t} />);
        const sentence = screen.getByTestId('cloze-sentence');
        expect(sentence.textContent).toContain('The');
        expect(sentence.textContent).toContain('drinks milk.');
        expect(sentence.textContent.toLowerCase()).not.toContain('cat');
        // the Hebrew sentence is shown as a comprehension anchor
        expect(screen.getByText('החתול שותה חלב.')).toBeTruthy();
    });

    it('offers the correct word among the options and reports a correct pick', () => {
        const onAnswer = vi.fn();
        render(<ClozeChallenge word={WORD} onAnswer={onAnswer} disabled={false} t={t} />);
        fireEvent.click(screen.getByRole('button', { name: 'CAT' }));
        expect(onAnswer).toHaveBeenCalledWith(true);
    });

    it('reports a wrong pick as false', () => {
        const onAnswer = vi.fn();
        render(<ClozeChallenge word={WORD} onAnswer={onAnswer} disabled={false} t={t} />);
        const wrong = screen.getAllByRole('button').find((b) => b.textContent !== 'CAT');
        fireEvent.click(wrong);
        expect(onAnswer).toHaveBeenCalledWith(false);
    });

    it('ignores taps while disabled (feedback overlay is up)', () => {
        const onAnswer = vi.fn();
        render(<ClozeChallenge word={WORD} onAnswer={onAnswer} disabled={true} t={t} />);
        fireEvent.click(screen.getByRole('button', { name: 'CAT' }));
        expect(onAnswer).not.toHaveBeenCalled();
    });
});
