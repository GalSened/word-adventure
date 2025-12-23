import { useState, useEffect, useCallback } from 'react';
import { safeGetJSON, safeSetJSON } from '../utils/storage';
import {
    CHAPTERS,
    PET_EVOLUTION,
    MYSTERIES,
    ENCOURAGEMENT,
    getRandomItem,
    getPetEvolutionStage,
    canPetEvolve,
    isChapterUnlocked,
    getNPCDialogue,
    getUnlockedLore
} from '../data/story';

const STORAGE_KEY = 'storyProgress';

/**
 * Get initial story progress
 */
const getInitialProgress = () => ({
    // Story progression
    currentChapter: null,
    completedChapters: [],
    totalWordsLearned: 0,

    // Player choices
    storyPath: null, // 'hero', 'explorer', 'scholar'
    choicesMade: [],

    // Pet evolution
    activePetId: null,
    petEvolutionLevel: {},

    // Mystery/Discovery
    discoveredSecrets: [],
    unlockedLore: [],
    collectibles: [],

    // Achievements
    achievements: [],

    // Story seen flags (to not repeat intros)
    seenIntros: [],
    seenEvolutions: [],

    // Stats for secrets
    answeredUnder3Seconds: false,
    wonWith1Life: false,
    playedBefore7am: false,
    playedAfter10pm: false,
    perfectLevelIds: [],
});

/**
 * Custom hook for managing story progression with player choices
 */
