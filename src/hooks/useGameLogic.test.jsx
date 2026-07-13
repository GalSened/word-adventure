import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// happy-dom has no real <canvas> 2D context; confetti is pure decoration
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
import { useGameStore } from '../store/gameStore';
import { useGameLogic } from './useGameLogic';
import { useStoryProgress } from './useStoryProgress';
import { useItemEffects } from './useItemEffects';
import { STORE_ITEMS } from '../data/storeItems';
import { initialWordData } from '../data/words';

const PROFILE = { name: 'Test', gender: 'boy', avatar: '🧙' };

function resetStore(overrides = {}) {
    useGameStore.setState({
        userProfile: PROFILE, score: 0, userProgress: {},
        highScores: [], inventory: [], completedLevels: [],
        hintsAvailable: 0, skipsAvailable: 0, equipped: {},
        gameState: 'start', currentWordIndex: 0, activeWords: [],
        userInput: '', lives: 3, feedback: null, currentStreak: 0,
        currentLevel: null,
        levelScore: 0, returnScreen: null,
        dailyStats: { date: new Date().toDateString(), wordsPlayed: 0, maxStreak: 0, dailyScore: 0 },
        hasCompletedOnboarding: true, onboardingStep: 3,
        ...overrides,
    });
}

/** Compose the REAL hooks the way WordAdventure does. */
function renderLogic() {
    return renderHook(() => {
        const inventory = useGameStore((s) => s.inventory);
        const story = useStoryProgress(PROFILE);
        const itemEffects = useItemEffects(inventory);
        return useGameLogic({ story, itemEffects });
    });
}

beforeEach(() => {
    localStorage.clear();
    resetStore();
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
});

describe('handleBuy', () => {
    it('rejects a purchase the player cannot afford, with feedback', () => {
        resetStore({ score: 10 });
        const { result } = renderLogic();
        act(() => result.current.handleBuy(STORE_ITEMS.crown)); // 1000 coins
        const s = useGameStore.getState();
        expect(s.score).toBe(10);
        expect(s.inventory).toEqual([]);
        expect(s.feedback?.type).toBe('error');
    });

    it('purchases an affordable item exactly once', () => {
        resetStore({ score: 1500 });
        const { result } = renderLogic();
        act(() => result.current.handleBuy(STORE_ITEMS.crown));
        const s = useGameStore.getState();
        expect(s.score).toBe(500);
        expect(s.inventory).toEqual(['crown']);
    });

    it('blocks buying a non-stackable item twice (double-click safety)', () => {
        resetStore({ score: 5000 });
        const { result } = renderLogic();
        act(() => {
            result.current.handleBuy(STORE_ITEMS.crown);
            result.current.handleBuy(STORE_ITEMS.crown); // same tick — stale-closure hazard
        });
        const s = useGameStore.getState();
        expect(s.inventory.filter(id => id === 'crown')).toHaveLength(1);
        expect(s.score).toBe(4000); // charged once
    });

    it('allows stacking consumables', () => {
        resetStore({ score: 1000 });
        const { result } = renderLogic();
        act(() => {
            result.current.handleBuy(STORE_ITEMS.potion_health);
            result.current.handleBuy(STORE_ITEMS.potion_health);
        });
        const s = useGameStore.getState();
        expect(s.inventory.filter(id => id === 'potion_health')).toHaveLength(2);
        expect(s.score).toBe(600);
    });
});

