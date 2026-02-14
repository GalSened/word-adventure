/**
 * useGameLogic hook - Core game logic extracted from WordAdventure
 * Handles level starting, answer processing, scoring, store purchases,
 * inventory management, and word scrambling
 */

import { useState, useMemo } from 'react';
import { calculateNextReview, getDueWords } from '../utils/srs';
import { hapticFeedback } from '../utils/mobile';
import { generateChallenge } from '../utils/grammarEngine';
import { safeSetJSON, STORAGE_KEYS } from '../utils/storage';
import { STORE_ITEMS } from '../data/storeItems';
import { initialWordData } from '../data/words';
import confetti from 'canvas-confetti';

export function useGameLogic({
    userProfile,
    score, setScore,
    stars, setStars,
    userProgress, setUserProgress,
    avatar, setAvatar,
    highScores, setHighScores,
    inventory, setInventory,
    dailyStats, setDailyStats,
    gameState, setGameState,
    currentWordIndex, setCurrentWordIndex,
    userInput, setUserInput,
    lives, setLives,
    feedback, setFeedback,
    activeWords, setActiveWords,
    gameMode, setGameMode,
    activePet, setActivePet,
    currentStreak, setCurrentStreak,
    currentLevel, setCurrentLevel,
    setTranscript,
    story,
    itemEffects,
}) {
    // GENDER HELPER
    const t = (male, female) => userProfile.gender === 'boy' ? male : female;

    const updateDailyStats = (newWords = 0, newScore = 0, streak = 0) => {
        setDailyStats(prev => ({
            ...prev,
            wordsPlayed: prev.wordsPlayed + newWords,
            dailyScore: prev.dailyScore + newScore,
            maxStreak: Math.max(prev.maxStreak, streak)
        }));
    };

    const saveHighScore = (finalScore) => {
        const newScore = { points: finalScore, date: new Date().toLocaleDateString('he-IL'), avatar };
        const updatedScores = [...highScores, newScore].sort((a, b) => b.points - a.points).slice(0, 5);
        setHighScores(updatedScores);
        safeSetJSON(STORAGE_KEYS.HIGH_SCORES, updatedScores);
    };

    const handleBuy = (item) => {
        if (score >= item.price) {
            setScore(s => s - item.price);
            setInventory(prev => [...prev, item.id]);
            setFeedback({ type: 'success', message: `${t('רכשת', 'רכשת')} ${item.name}! 🎉` });
            setTimeout(() => setFeedback(null), 1500);
        }
    };

    const startLevel = (level) => {
        let wordsToPlay = [];

        if (level === 'master') {
            wordsToPlay = Array(5).fill(null).map(() => generateChallenge());
            setGameMode('regular');
        }
        else if (level === 'review') {
            const allWordsWithState = initialWordData.map(w => ({ ...w, srs: userProgress[w.id] }));
            wordsToPlay = getDueWords(allWordsWithState).slice(0, 10);
            if (wordsToPlay.length === 0) {
                alert("אין מילים לחזרה כרגע! כל הכבוד! 🎉");
                return;
            }
            setGameMode('srs');
        } else {
            wordsToPlay = initialWordData.filter(w => w.level === level);
            setGameMode('regular');
        }

        setCurrentLevel(level);
        story.startChapter(level);

        setActiveWords(wordsToPlay);
        setCurrentWordIndex(0);
        setLives(itemEffects.getStartingLives(3));
        setUserInput('');
        setFeedback(null);
        setCurrentStreak(0);
        setGameState('playing');
    };

    const handleInventoryClose = (petId) => {
        if (petId) {
            const item = STORE_ITEMS[petId];
            if (item && item.walkable) {
                setActivePet({ name: item.name, icon: item.icon });
                setGameState('petWalking');
            } else {
                setGameState('map');
            }
        } else {
            setGameState('map');
        }
    };

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const currentWord = activeWords[currentWordIndex];

    const scrambledContent = useMemo(() => {
        if (!currentWord) return [];
        if (currentWord.type === 'sentence') {
            return shuffleArray(currentWord.word.split(' '));
        } else {
            return shuffleArray(currentWord.word.split(''));
        }
    }, [currentWord?.id]);

    const processAnswer = (isCorrect) => {
        const word = activeWords[currentWordIndex];
        if (isCorrect) {
            if (!word.id.startsWith('gen_')) {
                const newState = calculateNextReview(userProgress[word.id], 5);
                setUserProgress(prev => ({ ...prev, [word.id]: newState }));
            }

            const earnedScore = itemEffects.calculatePoints(150, currentStreak);
            setScore(s => s + earnedScore);
            setStars(s => s + 2);

            const newStreak = currentStreak + 1;
            setCurrentStreak(newStreak);
            updateDailyStats(1, earnedScore, newStreak);

            confetti({ particleCount: 50, origin: { y: 0.7 } });
            hapticFeedback('success');

            const dialogue = story.getDialogue('correct');
            setFeedback({ type: 'success', message: dialogue?.text || 'מושלם! 🌟' });

            story.recordWordLearned();

            if ([3, 5, 10, 15, 20].includes(newStreak)) {
                const streakDialogue = story.getDialogue('streak', { streak: newStreak });
                if (streakDialogue) {
                    setTimeout(() => {
                        setFeedback({ type: 'success', message: streakDialogue.text });
                    }, 800);
                }
                story.recordStreak(newStreak);
            }

            setTimeout(() => {
                if (currentWordIndex < activeWords.length - 1) {
                    setCurrentWordIndex(i => i + 1);
                    setUserInput('');
                    setTranscript('');
                    setFeedback(null);
                } else {
                    const startingLives = itemEffects.getStartingLives(3);
                    const wasPerfect = lives === startingLives;
                    story.completeChapter(currentLevel, wasPerfect);
                    if (lives === 1) {
                        story.recordComebackWin();
                    }
                    setGameState('levelComplete');
                    saveHighScore(score + earnedScore);
                }
            }, 1500);
        } else {
            if (!word.id.startsWith('gen_')) {
                const newState = calculateNextReview(userProgress[word.id], 0);
                setUserProgress(prev => ({ ...prev, [word.id]: newState }));
            }

            if (itemEffects.shouldProtectStreak() && currentStreak > 0) {
                setFeedback({ type: 'warning', message: '🛡️ המגן הציל את הרצף שלך!' });
                setTimeout(() => setFeedback(null), 1500);
                return;
            }

            setCurrentStreak(0);

            setLives(l => {
                const newLives = l - 1;
                if (newLives <= 0) {
                    setGameState('gameOver');
                    return 0;
                }
                if (newLives === 1) {
                    const lowLivesDialogue = story.getDialogue('low_lives');
                    if (lowLivesDialogue) {
                        setTimeout(() => {
                            setFeedback({ type: 'error', message: lowLivesDialogue.text });
                        }, 1200);
                    }
                }
                return newLives;
            });

            const wrongDialogue = story.getDialogue('wrong');
            setFeedback({ type: 'error', message: wrongDialogue?.text || `${t('לא נורא, נסה שוב!', 'לא נורא, נסי שוב!')} 💪` });
            hapticFeedback('error');
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    const handleCheck = () => {
        const currentItem = activeWords[currentWordIndex];
        const normalize = (str) => str.trim().toUpperCase().replace(/[.,?!]/g, '').replace(/\s+/g, ' ');

        if (normalize(userInput) === normalize(currentItem.word)) {
            processAnswer(true);
        } else {
            processAnswer(false);
        }
    };

    // Inventory onUse handler
    const handleUse = (item) => {
        const effect = itemEffects.useConsumable(item, (itemId) => {
            setInventory(prev => {
                const idx = prev.indexOf(itemId);
                if (idx > -1) {
                    const newInv = [...prev];
                    newInv.splice(idx, 1);
                    return newInv;
                }
                return prev;
            });
        });
        if (effect) {
            const result = itemEffects.applyConsumableEffect(effect, { lives, hintsAvailable: 0, skipsAvailable: 0 });
            if (result.lives !== undefined) setLives(result.lives);
            if (result.bonusCoins) {
                setScore(s => s + result.bonusCoins);
                setFeedback({ type: 'success', message: `קיבלת ${result.bonusCoins} מטבעות! 🎉` });
                setTimeout(() => setFeedback(null), 1500);
            }
        }
    };

    // Walk pet from inventory
    const handleWalkPet = (petId) => {
        const item = STORE_ITEMS[petId];
        if (item) {
            setActivePet({ name: item.name, icon: item.icon });
            setGameState('petWalking');
        }
    };

    // Pet walk complete handler
    const handlePetWalkComplete = (earnedScore) => {
        setScore(s => s + earnedScore);
        updateDailyStats(0, earnedScore, 0);
        setGameState('map');
    };

    // Memory game complete handler
    const handleMemoryComplete = (pts) => {
        setScore(s => s + pts);
        setGameState('start');
    };

    // Avatar select handler
    const handleAvatarSelect = (icon) => {
        setAvatar(icon);
        localStorage.setItem(STORAGE_KEYS.AVATAR, icon);
        setGameState('start');
    };

    return {
        t,
        startLevel,
        handleCheck,
        handleBuy,
        handleInventoryClose,
        handleUse,
        handleWalkPet,
        handlePetWalkComplete,
        handleMemoryComplete,
        handleAvatarSelect,
        currentWord,
        scrambledContent,
    };
}
