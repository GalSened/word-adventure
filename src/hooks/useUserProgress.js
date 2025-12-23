import { useState, useEffect, useCallback } from 'react';
import { safeGetJSON, safeSetJSON, safeGetNumber, STORAGE_KEYS } from '../utils/storage';

/**
 * Custom hook for managing user progress and persistent data
 * Handles profile, scores, inventory, and SRS progress
 */
export function useUserProgress() {
    // User profile
    const [userProfile, setUserProfile] = useState(() =>
        safeGetJSON(STORAGE_KEYS.USER_PROFILE, null)
    );

    // Scores and stars
    const [score, setScore] = useState(() =>
        safeGetNumber(STORAGE_KEYS.SCORE, 0)
    );
    const [stars, setStars] = useState(() =>
        safeGetNumber(STORAGE_KEYS.STARS, 0)
    );

    // SRS progress for each word
    const [userProgress, setUserProgress] = useState(() =>
        safeGetJSON(STORAGE_KEYS.USER_PROGRESS, {})
    );

    // Avatar (can be in profile or separate)
    const [avatar, setAvatar] = useState(() => {
        const profile = safeGetJSON(STORAGE_KEYS.USER_PROFILE, {});
        return profile.avatar || localStorage.getItem(STORAGE_KEYS.AVATAR) || '👸';
    });

    // High scores leaderboard
    const [highScores, setHighScores] = useState(() =>
        safeGetJSON(STORAGE_KEYS.HIGH_SCORES, [])
    );

    // Inventory of purchased items
    const [inventory, setInventory] = useState(() =>
        safeGetJSON(STORAGE_KEYS.INVENTORY, [])
    );

    // Persist user profile
    useEffect(() => {
        if (userProfile) {
            safeSetJSON(STORAGE_KEYS.USER_PROFILE, userProfile);
        }
    }, [userProfile]);

    // Persist SRS progress
    useEffect(() => {
        safeSetJSON(STORAGE_KEYS.USER_PROGRESS, userProgress);
    }, [userProgress]);

    // Persist score
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.SCORE, score);
    }, [score]);

    // Persist stars
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.STARS, stars);
    }, [stars]);

    // Persist inventory
    useEffect(() => {
        safeSetJSON(STORAGE_KEYS.INVENTORY, inventory);
    }, [inventory]);

    /**
     * Add points to the score
     */
    const addScore = useCallback((points) => {
        setScore(s => s + points);
    }, []);

    /**
     * Subtract points from the score
     */
    const subtractScore = useCallback((points) => {
        setScore(s => Math.max(0, s - points));
    }, []);

    /**
     * Add stars
     */
    const addStars = useCallback((count) => {
        setStars(s => s + count);
    }, []);

    /**
     * Update SRS progress for a word
     */
    const updateWordProgress = useCallback((wordId, srsState) => {
        setUserProgress(prev => ({
            ...prev,
            [wordId]: srsState
        }));
    }, []);

    /**
     * Save a high score entry
     */
    const saveHighScore = useCallback((points) => {
        const newScore = {
            points,
            date: new Date().toLocaleDateString('he-IL'),
            avatar
        };
        const updatedScores = [...highScores, newScore]
            .sort((a, b) => b.points - a.points)
            .slice(0, 5);
        setHighScores(updatedScores);
        safeSetJSON(STORAGE_KEYS.HIGH_SCORES, updatedScores);
    }, [highScores, avatar]);

    /**
     * Add an item to inventory
     */
    const addToInventory = useCallback((itemId) => {
        if (!inventory.includes(itemId)) {
            setInventory(prev => [...prev, itemId]);
        }
    }, [inventory]);

    /**
     * Check if user owns an item
     */
    const hasItem = useCallback((itemId) => {
        return inventory.includes(itemId);
    }, [inventory]);

    /**
     * Update avatar
     */
    const updateAvatar = useCallback((newAvatar) => {
        setAvatar(newAvatar);
        localStorage.setItem(STORAGE_KEYS.AVATAR, newAvatar);
    }, []);

    /**
     * Gender helper for localized text
     */
    const t = useCallback((male, female) => {
        return userProfile?.gender === 'boy' ? male : female;
    }, [userProfile]);

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
