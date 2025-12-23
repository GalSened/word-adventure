import { useState, useEffect, useCallback } from 'react';
import { safeGetJSON, safeSetJSON, STORAGE_KEYS } from '../utils/storage';
import { DAILY_QUEST_CONFIG } from '../config/constants';

/**
 * Get initial daily stats object
 */
const getInitialDailyStats = () => ({
    date: new Date().toDateString(),
    wordsPlayed: 0,
    maxStreak: 0,
    dailyScore: 0
});

/**
 * Custom hook for managing daily stats and streak tracking
 * Handles daily quests progress and streak calculations
 */
export function useDailyStats() {
    const [dailyStats, setDailyStats] = useState(() =>
        safeGetJSON(STORAGE_KEYS.DAILY_STATS, getInitialDailyStats())
    );

    // Track current consecutive correct answers
    const [currentStreak, setCurrentStreak] = useState(0);

    // Check for daily reset
    useEffect(() => {
        const today = new Date().toDateString();
        if (dailyStats.date !== today) {
            // New day - reset stats
            const freshStats = getInitialDailyStats();
            setDailyStats(freshStats);
            setCurrentStreak(0);
            safeSetJSON(STORAGE_KEYS.DAILY_STATS, freshStats);
        } else {
            // Same day - persist changes
            safeSetJSON(STORAGE_KEYS.DAILY_STATS, dailyStats);
        }
    }, [dailyStats]);

    /**
     * Record a correct answer
     * Increments streak and updates max streak
     */
    const recordCorrectAnswer = useCallback((earnedScore = 0) => {
        const newStreak = currentStreak + 1;
        setCurrentStreak(newStreak);

        setDailyStats(prev => ({
            ...prev,
            wordsPlayed: prev.wordsPlayed + 1,
            dailyScore: prev.dailyScore + earnedScore,
            maxStreak: Math.max(prev.maxStreak, newStreak)
        }));
    }, [currentStreak]);

    /**
     * Record an incorrect answer
     * Resets the current streak
     */
    const recordIncorrectAnswer = useCallback(() => {
        setCurrentStreak(0);
    }, []);

    /**
     * Add score without affecting streak
     * Used for mini-games like pet walking
     */
    const addDailyScore = useCallback((points) => {
        setDailyStats(prev => ({
            ...prev,
            dailyScore: prev.dailyScore + points
        }));
    }, []);

    /**
     * Check if a quest is completed
     */
    const isQuestCompleted = useCallback((questId) => {
        switch (questId) {
            case 'words_10':
                return dailyStats.wordsPlayed >= DAILY_QUEST_CONFIG.WORDS_TARGET;
            case 'score_1000':
                return dailyStats.dailyScore >= DAILY_QUEST_CONFIG.SCORE_TARGET;
            case 'streak_5':
                return dailyStats.maxStreak >= DAILY_QUEST_CONFIG.STREAK_TARGET;
            default:
                return false;
        }
    }, [dailyStats]);

    /**
     * Get progress percentage for a quest
     */
    const getQuestProgress = useCallback((questId) => {
        switch (questId) {
            case 'words_10':
                return Math.min(100, (dailyStats.wordsPlayed / DAILY_QUEST_CONFIG.WORDS_TARGET) * 100);
            case 'score_1000':
                return Math.min(100, (dailyStats.dailyScore / DAILY_QUEST_CONFIG.SCORE_TARGET) * 100);
            case 'streak_5':
                return Math.min(100, (dailyStats.maxStreak / DAILY_QUEST_CONFIG.STREAK_TARGET) * 100);
            default:
                return 0;
        }
    }, [dailyStats]);

    /**
     * Get all quests status
     */
    const getQuestsStatus = useCallback(() => [
        {
            id: 'words_10',
            target: DAILY_QUEST_CONFIG.WORDS_TARGET,
            current: dailyStats.wordsPlayed,
            reward: DAILY_QUEST_CONFIG.WORDS_REWARD,
            completed: dailyStats.wordsPlayed >= DAILY_QUEST_CONFIG.WORDS_TARGET
        },
        {
            id: 'score_1000',
            target: DAILY_QUEST_CONFIG.SCORE_TARGET,
            current: dailyStats.dailyScore,
            reward: DAILY_QUEST_CONFIG.SCORE_REWARD,
            completed: dailyStats.dailyScore >= DAILY_QUEST_CONFIG.SCORE_TARGET
        },
        {
            id: 'streak_5',
            target: DAILY_QUEST_CONFIG.STREAK_TARGET,
            current: dailyStats.maxStreak,
            reward: DAILY_QUEST_CONFIG.STREAK_REWARD,
            completed: dailyStats.maxStreak >= DAILY_QUEST_CONFIG.STREAK_TARGET
        }
    ], [dailyStats]);

    return {
        // State
        dailyStats,
        currentStreak,

        // Actions
        recordCorrectAnswer,
        recordIncorrectAnswer,
        addDailyScore,
        isQuestCompleted,
        getQuestProgress,
        getQuestsStatus,
    };
}
