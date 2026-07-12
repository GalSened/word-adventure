import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { hapticFeedback } from '../utils/mobile';

// --- VISUAL ASSETS ---
const FLORA = ['🌳', '🌲', '🌿', '🌾', '🌷', '🌻', '🎍'];
const FAUNA = ['🦋', '🐦', '🐝'];
const SKY_ELEMENTS = ['☁️', '🌥️', '🦅', '✈️'];

const THEMES = [
    {
        name: 'Royal Gardens',
        sky: 'from-sky-300 via-sky-200 to-blue-100',
        ground: 'from-emerald-500 to-emerald-700',
        accent: 'from-pink-300 to-purple-300',
        filter: 'contrast(1.1) saturate(1.2)'
    },
    {
        name: 'Golden Sunset',
        sky: 'from-orange-400 via-red-300 to-yellow-200',
        ground: 'from-amber-700 to-orange-900',
        accent: 'from-orange-400 to-red-500',
        filter: 'sepia(0.2) contrast(1.2)'
    },
    {
        name: 'Midnight Magic',
        sky: 'from-indigo-950 via-purple-900 to-slate-900',
        ground: 'from-slate-800 to-indigo-950',
        accent: 'from-blue-500 to-indigo-500',
        filter: 'brightness(0.9) contrast(1.3)'
    }
];

// Pet emoji representations with walking animation
const PET_EMOJIS = {
    dog: { idle: '🐕', walk: ['🐕', '🐕‍🦺', '🐕'], sniff: '🐶' },
    unicorn: { idle: '🦄', walk: ['🦄', '🐴', '🦄'], sniff: '🦄' },
    dragon: { idle: '🐉', walk: ['🐉', '🐲', '🐉'], sniff: '🐉' }
};

// Avatar emoji with walking animation
const AVATAR_WALK_FRAMES = {
    girl: ['👸', '🚶‍♀️', '👸'],
    boy: ['🤴', '🚶‍♂️', '🤴']
};

