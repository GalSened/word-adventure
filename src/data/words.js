/**
 * Word data for Word Adventure
 * Contains all vocabulary words organized by difficulty level
 * Validated at module load time via Zod schema
 */

import { validateWords } from './wordSchema';

const rawWordData = [
    // Easy Level - Simple 3-4 letter words
    {
        id: 'cat',
        word: 'CAT',
        hebrew: 'חתול',
        hint: '🐱 חיה שאוהבת חלב',
        category: 'animals',
        emoji: '🐱',
        level: 'easy',
        type: 'word',
        gender: 'm',
        exampleSentence: 'The cat sleeps on the sofa.',
    },
    {
        id: 'dog',
        word: 'DOG',
        hebrew: 'כלב',
        hint: '🐕 החבר הכי טוב של האדם',
        category: 'animals',
        emoji: '🐕',
        level: 'easy',
        type: 'word',
        gender: 'm',
        exampleSentence: 'The dog plays in the park.',
    },
    {
        id: 'sun',
        word: 'SUN',
        hebrew: 'שמש',
        hint: '☀️ מאיר בשמיים ביום',
        category: 'nature',
        emoji: '☀️',
        level: 'easy',
        type: 'word',
        gender: 'f',
        exampleSentence: 'The sun shines in the sky.',
    },
    {
        id: 'book',
        word: 'BOOK',
        hebrew: 'ספר',
        hint: '📚 קוראים אותו',
        category: 'objects',
        emoji: '📚',
        level: 'easy',
        type: 'word',
        gender: 'm',
        exampleSentence: 'I love to read a good book.',
    },
    {
        id: 'fish',
        word: 'FISH',
        hebrew: 'דג',
        hint: '🐟 שוחה במים',
        category: 'animals',
        emoji: '🐟',
        level: 'easy',
        type: 'word',
        gender: 'm',
        exampleSentence: 'The fish swims in the sea.',
    },

    // Medium Level - 5-6 letter words
    {
        id: 'happy',
        word: 'HAPPY',
        hebrew: 'שמח',
        hint: '😊 מרגישים ככה כשמקבלים מתנה',
        category: 'emotions',
        emoji: '😊',
        level: 'medium',
        type: 'word',
        gender: 'm',
        exampleSentence: 'I feel happy today.',
    },
    {
        id: 'water',
        word: 'WATER',
        hebrew: 'מים',
        hint: '💧 שותים אותו',
        category: 'nature',
        emoji: '💧',
        level: 'medium',
        type: 'word',
        gender: 'm',
        exampleSentence: 'Please give me a glass of water.',
    },
    {
        id: 'flower',
        word: 'FLOWER',
        hebrew: 'פרח',
        hint: '🌸 צומח בגינה ויפה',
        category: 'nature',
        emoji: '🌸',
        level: 'medium',
        type: 'word',
        gender: 'm',
        exampleSentence: 'The flower grows in the garden.',
    },

    // Hard Level - Complex words
    {
        id: 'butterfly',
        word: 'BUTTERFLY',
        hebrew: 'פרפר',
        hint: '🦋 חרק יפה עם כנפיים צבעוניות',
        category: 'animals',
        emoji: '🦋',
        level: 'hard',
        type: 'word',
        gender: 'm',
        exampleSentence: 'The butterfly has colorful wings.',
    },
    {
        id: 'adventure',
        word: 'ADVENTURE',
        hebrew: 'הרפתקה',
        hint: '🗺️ מסע מרגש עם הרפתקאות',
        category: 'emotions',
        emoji: '🗺️',
        level: 'hard',
        type: 'word',
        gender: 'f',
        exampleSentence: 'Every day is a new adventure.',
    },
    {
        id: 'treasure',
        word: 'TREASURE',
        hebrew: 'אוצר',
        hint: '💎 משהו יקר שמוצאים',
        category: 'objects',
        emoji: '💎',
        level: 'hard',
        type: 'word',
        gender: 'm',
        exampleSentence: 'The pirate found a hidden treasure.',
    },

    // Expert Level - Advanced vocabulary
    {
        id: 'mysterious',
        word: 'MYSTERIOUS',
        hebrew: 'מסתורי',
        hint: '🕵️‍♀️ משהו לא ברור ומסקרן',
        category: 'emotions',
        emoji: '🕵️',
        level: 'expert',
        type: 'word',
        gender: 'm',
        exampleSentence: 'The old house looks mysterious.',
    },
    {
        id: 'extraordinary',
        word: 'EXTRAORDINARY',
        hebrew: 'יוצא דופן',
        hint: '🌟 משהו מאוד מיוחד ולא רגיל',
        category: 'emotions',
        emoji: '🌟',
        level: 'expert',
        type: 'word',
        gender: 'm',
        exampleSentence: 'She has an extraordinary talent.',
    },
];

// Validate at module load time — will throw if any word is invalid
export const initialWordData = validateWords(rawWordData);

/**
 * Get words filtered by difficulty level
 * @param {string} level - The difficulty level (easy, medium, hard, expert)
 * @returns {Array} Filtered words
 */
export const getWordsByLevel = (level) => {
    return initialWordData.filter(word => word.level === level);
};

/**
 * Get all words
 * @returns {Array} All words
 */
export const getAllWords = () => {
    return initialWordData;
};

/**
 * Get a random word from a specific level
 * @param {string} level - The difficulty level
 * @returns {Object|null} Random word or null if level has no words
 */
export const getRandomWordByLevel = (level) => {
    const levelWords = getWordsByLevel(level);
    if (levelWords.length === 0) return null;
    return levelWords[Math.floor(Math.random() * levelWords.length)];
};

/**
 * Get word by ID
 * @param {string} id - The word ID
 * @returns {Object|undefined} The word object or undefined
 */
export const getWordById = (id) => {
    return initialWordData.find(word => word.id === id);
};
