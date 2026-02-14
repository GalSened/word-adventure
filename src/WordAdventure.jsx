import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Trophy, ShoppingBag, Backpack } from 'lucide-react';
import WelcomeScreen from './components/WelcomeScreen';
import StoryDialogue from './components/StoryDialogue';
import StoryPathChoice from './components/StoryPathChoice';
import PetEvolution from './components/PetEvolution';
import StoryIntro from './components/StoryIntro';
import ScreenRouter from './components/screens/ScreenRouter';
import { safeGetJSON, safeSetJSON, safeGetNumber, STORAGE_KEYS } from './utils/storage';
import { useVoiceRecognition } from './utils/voice';
import { useStoryProgress } from './hooks/useStoryProgress';
import { useItemEffects } from './hooks/useItemEffects';
import { useGameLogic } from './hooks/useGameLogic';
import { initialWordData } from './data/words';
// TODO: Wrap in GameProvider when screens migrate to useGame()

export default function WordAdventure() {
    const [userProfile, setUserProfile] = useState(() => safeGetJSON(STORAGE_KEYS.USER_PROFILE, null));
    const [score, setScore] = useState(() => safeGetNumber(STORAGE_KEYS.SCORE, 0));
    const [stars, setStars] = useState(() => safeGetNumber(STORAGE_KEYS.STARS, 0));
    const [userProgress, setUserProgress] = useState(() => safeGetJSON(STORAGE_KEYS.USER_PROGRESS, {}));
    const [avatar, setAvatar] = useState(() => (safeGetJSON(STORAGE_KEYS.USER_PROFILE, {}).avatar || localStorage.getItem(STORAGE_KEYS.AVATAR) || '👸'));
    const [highScores, setHighScores] = useState(() => safeGetJSON(STORAGE_KEYS.HIGH_SCORES, []));
    const [inventory, setInventory] = useState(() => safeGetJSON(STORAGE_KEYS.INVENTORY, []));
    const [dailyStats, setDailyStats] = useState(() => safeGetJSON(STORAGE_KEYS.DAILY_STATS, { date: new Date().toDateString(), wordsPlayed: 0, maxStreak: 0, dailyScore: 0 }));
    const [gameState, setGameState] = useState('start');
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [lives, setLives] = useState(3);
    const [feedback, setFeedback] = useState(null);
    const [activeWords, setActiveWords] = useState([]);
    const [gameMode, setGameMode] = useState('regular');
    const [activePet, setActivePet] = useState(null);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [showStoryIntro, setShowStoryIntro] = useState(() => !safeGetJSON('hasSeenStoryIntro', false));
    const [currentLevel, setCurrentLevel] = useState(null);

    const voice = useVoiceRecognition();
    const story = useStoryProgress(userProfile);
    const itemEffects = useItemEffects(inventory);
    const logic = useGameLogic({
        userProfile, score, setScore, stars, setStars, userProgress, setUserProgress,
        avatar, setAvatar, highScores, setHighScores, inventory, setInventory,
        dailyStats, setDailyStats, gameState, setGameState, currentWordIndex, setCurrentWordIndex,
        userInput, setUserInput, lives, setLives, feedback, setFeedback,
        activeWords, setActiveWords, gameMode, setGameMode, activePet, setActivePet,
        currentStreak, setCurrentStreak, currentLevel, setCurrentLevel,
        setTranscript: voice.setTranscript, story, itemEffects,
    });

    useEffect(() => { safeSetJSON(STORAGE_KEYS.USER_PROFILE, userProfile); }, [userProfile]);
    useEffect(() => { safeSetJSON(STORAGE_KEYS.USER_PROGRESS, userProgress); }, [userProgress]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.SCORE, score); }, [score]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.STARS, stars); }, [stars]);
    useEffect(() => { safeSetJSON(STORAGE_KEYS.INVENTORY, inventory); }, [inventory]);
    useEffect(() => {
        if (dailyStats.date !== new Date().toDateString()) {
            setDailyStats({ date: new Date().toDateString(), wordsPlayed: 0, maxStreak: 0, dailyScore: 0 });
            setCurrentStreak(0);
        } else { safeSetJSON(STORAGE_KEYS.DAILY_STATS, dailyStats); }
    }, [dailyStats]);
    useEffect(() => { if (voice.transcript) setUserInput(voice.transcript.toUpperCase().replace('.', '').replace('?', '').trim()); }, [voice.transcript]);

    if (!userProfile) return <WelcomeScreen onComplete={(profile) => setUserProfile(profile)} />;

    const screenProps = {
        userProfile, score, stars, avatar, inventory, dailyStats, gameState, currentWord: logic.currentWord,
        lives, feedback, userInput, scrambledContent: logic.scrambledContent, currentStreak, story, itemEffects,
        activePet, gameMode, isSupported: voice.isSupported, isListening: voice.isListening,
        startListening: voice.startListening, stopListening: voice.stopListening, setGameState, setUserInput,
        startLevel: logic.startLevel, handleCheck: logic.handleCheck, handleBuy: logic.handleBuy,
        handleInventoryClose: logic.handleInventoryClose, handleUse: logic.handleUse, handleWalkPet: logic.handleWalkPet,
        handlePetWalkComplete: logic.handlePetWalkComplete, handleMemoryComplete: logic.handleMemoryComplete,
        handleAvatarSelect: logic.handleAvatarSelect, t: logic.t,
        equipped: itemEffects.equipped, equipItem: itemEffects.equipItem, unequipItem: itemEffects.unequipItem,
        gender: userProfile.gender, memoryWords: activeWords.length > 0 ? activeWords : initialWordData.slice(0, 12),
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
            {showStoryIntro && userProfile && <StoryIntro gender={userProfile.gender} onComplete={() => { setShowStoryIntro(false); safeSetJSON('hasSeenStoryIntro', true); }} />}
            {!story.progress.storyPath && !showStoryIntro && userProfile && <StoryPathChoice options={story.getStoryPathOptions()} onChoose={story.chooseStoryPath} playerName={userProfile.name} gender={userProfile.gender} />}
            <StoryDialogue dialogue={story.currentDialogue} onDismiss={story.dismissDialogue} />
            <PetEvolution evolution={story.evolutionNotification} onDismiss={story.dismissEvolution} />
        </div>
    );
}