export default function PetWalkingGame({
    pet = { icon: '🐕', name: 'כלבלב' },
    userProfile,
    onExit,
    onComplete
}) {
    const isGirl = userProfile?.gender === 'girl';

    // Determine pet type from icon
    const petType = pet.icon.includes('🐕') ? 'dog'
                  : pet.icon.includes('🦄') ? 'unicorn'
                  : pet.icon.includes('🐉') ? 'dragon'
                  : 'dog';

    // --- STATE ---
    const [gameState, setGameState] = useState('walking');
    const [progress, setProgress] = useState(0);
    const [score, setScore] = useState(0);
    const [themeIndex, setThemeIndex] = useState(0);
    const [walkFrame, setWalkFrame] = useState(0);

    // Scene scroll offset
    const sceneOffsetRef = useRef(0);
    const [, setSceneRenderTrigger] = useState(0);

    // Positions (relative to viewport)
    const petPosRef = useRef({ x: 400, y: 0, bobOffset: 0 });
    const avatarPosRef = useRef({ x: 100, y: 0 });

    // Question Logic
    const [currentWord, setCurrentWord] = useState(null);
    const [options, setOptions] = useState([]);

    // Animation frame reference
    const animationFrameRef = useRef(null);
    const lastFrameTimeRef = useRef(performance.now());

    // Loop-owned progress + one-shot completion guard. State updaters must be
    // pure (React StrictMode invokes them twice — onComplete inside an updater
    // double-awarded the score in dev), so the loop mutates the ref and the
    // setState below only mirrors the computed value for rendering.
    const progressRef = useRef(0);
    const completedRef = useRef(false);

    // --- PROCEDURAL GENERATION ---
    const worldObjects = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            icon: Math.random() > 0.8
                ? FAUNA[Math.floor(Math.random() * FAUNA.length)]
                : FLORA[Math.floor(Math.random() * FLORA.length)],
            x: i * 150 + Math.random() * 50,
            y: Math.random() * 20,
            scale: 0.5 + Math.random() * 1.5,
            depth: Math.random()
        }));
    }, []);

    const clouds = useMemo(() => Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        icon: SKY_ELEMENTS[Math.floor(Math.random() * SKY_ELEMENTS.length)],
        x: i * 600,
        y: 10 + Math.random() * 30,
        speed: 0.2 + Math.random() * 0.3
    })), []);

    // Advanced word bank
    const quests = useMemo(() => [
        { en: 'TREASURE', he: 'אוצר', icon: '💎' },
        { en: 'CASTLE', he: 'טירה', icon: '🏰' },
        { en: 'DRAGON', he: 'דרקון', icon: '🐉' },
        { en: 'MAGIC', he: 'קסם', icon: '✨' },
        { en: 'KINGDOM', he: 'ממלכה', icon: '👑' },
        { en: 'LIBRARY', he: 'ספרייה', icon: '📚' },
        { en: 'FOREST', he: 'יער', icon: '🌲' },
        { en: 'OCEAN', he: 'אוקיינוס', icon: '🌊' }
    ], []);

    const triggerFind = useCallback(() => {
        setGameState('sniffing');
        hapticFeedback('medium');

        setTimeout(() => {
            setGameState('found');
            const word = quests[Math.floor(Math.random() * quests.length)];
            setCurrentWord(word);
            const distractors = quests
                .filter(w => w.en !== word.en)
                .sort(() => 0.5 - Math.random())
                .slice(0, 2);
            setOptions([word, ...distractors].sort(() => 0.5 - Math.random()));
        }, 1200);
    }, [quests]);

    // --- OPTIMIZED GAME LOOP ---
    useEffect(() => {
        let isActive = true;
        let frameCount = 0;

        const animate = (currentTime) => {
            if (!isActive) return;

            lastFrameTimeRef.current = currentTime;

            if (gameState === 'walking') {
                // Scroll scene
                sceneOffsetRef.current += 6;

                // Pet "bouncing" animation (smooth sine wave)
                const petBobSpeed = 0.003;
                petPosRef.current.bobOffset = Math.sin(currentTime * petBobSpeed) * 15;

                // Pet horizontal sway (running ahead/catching up)
                const petSwaySpeed = 0.001;
                const petSwayAmount = 30;
                petPosRef.current.x = 400 + Math.sin(currentTime * petSwaySpeed) * petSwayAmount;

                // Update progress
                progressRef.current = Math.min(100, progressRef.current + 0.05);
                setProgress(progressRef.current);

                if (progressRef.current >= 100) {
                    isActive = false;
                    if (!completedRef.current) {
                        completedRef.current = true;
                        onComplete(score);
                    }
                    return;
                }

                // Random encounter (less frequent, more controlled)
                if (Math.random() < 0.003 && progressRef.current < 95 && progressRef.current > 5) {
                    triggerFind();
                }

                // Update walk animation frame (every 5 frames)
                frameCount++;
                if (frameCount % 5 === 0) {
                    setWalkFrame(prev => (prev + 1) % 3);
                }

                // Trigger re-render for smooth animation (throttled)
                if (frameCount % 2 === 0) {
                    setSceneRenderTrigger(prev => prev + 1);
                }
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            isActive = false;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [gameState, score, onComplete, triggerFind]);

    const handleAnswer = useCallback((selected) => {
        if (selected.en === currentWord.en) {
            setGameState('correct');
            setScore(s => s + 50);
            hapticFeedback('success');

            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FFFFFF']
            });

            setTimeout(() => {
                setGameState('walking');
                if (Math.random() > 0.6) {
                    setThemeIndex(prev => (prev + 1) % THEMES.length);
                }
            }, 2500);
        } else {
            setGameState('wrong');
            hapticFeedback('error');
            setTimeout(() => setGameState('found'), 1000);
        }
    }, [currentWord]);

    // --- LEASH PHYSICS (IMPROVED) ---
    const getLeashPath = useCallback(() => {
        const handX = avatarPosRef.current.x + 100;
        const handY = 520;

        const collarX = petPosRef.current.x + 40;
        const collarY = 580 + petPosRef.current.bobOffset;

        // Natural catenary curve (hanging rope)
        const distance = Math.abs(collarX - handX);
        const midX = (handX + collarX) / 2;
        const sag = distance * 0.4 + (gameState === 'walking' ? Math.sin(Date.now() / 300) * 8 : 15);
        const midY = Math.max(handY, collarY) + sag;

        return `M ${handX} ${handY} Q ${midX} ${midY} ${collarX} ${collarY}`;
    }, [gameState]);

    const currentTheme = THEMES[themeIndex];

    // Get current pet emoji based on state
    const getCurrentPetEmoji = () => {
        const petEmoji = PET_EMOJIS[petType];
        if (gameState === 'sniffing') return petEmoji.sniff;
        if (gameState === 'walking') return petEmoji.walk[walkFrame];
        return petEmoji.idle;
    };

    // Get current avatar emoji based on state
    const getCurrentAvatarEmoji = () => {
        const avatarFrames = AVATAR_WALK_FRAMES[isGirl ? 'girl' : 'boy'];
        if (gameState === 'walking') return avatarFrames[walkFrame];
        return isGirl ? '👸' : '🤴';
    };

    return (
        <div
            className="fixed inset-0 overflow-hidden font-sans select-none"
            style={{ filter: currentTheme.filter }}
            role="application"
            aria-label="Pet walking adventure game"
        >
            {/* Dynamic Sky */}
            <div className={`absolute inset-0 bg-gradient-to-b ${currentTheme.sky} transition-all duration-[3000ms]`} />

            {/* Clouds (optimized with transform) */}
            {clouds.map(c => {
                const x = (c.x - sceneOffsetRef.current * c.speed * 0.2) % window.innerWidth;
                const finalX = x < -200 ? x + window.innerWidth + 200 : x;
                return (
                    <div
                        key={c.id}
                        className="absolute will-change-transform"
                        style={{
                            transform: `translate3d(${finalX}px, ${c.y}%, 0)`,
                            fontSize: '5rem',
                            opacity: 0.6
                        }}
                        aria-hidden="true"
                    >
                        {c.icon}
                    </div>
                );
            })}

            {/* UI HUD */}
            <div className="absolute top-0 w-full p-6 z-50 flex justify-between items-start pointer-events-none">
                <button
                    onClick={onExit}
                    className="pointer-events-auto bg-white/20 backdrop-blur-md p-3 rounded-full border-2 border-white/50 text-white shadow-xl hover:scale-110 active:scale-95 transition-transform"
                    aria-label="Exit pet walking game"
                >
                    <ArrowLeft size={32} />
                </button>

                <div className="flex flex-col items-center">
                    <div
                        className="bg-black/30 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-white font-bold text-xl shadow-lg flex items-center gap-2"
                        role="status"
                        aria-label={`Score: ${score}`}
                    >
                        <Star className="text-yellow-400 fill-yellow-400" /> {score}
                    </div>
                    <div
                        className="w-64 h-3 bg-black/30 rounded-full mt-2 overflow-hidden border border-white/10"
                        role="progressbar"
                        aria-valuenow={Math.round(progress)}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label="Adventure progress"
                    >
                        <motion.div
                            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_10px_rgba(255,200,0,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                        />
                    </div>
                </div>
            </div>

            {/* Ground Layers (optimized) */}
            <div
                className="absolute bottom-0 w-[200%] h-[60vh] opacity-40 origin-bottom pointer-events-none will-change-transform"
                style={{
                    background: `linear-gradient(to top, ${currentTheme.ground.split(' ')[1]}, transparent)`,
                    transform: `translateX(${-((sceneOffsetRef.current * 0.2) % 50)}%) skewY(-2deg)`
                }}
                aria-hidden="true"
            />

            <div className={`absolute bottom-0 w-full h-[35vh] bg-gradient-to-t ${currentTheme.ground} origin-bottom shadow-[0_-20px_40px_rgba(0,0,0,0.2)]`} aria-hidden="true" />

            {/* Decor Objects (optimized with GPU acceleration) */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                {worldObjects.map(obj => {
                    const realX = obj.x - sceneOffsetRef.current * (obj.depth > 0.5 ? 1.2 : 0.8);
                    const wrapWidth = 3000;
                    const loopX = ((realX % wrapWidth) + wrapWidth) % wrapWidth - 200;

                    const isFront = obj.depth > 0.5;
                    const blur = isFront ? '0px' : '2px';
                    const opacity = isFront ? 1 : 0.7;

                    return (
                        <div
                            key={obj.id}
                            className="absolute bottom-[20vh] will-change-transform flex items-end justify-center"
                            style={{
                                transform: `translate3d(${loopX}px, ${obj.y}px, 0) scale(${obj.scale})`,
                                zIndex: isFront ? 30 : 10,
                                filter: `blur(${blur})`
                            }}
                        >
                            <span className="text-[8rem] leading-none drop-shadow-lg" style={{ opacity }}>
                                {obj.icon}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Characters & Action */}
            <div className="absolute inset-0 z-40 pointer-events-none">
                {/* SVG Leash (improved rendering) */}
                <svg className="absolute inset-0 w-full h-full overflow-visible drop-shadow-md z-50" aria-hidden="true">
                    <path
                        d={getLeashPath()}
                        fill="none"
                        stroke="#5D4037"
                        strokeWidth="6"
                        strokeLinecap="round"
                    />
                    <path
                        d={getLeashPath()}
                        fill="none"
                        stroke="#8D6E63"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="5,5"
                    />
                </svg>

                {/* Avatar Emoji with Animation */}
                <motion.div
                    className="absolute bottom-[25vh] z-40"
                    style={{
                        left: avatarPosRef.current.x,
                        fontSize: '8rem'
                    }}
                    animate={{
                        y: gameState === 'walking' ? [0, -5, 0] : 0
                    }}
                    transition={{
                        duration: 0.4,
                        repeat: gameState === 'walking' ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                    role="img"
                    aria-label="Your character"
                >
                    {getCurrentAvatarEmoji()}
                </motion.div>

                {/* Pet Emoji with Animation */}
                <motion.div
                    className="absolute bottom-[23vh] z-40"
                    style={{
                        left: petPosRef.current.x,
                        fontSize: '7rem'
                    }}
                    animate={{
                        y: gameState === 'walking' ? petPosRef.current.bobOffset : 0,
                        rotate: gameState === 'sniffing' ? [0, -5, 5, 0] : 0
                    }}
                    transition={{
                        y: { type: "spring", stiffness: 200, damping: 10 },
                        rotate: { duration: 0.5, repeat: gameState === 'sniffing' ? Infinity : 0 }
                    }}
                    role="img"
                    aria-label={pet.name}
                >
                    {getCurrentPetEmoji()}
                    {gameState === 'sniffing' && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute -top-12 left-8 text-5xl filter drop-shadow-lg"
                        >
                            🔍
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Interaction Layer (Questions) */}
            <AnimatePresence>
                {(gameState === 'found' || gameState === 'correct' || gameState === 'wrong') && (
                    <motion.div
                        className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm pointer-events-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: 100, opacity: 0 }}
                            animate={{
                                scale: 1,
                                y: 0,
                                opacity: 1,
                                rotate: [0, -1, 1, 0]
                            }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="bg-white/95 backdrop-blur-xl rounded-[3rem] p-8 max-w-2xl w-full border-[6px] border-white shadow-2xl relative overflow-hidden"
                            role="dialog"
                            aria-labelledby="question-title"
                        >
                            <div className={`absolute top-0 left-0 w-full h-2 rounded-t-full bg-gradient-to-r ${currentTheme.accent}`} />

                            <div className="flex flex-col items-center">
                                <motion.div
                                    animate={{ y: [0, -20, 0] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                    className="text-[8rem] mb-4 filter drop-shadow-2xl"
                                    role="img"
                                    aria-label={currentWord?.he}
                                >
                                    {currentWord?.icon}
                                </motion.div>

                                <h2
                                    id="question-title"
                                    className="text-4xl font-black text-slate-800 mb-2 drop-shadow-sm text-center"
                                >
                                    {pet.name} מצא <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">{currentWord?.he}</span>!
                                </h2>
                                <p className="text-xl text-slate-500 font-bold mb-8">איך קוראים לזה באנגלית?</p>

                                <div className="grid grid-cols-1 gap-4 w-full" role="group" aria-label="Answer options">
                                    {options.map((opt) => (
                                        <motion.button
                                            key={opt.en}
                                            onClick={() => handleAnswer(opt)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`p-6 rounded-2xl text-3xl font-black transition-all shadow-lg border-b-8 pointer-events-auto ${
                                                gameState === 'correct' && opt.en === currentWord.en
                                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-700'
                                                    : gameState === 'wrong' && opt.en !== currentWord.en
                                                        ? 'bg-slate-200 text-slate-400 border-slate-300'
                                                        : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:text-purple-600'
                                            }`}
                                            disabled={gameState === 'correct' || gameState === 'wrong'}
                                            aria-label={`Option: ${opt.en}`}
                                        >
                                            {opt.en}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
