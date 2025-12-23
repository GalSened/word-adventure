/**
 * Game configuration constants
 * Centralizes all magic numbers and configuration values
 */

// Game mechanics
export const GAME_CONFIG = {
    INITIAL_LIVES: 3,
    SCORE_PER_CORRECT: 150,
    STARS_PER_CORRECT: 2,

    // Delays (milliseconds)
    FEEDBACK_DURATION: 1500,
    ERROR_FEEDBACK_DURATION: 1000,
    TRANSITION_DELAY: 2500,

    // Level settings
    MASTER_LEVEL_WORD_COUNT: 5,
    REVIEW_MAX_WORDS: 10,
};

// Daily quest targets
export const DAILY_QUEST_CONFIG = {
    WORDS_TARGET: 10,
    SCORE_TARGET: 1000,
    STREAK_TARGET: 5,

    // Rewards
    WORDS_REWARD: 50,
    SCORE_REWARD: 100,
    STREAK_REWARD: 75,
};

// Story chapters configuration
export const STORY_CHAPTERS = {
    easy: {
        title: 'הממלכה הקסומה',
        color: 'from-green-400 to-emerald-600',
        character: '👸'
    },
    medium: {
        title: 'היער הקסום',
        color: 'from-blue-400 to-indigo-600',
        character: '🧚'
    },
    hard: {
        title: 'מגדל הקוסם',
        color: 'from-purple-500 to-fuchsia-600',
        character: '🧙'
    },
    expert: {
        title: 'היקום האינסופי',
        color: 'from-rose-500 to-pink-600',
        character: '👽'
    },
    master: {
        title: 'היכל החכמים',
        color: 'from-amber-500 to-red-600',
        character: '🏛️'
    },
    review: {
        title: 'חזרות חכמות',
        color: 'from-yellow-400 to-orange-500',
        character: '🧠'
    }
};

// Avatar options
export const AVATAR_OPTIONS = [
    { id: 'princess', icon: '👸', name: 'נסיכה' },
    { id: 'prince', icon: '🤴', name: 'נסיך' },
    { id: 'wizard', icon: '🧙', name: 'קוסם' },
    { id: 'fairy', icon: '🧚', name: 'פיה' },
    { id: 'knight', icon: '🦸', name: 'גיבור על' },
    { id: 'alien', icon: '👽', name: 'חייזר' },
    { id: 'robot', icon: '🤖', name: 'רובוט' },
    { id: 'cowboy', icon: '🤠', name: 'קאובוי' },
    { id: 'cat', icon: '😺', name: 'חתול' },
];

// Pet configuration
export const PET_CONFIG = {
    dog: { name: 'כלבלב', icon: '🐕' },
    unicorn: { name: 'חד קרן', icon: '🦄' },
    dragon: { name: 'דרקון', icon: '🐉' }
};

// Animation settings
export const ANIMATION_CONFIG = {
    CONFETTI_PARTICLE_COUNT: 50,
    CONFETTI_ORIGIN_Y: 0.7,

    // Pet walking game
    PET_WALK_SCROLL_SPEED: 6,
    PET_WALK_PROGRESS_INCREMENT: 0.05,
    PET_WALK_ENCOUNTER_CHANCE: 0.005,
};

// Difficulty levels
export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'expert', 'master'];
