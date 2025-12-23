import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Volume2, VolumeX, Heart, Trophy, Star, ArrowRight, Zap, RefreshCw, Home, Map, Smile, Gamepad2, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import AvatarSelect from './components/AvatarSelect';
import Leaderboard from './components/Leaderboard';
import MemoryGame from './components/MemoryGame';

const wordData = {
    easy: [
        { word: 'CAT', hint: '🐱 חיה שאוהבת חלב', hebrew: 'חתול' },
        { word: 'DOG', hint: '🐕 החבר הכי טוב של האדם', hebrew: 'כלב' },
        { word: 'SUN', hint: '☀️ מאיר בשמיים ביום', hebrew: 'שמש' },
        { word: 'BOOK', hint: '📚 קוראים אותו', hebrew: 'ספר' },
        { word: 'FISH', hint: '🐟 שוחה במים', hebrew: 'דג' },
        { word: 'BIRD', hint: '🐦 עפה בשמיים', hebrew: 'ציפור' },
        { word: 'TREE', hint: '🌳 צומח ביער', hebrew: 'עץ' },
        { word: 'STAR', hint: '⭐ נוצץ בלילה', hebrew: 'כוכב' },
        { word: 'MILK', hint: '🥛 שותים עם עוגיות', hebrew: 'חלב' },
        { word: 'MOON', hint: '🌙 מאיר בלילה', hebrew: 'ירח' },
        { word: 'FIRE', hint: '🔥 חם ומסוכן', hebrew: 'אש' },
        { word: 'LOVE', hint: '❤️ רגש חזק וטוב', hebrew: 'אהבה' },
    ],
    medium: [
        { word: 'HAPPY', hint: '😊 מרגישים ככה כשמקבלים מתנה', hebrew: 'שמח' },
        { word: 'WATER', hint: '💧 שותים אותו', hebrew: 'מים' },
        { word: 'FLOWER', hint: '🌸 צומח בגינה ויפה', hebrew: 'פרח' },
        { word: 'SCHOOL', hint: '🏫 הולכים לשם ללמוד', hebrew: 'בית ספר' },
        { word: 'FRIEND', hint: '👫 משחקים איתו', hebrew: 'חבר' },
        { word: 'CANDY', hint: '🍬 מתוק וטעים', hebrew: 'סוכריה' },
        { word: 'RABBIT', hint: '🐰 קופץ ואוכל גזר', hebrew: 'ארנב' },
        { word: 'PURPLE', hint: '💜 צבע של ענבים', hebrew: 'סגול' },
        { word: 'SUMMER', hint: '🏖️ העונה החמה בשנה', hebrew: 'קיץ' },
        { word: 'WINTER', hint: '❄️ העונה הקרה ויורד גשם', hebrew: 'חורף' },
        { word: 'FAMILY', hint: '👨‍👩‍👧‍👦 אמא, אבא, אחים ואחיות', hebrew: 'משפחה' },
        { word: 'ORANGE', hint: '🍊 פרי הדר כתום', hebrew: 'תפוז' },
    ],
    hard: [
        { word: 'BUTTERFLY', hint: '🦋 חרק יפה עם כנפיים צבעוניות', hebrew: 'פרפר' },
        { word: 'ADVENTURE', hint: '🗺️ מסע מרגש עם הרפתקאות', hebrew: 'הרפתקה' },
        { word: 'TREASURE', hint: '💎 משהו יקר שמוצאים', hebrew: 'אוצר' },
        { word: 'RAINBOW', hint: '🌈 צבעים בשמיים אחרי גשם', hebrew: 'קשת' },
        { word: 'ELEPHANT', hint: '🐘 חיה גדולה עם חדק', hebrew: 'פיל' },
        { word: 'PRINCESS', hint: '👸 בת של מלך ומלכה', hebrew: 'נסיכה' },
        { word: 'CHOCOLATE', hint: '🍫 חום, מתוק וטעים מאוד', hebrew: 'שוקולד' },
        { word: 'BEAUTIFUL', hint: '✨ כשמשהו נראה מאוד יפה', hebrew: 'יפהפה' },
        { word: 'MOUNTAIN', hint: '🏔️ גבעה גדולה וגבוהה מאוד', hebrew: 'הר' },
        { word: 'DANGEROUS', hint: '⚠️ לא בטוח, צריך להיזהר', hebrew: 'מסוכן' },
        { word: 'DINOSAUR', hint: '🦕 חיה ענקית מהעבר', hebrew: 'דינוזאור' },
        { word: 'UNIVERSE', hint: '🌌 כל הכוכבים והחלל', hebrew: 'יקום' },
    ],
    expert: [
        { word: 'MYSTERIOUS', hint: '🕵️‍♀️ משהו לא ברור ומסקרן', hebrew: 'מסתורי' },
        { word: 'EXTRAORDINARY', hint: '🌟 משהו מאוד מיוחד ולא רגיל', hebrew: 'יוצא דופן' },
        { word: 'CELEBRATION', hint: '🎉 מסיבה ושמחה גדולה', hebrew: 'חגיגה' },
        { word: 'CHALLENGE', hint: '⛰️ משהו שקשה להצליח בו', hebrew: 'אתגר' },
        { word: 'IMAGINATION', hint: '💭 היכולת לחשוב על דברים שלא קיימים', hebrew: 'דמיון' },
        { word: 'KNOWLEDGE', hint: '🧠 מה שיודעים אחרי שלומדים', hebrew: 'ידע' },
        { word: 'FRIENDSHIP', hint: '🤝 הקשר הטוב בין חברים', hebrew: 'חברות' },
        { word: 'HAPPINESS', hint: '😃 הרגשה טובה ושמחה בלב', hebrew: 'אושר' },
    ]
};

