import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    WALK_MILESTONES,
    LANDMARKS,
    WORLD_LENGTH,
    FETCH_CONFIG,
    buildWalkPool,
    milestoneDue,
    computeWalkRewards,
    skyPhaseFor,
    moodModifiers,
    buildBonusCoinSpots,
    fetchRewards,
} from './walkSession';
import { initialWordData } from '../data/words';
import { calculateNextReview } from './srs';

describe('walk word pool', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('serves exactly the requested number of words', () => {
        const pool = buildWalkPool(initialWordData, {}, 5);
        expect(pool).toHaveLength(5);
        expect(new Set(pool.map(w => w.id)).size).toBe(5);
    });

    it('puts overdue SRS words first — the walk doubles as review', () => {
        vi.setSystemTime(new Date('2030-01-01T10:00:00'));
        const [a, b] = initialWordData;
        const progress = {
            [a.id]: calculateNextReview(undefined, 5),
            [b.id]: calculateNextReview(undefined, 5),
        };
        vi.setSystemTime(new Date('2030-01-10T10:00:00')); // both overdue
        const pool = buildWalkPool(initialWordData, progress, 5);
        expect(pool.slice(0, 2).map(w => w.id).sort()).toEqual([a.id, b.id].sort());
    });

    it('fills with unseen easy words when nothing is due', () => {
        const pool = buildWalkPool(initialWordData, {}, 5);
        for (const w of pool) {
            expect(['easy', 'medium']).toContain(w.level);
        }
    });
});

describe('milestones and landmarks', () => {
    it('world length is a finite positive px span (config wiring intact)', () => {
        // An undefined config constant here once NaN-poisoned the whole walk:
        // progress never advanced, milestones never fired, sky locked to night
        expect(Number.isFinite(WORLD_LENGTH)).toBe(true);
        expect(WORLD_LENGTH).toBeGreaterThan(1000);
    });

    it('defines 5 encounter milestones inside the walk', () => {
        expect(WALK_MILESTONES).toHaveLength(5);
        for (const m of WALK_MILESTONES) {
            expect(m).toBeGreaterThan(0);
            expect(m).toBeLessThan(100);
        }
        expect([...WALK_MILESTONES]).toEqual([...WALK_MILESTONES].sort((x, y) => x - y));
    });

    it('milestoneDue fires each milestone exactly once, in order', () => {
        expect(milestoneDue(WALK_MILESTONES[0] - 1, 0)).toBe(false);
        expect(milestoneDue(WALK_MILESTONES[0] + 1, 0)).toBe(true);
        expect(milestoneDue(WALK_MILESTONES[0] + 1, 1)).toBe(false); // already served
        expect(milestoneDue(WALK_MILESTONES[4] + 1, 4)).toBe(true);
        expect(milestoneDue(99, 5)).toBe(false); // all served
    });

    it('landmarks tell the walk story from home and back, with gendered lines', () => {
        expect(LANDMARKS[0].at).toBe(0);
        expect(LANDMARKS[LANDMARKS.length - 1].at).toBe(100);
        for (const lm of LANDMARKS) {
            expect(lm.icon, lm.id).toBeTruthy();
            expect(lm.line?.boy, lm.id).toBeTruthy();
            expect(lm.line?.girl, lm.id).toBeTruthy();
        }
    });
});

describe('walk rewards', () => {
    it('pays coins per correct word and a perfect bonus', () => {
        const partial = computeWalkRewards({ correctCount: 3, total: 5 });
        const perfect = computeWalkRewards({ correctCount: 5, total: 5 });
        expect(partial.coins).toBeGreaterThan(0);
        expect(perfect.coins).toBeGreaterThan(partial.coins);
        expect(perfect.perfect).toBe(true);
        expect(partial.perfect).toBe(false);
    });

    it('drops treats for sustained correct answers', () => {
        expect(computeWalkRewards({ correctCount: 0, total: 5 }).treats).toBe(0);
        expect(computeWalkRewards({ correctCount: 5, total: 5 }).treats).toBeGreaterThanOrEqual(1);
    });

    it('happiness gain scales with success', () => {
        const low = computeWalkRewards({ correctCount: 0, total: 5 });
        const high = computeWalkRewards({ correctCount: 5, total: 5 });
        expect(high.happiness).toBeGreaterThan(low.happiness);
        expect(low.happiness).toBeGreaterThan(0); // a walk always cheers the pet up
    });
});

