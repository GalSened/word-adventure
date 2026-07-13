/**
 * Level definitions for Word Adventure
 * 16 progressive levels with themed visuals, category mappings, and word counts.
 * Each level draws words from specific categories and difficulty bands.
 */

import { initialWordData } from './words';

/**
 * Difficulty fallback order -- when a level's primary difficulty band
 * doesn't have enough words, try adjacent difficulties in this order.
 * Every band cascades through ALL other bands (nearest first) so a level
 * can never silently serve fewer words than its configured wordCount
 * (level 5 "Rainbow Bridge" used to short 13/15 because easy stopped at medium).
 */
const DIFFICULTY_FALLBACK = {
    easy: ['medium', 'hard', 'expert'],
    medium: ['easy', 'hard', 'expert'],
    hard: ['medium', 'expert', 'easy'],
    expert: ['hard', 'medium', 'easy'],
};

/**
 * 16 levels mapping categories, themes, difficulty bands, and word counts.
 * Grammar is enabled only in levels whose categories overlap with
 * NOUN_CATEGORIES (animals, family, professions) per decision [03-04].
 */
export const LEVELS = [
    {
        id: 1,
        name: 'שער הממלכה',
        subtitle: 'The Kingdom Gate',
        categories: ['animals'],
        difficulty: 'easy',
        wordCount: 8,
        grammarEnabled: false,
        theme: {
            bgGradient: 'from-green-400 to-emerald-600',
            emoji: '🏰',
            decorEmojis: ['🦋', '🌸', '🌿'],
        },
        storyChapter: 'level_1',
        unlockRequirement: 0,
    },
    {
        id: 2,
        name: 'גן החיות',
        subtitle: 'Animal Garden',
        categories: ['animals'],
        difficulty: 'medium',
        wordCount: 10,
        grammarEnabled: true,
        theme: {
            bgGradient: 'from-lime-400 to-green-600',
            emoji: '🦁',
            decorEmojis: ['🐾', '🌳', '🍃'],
        },
        storyChapter: 'level_2',
        unlockRequirement: 1,
    },
    {
        id: 3,
        name: 'המשתה',
        subtitle: 'The Feast',
        categories: ['food'],
        difficulty: 'easy',
        wordCount: 10,
        grammarEnabled: false,
        theme: {
            bgGradient: 'from-orange-400 to-red-500',
            emoji: '🍕',
            decorEmojis: ['🍰', '🎂', '🍩'],
        },
        storyChapter: 'level_3',
        unlockRequirement: 2,
    },
    {
        id: 4,
        name: 'בית המשפחה',
        subtitle: 'Family Home',
        categories: ['family'],
        difficulty: 'easy',
        wordCount: 10,
        grammarEnabled: true,
        theme: {
            bgGradient: 'from-pink-400 to-rose-500',
            emoji: '👨‍👩‍👧‍👦',
            decorEmojis: ['🏠', '❤️', '🤗'],
        },
        storyChapter: 'level_4',
        unlockRequirement: 3,
    },
    {
        id: 5,
        name: 'גשר הקשת',
        subtitle: 'Rainbow Bridge',
        categories: ['colors'],
        difficulty: 'easy',
        wordCount: 15,
        grammarEnabled: false,
        theme: {
            bgGradient: 'from-violet-400 to-purple-600',
            emoji: '🌈',
            decorEmojis: ['🎨', '✨', '🖌️'],
        },
        storyChapter: 'level_5',
        unlockRequirement: 4,
    },
    {
        id: 6,
        name: 'שביל הטבע',
        subtitle: 'Nature Trail',
        categories: ['nature'],
        difficulty: 'easy',
        wordCount: 12,
        grammarEnabled: false,
        theme: {
            bgGradient: 'from-teal-400 to-cyan-600',
            emoji: '🌳',
            decorEmojis: ['🍀', '🌊', '⛰️'],
        },
        storyChapter: 'level_6',
        unlockRequirement: 5,
    },
    {
        id: 7,
        name: 'הסדנה',
        subtitle: 'The Workshop',
        categories: ['home', 'professions'],
        difficulty: 'easy',
        wordCount: 14,
        grammarEnabled: true,
        theme: {
            bgGradient: 'from-amber-400 to-yellow-600',
            emoji: '🔨',
            decorEmojis: ['⚙️', '🏗️', '💡'],
        },
        storyChapter: 'level_7',
        unlockRequirement: 6,
    },
    {
        id: 8,
        name: 'גוף ונפש',
        subtitle: 'Body and Soul',
        categories: ['body', 'emotions'],
        difficulty: 'easy',
        wordCount: 14,
        grammarEnabled: false,
        theme: {
            bgGradient: 'from-rose-400 to-pink-600',
            emoji: '💪',
            decorEmojis: ['🧠', '❤️', '🌟'],
        },
        storyChapter: 'level_8',
        unlockRequirement: 7,
    },
    {
        id: 9,
        name: 'זירת הפעולה',
        subtitle: 'Action Arena',
        categories: ['actions'],
        difficulty: 'medium',
        wordCount: 14,
        grammarEnabled: false,
        theme: {
            bgGradient: 'from-red-500 to-orange-600',
            emoji: '⚡',
            decorEmojis: ['🔥', '💥', '🎯'],
        },
        storyChapter: 'level_9',
        unlockRequirement: 8,
    },
    {
        id: 10,
        name: 'היער העמוק',
        subtitle: 'The Deep Forest',
        categories: ['nature', 'animals'],
        difficulty: 'hard',
        wordCount: 12,
        grammarEnabled: true,
        theme: {
            bgGradient: 'from-emerald-600 to-teal-800',
            emoji: '🌲',
            decorEmojis: ['🦉', '🍄', '🌙'],
        },
        storyChapter: 'level_10',
        unlockRequirement: 9,
    },
    {
        id: 11,
        name: 'כפר המומחים',
        subtitle: 'Expert Village',
        categories: ['family', 'professions', 'food'],
        difficulty: 'hard',
        wordCount: 14,
        grammarEnabled: true,
        theme: {
            bgGradient: 'from-indigo-500 to-blue-700',
            emoji: '🏘️',
            decorEmojis: ['📚', '🎓', '🔬'],
        },
        storyChapter: 'level_11',
        unlockRequirement: 10,
    },
    {
        id: 12,
        name: 'פסגת האלופים',
        subtitle: 'Master Summit',
        categories: ['animals', 'food', 'family', 'colors', 'nature', 'body', 'actions', 'home', 'emotions', 'professions'],
        difficulty: 'expert',
        wordCount: 15,
        grammarEnabled: true,
        theme: {
            bgGradient: 'from-amber-500 to-red-700',
            emoji: '🏔️',
            decorEmojis: ['👑', '⭐', '🏆'],
        },
        storyChapter: 'level_12',
        unlockRequirement: 11,
    },
    {
        id: 13,
        name: 'בית הספר הקסום',
        subtitle: 'The Magic School',
        categories: ['school'],
        difficulty: 'easy',
        wordCount: 12,
        grammarEnabled: false,
        theme: {
            bgGradient: 'from-sky-400 to-blue-600',
            emoji: '🏫',
            decorEmojis: ['📚', '✏️', '🎒'],
        },
        storyChapter: 'level_13',
        unlockRequirement: 12,
    },
    {
        id: 14,
        name: 'מסע הדרכים',
        subtitle: 'The Great Journey',
        categories: ['transport'],
        difficulty: 'medium',
        wordCount: 12,
        grammarEnabled: false,
        theme: {
            bgGradient: 'from-slate-400 to-zinc-600',
            emoji: '🚂',
            decorEmojis: ['🚗', '✈️', '🚢'],
        },
        storyChapter: 'level_14',
        unlockRequirement: 13,
    },
    {
        id: 15,
        name: 'אתגר האלופים',
        subtitle: 'Champions Challenge',
        categories: ['school', 'transport', 'actions', 'emotions'],
        difficulty: 'hard',
        wordCount: 14,
        grammarEnabled: false,
        theme: {
            bgGradient: 'from-fuchsia-500 to-purple-700',
            emoji: '🎯',
            decorEmojis: ['🏅', '⚡', '🔥'],
        },
        storyChapter: 'level_15',
        unlockRequirement: 14,
    },
    {
        id: 16,
        name: 'כתר האגדות',
        subtitle: 'The Legendary Crown',
        categories: ['animals', 'food', 'family', 'colors', 'nature', 'body', 'actions', 'home', 'emotions', 'professions', 'school', 'transport'],
        difficulty: 'expert',
        wordCount: 18,
        grammarEnabled: true,
        theme: {
            bgGradient: 'from-yellow-400 to-amber-700',
            emoji: '👑',
            decorEmojis: ['🌟', '🏆', '💎'],
        },
        storyChapter: 'level_16',
        unlockRequirement: 15,
    },
];

