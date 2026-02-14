import { useCallback } from 'react';
import { useGameStore } from '../store/gameStore';

/**
 * Custom hook for managing user progress and persistent data
 * Thin wrapper around useGameStore — delegates all state to Zustand
 */
export function useUserProgress() {
    // Select state from Zustand store
    const userProfile = useGameStore((s) => s.userProfile);
    const score = useGameStore((s) => s.score);
    const stars = useGameStore((s) => s.stars);
    const userProgress = useGameStore((s) => s.userProgress);
    const avatar = useGameStore((s) => s.avatar);
    const highScores = useGameStore((s) => s.highScores);
    const inventory = useGameStore((s) => s.inventory);

    // Select setters from Zustand store
    const setUserProfile = useGameStore((s) => s.setUserProfile);

    /**
     * Add points to the score
     */
    const addScore = useCallback((points) => {
        useGameStore.getState().addScore(points);
    }, []);

    /**
     * Subtract points from the score
     */
    const subtractScore = useCallback((points) => {
        useGameStore.getState().subtractScore(points);
    }, []);

    /**
     * Add stars
     */
    const addStars = useCallback((count) => {
        useGameStore.getState().addStars(count);
    }, []);

    /**
     * Update SRS progress for a word
     */
    const updateWordProgress = useCallback((wordId, srsState) => {
        useGameStore.getState().updateWordProgress(wordId, srsState);
    }, []);

    /**
     * Save a high score entry
     */
    const saveHighScore = useCallback((points) => {
        useGameStore.getState().saveHighScore(points);
    }, []);

    /**
     * Add an item to inventory
     */
    const addToInventory = useCallback((itemId) => {
        useGameStore.getState().addToInventory(itemId);
    }, []);

    /**
     * Check if user owns an item
     */
    const hasItem = useCallback((itemId) => {
        return useGameStore.getState().inventory.includes(itemId);
    }, []);

    /**
     * Update avatar
     */
    const updateAvatar = useCallback((newAvatar) => {
        useGameStore.getState().updateAvatar(newAvatar);
    }, []);

    /**
     * Gender helper for localized text
     */
    const t = useCallback((male, female) => {
        return useGameStore.getState().userProfile?.gender === 'boy' ? male : female;
    }, []);

    return {
        // State
        userProfile,
        score,
        stars,
        userProgress,
        avatar,
        highScores,
        inventory,

        // Setters
        setUserProfile,

        // Actions
        addScore,
        subtractScore,
        addStars,
        updateWordProgress,
        saveHighScore,
        addToInventory,
        hasItem,
        updateAvatar,
        t,
    };
}