describe('consumables actually do something', () => {
    it('using a hint potion converts it into an available hint', () => {
        resetStore({ inventory: ['potion_hint'] });
        const { result } = renderLogic();
        act(() => result.current.handleUse(STORE_ITEMS.potion_hint));
        const s = useGameStore.getState();
        expect(s.hintsAvailable).toBe(1);
        expect(s.inventory).toEqual([]);
    });

    it('using a skip item converts it into an available skip', () => {
        resetStore({ inventory: ['skip_word'] });
        const { result } = renderLogic();
        act(() => result.current.handleUse(STORE_ITEMS.skip_word));
        const s = useGameStore.getState();
        expect(s.skipsAvailable).toBe(1);
        expect(s.inventory).toEqual([]);
    });

    it('lucky coin pays out on a lucky roll', () => {
        resetStore({ inventory: ['lucky_coin'], score: 0 });
        vi.spyOn(Math, 'random').mockReturnValue(0.1); // < 0.5 bonus_chance → win
        const { result } = renderLogic();
        act(() => result.current.handleUse(STORE_ITEMS.lucky_coin));
        const s = useGameStore.getState();
        expect(s.score).toBeGreaterThan(0);
        expect(s.inventory).toEqual([]);
    });

    it('lucky coin can miss, but is still consumed', () => {
        resetStore({ inventory: ['lucky_coin'], score: 0 });
        vi.spyOn(Math, 'random').mockReturnValue(0.9); // >= 0.5 → miss
        const { result } = renderLogic();
        act(() => result.current.handleUse(STORE_ITEMS.lucky_coin));
        const s = useGameStore.getState();
        expect(s.score).toBe(0);
        expect(s.inventory).toEqual([]);
        expect(s.feedback).not.toBeNull();
    });

    it('a retired item refunds its price instead of vanishing silently', () => {
        resetStore({ inventory: ['freeze_time'], score: 0 });
        const { result } = renderLogic();
        act(() => result.current.handleUse(STORE_ITEMS.freeze_time));
        const s = useGameStore.getState();
        expect(s.score).toBe(STORE_ITEMS.freeze_time.price);
        expect(s.inventory).toEqual([]);
    });
});

describe('skip during play', () => {
    it('advances to the next word without touching lives, streak, or SRS', () => {
        const words = initialWordData.slice(0, 3);
        resetStore({
            gameState: 'playing', activeWords: words, currentWordIndex: 0,
            skipsAvailable: 1, lives: 3, currentStreak: 2,
        });
        const { result } = renderLogic();
        act(() => result.current.skipWord());
        const s = useGameStore.getState();
        expect(s.currentWordIndex).toBe(1);
        expect(s.lives).toBe(3);
        expect(s.currentStreak).toBe(2);
        expect(s.skipsAvailable).toBe(0);
        expect(s.userProgress[words[0].id]).toBeUndefined(); // no SRS penalty
    });

    it('does nothing when no skips are available', () => {
        const words = initialWordData.slice(0, 3);
        resetStore({ gameState: 'playing', activeWords: words, currentWordIndex: 0, skipsAvailable: 0 });
        const { result } = renderLogic();
        act(() => result.current.skipWord());
        expect(useGameStore.getState().currentWordIndex).toBe(0);
    });

    it('skipping the last word completes the level', () => {
        const words = initialWordData.slice(0, 1);
        resetStore({
            gameState: 'playing', activeWords: words, currentWordIndex: 0,
            skipsAvailable: 1, currentLevel: 1,
        });
        const { result } = renderLogic();
        act(() => result.current.skipWord());
        expect(useGameStore.getState().gameState).toBe('levelComplete');
    });
});

describe('hint during play', () => {
    it('reveals the next correct letter and consumes a hint', () => {
        const word = initialWordData.find(w => w.type !== 'sentence');
        resetStore({
            gameState: 'playing', activeWords: [word], currentWordIndex: 0,
            hintsAvailable: 1, userInput: '',
        });
        const { result } = renderLogic();
        act(() => result.current.useHint());
        const s = useGameStore.getState();
        expect(s.userInput).toBe(word.word.toUpperCase().slice(0, 1));
        expect(s.hintsAvailable).toBe(0);
    });

    it('replaces a wrong prefix with the correct one', () => {
        const word = initialWordData.find(w => w.type !== 'sentence' && w.word.length >= 3);
        resetStore({
            gameState: 'playing', activeWords: [word], currentWordIndex: 0,
            hintsAvailable: 1, userInput: 'ZZZ',
        });
        const { result } = renderLogic();
        act(() => result.current.useHint());
        const expected = word.word.toUpperCase().slice(0, 1);
        expect(useGameStore.getState().userInput).toBe(expected);
    });

    it('does nothing with no hints available', () => {
        const word = initialWordData.find(w => w.type !== 'sentence');
        resetStore({ gameState: 'playing', activeWords: [word], currentWordIndex: 0, hintsAvailable: 0 });
        const { result } = renderLogic();
        act(() => result.current.useHint());
        expect(useGameStore.getState().userInput).toBe('');
    });
});

