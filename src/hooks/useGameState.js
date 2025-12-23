import { useState, useCallback } from 'react';
import { GAME_CONFIG } from '../config/constants';

/**
 * Custom hook for managing game state
 * Handles game screens, word progression, lives, and feedback
 */
export function useGameState() {
    const [gameState, setGameState] = useState('start');
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [lives, setLives] = useState(GAME_CONFIG.INITIAL_LIVES);
    const [feedback, setFeedback] = useState(null);
    const [activeWords, setActiveWords] = useState([]);
    const [gameMode, setGameMode] = useState('regular');
    const [activePet, setActivePet] = useState(null);

    /**
     * Reset game state for a new round
     */
    const resetGame = useCallback(() => {
        setCurrentWordIndex(0);
        setLives(GAME_CONFIG.INITIAL_LIVES);
        setUserInput('');
        setFeedback(null);
    }, []);

    /**
     * Start a new level with the given words
     */
    const startLevel = useCallback((words, mode = 'regular') => {
        setActiveWords(words);
        setGameMode(mode);
        resetGame();
        setGameState('playing');
    }, [resetGame]);

    /**
     * Move to the next word
     */
    const nextWord = useCallback(() => {
        if (currentWordIndex < activeWords.length - 1) {
            setCurrentWordIndex(i => i + 1);
            setUserInput('');
            setFeedback(null);
        } else {
            setGameState('levelComplete');
        }
    }, [currentWordIndex, activeWords.length]);

    /**
     * Lose a life, trigger game over if no lives left
     */
    const loseLife = useCallback(() => {
        setLives(l => {
            if (l - 1 <= 0) {
                setGameState('gameOver');
                return 0;
            }
            return l - 1;
        });
    }, []);

    /**
     * Show feedback message
     */
    const showFeedback = useCallback((type, message, duration = GAME_CONFIG.FEEDBACK_DURATION) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), duration);
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
