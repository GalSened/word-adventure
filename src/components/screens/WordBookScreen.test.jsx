import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import WordBookScreen from './WordBookScreen';
import { useGameStore } from '../../store/gameStore';
import { WORD_CATEGORIES } from '../../data/wordSchema';

beforeEach(() => {
    localStorage.clear();
    useGameStore.setState({ userProgress: {} });
});

describe('WordBookScreen', () => {
    it('renders a tab for every word category without crashing', () => {
        // Regression: 'school' and 'transport' were added to the word data
        // without a matching CATEGORY_LABELS entry — label.emoji then threw
        // and the ErrorBoundary swallowed the whole screen.
        render(<WordBookScreen onClose={() => {}} />);
        const tabs = screen.getAllByRole('button').filter((b) => /\(\d+\)/.test(b.textContent));
        expect(tabs).toHaveLength(WORD_CATEGORIES.length);
    });

    it('labels the school and transport categories in Hebrew', () => {
        render(<WordBookScreen onClose={() => {}} />);
        expect(screen.getByText(/בית ספר/)).toBeTruthy();
        expect(screen.getByText(/תחבורה/)).toBeTruthy();
    });
});