const storyChapters = {
    easy: {
        title: 'הממלכה הקסומה',
        level: 1,
        intro: 'ברוכה הבאה לממלכה! עזרי ללונה לאסוף מילים פשוטות כדי להחזיר את הקסם. ✨',
        success: 'מדהים! אספת את המילים הפשוטות! הספרים מתחילים לזהור! ✨',
        character: '👸',
        color: 'from-green-400 to-emerald-600',
        bg: 'bg-green-50',
        accent: 'text-green-600'
    },
    medium: {
        title: 'היער הקסום',
        level: 2,
        intro: 'המסע ממשיך ליער. המילים כאן קצת יותר מסובכות! החיות צריכות עזרה. 🌲',
        success: 'וואו! היער חזר לחיים! החיות שמחות ורוקדות! 🎉',
        character: '🧚',
        color: 'from-blue-400 to-indigo-600',
        bg: 'bg-blue-50',
        accent: 'text-blue-600'
    },
    hard: {
        title: 'מגדל הקוסם',
        level: 3,
        intro: 'הגענו למגדל הגבוה! מילים חזקות וקשות מחכות לך כאן, גיבורה אמיתית! 🏰',
        success: 'את גיבורה! הממלכה חופשית והקסם חזר! תודה רבה! 👑',
        character: '🧙',
        color: 'from-purple-500 to-fuchsia-600',
        bg: 'bg-purple-50',
        accent: 'text-purple-600'
    },
    expert: {
        title: 'היקום האינסופי',
        level: 4,
        intro: 'רק הטובים ביותר מגיעים לכאן. גלי את סודות היקום עם מילים של אלופים! 🌌',
        success: 'אגדה! כבשת את היקום כולו! אין מילה שאת לא מכירה! 🏆',
        character: '👽',
        color: 'from-rose-500 to-pink-600',
        bg: 'bg-rose-50',
        accent: 'text-rose-600'
    }
};

