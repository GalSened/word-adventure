/**
 * Adaptive challenge type selection based on SRS mastery
 * Selects appropriate challenge types from difficulty pools
 * based on the word's SRS repetition count.
 */

/**
 * Challenge pools mapping mastery bands to allowed challenge types.
 * As repetition increases, harder challenge types become available.
 */
export const CHALLENGE_POOLS = {
    new: ['multipleChoice', 'reverseChoice'],
    learning: ['multipleChoice', 'reverseChoice', 'listening'],
    familiar: ['reverseChoice', 'listening', 'spelling'],
    mastered: ['spelling', 'sentenceBuild', 'listening'],
};

/**
 * Determine mastery band from SRS repetition count.
 * @param {number} repetition - SRS repetition count
 * @returns {'new' | 'learning' | 'familiar' | 'mastered'}
 */
function getMasteryBand(repetition) {
    if (repetition <= 1) return 'new';
    if (repetition <= 3) return 'learning';
    if (repetition <= 5) return 'familiar';
    return 'mastered';
}

/**
 * Select a challenge type based on word mastery and recent history.
 *
 * @param {Object} word - The word object (must have .type field)
 * @param {Object} srsState - SRS state with .repetition field
 * @param {string[]} recentTypes - Recently used challenge types (most recent last)
 * @returns {string} A challenge type string (e.g. 'multipleChoice', 'spelling')
 */
export function selectChallengeType(word, srsState, recentTypes = []) {
    const repetition = srsState?.repetition ?? 0;
    const band = getMasteryBand(repetition);
    let pool = [...CHALLENGE_POOLS[band]];

    // Filter out sentenceBuild if word is not a sentence type
    if (word?.type !== 'sentence') {
        pool = pool.filter(t => t !== 'sentenceBuild');
    }

    // Avoid consecutive same-type challenges if possible
    if (recentTypes.length > 0) {
        const lastType = recentTypes[recentTypes.length - 1];
        const filtered = pool.filter(t => t !== lastType);
        if (filtered.length > 0) {
            pool = filtered;
        }
    }

    // Random pick from remaining pool
    return pool[Math.floor(Math.random() * pool.length)];
}
