/**
 * Spaced Repetition System (SRS) Implementation
 * Based on a simplified SM-2 algorithm.
 */

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

    return {
        interval,
        repetition,
        easeFactor,
        nextReviewDate: Date.now() + (interval * 24 * 60 * 60 * 1000)
    };
};

export const getDueWords = (allWords) => {
    const now = Date.now();
    return allWords.filter(word => {
        if (!word.srs) return true; // New word, due immediately
        return word.srs.nextReviewDate <= now;
    });
};
