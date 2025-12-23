import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Heart, Trophy, Star, ArrowRight, Zap, RefreshCw, Home, Mic, MicOff, ShoppingBag, Backpack, Calendar, BookOpen, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import AvatarSelect from './components/AvatarSelect';
import Leaderboard from './components/Leaderboard';
import MemoryGame from './components/MemoryGame';
import Store from './components/Store';
import Inventory from './components/Inventory';
import DailyQuests from './components/DailyQuests';
import WelcomeScreen from './components/WelcomeScreen';
import PetWalkingGame from './components/PetWalkingGame';
import StoryDialogue from './components/StoryDialogue';
import StoryPathChoice from './components/StoryPathChoice';
import PetEvolution from './components/PetEvolution';
import StoryIntro from './components/StoryIntro';
import { calculateNextReview, getDueWords } from './utils/srs';
import { useVoiceRecognition } from './utils/voice';
import { generateChallenge } from './utils/grammarEngine';
import { safeGetJSON, safeSetJSON, safeGetNumber, STORAGE_KEYS } from './utils/storage';
import { useStoryProgress } from './hooks/useStoryProgress';
import { CHAPTERS, isChapterUnlocked } from './data/story';

// --- DATA ---
const initialWordData = [
    { id: 'cat', word: 'CAT', hint: '🐱 חיה שאוהבת חלב', hebrew: 'חתול', level: 'easy', type: 'word' },
    { id: 'dog', word: 'DOG', hint: '🐕 החבר הכי טוב של האדם', hebrew: 'כלב', level: 'easy', type: 'word' },
    { id: 'sun', word: 'SUN', hint: '☀️ מאיר בשמיים ביום', hebrew: 'שמש', level: 'easy', type: 'word' },
    { id: 'book', word: 'BOOK', hint: '📚 קוראים אותו', hebrew: 'ספר', level: 'easy', type: 'word' },
    { id: 'fish', word: 'FISH', hint: '🐟 שוחה במים', hebrew: 'דג', level: 'easy', type: 'word' },
    { id: 'happy', word: 'HAPPY', hint: '😊 מרגישים ככה כשמקבלים מתנה', hebrew: 'שמח', level: 'medium', type: 'word' },
    { id: 'water', word: 'WATER', hint: '💧 שותים אותו', hebrew: 'מים', level: 'medium', type: 'word' },
    { id: 'flower', word: 'FLOWER', hint: '🌸 צומח בגינה ויפה', hebrew: 'פרח', level: 'medium', type: 'word' },
    { id: 'butterfly', word: 'BUTTERFLY', hint: '🦋 חרק יפה עם כנפיים צבעוניות', hebrew: 'פרפר', level: 'hard', type: 'word' },
    { id: 'adventure', word: 'ADVENTURE', hint: '🗺️ מסע מרגש עם הרפתקאות', hebrew: 'הרפתקה', level: 'hard', type: 'word' },
    { id: 'treasure', word: 'TREASURE', hint: '💎 משהו יקר שמוצאים', hebrew: 'אוצר', level: 'hard', type: 'word' },
    { id: 'mysterious', word: 'MYSTERIOUS', hint: '🕵️‍♀️ משהו לא ברור ומסקרן', hebrew: 'מסתורי', level: 'expert', type: 'word' },
    { id: 'extraordinary', word: 'EXTRAORDINARY', hint: '🌟 משהו מאוד מיוחד ולא רגיל', hebrew: 'יוצא דופן', level: 'expert', type: 'word' },
];

const storyChapters = {
    easy: { title: 'הממלכה הקסומה', color: 'from-green-400 to-emerald-600', character: '👸' },
    medium: { title: 'היער הקסום', color: 'from-blue-400 to-indigo-600', character: '🧚' },
    hard: { title: 'מגדל הקוסם', color: 'from-purple-500 to-fuchsia-600', character: '🧙' },
    expert: { title: 'היקום האינסופי', color: 'from-rose-500 to-pink-600', character: '👽' },
    master: { title: 'היכל החכמים', color: 'from-amber-500 to-red-600', character: '🏛️' },
    review: { title: 'חזרות חכמות', color: 'from-yellow-400 to-orange-500', character: '🧠' }
};

