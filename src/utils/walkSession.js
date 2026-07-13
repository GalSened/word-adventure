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
 * Walk routes — a different journey every walk, rotating with the number
 * of completed walks. Each route is 5 narrative beats (`at` = progress
 * 0-100); `role` drives the mechanics: 'feed' opens the feeding moment,
 * 'play' opens the fetch minigame, 'story' is a passing banner. Each
 * route also flavors the scenery (flora accents + dominant tree kind).
 */
export const WALK_ROUTES = [
    {
        id: 'park',
        name: 'הפארק הגדול',
        tree: 'round',
        flora: ['🌿', '🌾', '🌷', '🌻', '🌼', '🍄'],
        landmarks: [
            {
                at: 0,
                id: 'gate',
                role: 'story',
                icon: '🏡',
                line: {
                    boy: 'יוצאים לטיול בפארק! תחזיק חזק ברצועה...',
                    girl: 'יוצאים לטיול בפארק! תחזיקי חזק ברצועה...',
                },
            },
            {
                at: 25,
                id: 'fountain',
                role: 'feed',
                icon: '⛲',
                line: {
                    boy: 'הגעתם למזרקה! נראה שמישהו רעב...',
                    girl: 'הגעתן למזרקה! נראה שמישהו רעב...',
                },
            },
            {
                at: 50,
                id: 'bridge',
                role: 'story',
                icon: '🌉',
                line: {
                    boy: 'הגשר הישן! רואים מכאן את כל העיר.',
                    girl: 'הגשר הישן! רואים מכאן את כל העיר.',
                },
            },
            {
                at: 70,
                id: 'meadow',
                role: 'play',
                icon: '🌼',
                line: {
                    boy: 'אחו הפרחים! זמן מושלם למשחק.',
                    girl: 'אחו הפרחים! זמן מושלם למשחק.',
                },
            },
            {
                at: 100,
                id: 'home',
                role: 'story',
                icon: '🏡',
                line: {
                    boy: 'חוזרים הביתה... איזה טיול נהדר היה!',
                    girl: 'חוזרות הביתה... איזה טיול נהדר היה!',
                },
            },
        ],
    },
    {
        id: 'beach',
        name: 'חוף הים',
        tree: 'palm',
        flora: ['🐚', '⭐', '🌴', '🦀', '🌺', '🪸'],
        landmarks: [
            {
                at: 0,
                id: 'boardwalk',
                role: 'story',
                icon: '🏖️',
                line: {
                    boy: 'היום הולכים לים! מריחים את המלח באוויר?',
                    girl: 'היום הולכות לים! מריחות את המלח באוויר?',
                },
            },
            {
                at: 25,
                id: 'picnic',
                role: 'feed',
                icon: '🧺',
                line: {
                    boy: 'פיקניק על החול! מישהו כאן רעב מהגלים...',
                    girl: 'פיקניק על החול! מישהו כאן רעב מהגלים...',
                },
            },
            {
                at: 50,
                id: 'harbor',
                role: 'story',
                icon: '⛵',
                line: {
                    boy: 'הנמל הקטן! תראה את הסירות המפליגות.',
                    girl: 'הנמל הקטן! תראי את הסירות המפליגות.',
                },
            },
            {
                at: 70,
                id: 'cove',
                role: 'play',
                icon: '🐚',
                line: {
                    boy: 'מפרץ הצדפים! החול כאן מושלם למשחק.',
                    girl: 'מפרץ הצדפים! החול כאן מושלם למשחק.',
                },
            },
            {
                at: 100,
                id: 'home',
                role: 'story',
                icon: '🏡',
                line: {
                    boy: 'חוזרים הביתה עם חול בין האצבעות...',
                    girl: 'חוזרות הביתה עם חול בין האצבעות...',
                },
            },
        ],
    },
    {
        id: 'forest',
        name: 'היער הקסום',
        tree: 'pine',
        flora: ['🍄', '🌰', '🦉', '🌿', '🍁', '🪵'],
        landmarks: [
            {
                at: 0,
                id: 'trailhead',
                role: 'story',
                icon: '🌲',
                line: {
                    boy: 'נכנסים ליער הקסום... שקט, אולי נראה חיות!',
                    girl: 'נכנסות ליער הקסום... שקט, אולי נראה חיות!',
                },
            },
            {
                at: 25,
                id: 'campsite',
                role: 'feed',
                icon: '🏕️',
                line: {
                    boy: 'מחנה ביער! זמן להוציא משהו טעים מהתיק.',
                    girl: 'מחנה ביער! זמן להוציא משהו טעים מהתיק.',
                },
            },
            {
                at: 50,
                id: 'stream',
                role: 'story',
                icon: '🏞️',
                line: {
                    boy: 'נחל צלול! שומעים את המים מפכפכים?',
                    girl: 'נחל צלול! שומעות את המים מפכפכים?',
                },
            },
            {
                at: 70,
                id: 'clearing',
                role: 'play',
                icon: '🍄',
                line: {
                    boy: 'קרחת יער עם פטריות ענק! בוא נשחק כאן.',
                    girl: 'קרחת יער עם פטריות ענק! בואי נשחק כאן.',
                },
            },
            {
                at: 100,
                id: 'home',
                role: 'story',
                icon: '🏡',
                line: {
                    boy: 'יוצאים מהיער הביתה... איזו הרפתקה!',
                    girl: 'יוצאות מהיער הביתה... איזו הרפתקה!',
                },
            },
        ],
    },
];

