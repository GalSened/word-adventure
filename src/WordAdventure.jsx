import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Home, Trophy, ShoppingBag, Backpack } from 'lucide-react';
import WelcomeScreen from './components/WelcomeScreen';
import StoryDialogue from './components/StoryDialogue';
import StoryPathChoice from './components/StoryPathChoice';
import PetEvolution from './components/PetEvolution';
import ScreenRouter from './components/screens/ScreenRouter';
import AvatarWithGear from './components/AvatarWithGear';
import FeedbackToast from './components/FeedbackToast';
import { getThemeStyle } from './utils/themes';
import { useGameStore } from './store/gameStore';
import { useStoryProgress } from './hooks/useStoryProgress';
import { useItemEffects } from './hooks/useItemEffects';
import { useGameLogic } from './hooks/useGameLogic';
import { initialWordData } from './data/words';
import { getMemoryGameWords } from './utils/memoryGameWords';

export default function WordAdventure() {
    const { userProfile, setUserProfile, score, avatar, inventory, dailyStats, completedLevels, userProgress, hintsAvailable, skipsAvailable } = useGameStore();
    const { gameState, setGameState, currentStreak, activePet, lives, feedback, userInput, setUserInput, hasSeenStoryIntro, setHasSeenStoryIntro, hasCompletedOnboarding, openStore, openInventory, closeOverlay } = useGameStore();

    const story = useStoryProgress(userProfile);
    const itemEffects = useItemEffects(inventory);
    const logic = useGameLogic({ story, itemEffects });

    useEffect(() => {
        if (dailyStats.date !== new Date().toDateString()) {
            useGameStore.getState().resetDailyStats();
            useGameStore.getState().setCurrentStreak(0);
        }
    }, [dailyStats.date]);

    // Guided first lesson: auto-start level 1 for new players (replaces StoryIntro overlay).
    // gameState must be a dependency: without it, a new player who taps Home
    // mid-lesson lands on the full start menu and onboarding never re-arms.
    useEffect(() => {
        if (userProfile && !hasCompletedOnboarding && gameState === 'start') {
            // Auto-start level 1 for new players
            logic.startLevel(1);
            // Also mark story intro as seen so StoryPathChoice doesn't block
            if (!hasSeenStoryIntro) {
                setHasSeenStoryIntro(true);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- logic is a fresh object every render; the guard makes re-runs idempotent
    }, [userProfile, hasCompletedOnboarding, gameState, hasSeenStoryIntro, setHasSeenStoryIntro]);

    // SRS-weighted memory-game selection — memoized so the board isn't
    // recomputed (and the child game reshuffled) on unrelated re-renders
    const memoryWords = useMemo(
        () => getMemoryGameWords(initialWordData, userProgress),
        [userProgress]
    );

    if (!userProfile) return <WelcomeScreen onComplete={(profile) => setUserProfile(profile)} />;

    const screenProps = {
        userProfile, score, avatar, inventory, dailyStats, gameState, currentWord: logic.currentWord,
        lives, feedback, userInput, scrambledContent: logic.scrambledContent, currentStreak, story, itemEffects,
        activePet, challengeType: logic.challengeType, onAnswer: logic.onAnswer,
        setGameState, setUserInput,
        startLevel: logic.startLevel, handleCheck: logic.handleCheck, handleBuy: logic.handleBuy,
        handleInventoryClose: logic.handleInventoryClose, handleUse: logic.handleUse, handleWalkPet: logic.handleWalkPet,
        handlePetWalkComplete: logic.handlePetWalkComplete, handleMemoryComplete: logic.handleMemoryComplete,
        handleAvatarSelect: logic.handleAvatarSelect, t: logic.t,
        equipped: itemEffects.equipped, equipItem: itemEffects.equipItem, unequipItem: itemEffects.unequipItem,
        completedLevels: completedLevels || [],
        gender: userProfile.gender, memoryWords,
        skipWord: logic.skipWord, useHint: logic.useHint,
        hintsAvailable, skipsAvailable, closeOverlay,
    };

    const theme = getThemeStyle(itemEffects.equipped?.theme);

    return (
        <div className={`min-h-screen ${theme.page} font-sans text-slate-800 relative`} dir="rtl">
            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity }} className={`absolute -top-20 -right-20 w-96 h-96 ${theme.blobA} rounded-full blur-3xl`} />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity }} className={`absolute bottom-0 left-0 w-80 h-80 ${theme.blobB} rounded-full blur-3xl`} />
            </div>
            <div className="relative z-10 max-w-4xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6 bg-white/80 backdrop-blur rounded-2xl p-3 shadow-md">
                    <div className="flex gap-1">
                        <button onClick={() => setGameState('start')} aria-label="מסך הבית" className="p-2.5 rounded-xl text-purple-600 hover:bg-purple-50 active:scale-90 transition-transform"><Home /></button>
                        <button onClick={openStore} aria-label="חנות ההפתעות" className="p-2.5 rounded-xl text-yellow-600 hover:bg-yellow-50 active:scale-90 transition-transform"><ShoppingBag /></button>
                        <button onClick={openInventory} aria-label="התיק שלי" className="p-2.5 rounded-xl text-blue-600 hover:bg-blue-50 active:scale-90 transition-transform"><Backpack /></button>
                    </div>
                    <div className="flex gap-4 items-center font-bold text-lg">
                        <span className="flex items-center gap-1 text-yellow-600"><Trophy size={18} /> {score}</span>
                        <AvatarWithGear avatar={avatar} equipped={itemEffects.equipped} className="text-2xl" />
                    </div>
                </div>
                <ScreenRouter gameState={gameState} {...screenProps} />
            </div>
            {gameState !== 'playing' && <FeedbackToast feedback={feedback} />}
            {!story.progress.storyPath && hasCompletedOnboarding && userProfile && <StoryPathChoice options={story.getStoryPathOptions()} onChoose={story.chooseStoryPath} playerName={userProfile.name} gender={userProfile.gender} />}
            <StoryDialogue dialogue={story.currentDialogue} onDismiss={story.dismissDialogue} />
            <PetEvolution evolution={story.evolutionNotification} onDismiss={story.dismissEvolution} />
        </div>
    );
}
