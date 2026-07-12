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
        levelScore: 0, returnScreen: null, avatar: '\u{1F478}',
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

describe('avatar defaults from gender', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        resetStore();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('first profile creation for a girl keeps the princess avatar', () => {
        useGameStore.getState().setUserProfile({ name: 'דנה', gender: 'girl' });
        expect(useGameStore.getState().avatar).toBe('👸');
    });

    it('first profile creation for a boy sets the prince avatar', () => {
        useGameStore.getState().setUserProfile({ name: 'אדם', gender: 'boy' });
        expect(useGameStore.getState().avatar).toBe('🤴');
    });

    it('re-setting the profile never clobbers a manually chosen avatar', () => {
        useGameStore.getState().setUserProfile({ name: 'אדם', gender: 'boy' });
        useGameStore.getState().updateAvatar('🤖');
        useGameStore.getState().setUserProfile({ name: 'אדם', gender: 'boy' });
        expect(useGameStore.getState().avatar).toBe('🤖');
    });
});

describe('per-level high scores', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        resetStore();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('records points together with the level they were earned in', () => {
        useGameStore.getState().saveHighScore(300, 2);
        const entry = useGameStore.getState().highScores[0];
        expect(entry.points).toBe(300);
        expect(entry.level).toBe(2);
    });

    it('keeps only the top 5, sorted descending', () => {
        [100, 500, 300, 200, 400, 250].forEach((p, i) =>
            useGameStore.getState().saveHighScore(p, i + 1));
        const points = useGameStore.getState().highScores.map(e => e.points);
        expect(points).toEqual([500, 400, 300, 250, 200]);
    });

    it('levelScore accumulates and resets', () => {
        useGameStore.getState().addLevelScore(150);
        useGameStore.getState().addLevelScore(165);
        expect(useGameStore.getState().levelScore).toBe(315);
        useGameStore.getState().resetLevelScore();
        expect(useGameStore.getState().levelScore).toBe(0);
    });
});

describe('store/inventory navigation preserves an in-progress level', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        resetStore();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('store opened mid-level returns to the level on close', () => {
        useGameStore.setState({ gameState: 'playing' });
        useGameStore.getState().openStore();
        expect(useGameStore.getState().gameState).toBe('store');
        useGameStore.getState().closeOverlay('start');
        expect(useGameStore.getState().gameState).toBe('playing');
    });

    it('store opened from the start screen closes back to start', () => {
        useGameStore.getState().openStore();
        useGameStore.getState().closeOverlay('start');
        expect(useGameStore.getState().gameState).toBe('start');
    });

    it('inventory opened mid-level returns to the level on close', () => {
        useGameStore.setState({ gameState: 'playing' });
        useGameStore.getState().openInventory();
        useGameStore.getState().closeOverlay('map');
        expect(useGameStore.getState().gameState).toBe('playing');
    });

    it('hopping store↔inventory keeps the way back to the level', () => {
        useGameStore.setState({ gameState: 'playing' });
        useGameStore.getState().openInventory();
        useGameStore.getState().openStore(); // header hop while inside inventory
        useGameStore.getState().closeOverlay('start');
        expect(useGameStore.getState().gameState).toBe('playing');
    });

    it('explicit navigation (Home) abandons the resume point', () => {
        useGameStore.setState({ gameState: 'playing' });
        useGameStore.getState().openStore();
        useGameStore.getState().setGameState('start'); // Home from inside the store
        useGameStore.getState().openStore();
        useGameStore.getState().closeOverlay('start');
        expect(useGameStore.getState().gameState).toBe('start');
    });
});
