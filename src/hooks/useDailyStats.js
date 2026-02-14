import { useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { DAILY_QUEST_CONFIG } from '../config/constants';

/**
 * Custom hook for managing daily stats and streak tracking
 * Thin wrapper around useGameStore — delegates all state to Zustand
 */
export function useDailyStats() {
    // Select state from Zustand store
    const dailyStats = useGameStore((s) => s.dailyStats);
    const currentStreak = useGameStore((s) => s.currentStreak);

    // Check for daily reset
    useEffect(() => {
        const today = new Date().toDateString();
        if (dailyStats.date !== today) {
            // New day - reset stats
            useGameStore.getState().resetDailyStats();
            useGameStore.getState().setCurrentStreak(0);
        }
    }, [dailyStats.date]);

    /**
     * Record a correct answer
     * Increments streak and updates max streak
     */
    const recordCorrectAnswer = useCallback((earnedScore = 0) => {
        const store = useGameStore.getState();
        const newStreak = store.currentStreak + 1;
        store.setCurrentStreak(newStreak);

        store.updateDailyStats({
            wordsPlayed: store.dailyStats.wordsPlayed + 1,
            dailyScore: store.dailyStats.dailyScore + earnedScore,
            maxStreak: Math.max(store.dailyStats.maxStreak, newStreak),
        });
    }, []);

    /**
     * Record an incorrect answer
     * Resets the current streak
     */
    const recordIncorrectAnswer = useCallback(() => {
        useGameStore.getState().setCurrentStreak(0);
    }, []);

    /**
     * Add score without affecting streak
     * Used for mini-games like pet walking
     */
    const addDailyScore = useCallback((points) => {
        const store = useGameStore.getState();
        store.updateDailyStats({
            dailyScore: store.dailyStats.dailyScore + points,
        });
    }, []);

    /**
     * Check if a quest is completed
     */
    const isQuestCompleted = useCallback((questId) => {
        const stats = useGameStore.getState().dailyStats;
        switch (questId) {
            case 'words_10':
                return stats.wordsPlayed >= DAILY_QUEST_CONFIG.WORDS_TARGET;
            case 'score_1000':
                return stats.dailyScore >= DAILY_QUEST_CONFIG.SCORE_TARGET;
            case 'streak_5':
                return stats.maxStreak >= DAILY_QUEST_CONFIG.STREAK_TARGET;
            default:
                return false;
        }
    }, []);

    /**
     * Get progress percentage for a quest
     */
    const getQuestProgress = useCallback((questId) => {
        const stats = useGameStore.getState().dailyStats;
        switch (questId) {
            case 'words_10':
                return Math.min(100, (stats.wordsPlayed / DAILY_QUEST_CONFIG.WORDS_TARGET) * 100);
            case 'score_1000':
                return Math.min(100, (stats.dailyScore / DAILY_QUEST_CONFIG.SCORE_TARGET) * 100);
            case 'streak_5':
                return Math.min(100, (stats.maxStreak / DAILY_QUEST_CONFIG.STREAK_TARGET) * 100);
            default:
                return 0;
        }
    }, []);

    /**
     * Get all quests status
     */
    const getQuestsStatus = useCallback(() => {
        const stats = useGameStore.getState().dailyStats;
        return [
            {
                id: 'words_10',
                target: DAILY_QUEST_CONFIG.WORDS_TARGET,
                current: stats.wordsPlayed,
                reward: DAILY_QUEST_CONFIG.WORDS_REWARD,
                completed: stats.wordsPlayed >= DAILY_QUEST_CONFIG.WORDS_TARGET,
            },
            {
                id: 'score_1000',
                target: DAILY_QUEST_CONFIG.SCORE_TARGET,
                current: stats.dailyScore,
                reward: DAILY_QUEST_CONFIG.SCORE_REWARD,
                completed: stats.dailyScore >= DAILY_QUEST_CONFIG.SCORE_TARGET,
            },
            {
                id: 'streak_5',
                target: DAILY_QUEST_CONFIG.STREAK_TARGET,
                current: stats.maxStreak,
                reward: DAILY_QUEST_CONFIG.STREAK_REWARD,
                completed: stats.maxStreak >= DAILY_QUEST_CONFIG.STREAK_TARGET,
            },
        ];
    }, []);

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
