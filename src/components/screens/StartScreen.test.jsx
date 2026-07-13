import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import StartScreen from './StartScreen';
import { useGameStore } from '../../store/gameStore';

const PROFILE = { name: 'דני', gender: 'boy', avatar: '🤴' };
const DAILY = { date: new Date().toDateString(), wordsPlayed: 0, maxStreak: 0, dailyScore: 0 };
const t = (boy) => boy;

function renderStart() {
    return render(
        <StartScreen
            userProfile={PROFILE}
            dailyStats={DAILY}
            onStartLevel={() => {}}
            onNavigate={() => {}}
            onWalkPet={() => {}}
            t={t}
        />
    );
}

describe('StartScreen hero card pet state', () => {
    beforeEach(() => {
        useGameStore.setState({
            userProgress: {},
            highScores: [],
            inventory: ['dog'],
            petCare: { satiety: 70, happiness: 70, walksCompleted: 0 },
        });
    });

    it('warns on the hero card when the pet is hungry', () => {
        useGameStore.setState({ petCare: { satiety: 10, happiness: 80, walksCompleted: 2 } });
        renderStart();
        expect(screen.getByText(/רעב/)).toBeTruthy();
    });

    it('shows no hunger warning when the pet is fed', () => {
        renderStart();
        expect(screen.queryByText(/רעב/)).toBeNull();
    });

    it('shows the care meters for an owned pet', () => {
        useGameStore.setState({ petCare: { satiety: 55, happiness: 80, walksCompleted: 0 } });
        renderStart();
        expect(screen.getByLabelText(/מצב החיה/)).toBeTruthy();
    });

    it('counts completed walks once there are some', () => {
        useGameStore.setState({ petCare: { satiety: 70, happiness: 70, walksCompleted: 3 } });
        renderStart();
        expect(screen.getByText(/3 טיולים/)).toBeTruthy();
    });

    it('shows neither meters nor hunger for a player with no pet yet', () => {
        useGameStore.setState({ inventory: [] });
        renderStart();
        expect(screen.queryByLabelText(/מצב החיה/)).toBeNull();
        expect(screen.queryByText(/רעב/)).toBeNull();
    });
});
