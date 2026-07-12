import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Leaderboard from './Leaderboard';

const base = { date: '12.7.2026', avatar: '🤴' };

describe('Leaderboard', () => {
    it('shows the level a score was earned in', () => {
        render(<Leaderboard scores={[{ ...base, points: 300, level: 2 }]} />);
        expect(screen.getByText('שלב 2')).toBeTruthy();
    });

    it('marks review-session scores', () => {
        render(<Leaderboard scores={[{ ...base, points: 120, level: 'review' }]} />);
        expect(screen.getByText('חזרה')).toBeTruthy();
    });

    it('renders legacy entries that have no level field', () => {
        render(<Leaderboard scores={[{ ...base, points: 990 }]} />);
        expect(screen.getByText('990')).toBeTruthy();
        expect(screen.queryByText(/שלב/)).toBeNull();
    });
});