export default function WordAdventure() {
    const [gameState, setGameState] = useState('start'); // start, map, story, playing, levelComplete, gameOver, memory, avatar
    const [difficulty, setDifficulty] = useState(null);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [score, setScore] = useState(0);
    const [stars, setStars] = useState(0);
    const [lives, setLives] = useState(3);
    const [streak, setStreak] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [completedLevels, setCompletedLevels] = useState([]);
    const [shuffledWords, setShuffledWords] = useState([]);
    const [audioEnabled, setAudioEnabled] = useState(true);

    // Phase 3 State
    const [avatar, setAvatar] = useState(() => localStorage.getItem('avatar') || '👸');
    const [highScores, setHighScores] = useState(() => JSON.parse(localStorage.getItem('highScores')) || []);

    const saveScore = (newPoints) => {
        const newScore = { points: newPoints, date: new Date().toLocaleDateString('he-IL'), avatar };
        const updatedScores = [...highScores, newScore].sort((a, b) => b.points - a.points).slice(0, 10);
        setHighScores(updatedScores);
        localStorage.setItem('highScores', JSON.stringify(updatedScores));
    };

    const handleAvatarSelect = (icon) => {
        setAvatar(icon);
        localStorage.setItem('avatar', icon);
        setGameState('start');
    };

    const playSound = (type) => {
        if (!audioEnabled) return;
        // Real implementation would go here
    };

    const speakWord = (text) => {
        if (!audioEnabled || !('speechSynthesis' in window)) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const startLevel = (level) => {
        setDifficulty(level);
        setShuffledWords(shuffleArray(wordData[level]).slice(0, 5));
        setCurrentWordIndex(0);
        setLives(3);
        setStreak(0);
        setUserInput('');
        setShowHint(false);
        setFeedback(null);
        setGameState('story');
        playSound('start');
    };

    const currentWord = shuffledWords[currentWordIndex];

    const scrambleWord = (word) => {
        return shuffleArray(word.split('')).join('');
    };

    const checkAnswer = () => {
        if (userInput.trim().toUpperCase() === currentWord.word) {
            const earnedStars = showHint ? 1 : 2;
            const streakBonus = streak * 10;
            setStars(prev => prev + earnedStars);
            setScore(prev => prev + (showHint ? 50 : 100) + streakBonus);
            setStreak(prev => prev + 1);

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            setFeedback({ type: 'success', message: `מעולה! 🎉 +${earnedStars} ⭐` });
            playSound('success');

            setTimeout(() => {
                if (currentWordIndex < shuffledWords.length - 1) {
                    setCurrentWordIndex(prev => prev + 1);
                    setUserInput('');
                    setShowHint(false);
                    setFeedback(null);
                } else {
                    setCompletedLevels(prev => Array.from(new Set([...prev, difficulty])));
                    setGameState('levelComplete');
                    playSound('levelComplete');
                    saveScore(score + (showHint ? 50 : 100)); // Save final score
                }
            }, 1500);
        } else {
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    setGameState('gameOver');
                    playSound('gameOver');
                }
                return newLives;
            });
            setStreak(0);
            setFeedback({ type: 'error', message: 'לא נורא, נסי שוב! 💪' });
            playSound('error');
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    };

    const getLevelStatus = (level) => {
        if (completedLevels.includes(level)) return 'completed';
        const levels = ['easy', 'medium', 'hard', 'expert'];
        const levelIndex = levels.indexOf(level);
        if (levelIndex === 0) return 'available';
        if (completedLevels.includes(levels[levelIndex - 1])) return 'available';
        return 'locked';
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden relative" dir="rtl">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-30">
                <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 left-10 text-9xl">☁️</motion.div>
                <motion.div animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute top-40 right-20 text-8xl">🎈</motion.div>
                <motion.div animate={{ x: [0, 50, 0], y: [0, 10, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-10 left-1/4 text-8xl">🌟</motion.div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8">

                {/* Header / Top Bar */}
                <div className="flex justify-between items-center mb-8 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-purple-100">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setGameState('start')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <Home className="text-purple-600" size={28} />
                        </button>
                        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 hidden md:block">
                            הרפתקת המילים
                        </h1>
                    </div>

                    <div className="flex gap-4 items-center">
                        <button onClick={() => setGameState('avatar')} className="text-3xl hover:scale-110 transition-transform" title="בחרי דמות">
                            {avatar}
                        </button>
                        <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full text-yellow-700 font-bold">
                            <Trophy size={20} />
                            <span>{score}</span>
                        </div>
                        <button onClick={() => setAudioEnabled(!audioEnabled)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-purple-600">
                            {audioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">

                    {/* START SCREEN */}
                    {gameState === 'start' && (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center py-8"
                        >
                            <motion.div
                                initial={{ y: -20 }} animate={{ y: 0 }}
                                className="inline-block text-8xl mb-6 filter drop-shadow-xl"
                            >
                                {avatar}
                            </motion.div>
                            <h1 className="text-6xl font-black text-slate-800 mb-6 tracking-tight">
                                הרפתקת <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">המילים</span>
                            </h1>

                            <div className="flex flex-col md:flex-row justify-center gap-6 mb-12">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setGameState('map')}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-bold px-8 py-6 rounded-3xl shadow-xl flex items-center justify-center gap-4"
                                >
                                    <BookOpen size={32} />
                                    <span>סיפור המילים</span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setGameState('memory')}
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-2xl font-bold px-8 py-6 rounded-3xl shadow-xl flex items-center justify-center gap-4"
                                >
                                    <Gamepad2 size={32} />
                                    <span>משחק הזיכרון</span>
                                </motion.button>
                            </div>

                            <div className="max-w-md mx-auto">
                                <Leaderboard scores={highScores} />
                            </div>
                        </motion.div>
                    )}

                    {/* AVATAR SELECT */}
                    {gameState === 'avatar' && (
                        <motion.div
                            key="avatar"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-slate-800">בחרי את הגיבורה שלך!</h2>
                            </div>
                            <AvatarSelect currentAvatar={avatar} onSelect={handleAvatarSelect} />
                            <div className="text-center mt-8">
                                <button onClick={() => setGameState('start')} className="text-slate-500 font-bold hover:text-slate-800">ביטול</button>
                            </div>
                        </motion.div>
                    )}

                    {/* MEMORY GAME */}
                    {gameState === 'memory' && (
                        <motion.div
                            key="memory"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-blue-600">משחק הזיכרון ✨</h2>
                                <p className="text-slate-500">התאימי בין המילה בעברית למילה באנגלית!</p>
                            </div>
                            <MemoryGame
                                words={[...wordData.easy, ...wordData.medium, ...wordData.hard]}
                                onComplete={(points) => {
                                    setScore(prev => prev + points);
                                    saveScore(score + points);
                                    setFeedback({ type: 'success', message: `ניצחת! +${points} נקודות!` });
                                    setTimeout(() => setGameState('start'), 3000);
                                }}
                                onExit={() => setGameState('start')}
                            />
                        </motion.div>
                    )}

                    {/* MAP / LEVEL SELECT */}
                    {gameState === 'map' && (
                        <motion.div
                            key="map"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <div className="md:col-span-2 text-center mb-6">
                                <h2 className="text-4xl font-bold text-slate-800">בחרי את ההרפתקה שלך</h2>
                            </div>

                            {['easy', 'medium', 'hard', 'expert'].map((level) => {
                                const status = getLevelStatus(level);
                                const chapter = storyChapters[level];

                                return (
                                    <motion.button
                                        key={level}
                                        whileHover={status !== 'locked' ? { scale: 1.02, y: -5 } : {}}
                                        whileTap={status !== 'locked' ? { scale: 0.98 } : {}}
                                        onClick={() => status !== 'locked' && startLevel(level)}
                                        disabled={status === 'locked'}
                                        className={`relative p-6 rounded-3xl text-right transition-all overflow-hidden ${status === 'locked' ? 'bg-slate-200 cursor-not-allowed opacity-70' : 'bg-white shadow-xl hover:shadow-2xl cursor-pointer'
                                            }`}
                                    >
                                        <div className={`absolute top-0 right-0 w-2 h-full bg-gradient-to-b ${chapter.color}`} />

                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-4xl bg-slate-50 p-3 rounded-2xl">{chapter.character}</span>
                                            {status === 'completed' && <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">הושלם <Zap size={14} fill="currentColor" /></div>}
                                            {status === 'locked' && <div className="bg-slate-300 text-slate-600 px-3 py-1 rounded-full text-sm font-bold">נעול 🔒</div>}
                                        </div>

                                        <h3 className={`text-2xl font-bold mb-2 ${chapter.accent}`}>{chapter.title}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed pl-4">{chapter.intro}</p>

                                        {status !== 'locked' && (
                                            <div className="mt-4 flex items-center text-sm font-bold text-slate-400 gap-1">
                                                לחצי להתחלה <ArrowRight size={16} />
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* STORY INTRO */}
                    {gameState === 'story' && (
                        <motion.div
                            key="story"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.1, opacity: 0 }}
                            className="max-w-xl mx-auto bg-white rounded-3xl p-10 shadow-2xl text-center border-4 border-white"
                        >
                            <div className="text-8xl mb-6 animate-bounce">{storyChapters[difficulty].character}</div>
                            <h2 className={`text-3xl font-bold mb-6 ${storyChapters[difficulty].accent}`}>
                                {storyChapters[difficulty].title}
                            </h2>
                            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                                {storyChapters[difficulty].intro}
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setGameState('playing')}
                                className={`bg-gradient-to-r ${storyChapters[difficulty].color} text-white px-10 py-4 rounded-full text-xl font-bold shadow-lg`}
                            >
                                מוכנה? בואי נתחיל! 🚀
                            </motion.button>
                        </motion.div>
                    )}

                    {/* GAMEPLAY */}
                    {gameState === 'playing' && currentWord && (
                        <motion.div
                            key="play"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full max-w-2xl mx-auto"
                        >
                            {/* Stats Bar */}
                            <div className="flex justify-between items-center mb-6 px-4">
                                <div className="flex gap-2">
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={false}
                                            animate={{ scale: i < lives ? 1 : 0.8, opacity: i < lives ? 1 : 0.3 }}
                                        >
                                            <Heart size={32} fill={i < lives ? "#ef4444" : "none"} className={i < lives ? "text-red-500" : "text-slate-300"} />
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="bg-white px-6 py-2 rounded-full shadow-sm font-bold text-purple-600 border border-purple-100">
                                    {currentWordIndex + 1} / {shuffledWords.length}
                                </div>
                                <div className="flex items-center gap-1 text-yellow-500 font-bold text-xl">
                                    <Star fill="currentColor" /> {stars}
                                </div>
                            </div>

                            {/* Main Card */}
                            <div className="bg-white rounded-3xl shadow-xl overflow-hidden relative">
                                <div className={`h-2 bg-gradient-to-r ${storyChapters[difficulty].color}`} />

                                <div className="p-8 text-center">
                                    <div className="absolute top-4 right-4">
                                        <button onClick={() => speakWord(currentWord.word)} className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                                            <Volume2 size={24} />
                                        </button>
                                    </div>

                                    <div className="mb-8">
                                        <span className="text-sm tracking-wider text-slate-400 uppercase font-bold mb-2 block">תרגמי את המילה</span>
                                        <h2 className="text-5xl font-black text-slate-800 mb-2">{currentWord.hebrew}</h2>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-3 mb-8 min-h-[60px]" dir="ltr">
                                        {scrambleWord(currentWord.word).split('').map((char, idx) => (
                                            <span key={idx} className="w-12 h-14 flex items-center justify-center bg-yellow-50 border-2 border-yellow-200 rounded-xl text-2xl font-bold text-yellow-700 font-mono shadow-sm">
                                                {char}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="relative mb-8">
                                        <input
                                            type="text"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                                            onKeyPress={handleKeyPress}
                                            placeholder="הקלידי כאן באנגלית..."
                                            className="w-full text-center text-3xl p-5 rounded-2xl border-4 border-slate-100 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all font-mono tracking-widest uppercase placeholder:normal-case placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-300"
                                            dir="ltr"
                                            autoFocus
                                        />
                                        {showHint && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-blue-50 text-blue-700 p-3 rounded-xl mt-3 text-lg"
                                            >
                                                💡 רמז: {currentWord.hint}
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={() => setShowHint(true)}
                                            disabled={showHint}
                                            className={`px-6 py-4 rounded-xl font-bold transition-all flex-1 ${showHint ? 'bg-gray-100 text-gray-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            רמז (-1 ⭐)
                                        </button>
                                        <button
                                            onClick={checkAnswer}
                                            className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all flex-[2] bg-gradient-to-r ${storyChapters[difficulty].color}`}
                                        >
                                            בדיקה
                                        </button>
                                    </div>

                                </div>

                                {/* Feedback Overlay */}
                                <AnimatePresence>
                                    {feedback && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={`absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-20`}
                                        >
                                            <div className={`text-center p-8 rounded-3xl shadow-2xl border-4 ${feedback.type === 'success' ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                                                <div className="text-6xl mb-4">{feedback.type === 'success' ? '🎉' : '💪'}</div>
                                                <h3 className={`text-3xl font-bold mb-2 ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {feedback.message}
                                                </h3>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                    {/* LEVEL COMPLETE */}
                    {gameState === 'levelComplete' && (
                        <motion.div
                            key="levelComplete"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-12 bg-white rounded-3xl shadow-xl max-w-xl mx-auto"
                        >
                            <div className="text-8xl mb-6">🏆</div>
                            <h2 className="text-4xl font-black text-purple-600 mb-4">כל הכבוד!</h2>
                            <div className="text-xl text-slate-600 mb-8 px-8">{storyChapters[difficulty].success}</div>

                            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                                <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
                                    <div className="text-3xl font-bold text-yellow-600">{score}</div>
                                    <div className="text-sm text-yellow-500 uppercase font-bold">ניקוד</div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                                    <div className="text-3xl font-bold text-purple-600">{stars}</div>
                                    <div className="text-sm text-purple-500 uppercase font-bold">כוכבים</div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 px-8">
                                <button onClick={() => setGameState('map')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-xl font-bold transition-colors">
                                    חזרה למפה
                                </button>
                                <button onClick={() => startLevel(difficulty)} className="bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold shadow-lg transition-colors flex items-center justify-center gap-2">
                                    <RefreshCw size={20} /> שחקי שוב
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* GAME OVER */}
                    {gameState === 'gameOver' && (
                        <motion.div
                            key="gameOver"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-12 bg-white rounded-3xl shadow-xl max-w-xl mx-auto border-4 border-red-50"
                        >
                            <div className="text-8xl mb-6">😢</div>
                            <h2 className="text-4xl font-black text-red-500 mb-4">נגמרו הלבבות...</h2>
                            <p className="text-xl text-slate-600 mb-8 px-8">
                                לא נורא! גם גיבורים צריכים לנוח לפעמים.<br />בואי ננסה שוב!
                            </p>

                            <div className="flex flex-col gap-3 px-8">
                                <button onClick={() => startLevel(difficulty)} className="bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold shadow-lg transition-colors flex items-center justify-center gap-2">
                                    <RefreshCw size={20} /> נסי שוב
                                </button>
                                <button onClick={() => setGameState('map')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-xl font-bold transition-colors">
                                    חזרה למפה
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