describe('leaderboard records per-level scores', () => {
    it('saves the points earned in the level, not the lifetime total', () => {
        vi.useFakeTimers();
        const word = initialWordData.find(w => w.type !== 'sentence');
        resetStore({
            gameState: 'playing', activeWords: [word], currentWordIndex: 0,
            userInput: word.word.toUpperCase(), currentLevel: 3, score: 1000,
        });
        const { result } = renderLogic();
        act(() => result.current.handleCheck()); // correct answer on the last word
        act(() => vi.advanceTimersByTime(2000)); // level-complete transition
        const s = useGameStore.getState();
        expect(s.gameState).toBe('levelComplete');
        const earned = s.score - 1000;
        expect(earned).toBeGreaterThan(0);
        expect(s.highScores).toHaveLength(1);
        expect(s.highScores[0].points).toBe(earned); // NOT the 1000+ lifetime total
        expect(s.highScores[0].level).toBe(3);
    });

    it('a level finished only by skipping records no leaderboard entry', () => {
        const word = initialWordData.find(w => w.type !== 'sentence');
        resetStore({
            gameState: 'playing', activeWords: [word], currentWordIndex: 0,
            skipsAvailable: 1, currentLevel: 1, score: 500,
        });
        const { result } = renderLogic();
        act(() => result.current.skipWord());
        const s = useGameStore.getState();
        expect(s.gameState).toBe('levelComplete');
        expect(s.highScores).toHaveLength(0); // zero points earned → nothing to rank
    });

    it('startLevel resets the per-level score counter', () => {
        resetStore({ levelScore: 999 });
        const { result } = renderLogic();
        act(() => result.current.startLevel(1));
        expect(useGameStore.getState().levelScore).toBe(0);
    });
});

describe('inventory close returns to an in-progress level', () => {
    it('returns to playing when the inventory was opened mid-level', () => {
        resetStore({
            gameState: 'playing', activeWords: initialWordData.slice(0, 2),
            currentWordIndex: 1, lives: 2,
        });
        const { result } = renderLogic();
        act(() => useGameStore.getState().openInventory());
        act(() => result.current.handleInventoryClose(null));
        const s = useGameStore.getState();
        expect(s.gameState).toBe('playing');
        expect(s.currentWordIndex).toBe(1); // level state untouched
        expect(s.lives).toBe(2);
    });

    it('falls back to the map when not opened from a level', () => {
        resetStore();
        const { result } = renderLogic();
        act(() => useGameStore.getState().openInventory());
        act(() => result.current.handleInventoryClose(null));
        expect(useGameStore.getState().gameState).toBe('map');
    });
});

describe('level-complete navigation guard', () => {
    it('does not yank the player to levelComplete if they left mid-transition', () => {
        vi.useFakeTimers();
        const word = initialWordData.find(w => w.type !== 'sentence');
        resetStore({
            gameState: 'playing', activeWords: [word], currentWordIndex: 0,
            userInput: word.word.toUpperCase(), currentLevel: 1,
        });
        const { result } = renderLogic();
        act(() => result.current.handleCheck()); // correct answer schedules the 1.5s transition
        act(() => useGameStore.getState().setGameState('start')); // player hits Home first
        act(() => vi.advanceTimersByTime(2000));
        expect(useGameStore.getState().gameState).toBe('start');
    });
});
