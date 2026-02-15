/**
 * useGameLogic hook - Core game logic extracted from WordAdventure
 * Handles level starting, answer processing, scoring, store purchases,
 * inventory management, and word scrambling
 *
 * Reads all persisted and ephemeral state from useGameStore directly.
 * Only receives non-store dependencies as parameters.
 */

import { useMemo, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { calculateNextReview, buildReviewSession } from '../utils/srs';
import { selectChallengeType } from '../utils/challengeSelector';
import { hapticFeedback } from '../utils/mobile';
import { generateChallenge } from '../utils/grammarEngine';
import { STORE_ITEMS } from '../data/storeItems';
import { initialWordData } from '../data/words';
import confetti from 'canvas-confetti';

export function useGameLogic({ story, itemEffects, setTranscript }) {
    // Read all state from Zustand store
    const {
        userProfile, score, avatar, inventory, dailyStats,
        gameState, currentWordIndex, userInput, lives, feedback,
        activeWords, gameMode, activePet, currentStreak, currentLevel,
    } = useGameStore();

    // GENDER HELPER
    const t = (male, female) => userProfile.gender === 'boy' ? male : female;

    const handleBuy = (item) => {
        const store = useGameStore.getState();
        if (score >= item.price) {
            store.subtractScore(item.price);
            store.setInventory([...inventory, item.id]);
            store.setFeedback({ type: 'success', message: `${t('רכשת', 'רכשת')} ${item.name}! 🎉` });
            setTimeout(() => useGameStore.getState().setFeedback(null), 1500);
        }
    };

    const startLevel = (level) => {
        const store = useGameStore.getState();
        let wordsToPlay = [];

        if (level === 'master') {
            wordsToPlay = Array(5).fill(null).map(() => generateChallenge());
            store.setGameMode('regular');
        }
        else if (level === 'review') {
            wordsToPlay = buildReviewSession(initialWordData, store.userProgress);
            if (wordsToPlay.length === 0) {
                alert("אין מילים לחזרה כרגע! כל הכבוד! 🎉");
                return;
            }
            store.setGameMode('srs');
        } else {
            wordsToPlay = initialWordData.filter(w => w.level === level);
            store.setGameMode('regular');
        }

        store.setCurrentLevel(level);
        story.startChapter(level);

        store.setActiveWords(wordsToPlay);
        store.setCurrentWordIndex(0);
        store.setLives(itemEffects.getStartingLives(3));
        store.setUserInput('');
        store.setFeedback(null);
        store.setCurrentStreak(0);
        store.setGameState('playing');
    };

    const handleInventoryClose = (petId) => {
        const store = useGameStore.getState();
        if (petId) {
            const item = STORE_ITEMS[petId];
            if (item && item.walkable) {
                store.setActivePet({ name: item.name, icon: item.icon });
                store.setGameState('petWalking');
            } else {
                store.setGameState('map');
            }
        } else {
            store.setGameState('map');
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

    // Track recent challenge types to avoid repetitive sequences
    const recentChallengeTypes = useRef([]);

    // Select challenge type adaptively based on SRS mastery
    const challengeType = useMemo(() => {
        if (!currentWord) return 'spelling';
        // Grammar-generated words always get grammar challenge
        if (currentWord.id?.startsWith('gen_')) return 'grammar';
        // Select based on SRS mastery
        const srsState = useGameStore.getState().userProgress[currentWord.id];
        const selected = selectChallengeType(currentWord, srsState, recentChallengeTypes.current);
        // Track for variety (keep last 3)
        recentChallengeTypes.current = [...recentChallengeTypes.current.slice(-2), selected];
        return selected;
    }, [currentWordIndex, activeWords]);

    // Callback for non-spelling challenges to report answer directly
    const onAnswer = (isCorrect) => {
        processAnswer(isCorrect);
    };

    const scrambledContent = useMemo(() => {
        if (!currentWord) return [];
        if (currentWord.type === 'sentence') {
            return shuffleArray(currentWord.word.split(' '));
        } else {
            return shuffleArray(currentWord.word.split(''));
        }
    }, [currentWord?.id]);

    const processAnswer = (isCorrect) => {
        const store = useGameStore.getState();
        const word = store.activeWords[store.currentWordIndex];
        if (isCorrect) {
            if (!word.id.startsWith('gen_')) {
                const newState = calculateNextReview(store.userProgress[word.id], 5);
                store.updateWordProgress(word.id, newState);
            }

            const earnedScore = itemEffects.calculatePoints(150, store.currentStreak);
            store.addScore(earnedScore);
            store.addStars(2);

            const newStreak = store.currentStreak + 1;
            store.setCurrentStreak(newStreak);
            store.updateDailyStats({
                wordsPlayed: store.dailyStats.wordsPlayed + 1,
                dailyScore: store.dailyStats.dailyScore + earnedScore,
                maxStreak: Math.max(store.dailyStats.maxStreak, newStreak),
            });

            confetti({ particleCount: 50, origin: { y: 0.7 } });
            hapticFeedback('success');

            const dialogue = story.getDialogue('correct');
            store.setFeedback({ type: 'success', message: dialogue?.text || 'מושלם! 🌟' });

            story.recordWordLearned();

            if ([3, 5, 10, 15, 20].includes(newStreak)) {
                const streakDialogue = story.getDialogue('streak', { streak: newStreak });
                if (streakDialogue) {
                    setTimeout(() => {
                        useGameStore.getState().setFeedback({ type: 'success', message: streakDialogue.text });
                    }, 800);
                }
                story.recordStreak(newStreak);
            }

            setTimeout(() => {
                const s = useGameStore.getState();
                if (s.currentWordIndex < s.activeWords.length - 1) {
                    s.setCurrentWordIndex(s.currentWordIndex + 1);
                    s.setUserInput('');
                    setTranscript('');
                    s.setFeedback(null);
                } else {
                    const startingLives = itemEffects.getStartingLives(3);
                    const wasPerfect = s.lives === startingLives;
                    story.completeChapter(s.currentLevel, wasPerfect);
                    if (s.lives === 1) {
                        story.recordComebackWin();
                    }
                    s.setGameState('levelComplete');
                    s.saveHighScore(s.score);
                }
            }, 1500);
        } else {
            if (!word.id.startsWith('gen_')) {
                const newState = calculateNextReview(store.userProgress[word.id], 0);
                store.updateWordProgress(word.id, newState);
            }

            if (itemEffects.shouldProtectStreak() && store.currentStreak > 0) {
                store.setFeedback({ type: 'warning', message: '🛡️ המגן הציל את הרצף שלך!' });
                setTimeout(() => useGameStore.getState().setFeedback(null), 1500);
                return;
            }

            store.setCurrentStreak(0);

            const currentLives = store.lives;
            const newLives = currentLives - 1;
            if (newLives <= 0) {
                store.setLives(0);
                store.setGameState('gameOver');
            } else {
                store.setLives(newLives);
                if (newLives === 1) {
                    const lowLivesDialogue = story.getDialogue('low_lives');
                    if (lowLivesDialogue) {
                        setTimeout(() => {
                            useGameStore.getState().setFeedback({ type: 'error', message: lowLivesDialogue.text });
                        }, 1200);
                    }
                }
            }

            const wrongDialogue = story.getDialogue('wrong');
            store.setFeedback({ type: 'error', message: wrongDialogue?.text || `${t('לא נורא, נסה שוב!', 'לא נורא, נסי שוב!')} 💪` });
            hapticFeedback('error');
            setTimeout(() => useGameStore.getState().setFeedback(null), 1000);
        }
    };

    const handleCheck = () => {
        const store = useGameStore.getState();
        const currentItem = store.activeWords[store.currentWordIndex];
        const normalize = (str) => str.trim().toUpperCase().replace(/[.,?!]/g, '').replace(/\s+/g, ' ');

        if (normalize(store.userInput) === normalize(currentItem.word)) {
            processAnswer(true);
        } else {
            processAnswer(false);
        }
    };

    // Inventory onUse handler
    const handleUse = (item) => {
        const effect = itemEffects.useConsumable(item, (itemId) => {
            const store = useGameStore.getState();
            const prev = store.inventory;
            const idx = prev.indexOf(itemId);
            if (idx > -1) {
                const newInv = [...prev];
                newInv.splice(idx, 1);
                store.setInventory(newInv);
            }
        });
        if (effect) {
            const store = useGameStore.getState();
            const result = itemEffects.applyConsumableEffect(effect, { lives: store.lives, hintsAvailable: 0, skipsAvailable: 0 });
            if (result.lives !== undefined) store.setLives(result.lives);
            if (result.bonusCoins) {
                store.addScore(result.bonusCoins);
                store.setFeedback({ type: 'success', message: `קיבלת ${result.bonusCoins} מטבעות! 🎉` });
                setTimeout(() => useGameStore.getState().setFeedback(null), 1500);
            }
        }
    };

    // Walk pet from inventory
    const handleWalkPet = (petId) => {
        const item = STORE_ITEMS[petId];
        if (item) {
            const store = useGameStore.getState();
            store.setActivePet({ name: item.name, icon: item.icon });
            store.setGameState('petWalking');
        }
    };

    // Pet walk complete handler
    const handlePetWalkComplete = (earnedScore) => {
        const store = useGameStore.getState();
        store.addScore(earnedScore);
        store.updateDailyStats({
            dailyScore: store.dailyStats.dailyScore + earnedScore,
        });
        store.setGameState('map');
    };

    // Memory game complete handler
    const handleMemoryComplete = (pts) => {
        const store = useGameStore.getState();
        store.addScore(pts);
        store.setGameState('start');
    };

    // Avatar select handler
    const handleAvatarSelect = (icon) => {
        const store = useGameStore.getState();
        store.updateAvatar(icon);
        store.setGameState('start');
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
        challengeType,
        onAnswer,
    };
}