export function useStoryProgress(userProfile) {
    const [progress, setProgress] = useState(() =>
        safeGetJSON(STORAGE_KEY, getInitialProgress())
    );

    const [currentDialogue, setCurrentDialogue] = useState(null);
    const [pendingChoice, setPendingChoice] = useState(null);
    const [evolutionNotification, setEvolutionNotification] = useState(null);

    // Persist progress changes
    useEffect(() => {
        safeSetJSON(STORAGE_KEY, progress);
    }, [progress]);

    // Check for time-based secrets
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 7 && !progress.playedBefore7am) {
            updateProgress({ playedBefore7am: true });
            unlockSecret('early_bird');
        }
        if (hour >= 22 && !progress.playedAfter10pm) {
            updateProgress({ playedAfter10pm: true });
            unlockSecret('night_owl');
        }
    }, []);

    /**
     * Update progress state
     */
    const updateProgress = useCallback((updates) => {
        setProgress(prev => ({ ...prev, ...updates }));
    }, []);

    /**
     * Set the player's story path choice
     */
    const chooseStoryPath = useCallback((path) => {
        updateProgress({
            storyPath: path,
            choicesMade: [...progress.choicesMade, { type: 'story_path', choice: path, timestamp: Date.now() }]
        });
    }, [progress.choicesMade, updateProgress]);

    /**
     * Record a story choice
     */
    const makeChoice = useCallback((choiceId, option) => {
        updateProgress({
            choicesMade: [...progress.choicesMade, { id: choiceId, option, timestamp: Date.now() }]
        });
        setPendingChoice(null);
    }, [progress.choicesMade, updateProgress]);

    /**
     * Present a choice to the player
     */
    const presentChoice = useCallback((choice) => {
        setPendingChoice(choice);
    }, []);

    /**
     * Start a chapter
     */
    const startChapter = useCallback((level) => {
        const chapter = CHAPTERS[level];
        if (!chapter) return false;

        // Check if chapter is unlocked
        if (!isChapterUnlocked(level, progress.totalWordsLearned)) {
            return false;
        }

        updateProgress({ currentChapter: level });

        // Show intro dialogue if not seen
        if (!progress.seenIntros.includes(level)) {
            const introText = userProfile?.gender === 'girl'
                ? chapter.intro.girl
                : chapter.intro.boy;

            setCurrentDialogue({
                type: 'chapter_intro',
                npc: chapter.npc,
                text: introText,
                chapter: level
            });

            updateProgress({
                seenIntros: [...progress.seenIntros, level]
            });
        }

        return true;
    }, [progress, userProfile, updateProgress]);

    /**
     * Complete a chapter
     */
    const completeChapter = useCallback((level, wasPerfect = false) => {
        const chapter = CHAPTERS[level];
        if (!chapter) return;

        const updates = {
            currentChapter: null,
            completedChapters: progress.completedChapters.includes(level)
                ? progress.completedChapters
                : [...progress.completedChapters, level]
        };

        // Track perfect completion
        if (wasPerfect && !progress.perfectLevelIds.includes(level)) {
            updates.perfectLevelIds = [...progress.perfectLevelIds, level];
            unlockSecret('perfect_level');
        }

        // Award collectible
        if (chapter.mystery && !progress.collectibles.includes(chapter.mystery.reward)) {
            updates.collectibles = [...progress.collectibles, chapter.mystery.reward];
        }

        updateProgress(updates);

        // Show completion dialogue
        const completionText = userProfile?.gender === 'girl'
            ? chapter.completion.girl
            : chapter.completion.boy;

        setCurrentDialogue({
            type: 'chapter_complete',
            npc: chapter.npc,
            text: completionText,
            chapter: level,
            mystery: chapter.mystery
        });
    }, [progress, userProfile, updateProgress]);

    /**
     * Record a word learned
     */
    const recordWordLearned = useCallback(() => {
        const newTotal = progress.totalWordsLearned + 1;
        const updates = { totalWordsLearned: newTotal };

        // Check for word master achievement
        if (newTotal >= 50 && !progress.achievements.includes('word_master')) {
            unlockSecret('word_master');
        }

        // Check for new lore unlocks
        const newLore = getUnlockedLore(newTotal);
        if (newLore.length > progress.unlockedLore.length) {
            updates.unlockedLore = newLore.map(l => l.id);
        }

        // Check pet evolution
        if (progress.activePetId) {
            const currentStage = getPetEvolutionStage(progress.activePetId, progress.totalWordsLearned);
            const newStage = getPetEvolutionStage(progress.activePetId, newTotal);

            if (newStage && currentStage && newStage.level > currentStage.level) {
                // Pet evolved!
                const evolutionKey = `${progress.activePetId}_${newStage.level}`;
                if (!progress.seenEvolutions.includes(evolutionKey)) {
                    setEvolutionNotification({
                        pet: PET_EVOLUTION[progress.activePetId],
                        oldStage: currentStage,
                        newStage: newStage
                    });
                    updates.seenEvolutions = [...progress.seenEvolutions, evolutionKey];
                }

                updates.petEvolutionLevel = {
                    ...progress.petEvolutionLevel,
                    [progress.activePetId]: newStage.level
                };
            }
        }

        updateProgress(updates);
    }, [progress, updateProgress]);

    /**
     * Set active pet
     */
    const setActivePet = useCallback((petId) => {
        updateProgress({
            activePetId: petId,
            petEvolutionLevel: {
                ...progress.petEvolutionLevel,
                [petId]: progress.petEvolutionLevel[petId] || 1
            }
        });
    }, [progress.petEvolutionLevel, updateProgress]);

    /**
     * Get pet's current evolution stage
     */
    const getPetStage = useCallback((petId = progress.activePetId) => {
        if (!petId) return null;
        return getPetEvolutionStage(petId, progress.totalWordsLearned);
    }, [progress.activePetId, progress.totalWordsLearned]);

    /**
     * Unlock a secret achievement
     */
    const unlockSecret = useCallback((secretId) => {
        if (progress.discoveredSecrets.includes(secretId)) return;

        const secret = MYSTERIES.secrets.find(s => s.id === secretId);
        if (!secret) return;

        updateProgress({
            discoveredSecrets: [...progress.discoveredSecrets, secretId],
            achievements: [...progress.achievements, secretId]
        });

        // Show achievement notification
        setCurrentDialogue({
            type: 'achievement',
            achievement: secret
        });
    }, [progress.discoveredSecrets, progress.achievements, updateProgress]);

    /**
     * Record fast answer (under 3 seconds)
     */
    const recordFastAnswer = useCallback(() => {
        if (!progress.answeredUnder3Seconds) {
            updateProgress({ answeredUnder3Seconds: true });
            unlockSecret('speed_demon');
        }
    }, [progress.answeredUnder3Seconds, updateProgress]);

    /**
     * Record comeback win (won with 1 life)
     */
    const recordComebackWin = useCallback(() => {
        if (!progress.wonWith1Life) {
            updateProgress({ wonWith1Life: true });
            unlockSecret('comeback_kid');
        }
    }, [progress.wonWith1Life, updateProgress]);

    /**
     * Record a streak milestone
     */
    const recordStreak = useCallback((streak) => {
        if (streak >= 20) {
            unlockSecret('streak_champion');
        }
    }, []);

    /**
     * Get contextual dialogue for current game state
     */
    const getDialogue = useCallback((trigger, extra = {}) => {
        const level = progress.currentChapter;
        const name = userProfile?.name || 'גיבור';

        // NPC dialogue for current chapter
        if (level && CHAPTERS[level]) {
            const npcDialogue = getNPCDialogue(level, trigger, name);
            if (npcDialogue) {
                return {
                    npc: CHAPTERS[level].npc,
                    text: npcDialogue
                };
            }
        }

        // Generic encouragement
        switch (trigger) {
            case 'correct':
                return { text: getRandomItem(ENCOURAGEMENT.correct) };
            case 'wrong':
                return { text: getRandomItem(ENCOURAGEMENT.wrong) };
            case 'streak':
                const streakNum = extra.streak;
                const streakMessages = ENCOURAGEMENT.streak[streakNum];
                if (streakMessages) {
                    return { text: getRandomItem(streakMessages) };
                }
                return null;
            case 'low_lives':
                return { text: getRandomItem(ENCOURAGEMENT.lowLives) };
            case 'daily_return':
                return { text: getRandomItem(ENCOURAGEMENT.dailyReturn) };
            default:
                return null;
        }
    }, [progress.currentChapter, userProfile]);

    /**
     * Dismiss current dialogue
     */
    const dismissDialogue = useCallback(() => {
        setCurrentDialogue(null);
    }, []);

    /**
     * Dismiss evolution notification
     */
    const dismissEvolution = useCallback(() => {
        setEvolutionNotification(null);
    }, []);

    /**
     * Get list of unlocked chapters
     */
    const getUnlockedChapters = useCallback(() => {
        return Object.entries(CHAPTERS)
            .filter(([level]) => isChapterUnlocked(level, progress.totalWordsLearned))
            .map(([level, chapter]) => ({
                level,
                ...chapter,
                completed: progress.completedChapters.includes(level)
            }));
    }, [progress.totalWordsLearned, progress.completedChapters]);

    /**
     * Get story path options for player to choose
     */
    const getStoryPathOptions = useCallback(() => [
        {
            id: 'hero',
            title: 'דרך הגיבור',
            icon: '⚔️',
            description: 'להילחם בקוסם האפל ולהציל את הממלכה',
            bonus: 'בונוס נקודות בקרב'
        },
        {
            id: 'explorer',
            title: 'דרך החוקר',
            icon: '🗺️',
            description: 'לגלות סודות ואוצרות נסתרים',
            bonus: 'רמזים נוספים'
        },
        {
            id: 'scholar',
            title: 'דרך החכם',
            icon: '📚',
            description: 'ללמוד את כל המילים ולהיות מאסטר',
            bonus: 'התקדמות מהירה יותר'
        }
    ], []);

    return {
        // State
        progress,
        currentDialogue,
        pendingChoice,
        evolutionNotification,

        // Story progression
        startChapter,
        completeChapter,
        getUnlockedChapters,

        // Player choices
        chooseStoryPath,
        makeChoice,
        presentChoice,
        getStoryPathOptions,

        // Pet system
        setActivePet,
        getPetStage,

        // Word/learning tracking
        recordWordLearned,
        recordFastAnswer,
        recordComebackWin,
        recordStreak,

        // Dialogue system
        getDialogue,
        dismissDialogue,
        dismissEvolution,

        // Secrets/achievements
        unlockSecret,
    };
}
