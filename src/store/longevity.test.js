import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameStore, flushPendingWrites } from './gameStore';
import { calculateNextReview, getDueWords, buildReviewSession } from '../utils/srs';
import { initialWordData } from '../data/words';

const STORE_KEY = 'word-adventure';
const DAY = 24 * 60 * 60 * 1000;

function resetStore() {
    useGameStore.setState({
        userProfile: { name: 'Soak', gender: 'boy' }, score: 0, stars: 0,
        userProgress: {}, highScores: [], inventory: [], completedLevels: [],
        hintsAvailable: 0, skipsAvailable: 0,
        gameState: 'start', currentWordIndex: 0, activeWords: [],
        lives: 3, currentStreak: 0, levelScore: 0, returnScreen: null,
        dailyStats: { date: new Date().toDateString(), wordsPlayed: 0, maxStreak: 0, dailyScore: 0 },
    });
}

/**
 * Long-horizon behavior: months of play must not corrupt state, grow
 * storage without bound, or break the SRS review pipeline.
 */
describe('longevity: months of play', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
        resetStore();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('100 completed levels keep the leaderboard capped at 5 best runs', () => {
        const s = () => useGameStore.getState();
        for (let i = 1; i <= 100; i++) {
            s().saveHighScore(1000 + (i % 37) * 10, ((i - 1) % 16) + 1);
        }
        const scores = s().highScores;
        expect(scores).toHaveLength(5);
        // Sorted descending, holding the best runs seen
        const points = scores.map(e => e.points);
        expect(points).toEqual([...points].sort((a, b) => b - a));
        expect(points[0]).toBe(1360); // best value produced by the loop
    });

    it('full progress on every word keeps the persisted payload bounded', () => {
        const s = () => useGameStore.getState();
        // Simulate the whole word bank mastered over many sessions
        for (const w of initialWordData) {
            let state;
            for (let rep = 0; rep < 6; rep++) {
                state = calculateNextReview(state, 5);
            }
            s().updateWordProgress(w.id, state);
        }
        for (let i = 0; i < 50; i++) s().saveHighScore(500 + i, (i % 16) + 1);
        s().addScore(999999);
        flushPendingWrites();

        const raw = localStorage.getItem(STORE_KEY);
        expect(raw).not.toBeNull();
        // Full mastery of 260+ words + capped leaderboard must stay well
        // under 100KB — localStorage budgets are ~5MB, we use <2%
        expect(raw.length).toBeLessThan(100_000);
        // And it round-trips
        const parsed = JSON.parse(raw).state;
        expect(Object.keys(parsed.userProgress).length).toBe(initialWordData.length);
        expect(parsed.highScores).toHaveLength(5);
    });

    it('SRS pipeline: a learned word becomes due after its interval and enters the review session', () => {
        vi.setSystemTime(new Date('2026-07-12T10:00:00'));
        const word = initialWordData[0];

        // First correct answer: interval 1 day
        const srs = calculateNextReview(undefined, 5);
        expect(srs.repetition).toBe(1);

        // Same day: not due
        expect(getDueWords([{ ...word, srs }])).toHaveLength(0);
        expect(buildReviewSession([word], { [word.id]: srs })).toHaveLength(1); // low-rep fill slot

        // Two days later: overdue and served by the session builder
        vi.setSystemTime(new Date('2026-07-14T10:00:00'));
        expect(getDueWords([{ ...word, srs }])).toHaveLength(1);
        const session = buildReviewSession([word], { [word.id]: srs });
        expect(session.map(w => w.id)).toContain(word.id);
    });

    it('SRS pipeline: review sessions stay capped at 10 even when everything is overdue', () => {
        vi.setSystemTime(new Date('2026-07-12T10:00:00'));
        const words = initialWordData.slice(0, 40);
        const progress = {};
        for (const w of words) {
            progress[w.id] = calculateNextReview(undefined, 5);
        }
        vi.setSystemTime(new Date('2026-09-01T10:00:00')); // 7 weeks later
        const session = buildReviewSession(words, progress);
        expect(session.length).toBeLessThanOrEqual(10);
        expect(session.length).toBeGreaterThan(0);
    });

    it('SRS intervals grow with mastery — a mastered word is not due for weeks', () => {
        vi.setSystemTime(new Date('2026-07-12T10:00:00'));
        let srs;
        // Answer correctly 5 times across the proper review days
        for (let i = 0; i < 5; i++) {
            srs = calculateNextReview(srs, 5);
            vi.setSystemTime(new Date(Date.now() + (srs.interval + 1) * DAY));
        }
        // SM-2: 1, 6, then interval * easeFactor — well past two weeks
        expect(srs.interval).toBeGreaterThan(14);
        expect(srs.repetition).toBe(5);
    });

    it('daily stats reset stamps the new day and zeroes counters', () => {
        // EVERY date in this test must come from the mocked clock. The first
        // version stamped "yesterday" from the real clock, which made the test
        // a calendar bomb: it failed in CI the moment the real date reached
        // the hardcoded "next morning" (2026-07-13, run 20 on main).
        const s = () => useGameStore.getState();
        vi.setSystemTime(new Date('2030-01-01T23:50:00'));
        s().resetDailyStats(); // stamp "yesterday" under the mocked clock
        s().updateDailyStats({ wordsPlayed: 30, dailyScore: 4500, maxStreak: 12 });
        expect(s().dailyStats.wordsPlayed).toBe(30);

        // Next morning — the WordAdventure date-rollover effect calls resetDailyStats
        vi.setSystemTime(new Date('2030-01-02T07:00:00'));
        expect(s().dailyStats.date).not.toBe(new Date().toDateString());
        s().resetDailyStats();
        const fresh = s().dailyStats;
        expect(fresh.date).toBe(new Date().toDateString());
        expect(fresh.wordsPlayed).toBe(0);
        expect(fresh.dailyScore).toBe(0);
        expect(fresh.maxStreak).toBe(0);
    });

    it('a corrupted persisted payload does not brick the store module', () => {
        localStorage.setItem(STORE_KEY, '{definitely not json');
        // zustand persist swallows the parse failure and starts from defaults;
        // the store must still be usable
        expect(() => useGameStore.getState().addScore(10)).not.toThrow();
        expect(useGameStore.getState().score).toBeGreaterThanOrEqual(10);
    });
});
