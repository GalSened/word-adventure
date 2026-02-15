/**
 * Select words for the memory match game based on SRS data.
 * Prioritizes recently learned words (low repetition) to reinforce
 * vocabulary the player is actively acquiring.
 *
 * @param {Array} allWords - Full word list (initialWordData)
 * @param {Object} userProgress - SRS state map { wordId: { repetition, nextReviewDate, ... } }
 * @param {number} count - Number of word pairs needed (default 6 for 12 cards)
 * @returns {Array} Selected word objects
 */
export function getMemoryGameWords(allWords, userProgress, count = 6) {
    const learnedIds = Object.keys(userProgress);

    // If fewer than `count` words learned, mix learned + unlearned from easy words
    if (learnedIds.length < count) {
        const learned = allWords.filter(w => userProgress[w.id]);
        const unlearned = allWords
            .filter(w => !userProgress[w.id] && w.level === 'easy')
            .slice(0, count - learned.length);
        return [...learned, ...unlearned].slice(0, count);
    }

    // Enough learned words: select based on SRS priority
    // Prefer recently learned (low repetition = newest acquisitions)
    // Then by most recently reviewed (higher nextReviewDate = fresher)
    const candidates = allWords
        .filter(w => userProgress[w.id])
        .map(w => ({
            ...w,
            _rep: userProgress[w.id].repetition || 0,
            _nrd: userProgress[w.id].nextReviewDate || 0,
        }))
        .sort((a, b) => {
            // Primary: lower repetition first (recently learned)
            if (a._rep !== b._rep) return a._rep - b._rep;
            // Secondary: higher nextReviewDate first (more recently reviewed)
            return b._nrd - a._nrd;
        });

    // Take top `count` candidates
    const selected = candidates.slice(0, count);

    // Clean up internal sorting keys before returning
    return selected.map(({ _rep, _nrd, ...word }) => word);
}