/** Pick today's route: rotates with completed walks, wraps forever. */
export function routeFor(walksCompleted) {
    return WALK_ROUTES[(walksCompleted ?? 0) % WALK_ROUTES.length];
}

/** Legacy alias — the park is the original (first) route. */
export const LANDMARKS = WALK_ROUTES[0].landmarks;

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
 * even on a bad word day. `bonusCoins` carries coins tapped along the
 * path and fetch-game winnings straight into the payout.
 */
export function computeWalkRewards({ correctCount, total, bonusCoins = 0 }) {
    const perfect = total > 0 && correctCount === total;
    return {
        coins: correctCount * 40 + (perfect ? 100 : 0) + bonusCoins,
        treats: Math.floor(correctCount / 3),
        happiness: 8 + correctCount * 4,
        perfect,
    };
}

/** Below this satiety the pet is hungry: slower walk + a food thought bubble. */
export const HUNGRY_THRESHOLD = 30;
/** At or above this happiness the pet sniffs out bonus coins on the path. */
export const HAPPY_THRESHOLD = 70;

/**
 * How the pet's care state changes THIS walk. Computed live each frame so
 * feeding a hungry pet at the fountain visibly restores its pace.
 *
 * @param {Object|undefined} petCare - { satiety, happiness } (legacy saves may lack it)
 * @returns {{hungry: boolean, speedMult: number, bonusSpots: number}}
 */
export function moodModifiers(petCare) {
    const satiety = petCare?.satiety ?? 70;
    const happiness = petCare?.happiness ?? 70;
    const hungry = satiety < HUNGRY_THRESHOLD;
    return {
        hungry,
        speedMult: hungry ? 0.75 : 1,
        bonusSpots: happiness >= HAPPY_THRESHOLD ? 4 : 0,
    };
}

/**
 * Deterministic bonus-coin positions (walk progress 0-100), stepped across
 * the walk and kept ≥3 away from every word milestone so a coin never
 * competes with a question.
 */
export function buildBonusCoinSpots(count) {
    const spots = [];
    for (let candidate = 8; spots.length < count && candidate < 96; candidate += 9) {
        if (WALK_MILESTONES.every(m => Math.abs(m - candidate) >= 3)) {
            spots.push(candidate);
        }
    }
    return spots;
}

/** Fetch minigame tuning: catches to win and how long the ball stays in play. */
export const FETCH_CONFIG = { catchesTarget: 3, timeoutMs: 9000 };

/**
 * Fetch minigame payout. Full catches pay the toy's full happiness value;
 * fewer catches pay proportionally less but never zero — the dog always
 * enjoys the game. Coins reward the kid's own catching.
 */
export function fetchRewards(catches, toyHappiness) {
    const c = Math.max(0, Math.min(catches, FETCH_CONFIG.catchesTarget));
    return {
        coins: c * 15,
        happiness: Math.round(
            toyHappiness * (0.4 + (0.6 * c) / FETCH_CONFIG.catchesTarget)
        ),
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
