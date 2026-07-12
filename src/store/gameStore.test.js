import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useGameStore, flushPendingWrites } from './gameStore';

const STORE_KEY = 'word-adventure';

function resetStore() {
    useGameStore.setState({
        userProfile: null, score: 0, stars: 0, userProgress: {},
        highScores: [], inventory: [], completedLevels: [],
        hintsAvailable: 0, skipsAvailable: 0,
        gameState: 'start', currentWordIndex: 0, activeWords: [],
        lives: 3, currentStreak: 0,
    });
}

describe('debounced persistence flush', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
        resetStore();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('writes are debounced — nothing hits localStorage immediately', () => {
        localStorage.removeItem(STORE_KEY);
        useGameStore.getState().addScore(100);
        expect(localStorage.getItem(STORE_KEY)).toBeNull();
    });

    it('debounced write lands after 300ms', () => {
        useGameStore.getState().addScore(100);
        vi.advanceTimersByTime(301);
        const raw = localStorage.getItem(STORE_KEY);
        expect(raw).not.toBeNull();
        expect(JSON.parse(raw).state.score).toBe(100);
    });

    it('flushPendingWrites persists immediately without waiting for the debounce', () => {
        useGameStore.getState().addScore(250);
        flushPendingWrites();
        const raw = localStorage.getItem(STORE_KEY);
        expect(raw).not.toBeNull();
        expect(JSON.parse(raw).state.score).toBe(250);
    });

    it('pagehide event flushes the pending write', () => {
        useGameStore.getState().addScore(77);
        window.dispatchEvent(new Event('pagehide'));
        const raw = localStorage.getItem(STORE_KEY);
        expect(raw).not.toBeNull();
        expect(JSON.parse(raw).state.score).toBe(77);
    });
});

describe('consumable counters', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        resetStore();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('addHints / consumeHint round-trip and clamp at zero', () => {
        const s = () => useGameStore.getState();
        s().addHints(2);
        expect(s().hintsAvailable).toBe(2);
        s().consumeHint();
        expect(s().hintsAvailable).toBe(1);
        s().consumeHint();
        s().consumeHint(); // extra consume must not go negative
        expect(s().hintsAvailable).toBe(0);
    });

    it('addSkips / consumeSkip round-trip and clamp at zero', () => {
        const s = () => useGameStore.getState();
        s().addSkips(1);
        expect(s().skipsAvailable).toBe(1);
        s().consumeSkip();
        s().consumeSkip();
        expect(s().skipsAvailable).toBe(0);
    });

    it('counters are persisted (included in the persisted payload)', () => {
        useGameStore.getState().addHints(3);
        useGameStore.getState().addSkips(2);
        flushPendingWrites();
        const persisted = JSON.parse(localStorage.getItem(STORE_KEY)).state;
        expect(persisted.hintsAvailable).toBe(3);
        expect(persisted.skipsAvailable).toBe(2);
    });
});
