import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    WALK_MILESTONES,
    LANDMARKS,
    WORLD_LENGTH,
    buildWalkPool,
    milestoneDue,
    computeWalkRewards,
    skyPhaseFor,
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
