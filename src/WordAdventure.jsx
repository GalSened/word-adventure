import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Trophy, ShoppingBag, Backpack } from 'lucide-react';
import WelcomeScreen from './components/WelcomeScreen';
import StoryDialogue from './components/StoryDialogue';
import StoryPathChoice from './components/StoryPathChoice';
import PetEvolution from './components/PetEvolution';
import ScreenRouter from './components/screens/ScreenRouter';
import { useGameStore } from './store/gameStore';
import { useVoiceRecognition } from './utils/voice';
import { useStoryProgress } from './hooks/useStoryProgress';
import { useItemEffects } from './hooks/useItemEffects';
import { useGameLogic } from './hooks/useGameLogic';
import { initialWordData } from './data/words';
import { getMemoryGameWords } from './utils/memoryGameWords';

export default function WordAdventure() {
    const { userProfile, setUserProfile, score, avatar, inventory, dailyStats, stars, completedLevels, userProgress } = useGameStore();
    const { gameState, setGameState, currentStreak, activePet, lives, feedback, userInput, setUserInput, gameMode, activeWords, hasSeenStoryIntro, setHasSeenStoryIntro, hasCompletedOnboarding, setHasCompletedOnboarding } = useGameStore();

    const voice = useVoiceRecognition();
    const story = useStoryProgress(userProfile);
    const itemEffects = useItemEffects(inventory);
    const logic = useGameLogic({ story, itemEffects, setTranscript: voice.setTranscript });

    useEffect(() => {
        if (dailyStats.date !== new Date().toDateString()) {
            useGameStore.getState().resetDailyStats();
            useGameStore.getState().setCurrentStreak(0);
        }
    }, [dailyStats.date]);

    useEffect(() => { if (voice.transcript) setUserInput(voice.transcript.toUpperCase().replace('.', '').replace('?', '').trim()); }, [voice.transcript]);

    // Guided first lesson: auto-start level 1 for new players (replaces StoryIntro overlay)
    useEffect(() => {
        if (userProfile && !hasCompletedOnboarding && gameState === 'start') {
            // Auto-start level 1 for new players
            logic.startLevel(1);
            // Also mark story intro as seen so StoryPathChoice doesn't block
            if (!hasSeenStoryIntro) {
                setHasSeenStoryIntro(true);
            }
        }
    }, [userProfile, hasCompletedOnboarding]);

    if (!userProfile) return <WelcomeScreen onComplete={(profile) => setUserProfile(profile)} />;

    const screenProps = {
        userProfile, score, stars, avatar, inventory, dailyStats, gameState, currentWord: logic.currentWord,
        lives, feedback, userInput, scrambledContent: logic.scrambledContent, currentStreak, story, itemEffects,
        activePet, gameMode, challengeType: logic.challengeType, onAnswer: logic.onAnswer,
        isSupported: voice.isSupported, isListening: voice.isListening,
        startListening: voice.startListening, stopListening: voice.stopListening, setGameState, setUserInput,
        startLevel: logic.startLevel, handleCheck: logic.handleCheck, handleBuy: logic.handleBuy,
        handleInventoryClose: logic.handleInventoryClose, handleUse: logic.handleUse, handleWalkPet: logic.handleWalkPet,
        handlePetWalkComplete: logic.handlePetWalkComplete, handleMemoryComplete: logic.handleMemoryComplete,
        handleAvatarSelect: logic.handleAvatarSelect, handleAdventureComplete: logic.handleAdventureComplete, t: logic.t,
        equipped: itemEffects.equipped, equipItem: itemEffects.equipItem, unequipItem: itemEffects.unequipItem,
        completedLevels: completedLevels || [],
        gender: userProfile.gender, memoryWords: getMemoryGameWords(initialWordData, userProgress),
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative" dir="rtl">
            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity }} className="absolute -top-20 -right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity }} className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 max-w-4xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6 bg-white/80 backdrop-blur rounded-2xl p-3 shadow-md">
                    <div className="flex gap-2">
                        <button onClick={() => setGameState('start')}><Home className="text-purple-600" /></button>
                        <button onClick={() => setGameState('store')} className="text-yellow-600"><ShoppingBag /></button>
                        <button onClick={() => setGameState('inventory')} className="text-blue-600"><Backpack /></button>
                    </div>
                    <div className="flex gap-4 font-bold text-lg">
                        <span className="flex items-center gap-1 text-yellow-600"><Trophy size={18} /> {score}</span>
                        <span className="flex items-center gap-1 text-purple-600 text-2xl">{avatar}</span>
                    </div>
                </div>
                <ScreenRouter gameState={gameState} {...screenProps} />
            </div>
            {!story.progress.storyPath && hasCompletedOnboarding && userProfile && <StoryPathChoice options={story.getStoryPathOptions()} onChoose={story.chooseStoryPath} playerName={userProfile.name} gender={userProfile.gender} />}
            <StoryDialogue dialogue={story.currentDialogue} onDismiss={story.dismissDialogue} />
            <PetEvolution evolution={story.evolutionNotification} onDismiss={story.dismissEvolution} />
        </div>
    );
}