describe('mood modifiers — pet care matters mechanically', () => {
    it('a hungry pet walks slower and asks for food', () => {
        const mods = moodModifiers({ satiety: 20, happiness: 50 });
        expect(mods.hungry).toBe(true);
        expect(mods.speedMult).toBeLessThan(1);
        expect(mods.speedMult).toBeGreaterThan(0);
    });

    it('a well-fed pet walks at full speed', () => {
        const mods = moodModifiers({ satiety: 70, happiness: 50 });
        expect(mods.hungry).toBe(false);
        expect(mods.speedMult).toBe(1);
    });

    it('a happy pet sniffs out bonus coins; a glum pet does not', () => {
        expect(moodModifiers({ satiety: 70, happiness: 80 }).bonusSpots).toBeGreaterThan(0);
        expect(moodModifiers({ satiety: 70, happiness: 40 }).bonusSpots).toBe(0);
    });

    it('threshold boundaries: satiety 30 is not hungry, happiness 70 earns bonus', () => {
        expect(moodModifiers({ satiety: 30, happiness: 70 })).toMatchObject({
            hungry: false,
            speedMult: 1,
        });
        expect(moodModifiers({ satiety: 30, happiness: 70 }).bonusSpots).toBeGreaterThan(0);
    });

    it('tolerates a missing petCare payload (legacy saves)', () => {
        const mods = moodModifiers(undefined);
        expect(mods.speedMult).toBe(1);
        expect(mods.hungry).toBe(false);
    });
});

describe('bonus coin spots', () => {
    it('returns the requested number of unique, sorted, in-walk positions', () => {
        const spots = buildBonusCoinSpots(4);
        expect(spots).toHaveLength(4);
        expect(new Set(spots).size).toBe(4);
        expect([...spots]).toEqual([...spots].sort((a, b) => a - b));
        for (const s of spots) {
            expect(s).toBeGreaterThan(0);
            expect(s).toBeLessThan(100);
        }
    });

    it('keeps clear of word milestones so coins never cover a question', () => {
        for (const s of buildBonusCoinSpots(4)) {
            for (const m of WALK_MILESTONES) {
                expect(Math.abs(s - m)).toBeGreaterThanOrEqual(3);
            }
        }
    });

    it('is deterministic — same walk, same coins', () => {
        expect(buildBonusCoinSpots(4)).toEqual(buildBonusCoinSpots(4));
    });

    it('returns nothing for a zero request', () => {
        expect(buildBonusCoinSpots(0)).toEqual([]);
    });
});

describe('fetch minigame rewards', () => {
    it('has a sane config: a reachable target and a forgiving timeout', () => {
        expect(FETCH_CONFIG.catchesTarget).toBeGreaterThanOrEqual(1);
        expect(FETCH_CONFIG.timeoutMs).toBeGreaterThan(3000);
    });

    it('full catches pay the toy\'s full happiness; fewer catches pay less but never zero', () => {
        const toyHappiness = 20;
        const full = fetchRewards(FETCH_CONFIG.catchesTarget, toyHappiness);
        const none = fetchRewards(0, toyHappiness);
        expect(full.happiness).toBe(toyHappiness);
        expect(none.happiness).toBeGreaterThan(0); // the dog still had fun
        expect(none.happiness).toBeLessThan(full.happiness);
    });

    it('coins scale with catches and zero catches pay no coins', () => {
        expect(fetchRewards(0, 20).coins).toBe(0);
        expect(fetchRewards(1, 20).coins).toBeGreaterThan(0);
        expect(fetchRewards(FETCH_CONFIG.catchesTarget, 20).coins)
            .toBeGreaterThan(fetchRewards(1, 20).coins);
    });

    it('clamps catches above the target', () => {
        expect(fetchRewards(99, 20)).toEqual(fetchRewards(FETCH_CONFIG.catchesTarget, 20));
    });
});

describe('walk rewards with bonus coins', () => {
    it('adds tapped bonus coins to the final payout', () => {
        const base = computeWalkRewards({ correctCount: 3, total: 5 });
        const withBonus = computeWalkRewards({ correctCount: 3, total: 5, bonusCoins: 30 });
        expect(withBonus.coins).toBe(base.coins + 30);
    });

    it('defaults to zero bonus for callers that never saw a coin', () => {
        expect(computeWalkRewards({ correctCount: 5, total: 5 }).coins)
            .toBe(computeWalkRewards({ correctCount: 5, total: 5, bonusCoins: 0 }).coins);
    });
});

describe('day-night arc', () => {
    it('walk starts in daylight, passes sunset, ends at night', () => {
        expect(skyPhaseFor(0).id).toBe('day');
        expect(skyPhaseFor(50).id).toBe('sunset');
        expect(skyPhaseFor(90).id).toBe('night');
    });

    it('every phase carries full scenery colors', () => {
        for (const p of [0, 50, 90]) {
            const phase = skyPhaseFor(p);
            expect(phase.sky).toBeTruthy();
            expect(phase.ground).toBeTruthy();
            expect(phase.accent).toBeTruthy();
            expect(typeof phase.stars).toBe('boolean');
        }
    });
});
