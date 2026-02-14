import { useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { GAME_CONFIG } from '../config/constants';

/**
 * Custom hook for managing game state
 * Thin wrapper around useGameStore — delegates all state to Zustand
 */
export function useGameState() {
    // Select state from Zustand store
    const gameState = useGameStore((s) => s.gameState);
    const currentWordIndex = useGameStore((s) => s.currentWordIndex);
    const userInput = useGameStore((s) => s.userInput);
    const lives = useGameStore((s) => s.lives);
    const feedback = useGameStore((s) => s.feedback);
    const activeWords = useGameStore((s) => s.activeWords);
    const gameMode = useGameStore((s) => s.gameMode);
    const activePet = useGameStore((s) => s.activePet);

    // Select setters from Zustand store
    const setGameState = useGameStore((s) => s.setGameState);
    const setUserInput = useGameStore((s) => s.setUserInput);
    const setActivePet = useGameStore((s) => s.setActivePet);

    /**
     * Reset game state for a new round
     */
    const resetGame = useCallback(() => {
        const store = useGameStore.getState();
        store.setCurrentWordIndex(0);
        store.setLives(GAME_CONFIG.INITIAL_LIVES);
        store.setUserInput('');
        store.setFeedback(null);
    }, []);

    /**
     * Start a new level with the given words
     */
    const startLevel = useCallback((words, mode = 'regular') => {
        const store = useGameStore.getState();
        store.setActiveWords(words);
        store.setGameMode(mode);
        // Inline reset
        store.setCurrentWordIndex(0);
        store.setLives(GAME_CONFIG.INITIAL_LIVES);
        store.setUserInput('');
        store.setFeedback(null);
        // Transition to playing
        store.setGameState('playing');
    }, []);

    /**
     * Move to the next word
     */
    const nextWord = useCallback(() => {
        const store = useGameStore.getState();
        if (store.currentWordIndex < store.activeWords.length - 1) {
            store.setCurrentWordIndex(store.currentWordIndex + 1);
            store.setUserInput('');
            store.setFeedback(null);
        } else {
            store.setGameState('levelComplete');
        }
    }, []);

    /**
     * Lose a life, trigger game over if no lives left
     */
    const loseLife = useCallback(() => {
        const store = useGameStore.getState();
        const newLives = store.lives - 1;
        if (newLives <= 0) {
            store.setLives(0);
            store.setGameState('gameOver');
        } else {
            store.setLives(newLives);
        }
    }, []);

    /**
     * Show feedback message
     */
    const showFeedback = useCallback((type, message, duration = GAME_CONFIG.FEEDBACK_DURATION) => {
        const store = useGameStore.getState();
        store.setFeedback({ type, message });
        setTimeout(() => useGameStore.getState().setFeedback(null), duration);
    }, []);

    /**
     * Get the current word being played
     */
    const currentWord = activeWords[currentWordIndex] || null;

    return {
        // State
        gameState,
        currentWordIndex,
        userInput,
        lives,
        feedback,
        activeWords,
        gameMode,
        activePet,
        currentWord,

        // Setters
        setGameState,
        setUserInput,
        setActivePet,

        // Actions
        resetGame,
        startLevel,
        nextWord,
        loseLife,
        showFeedback,
    };
}
