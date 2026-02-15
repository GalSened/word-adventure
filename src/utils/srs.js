/**
 * Spaced Repetition System (SRS) Implementation
 * Based on a simplified SM-2 algorithm.
 */

/**
 * Add jitter to an interval to prevent review clustering.
 * No jitter for intervals <= 1 day. Otherwise +/- 10%.
 * Result is always >= 1 and always an integer.
 */
export const addJitter = (intervalDays) => {
    if (intervalDays <= 1) return intervalDays;
    const jitter = Math.round(intervalDays * 0.1 * (2 * Math.random() - 1));
    return Math.max(1, intervalDays + jitter);
};

export const calculateNextReview = (previousState, quality) => {
    // Quality: 0-5 (0=blackout, 5=perfect)
    // If quality < 3, we reset repetitions

    let { interval, repetition, easeFactor } = previousState || {
        interval: 0,
        repetition: 0,
        easeFactor: 2.5
    };

    if (quality >= 3) {
        if (repetition === 0) {
            interval = 1;
        } else if (repetition === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
        repetition += 1;
    } else {
        repetition = 0;
        interval = 1; // Review tomorrow (or very soon)
    }

    // Update Ease Factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    // Apply jitter to nextReviewDate but keep base interval un-jittered
    const jitteredInterval = addJitter(interval);

    return {
        interval,
        repetition,
        easeFactor,
        nextReviewDate: Date.now() + (jitteredInterval * 24 * 60 * 60 * 1000)
    };
};

/**
 * Get words that are due for review.
 * Only returns words WITH SRS state that are overdue (PROG-01).
 * Unseen words (no srs property) are excluded.
 */
export const getDueWords = (allWords) => {
    const now = Date.now();
    return allWords.filter(word => {
        if (!word.srs) return false; // Unseen word, NOT due
        return word.srs.nextReviewDate <= now;
    });
};

/**
 * Build a review session from all words and user progress.
 * - Filters to learned words only (words with progress entry)
 * - Returns max 7 overdue words sorted by most overdue first (PROG-04)
 * - Fills remaining slots with up to 3 low-rep learned words (PROG-02)
 * - Total session capped at 10 words
 *
 * @param {Array} allWords - All word data objects (must have .id)
 * @param {Object} userProgress - Map of wordId -> SRS state
 * @param {number} maxNew - Max low-rep "new" slots (default 3)
 * @param {number} maxReview - Max overdue review slots (default 7)
 * @returns {Array} Review session words
 */
export const buildReviewSession = (allWords, userProgress, maxNew = 3, maxReview = 7) => {
    const now = Date.now();
    const LOW_REP_THRESHOLD = 3;

    // Filter to learned words only (those with progress entry)
    const learnedWords = allWords
        .filter(w => userProgress[w.id])
        .map(w => ({ ...w, srs: userProgress[w.id] }));

    if (learnedWords.length === 0) return [];

    // Separate overdue vs not-yet-due
    const overdue = learnedWords.filter(w => w.srs.nextReviewDate <= now);
    const notYetDue = learnedWords.filter(w => w.srs.nextReviewDate > now);

    // Sort overdue by nextReviewDate ascending (most overdue first)
    overdue.sort((a, b) => a.srs.nextReviewDate - b.srs.nextReviewDate);

    // Take top maxReview overdue words
    const reviewWords = overdue.slice(0, maxReview);

    // Fill remaining slots with low-rep learned words not yet due
    const lowRepWords = notYetDue
        .filter(w => w.srs.repetition < LOW_REP_THRESHOLD)
        .slice(0, maxNew);

    // Combine (overdue first, then low-rep), cap at maxReview + maxNew = 10
    return [...reviewWords, ...lowRepWords].slice(0, maxReview + maxNew);
};
