/**
 * useGameLogic hook - Core game logic extracted from WordAdventure
 * Handles level starting, answer processing, scoring, store purchases,
 * inventory management, and word scrambling
 *
 * Reads all persisted and ephemeral state from useGameStore directly.
 * Only receives non-store dependencies as parameters.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { calculateNextReview, buildReviewSession } from '../utils/srs';
import { selectChallengeType } from '../utils/challengeSelector';
import { hapticFeedback } from '../utils/mobile';
import { generateChallenge } from '../utils/grammarEngine';
import { getLevelById, getLevelWords } from '../data/levels';
import { STORE_ITEMS } from '../data/storeItems';
import { initialWordData } from '../data/words';
import { GRAMMAR_INJECTION_INTERVAL, GAME_CONFIG } from '../config/constants';
import confetti from 'canvas-confetti';

/**
 * Show feedback and schedule its own removal. The clear only fires if the
 * feedback is still the exact object we set — a stale timer must never wipe
 * newer feedback set by another screen (e.g. a store purchase toast), and
 * every message is guaranteed a matching clear so the blocking feedback
 * overlay in PlayingScreen can never get stuck.
 */
function showTransientFeedback(feedback, duration, { onlyWhilePlaying = false } = {}) {
    const store = useGameStore.getState();
    if (onlyWhilePlaying && store.gameState !== 'playing') return;
    store.setFeedback(feedback);
    setTimeout(() => {
        const s = useGameStore.getState();
        if (s.feedback === feedback) s.setFeedback(null);
    }, duration);
}

