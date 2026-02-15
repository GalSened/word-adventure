/**
 * Wrong answer generation for multiple choice challenges
 * Generates plausible distractor options from the word bank,
 * preferring same-category words for more challenging choices.
 */

import { initialWordData } from '../data/words';

/**
 * Fisher-Yates shuffle (in-place on a copy).
 * Returns a new shuffled array without mutating the original.
 *
 * @param {Array} array - Array to shuffle
 * @returns {Array} New shuffled array
 */
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Generate distractor (wrong answer) word objects for a given correct word.
 * Prefers same-category words for more challenging distractors,
 * fills from other categories if needed.
 *
 * @param {Object} correctWord - The correct word object (must have .id and .category)
 * @param {number} count - Number of distractors to generate (default 3)
 * @param {string} field - Not used for filtering but kept for API consistency
 * @returns {Object[]} Array of distractor word objects
 */
export function generateDistractors(correctWord, count = 3, field = 'word') {
    // Filter out the correct word
    const otherWords = initialWordData.filter(w => w.id !== correctWord.id);

    // Split into same-category and different-category pools
    const sameCategory = shuffleArray(
        otherWords.filter(w => w.category === correctWord.category)
    );
    const differentCategory = shuffleArray(
        otherWords.filter(w => w.category !== correctWord.category)
    );

    // Take distractors preferring same-category first
    const distractors = [];

    for (const w of sameCategory) {
        if (distractors.length >= count) break;
        distractors.push(w);
    }

    for (const w of differentCategory) {
        if (distractors.length >= count) break;
        distractors.push(w);
    }

    return distractors.slice(0, count);
}