/**
 * Get a level by its id.
 * @param {number} id - Level id (1-12)
 * @returns {object|undefined} Level object or undefined
 */
export const getLevelById = (id) => LEVELS.find(l => l.id === id);

/**
 * Get all levels that are unlocked given the set of completed level ids.
 * A level is unlocked if its unlockRequirement is 0 or is in completedLevelIds.
 * @param {number[]} completedLevelIds - Array of completed level ids
 * @returns {object[]} Array of unlocked level objects
 */
export const getUnlockedLevels = (completedLevelIds = []) =>
    LEVELS.filter(l => l.unlockRequirement === 0 || completedLevelIds.includes(l.unlockRequirement));

/**
 * Get the word pool for a level.
 * Filters initialWordData by the level's categories and difficulty band.
 * If the pool is smaller than wordCount, includes adjacent difficulties
 * from the same categories using DIFFICULTY_FALLBACK order.
 * @param {object} level - Level object from LEVELS
 * @returns {object[]} Array of word objects, shuffled
 */
export const getLevelWords = (level) => {
    const { categories, difficulty, wordCount } = level;

    // Primary pool: exact category + difficulty match
    let pool = initialWordData.filter(
        w => categories.includes(w.category) && w.level === difficulty
    );

    // Fallback: if pool < wordCount, try adjacent difficulties
    if (pool.length < wordCount && DIFFICULTY_FALLBACK[difficulty]) {
        for (const fallbackDiff of DIFFICULTY_FALLBACK[difficulty]) {
            if (pool.length >= wordCount) break;
            const extra = initialWordData.filter(
                w => categories.includes(w.category)
                    && w.level === fallbackDiff
                    && !pool.some(p => p.id === w.id)
            );
            pool = [...pool, ...extra];
        }
    }

    // Shuffle and trim to wordCount
    // (Fisher-Yates: Array.sort with a random comparator is a biased shuffle)
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, wordCount);
};