export function useGameLogic({ story, itemEffects }) {
    // Read all state from Zustand store
    const {
        userProfile,
        currentWordIndex, activeWords,
    } = useGameStore();

    // GENDER HELPER
    const t = (male, female) => userProfile.gender === 'boy' ? male : female;

    const handleBuy = (item) => {
        // Always read fresh state: render-scope score/inventory go stale when
        // two clicks land before a re-render (double-charge hazard)
        const store = useGameStore.getState();

        if (!item.stackable && store.inventory.includes(item.id)) {
            showTransientFeedback({ type: 'warning', message: `${item.name} כבר ברשותך!` }, GAME_CONFIG.FEEDBACK_DURATION);
            return;
        }

        if (store.score < item.price) {
            showTransientFeedback({ type: 'error', message: 'אין מספיק מטבעות! 💰' }, GAME_CONFIG.FEEDBACK_DURATION);
            return;
        }

        store.subtractScore(item.price);
        store.setInventory([...store.inventory, item.id]);
        showTransientFeedback({ type: 'success', message: `רכשת ${item.name}! 🎉` }, GAME_CONFIG.FEEDBACK_DURATION);
    };

    const startLevel = (levelId) => {
        const store = useGameStore.getState();
        let wordsToPlay = [];

        if (levelId === 'review') {
            // Keep existing review mode logic
            wordsToPlay = buildReviewSession(initialWordData, store.userProgress);
            if (wordsToPlay.length === 0) {
                showTransientFeedback({ type: 'success', message: 'אין מילים לחזרה כרגע! כל הכבוד! 🎉' }, GAME_CONFIG.FEEDBACK_DURATION);
                return;
            }
        } else {
            const level = typeof levelId === 'number' ? getLevelById(levelId) : null;
            if (level) {
                // New level system
                wordsToPlay = getLevelWords(level);

                // Inject grammar challenges if enabled for this level
                if (level.grammarEnabled) {
                    const grammarInterval = GRAMMAR_INJECTION_INTERVAL || 4;
                    const withGrammar = [];
                    wordsToPlay.forEach((w, i) => {
                        withGrammar.push(w);
                        if ((i + 1) % grammarInterval === 0) {
                            withGrammar.push(generateChallenge());
                        }
                    });
                    wordsToPlay = withGrammar;
                }
            } else {
                // Legacy fallback for old difficulty strings
                if (levelId === 'master') {
                    wordsToPlay = Array(5).fill(null).map(() => generateChallenge());
                } else {
                    wordsToPlay = initialWordData.filter(w => w.level === levelId);
                }
            }
        }

        store.setCurrentLevel(levelId);
        story.startChapter(typeof levelId === 'number' ? `level_${levelId}` : levelId);

        store.setActiveWords(wordsToPlay);
        store.setCurrentWordIndex(0);
        store.setLives(itemEffects.getStartingLives(GAME_CONFIG.INITIAL_LIVES));
        store.setUserInput('');
        store.setFeedback(null);
        store.setCurrentStreak(0);
        store.resetLevelScore();
        store.setGameState('playing');
    };

    const handleInventoryClose = (petId) => {
        const store = useGameStore.getState();
        if (petId) {
            const item = STORE_ITEMS[petId];
            if (item && item.walkable) {
                store.setActivePet({ name: item.name, icon: item.icon });
                store.setGameState('petWalking');
                return;
            }
        }
        // Resume an in-progress level if the inventory was opened from one
        store.closeOverlay('map');
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

    // Select challenge type adaptively based on SRS mastery.
    // The memo must stay pure (no ref writes) — history is recorded in the
    // effect below, after the selection has been committed.
    const challengeType = useMemo(() => {
        if (!currentWord) return 'spelling';
        // Grammar-generated words always get grammar challenge
        if (currentWord.id?.startsWith('gen_')) return 'grammar';
        // Select based on SRS mastery
        const srsState = useGameStore.getState().userProgress[currentWord.id];
        return selectChallengeType(currentWord, srsState, recentChallengeTypes.current);
    }, [currentWord]);

    // Record the committed selection for variety tracking (keep last 3)
    useEffect(() => {
        recentChallengeTypes.current = [...recentChallengeTypes.current.slice(-2), challengeType];
    }, [challengeType, currentWordIndex]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentWord?.id]);

    // Shared level-completion path for the last word (answered or skipped)
    const completeLevel = (s) => {
        const startingLives = itemEffects.getStartingLives(GAME_CONFIG.INITIAL_LIVES);
        const wasPerfect = s.lives === startingLives;
        const chapterKey = typeof s.currentLevel === 'number' ? `level_${s.currentLevel}` : s.currentLevel;
        story.completeChapter(chapterKey, wasPerfect);
        if (s.lives === 1) {
            story.recordComebackWin();
        }
        // Persist completed level for progression unlocking
        if (typeof s.currentLevel === 'number') {
            s.addCompletedLevel(s.currentLevel);
        }
        // Mark onboarding as complete after finishing first level
        if (!s.hasCompletedOnboarding) {
            s.setHasCompletedOnboarding(true);
            s.setOnboardingStep(3);
        }
        s.setGameState('levelComplete');
        // Leaderboard ranks what THIS level earned; s.score is the lifetime
        // total (and coin balance), which made every entry a running maximum
        if (s.levelScore > 0) {
            s.saveHighScore(s.levelScore, s.currentLevel);
        }
    };

    /**
     * Spend a purchased skip: advance past the current word with no penalty —
     * no life loss, no streak reset, no SRS update, no score.
     */
    const skipWord = () => {
        const store = useGameStore.getState();
        if (store.gameState !== 'playing' || store.skipsAvailable <= 0) return;

        store.consumeSkip();
        hapticFeedback('light');

        if (store.currentWordIndex < store.activeWords.length - 1) {
            store.setCurrentWordIndex(store.currentWordIndex + 1);
            store.setUserInput('');
            store.setFeedback(null);
        } else {
            completeLevel(store);
        }
    };

    /**
     * Spend a purchased hint: replace the input with the correct prefix plus
     * one more token (letter for words, word for sentences).
     */
    const useHint = () => {
        const store = useGameStore.getState();
        if (store.gameState !== 'playing' || store.hintsAvailable <= 0) return;

        const word = store.activeWords[store.currentWordIndex];
        if (!word) return;

        const isSentence = word.type === 'sentence';
        const target = isSentence
            ? word.word.toUpperCase().split(' ')
            : word.word.toUpperCase().split('');
        const current = isSentence
            ? store.userInput.split(' ').filter(Boolean)
            : store.userInput.split('');

        // Longest correct prefix of the current input
        let correctLen = 0;
        while (
            correctLen < current.length &&
            correctLen < target.length &&
            current[correctLen] === target[correctLen]
        ) {
            correctLen++;
        }
        if (correctLen >= target.length) return; // already complete

        // hint_master (equipped booster) upgrades every hint to two tokens
        const revealCount = itemEffects.getHintQuality() === 'detailed' ? 2 : 1;
        const revealed = target.slice(0, Math.min(target.length, correctLen + revealCount));
        store.setUserInput(isSentence ? revealed.join(' ') : revealed.join(''));
        store.consumeHint();
        hapticFeedback('light');
    };

    const processAnswer = (isCorrect) => {
        const store = useGameStore.getState();
        const word = store.activeWords[store.currentWordIndex];
        if (isCorrect) {
            if (!word.id.startsWith('gen_')) {
                const newState = calculateNextReview(store.userProgress[word.id], 5);
                store.updateWordProgress(word.id, newState);
            }

            const earnedScore = itemEffects.calculatePoints(GAME_CONFIG.SCORE_PER_CORRECT, store.currentStreak);
            store.addScore(earnedScore);
            store.addLevelScore(earnedScore);

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
            showTransientFeedback({ type: 'success', message: dialogue?.text || 'מושלם! 🌟' }, GAME_CONFIG.FEEDBACK_DURATION);

            story.recordWordLearned();

            if ([3, 5, 10, 15, 20].includes(newStreak)) {
                const streakDialogue = story.getDialogue('streak', { streak: newStreak });
                if (streakDialogue) {
                    setTimeout(() => {
                        // The player may have left the level during the delay —
                        // never pop gameplay feedback on another screen, and
                        // always schedule a matching clear
                        showTransientFeedback(
                            { type: 'success', message: streakDialogue.text },
                            GAME_CONFIG.FEEDBACK_DURATION,
                            { onlyWhilePlaying: true }
                        );
                    }, 800);
                }
                story.recordStreak(newStreak);
            }

            setTimeout(() => {
                const s = useGameStore.getState();
                // The player may have navigated away (Home/Store) during the
                // feedback delay — never yank them back into the level flow
                if (s.gameState !== 'playing') return;
                if (s.currentWordIndex < s.activeWords.length - 1) {
                    s.setCurrentWordIndex(s.currentWordIndex + 1);
                    s.setUserInput('');
                    // Deliberately unconditional: whatever gameplay message is
                    // up (success or a mid-delay streak celebration) must not
                    // outlive the advance, or its overlay would block input on
                    // the next word. Off-screen feedback can't exist here —
                    // this timer only runs while still playing.
                    s.setFeedback(null);
                } else {
                    completeLevel(s);
                }
            }, GAME_CONFIG.FEEDBACK_DURATION);
        } else {
            if (!word.id.startsWith('gen_')) {
                const newState = calculateNextReview(store.userProgress[word.id], 0);
                store.updateWordProgress(word.id, newState);
            }

            if (itemEffects.shouldProtectStreak() && store.currentStreak > 0) {
                showTransientFeedback({ type: 'warning', message: '🛡️ המגן הציל את הרצף שלך!' }, GAME_CONFIG.FEEDBACK_DURATION);
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
            }

            // On the last life the low-lives warning IS the wrong-answer
            // message (shown a bit longer so it registers). A second delayed
            // setter here used to fire after the clear and freeze the game
            // behind a feedback overlay that nothing ever removed.
            const lowLivesDialogue = newLives === 1 ? story.getDialogue('low_lives') : null;
            const wrongDialogue = lowLivesDialogue || story.getDialogue('wrong');
            // onlyWhilePlaying: on the final life the state is already
            // 'gameOver' here — a 'try again' toast over the ResultScreen
            // would be noise, so the message only shows during play
            showTransientFeedback(
                { type: 'error', message: wrongDialogue?.text || `${t('לא נורא, נסה שוב!', 'לא נורא, נסי שוב!')} 💪` },
                lowLivesDialogue ? GAME_CONFIG.FEEDBACK_DURATION : GAME_CONFIG.ERROR_FEEDBACK_DURATION,
                { onlyWhilePlaying: true }
            );
            hapticFeedback('error');
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

    // Inventory onUse handler.
    // Every consumable must produce a real, visible effect — items were
    // previously consumed (and paid for) while their effects were discarded.
    const handleUse = (item) => {
        const removeOne = (itemId) => {
            const store = useGameStore.getState();
            const prev = store.inventory;
            const idx = prev.indexOf(itemId);
            if (idx > -1) {
                const newInv = [...prev];
                newInv.splice(idx, 1);
                store.setInventory(newInv);
            }
        };

        const showFeedback = (type, message) => {
            showTransientFeedback({ type, message }, GAME_CONFIG.FEEDBACK_DURATION);
        };

        const effect = itemEffects.useConsumable(item, removeOne);
        if (!effect) return;

        const store = useGameStore.getState();

        // Retired items (e.g. freeze_time — the game has no timer) refund their price
        if (item.retired) {
            store.addScore(item.price);
            showFeedback('success', `${item.name} יצא משימוש — קיבלת ${item.price} מטבעות בחזרה! 💰`);
            return;
        }

        switch (effect.type) {
            case 'heal': {
                const result = itemEffects.applyConsumableEffect(effect, { lives: store.lives });
                store.setLives(result.lives);
                showFeedback('success', 'לב אחד חזר! ❤️');
                break;
            }
            case 'hint':
                store.addHints(effect.value || 1);
                showFeedback('success', `יש לך רמז מוכן למשחק! 💡`);
                break;
            case 'skip':
                store.addSkips(effect.value || 1);
                showFeedback('success', `אפשר לדלג על מילה קשה! ⏭️`);
                break;
            case 'luck': {
                if (Math.random() < (effect.bonus_chance || 0.5)) {
                    const bonus = item.price * 2;
                    store.addScore(bonus);
                    showFeedback('success', `מזל גדול! קיבלת ${bonus} מטבעות! 🍀`);
                } else {
                    showFeedback('warning', 'לא הפעם... נסה שוב מחר! 🍀');
                }
                break;
            }
            case 'mystery': {
                if (Math.random() < 0.5) {
                    const bonus = Math.floor(Math.random() * 100) + 50;
                    store.addScore(bonus);
                    showFeedback('success', `בקופסה היו ${bonus} מטבעות! 🎁`);
                } else {
                    const prizes = ['potion_health', 'potion_hint', 'skip_word'];
                    const prizeId = prizes[Math.floor(Math.random() * prizes.length)];
                    store.setInventory([...useGameStore.getState().inventory, prizeId]);
                    showFeedback('success', `בקופסה היה ${STORE_ITEMS[prizeId].name}! 🎁`);
                }
                break;
            }
            default: {
                // Unknown effect — never silently swallow a purchased item: refund
                store.addScore(item.price);
                showFeedback('success', `קיבלת ${item.price} מטבעות בחזרה! 💰`);
                break;
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
        // The walk is a home-base mode: coming back from it lands on the
        // start menu (where the walk hero card and pet mood live), like exit.
        store.setGameState('start');
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
        skipWord,
        useHint,
    };
}