export default function WordAdventure() {
    // Persistent State (using safe storage utilities)
    const [userProfile, setUserProfile] = useState(() => safeGetJSON(STORAGE_KEYS.USER_PROFILE, null));
    const [score, setScore] = useState(() => safeGetNumber(STORAGE_KEYS.SCORE, 0));
    const [stars, setStars] = useState(() => safeGetNumber(STORAGE_KEYS.STARS, 0));
    const [userProgress, setUserProgress] = useState(() => safeGetJSON(STORAGE_KEYS.USER_PROGRESS, {}));
    const [avatar, setAvatar] = useState(() => {
        const profile = safeGetJSON(STORAGE_KEYS.USER_PROFILE, {});
        return profile.avatar || localStorage.getItem(STORAGE_KEYS.AVATAR) || '👸';
    });
    const [highScores, setHighScores] = useState(() => safeGetJSON(STORAGE_KEYS.HIGH_SCORES, []));
    const [inventory, setInventory] = useState(() => safeGetJSON(STORAGE_KEYS.INVENTORY, []));
    const [dailyStats, setDailyStats] = useState(() => safeGetJSON(STORAGE_KEYS.DAILY_STATS, {
        date: new Date().toDateString(),
        wordsPlayed: 0,
        maxStreak: 0,
        dailyScore: 0
    }));

    // Game State
    const [gameState, setGameState] = useState('start');
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [lives, setLives] = useState(3);
    const [feedback, setFeedback] = useState(null);
    const [activeWords, setActiveWords] = useState([]);
    const [gameMode, setGameMode] = useState('regular');
    const [activePet, setActivePet] = useState(null);
    const [currentStreak, setCurrentStreak] = useState(0); // Track consecutive correct answers

    // Voice Hook
    const { isListening, transcript, startListening, stopListening, isSupported, setTranscript } = useVoiceRecognition();

    // Story Progression Hook
    const story = useStoryProgress(userProfile);
    const [showStoryIntro, setShowStoryIntro] = useState(() =>
        !safeGetJSON('hasSeenStoryIntro', false)
    );
    const [currentLevel, setCurrentLevel] = useState(null);

    // --- EFFECT: PERSISTENCE (using safe storage) ---
    useEffect(() => { safeSetJSON(STORAGE_KEYS.USER_PROFILE, userProfile); }, [userProfile]);
    useEffect(() => { safeSetJSON(STORAGE_KEYS.USER_PROGRESS, userProgress); }, [userProgress]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.SCORE, score); }, [score]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.STARS, stars); }, [stars]);
    useEffect(() => { safeSetJSON(STORAGE_KEYS.INVENTORY, inventory); }, [inventory]);

    // Daily Stats Reset Check
    useEffect(() => {
        if (dailyStats.date !== new Date().toDateString()) {
            setDailyStats({ date: new Date().toDateString(), wordsPlayed: 0, maxStreak: 0, dailyScore: 0 });
            setCurrentStreak(0); // Reset streak on new day
        } else {
            safeSetJSON(STORAGE_KEYS.DAILY_STATS, dailyStats);
        }
    }, [dailyStats]);

    // Voice Transcript Update
    useEffect(() => {
        if (transcript) {
            setUserInput(transcript.toUpperCase().replace('.', '').replace('?', '').trim());
        }
    }, [transcript]);

    // If no user profile, show welcome screen
    if (!userProfile) {
        return <WelcomeScreen onComplete={(profile) => setUserProfile(profile)} />;
    }

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
            // PROCEDURAL GENERATION MODE
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

        // Start chapter in story system
        setCurrentLevel(level);
        story.startChapter(level);

        setActiveWords(wordsToPlay);
        setCurrentWordIndex(0);
        setLives(3);
        setUserInput('');
        setFeedback(null);
        setCurrentStreak(0);
        setGameState('playing');
    };

    const handleInventoryClose = (petId) => {
        if (petId) {
            // Launch pet walking game
            const petDetails = {
                'dog': { name: 'כלבלב', icon: '🐕' },
                'unicorn': { name: 'חד קרן', icon: '🦄' },
                'dragon': { name: 'דרקון', icon: '🐉' }
            };
            setActivePet(petDetails[petId]);
            setGameState('petWalking');
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

    const getScrambledContent = (item) => {
        if (item.type === 'sentence') {
            return shuffleArray(item.word.split(' '));
        } else {
            return shuffleArray(item.word.split(''));
        }
    };

    const processAnswer = (isCorrect) => {
        const word = activeWords[currentWordIndex];
        if (isCorrect) {
            if (!word.id.startsWith('gen_')) {
                const newState = calculateNextReview(userProgress[word.id], 5);
                setUserProgress(prev => ({ ...prev, [word.id]: newState }));
            }

            const earnedScore = 150;
            setScore(s => s + earnedScore);
            setStars(s => s + 2);

            // Update streak: increment and track max
            const newStreak = currentStreak + 1;
            setCurrentStreak(newStreak);
            updateDailyStats(1, earnedScore, newStreak);

            confetti({ particleCount: 50, origin: { y: 0.7 } });

            // Get contextual dialogue from story system
            const dialogue = story.getDialogue('correct');
            setFeedback({ type: 'success', message: dialogue?.text || 'מושלם! 🌟' });

            // Record word learned for pet evolution
            story.recordWordLearned();

            // Check for streak milestones
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
                    // Complete chapter in story system
                    const wasPerfect = lives === 3;
                    story.completeChapter(currentLevel, wasPerfect);
                    if (wasPerfect && lives === 1) {
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

            // Reset streak on wrong answer
            setCurrentStreak(0);

            setLives(l => {
                const newLives = l - 1;
                if (newLives <= 0) {
                    setGameState('gameOver');
                    return 0;
                }
                // Show low lives warning
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

            // Get contextual dialogue from story system
            const wrongDialogue = story.getDialogue('wrong');
            setFeedback({ type: 'error', message: wrongDialogue?.text || `${t('לא נורא, נסה שוב!', 'לא נורא, נסי שוב!')} 💪` });
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

    const currentWord = activeWords[currentWordIndex];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative" dir="rtl">
            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity }} className="absolute -top-20 -right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity }} className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto p-4">
                {/* TOP BAR */}
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

                <AnimatePresence mode="wait">
                    {gameState === 'start' && (
                        <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6">
                            <h1 className="text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Word Adventure</h1>
                            <h2 className="text-xl font-bold text-purple-400 mb-8">{t('שלום', 'שלום')} {userProfile.name}! {t('מוכן להרפתקה?', 'מוכנה להרפתקה?')}</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-10">
                                <div className="md:col-span-2">
                                    <DailyQuests progress={dailyStats} gender={userProfile.gender} />
                                </div>

                                <button onClick={() => startLevel('review')} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all">
                                    <div className="text-4xl mb-2">🧠</div>
                                    <div className="text-2xl font-bold">חזרה חכמה</div>
                                    <div className="text-sm opacity-90">הדרך הכי טובה לזכור!</div>
                                </button>
                                <button onClick={() => setGameState('map')} className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all">
                                    <div className="text-4xl mb-2">🗺️</div>
                                    <div className="text-2xl font-bold">מפת עולמות</div>
                                    <div className="text-sm opacity-90">{t('שחק שלבים חדשים', 'שחקי שלבים חדשים')}</div>
                                </button>
                                <button onClick={() => setGameState('memory')} className="bg-gradient-to-r from-purple-400 to-pink-500 text-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all">
                                    <div className="text-4xl mb-2">🃏</div>
                                    <div className="text-2xl font-bold">משחק הזיכרון</div>
                                    <div className="text-sm opacity-90">אימון למוח</div>
                                </button>
                                <button onClick={() => setGameState('store')} className="bg-white text-slate-700 border-2 border-slate-100 p-6 rounded-3xl shadow-lg hover:bg-slate-50 transition-all">
                                    <div className="text-4xl mb-2">🛍️</div>
                                    <div className="text-2xl font-bold">חנות ההפתעות</div>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {gameState === 'store' && (
                        <motion.div key="store" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                            <Store coins={score} inventory={inventory} onBuy={handleBuy} onClose={() => setGameState('start')} />
                        </motion.div>
                    )}

                    {gameState === 'inventory' && (
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                            <Inventory inventory={inventory} onClose={handleInventoryClose} gender={userProfile.gender} />
                        </motion.div>
                    )}

                    {gameState === 'petWalking' && (
                        <motion.div key="petWalking" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 z-50 bg-white">
                            <PetWalkingGame
                                pet={activePet}
                                avatar={avatar}
                                onExit={() => setGameState('map')}
                                onComplete={(earnedScore) => {
                                    setScore(s => s + earnedScore);
                                    updateDailyStats(0, earnedScore, 0);
                                    setGameState('map');
                                }}
                            />
                        </motion.div>
                    )}

                    {gameState === 'map' && (
                        <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4">
                            <h2 className="text-3xl font-bold text-center mb-4">{t('בחר עולם', 'בחרי עולם')}</h2>
                            <p className="text-center text-purple-600 mb-2">
                                📚 {story.progress.totalWordsLearned} מילים נלמדו
                            </p>
                            {['easy', 'medium', 'hard', 'expert', 'master'].map(lvl => {
                                const chapter = CHAPTERS[lvl];
                                const isUnlocked = isChapterUnlocked(lvl, story.progress.totalWordsLearned);
                                const isCompleted = story.progress.completedChapters.includes(lvl);

                                return (
                                    <button
                                        key={lvl}
                                        onClick={() => isUnlocked && startLevel(lvl)}
                                        disabled={!isUnlocked}
                                        className={`relative bg-gradient-to-r ${chapter.color} text-white p-6 rounded-2xl text-right shadow-lg flex justify-between items-center transition-all ${
                                            !isUnlocked ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-[1.02] hover:shadow-xl'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="text-5xl">
                                                {isCompleted ? '✅' : chapter.character}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold">{chapter.title}</h3>
                                                <p className="text-sm opacity-80">
                                                    {chapter.npc?.name && `עם ${chapter.npc.name}`}
                                                </p>
                                                {!isUnlocked && (
                                                    <p className="text-xs mt-1 flex items-center gap-1">
                                                        <Lock size={12} />
                                                        צריך {chapter.unlockRequirement} מילים
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {isUnlocked ? (
                                            <ArrowRight size={24} />
                                        ) : (
                                            <Lock size={24} />
                                        )}
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}

                    {gameState === 'playing' && currentWord && (
                        <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto">
                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3].map(i => <Heart key={i} fill={i <= lives ? "#ef4444" : "none"} className={i <= lives ? "text-red-500" : "text-slate-300"} />)}
                            </div>

                            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center border-b-8 border-purple-100 relative overflow-hidden">
                                <span className="text-slate-400 text-sm tracking-widest font-bold">{t('תרגם', 'תרגמי')} את ה{currentWord.type === 'sentence' ? 'משפט' : 'מילה'}</span>
                                <h2 className="text-6xl font-black text-slate-800 my-6 leading-tight">{currentWord.hebrew}</h2>

                                <div className="flex flex-wrap justify-center gap-3 mb-8 min-h-[60px]" dir="ltr">
                                    {getScrambledContent(currentWord).map((fragment, idx) => (
                                        <span key={idx} className={`flex items-center justify-center bg-yellow-50 border-2 border-yellow-200 rounded-xl font-bold text-yellow-700 font-mono shadow-sm ${currentWord.type === 'sentence' ? 'px-4 py-2 text-xl' : 'w-12 h-14 text-2xl'}`}>
                                            {fragment}
                                        </span>
                                    ))}
                                </div>

                                <div className="relative mb-6">
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                                        placeholder={currentWord.type === 'sentence' ? t("כתוב את המשפט...", "כתבי את המשפט...") : t("כתוב כאן...", "כתבי כאן...")}
                                        className={`w-full text-center font-mono p-4 rounded-xl border-4 border-slate-100 focus:border-purple-400 focus:outline-none ${currentWord.type === 'sentence' ? 'text-xl' : 'text-3xl'}`}
                                        dir="ltr"
                                        autoFocus
                                    />
                                    {isSupported && (
                                        <button
                                            onClick={isListening ? stopListening : startListening}
                                            className={`absolute top-2 right-2 p-3 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                        >
                                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                        </button>
                                    )}
                                </div>

                                <button onClick={handleCheck} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-purple-700 shadow-lg transition-transform active:scale-95">
                                    בדיקה
                                </button>

                                <AnimatePresence>
                                    {feedback && (
                                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className={`absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-md z-20`}>
                                            <div className={`text-center font-bold text-3xl ${feedback.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                                {feedback.message}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                    {(gameState === 'levelComplete' || gameState === 'gameOver') && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 bg-white rounded-3xl shadow-xl">
                            <div className="text-8xl mb-4">{gameState === 'levelComplete' ? '🏆' : '😢'}</div>
                            <h2 className="text-4xl font-bold mb-6">{gameState === 'levelComplete' ? 'Woohoo!' : 'אוי לא!'}</h2>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => setGameState('start')} className="px-6 py-3 bg-slate-100 rounded-xl font-bold">לתפריט</button>
                                <button onClick={() => startLevel('review')} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold">{t('שחק שוב', 'שחקי שוב')}</button>
                            </div>
                        </motion.div>
                    )}

                    {gameState === 'memory' && (
                        <MemoryGame
                            words={activeWords.length > 0 ? activeWords : initialWordData.slice(0, 12)}
                            onComplete={(pts) => { setScore(s => s + pts); setGameState('start'); }}
                            onExit={() => setGameState('start')}
                        />
                    )}

                    {gameState === 'avatar' && (
                        <div className="bg-white rounded-3xl p-6 shadow-xl">
                            <h2 className="text-2xl font-bold text-center mb-6">{t('בחר דמות', 'בחרי דמות')}</h2>
                            <AvatarSelect currentAvatar={avatar} onSelect={(icon) => { setAvatar(icon); localStorage.setItem(STORAGE_KEYS.AVATAR, icon); setGameState('start'); }} />
                            <button onClick={() => setGameState('start')} className="w-full mt-4 py-3 bg-slate-100 rounded-xl font-bold">חזרה</button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Story Intro - First time only */}
            {showStoryIntro && userProfile && (
                <StoryIntro
                    gender={userProfile.gender}
                    onComplete={() => {
                        setShowStoryIntro(false);
                        safeSetJSON('hasSeenStoryIntro', true);
                    }}
                />
            )}

            {/* Story Path Choice - If not chosen yet */}
            {!story.progress.storyPath && !showStoryIntro && userProfile && (
                <StoryPathChoice
                    options={story.getStoryPathOptions()}
                    onChoose={story.chooseStoryPath}
                    playerName={userProfile.name}
                    gender={userProfile.gender}
                />
            )}

            {/* Story Dialogue Overlay */}
            <StoryDialogue
                dialogue={story.currentDialogue}
                onDismiss={story.dismissDialogue}
            />

            {/* Pet Evolution Notification */}
            <PetEvolution
                evolution={story.evolutionNotification}
                onDismiss={story.dismissEvolution}
            />
        </div>
    );
}
