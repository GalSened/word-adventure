/**
 * Word data for Word Adventure
 * Contains all vocabulary words organized by difficulty level
 */

export const initialWordData = [
    // Easy Level - Simple 3-4 letter words
    { id: 'cat', word: 'CAT', hint: '🐱 חיה שאוהבת חלב', hebrew: 'חתול', level: 'easy', type: 'word' },
    { id: 'dog', word: 'DOG', hint: '🐕 החבר הכי טוב של האדם', hebrew: 'כלב', level: 'easy', type: 'word' },
    { id: 'sun', word: 'SUN', hint: '☀️ מאיר בשמיים ביום', hebrew: 'שמש', level: 'easy', type: 'word' },
    { id: 'book', word: 'BOOK', hint: '📚 קוראים אותו', hebrew: 'ספר', level: 'easy', type: 'word' },
    { id: 'fish', word: 'FISH', hint: '🐟 שוחה במים', hebrew: 'דג', level: 'easy', type: 'word' },

    // Medium Level - 5-6 letter words
    { id: 'happy', word: 'HAPPY', hint: '😊 מרגישים ככה כשמקבלים מתנה', hebrew: 'שמח', level: 'medium', type: 'word' },
    { id: 'water', word: 'WATER', hint: '💧 שותים אותו', hebrew: 'מים', level: 'medium', type: 'word' },
    { id: 'flower', word: 'FLOWER', hint: '🌸 צומח בגינה ויפה', hebrew: 'פרח', level: 'medium', type: 'word' },

    // Hard Level - Complex words
    { id: 'butterfly', word: 'BUTTERFLY', hint: '🦋 חרק יפה עם כנפיים צבעוניות', hebrew: 'פרפר', level: 'hard', type: 'word' },
    { id: 'adventure', word: 'ADVENTURE', hint: '🗺️ מסע מרגש עם הרפתקאות', hebrew: 'הרפתקה', level: 'hard', type: 'word' },
    { id: 'treasure', word: 'TREASURE', hint: '💎 משהו יקר שמוצאים', hebrew: 'אוצר', level: 'hard', type: 'word' },

    // Expert Level - Advanced vocabulary
    { id: 'mysterious', word: 'MYSTERIOUS', hint: '🕵️‍♀️ משהו לא ברור ומסקרן', hebrew: 'מסתורי', level: 'expert', type: 'word' },
    { id: 'extraordinary', word: 'EXTRAORDINARY', hint: '🌟 משהו מאוד מיוחד ולא רגיל', hebrew: 'יוצא דופן', level: 'expert', type: 'word' },
];

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
