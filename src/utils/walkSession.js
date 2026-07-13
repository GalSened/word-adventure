/**
 * Walk session engine for the pet-walk mode.
 *
 * The walk is a narrated journey: leave home, pass landmarks, find real
 * words from the bank (due SRS words first — the walk doubles as review),
 * feed and play with the pet, and come home with coins and treats.
 * All logic here is pure so the RAF-driven component stays thin.
 */

import { ANIMATION_CONFIG } from '../config/constants';

/** Progress percentages where the pet sniffs out a word. */
export const WALK_MILESTONES = [15, 35, 55, 75, 90];

/**
 * Total scrollable world width in px: frames-to-finish * px-per-frame.
 * Landmark world positions are derived from this, so it must stay finite —
 * an undefined config constant here once turned the whole walk to NaN.
 */
export const WORLD_LENGTH =
    (100 / ANIMATION_CONFIG.PET_WALK_PROGRESS_INCREMENT) * ANIMATION_CONFIG.PET_WALK_SCROLL_SPEED;

/**
 * Narrative beats along the path. `at` is walk progress (0-100).
 * The fountain doubles as the feeding moment and the meadow as the
 * toy/play moment — the component reads those ids.
 */
export const LANDMARKS = [
    {
        at: 0,
        id: 'gate',
        icon: '🏡',
        line: {
            boy: 'יוצאים לטיול! תחזיק חזק ברצועה...',
            girl: 'יוצאים לטיול! תחזיקי חזק ברצועה...',
        },
    },
    {
        at: 25,
        id: 'fountain',
        icon: '⛲',
        line: {
            boy: 'הגעתם למזרקה! נראה שמישהו רעב...',
            girl: 'הגעתן למזרקה! נראה שמישהו רעב...',
        },
    },
    {
        at: 50,
        id: 'bridge',
        icon: '🌉',
        line: {
            boy: 'הגשר הישן! רואים מכאן את כל העיר.',
            girl: 'הגשר הישן! רואים מכאן את כל העיר.',
        },
    },
    {
        at: 70,
        id: 'meadow',
        icon: '🌼',
        line: {
            boy: 'אחו הפרחים! זמן מושלם למשחק.',
            girl: 'אחו הפרחים! זמן מושלם למשחק.',
        },
    },
    {
        at: 100,
        id: 'home',
        icon: '🏡',
        line: {
            boy: 'חוזרים הביתה... איזה טיול נהדר היה!',
            girl: 'חוזרות הביתה... איזה טיול נהדר היה!',
        },
    },
];

/**
 * Build the word pool for one walk.
 * Overdue SRS words come first (most overdue first), then unseen
 * easy/medium words so a new player always has something to find.
 *
 * @param {Array} words - Full word bank
 * @param {Object} userProgress - wordId -> SRS state
 * @param {number} count - Encounters per walk
 * @returns {Array} Exactly `count` word objects (bank permitting)
 */
export function buildWalkPool(words, userProgress, count = WALK_MILESTONES.length) {
    const now = Date.now();

    const overdue = words
        .filter(w => userProgress[w.id]?.nextReviewDate <= now)
        .sort((a, b) => userProgress[a.id].nextReviewDate - userProgress[b.id].nextReviewDate);

    const fresh = words.filter(
        w => !userProgress[w.id] && (w.level === 'easy' || w.level === 'medium')
    );

    const pool = [];
    const seen = new Set();
    for (const w of [...overdue, ...fresh, ...words]) {
        if (pool.length >= count) break;
        if (seen.has(w.id)) continue;
        seen.add(w.id);
        pool.push(w);
    }
    return pool;
}

/**
 * Should an encounter fire? Milestones are served strictly in order,
 * one word each — deterministic, unlike the old random-per-frame roll.
 *
 * @param {number} progress - Walk progress 0-100
 * @param {number} servedCount - Encounters already served
 * @returns {boolean}
 */
export function milestoneDue(progress, servedCount) {
    return servedCount < WALK_MILESTONES.length && progress >= WALK_MILESTONES[servedCount];
}

/**
 * End-of-walk rewards.
 * Coins are the shared currency (score); treats drop into the inventory
 * for future feedings; happiness always rises a little — walks are fun
 * even on a bad word day.
 */
export function computeWalkRewards({ correctCount, total }) {
    const perfect = total > 0 && correctCount === total;
    return {
        coins: correctCount * 40 + (perfect ? 100 : 0),
        treats: Math.floor(correctCount / 3),
        happiness: 8 + correctCount * 4,
        perfect,
    };
}

/** Scenery phases — the walk starts at noon and ends under the stars. */
const SKY_PHASES = [
    {
        id: 'day',
        until: 40,
        sky: 'from-sky-300 via-sky-200 to-blue-100',
        ground: 'from-emerald-500 to-emerald-700',
        hills: '#34d399',
        accent: 'from-pink-300 to-purple-300',
        orb: '☀️',
        stars: false,
    },
    {
        id: 'sunset',
        until: 75,
        sky: 'from-orange-400 via-rose-300 to-amber-100',
        ground: 'from-amber-600 to-orange-800',
        hills: '#f59e0b',
        accent: 'from-orange-400 to-red-400',
        orb: '🌇',
        stars: false,
    },
    {
        id: 'night',
        until: 101,
        sky: 'from-indigo-950 via-purple-900 to-slate-800',
        ground: 'from-slate-800 to-indigo-950',
        hills: '#312e81',
        accent: 'from-blue-500 to-indigo-500',
        orb: '🌕',
        stars: true,
    },
];

/**
 * @param {number} progress - Walk progress 0-100
 * @returns {Object} The scenery phase for this point of the journey
 */
export function skyPhaseFor(progress) {
    return SKY_PHASES.find(p => progress < p.until) || SKY_PHASES[SKY_PHASES.length - 1];
}
