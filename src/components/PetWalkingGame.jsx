import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Volume2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import SpriteAnimator from './SpriteAnimator';

// Import sprite assets directly so Vite bundles them
// Assuming assets are in src/assets/sprites/
import girlWalkSprite from '../assets/sprites/girl_walk.png';
import boyWalkSprite from '../assets/sprites/boy_walk.png';
import dogWalkSprite from '../assets/sprites/dog_walk.png';

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

export default function PetWalkingGame({ pet = { icon: '🐕', name: 'כלבלב' }, avatar, userProfile, onExit, onComplete }) {
    // Determine Sprite based on Avatar
    // WordAdventure passes 'avatar' as emoji (e.g. 👸) and userProfile object.
    const isGirl = (userProfile?.gender === 'girl') || (avatar === '👸') || (userProfile?.avatar === '👸');
    const playerSprite = isGirl ? girlWalkSprite : boyWalkSprite;
    const petSprite = dogWalkSprite; // Helper for now, we can add more pets later

    // --- STATE ---
    const [gameState, setGameState] = useState('walking');
    const [progress, setProgress] = useState(0);
    const [score, setScore] = useState(0);
    const [themeIndex, setThemeIndex] = useState(0);

    // Physics & Interaction
    const [sceneOffset, setSceneOffset] = useState(0);

    // Positions (Relative to screen)
    const [petPos, setPetPos] = useState({ x: 400, y: 0 }); // Pet is ahead
    const [avatarPos, setAvatarPos] = useState({ x: 100, y: 0 });

    // Question Logic
    const [currentWord, setCurrentWord] = useState(null);
    const [options, setOptions] = useState([]);

    // --- PROCEDURAL GENERATION ---
    const worldObjects = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            icon: Math.random() > 0.8 ? FAUNA[Math.floor(Math.random() * FAUNA.length)] : FLORA[Math.floor(Math.random() * FLORA.length)],
            x: i * 150 + Math.random() * 50,
            y: Math.random() * 20,
            scale: 0.5 + Math.random() * 1.5,
            depth: Math.random() // Used for parallax speed
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

    // --- GAME LOOP ---
    useEffect(() => {
        let frameId;
        const animate = () => {
            if (gameState === 'walking') {
                setSceneOffset(prev => prev + 6); // Scroll speed

                // Pet "Running Ahead" Breath
                setPetPos(prev => ({
                    ...prev,
                    x: 400 + Math.sin(Date.now() / 500) * 50 // Moves back and forth slightly
                }));

                setProgress(prev => {
                    const next = prev + 0.05; // Slow progress
                    if (next >= 100) {
                        onComplete(score);
                        return 100;
                    }
                    // Random encounter
                    if (Math.random() < 0.005 && next < 95 && next > 2) {
                        triggerFind();
                    }
                    return next;
                });
            }
            frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, [gameState, score]);

    const triggerFind = () => {
        setGameState('sniffing');
        // Pet stops
        setTimeout(() => {
            setGameState('found');
            const word = quests[Math.floor(Math.random() * quests.length)];
            setCurrentWord(word);
            const distractors = quests.filter(w => w.en !== word.en).sort(() => 0.5 - Math.random()).slice(0, 2);
            setOptions([word, ...distractors].sort(() => 0.5 - Math.random()));
        }, 1200);
    };

    const handleAnswer = (selected) => {
        if (selected.en === currentWord.en) {
            setGameState('correct');
            setScore(s => s + 50);
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FFFFFF']
            });
            setTimeout(() => {
                setGameState('walking');
                // Change theme occasionally
                if (Math.random() > 0.6) setThemeIndex(prev => (prev + 1) % THEMES.length);
            }, 2500);
        } else {
            setGameState('wrong');
            setTimeout(() => setGameState('found'), 1000);
        }
    };

    // --- LEASH PHYSICS ---
    // Calculates a bezier curve between the Avatar's hand and Pet's collar
    const getLeashPath = () => {
        // Avatar hand position (approximate based on sprite)
        const handX = avatarPos.x + 130;
        const handY = 550; // Fixed height relative to ground/screen? adjusting below

        // Pet collar position
        const collarX = petPos.x + 30;
        const collarY = 620;

        // Curve control point (sag)
        const midX = (handX + collarX) / 2;
        const sag = Math.abs(collarX - handX) * 0.5 + (gameState === 'walking' ? Math.sin(Date.now() / 200) * 10 : 20);
        const midY = Math.max(handY, collarY) + sag;

        return `M ${handX} ${handY} Q ${midX} ${midY} ${collarX} ${collarY}`;
    };

    const currentTheme = THEMES[themeIndex];

    return (
        <div className="fixed inset-0 overflow-hidden font-sans select-none" style={{ filter: currentTheme.filter }}>
            {/* Dynamic Sky */}
            <div className={`absolute inset-0 bg-gradient-to-b ${currentTheme.sky} transition-colors duration-2000`}></div>

            {/* Clouds */}
            {clouds.map(c => {
                const x = (c.x - sceneOffset * c.speed * 0.2) % window.innerWidth;
                const finalX = x < -200 ? x + window.innerWidth + 200 : x;
                return (
                    <div key={c.id} className="absolute transition-transform will-change-transform"
                        style={{
                            transform: `translate3d(${finalX}px, ${c.y}%, 0)`,
                            fontSize: '5rem', opacity: 0.6
                        }}>
                        {c.icon}
                    </div>
                );
            })}

            {/* UI HUD */}
            <div className="absolute top-0 w-full p-6 z-50 flex justify-between items-start pointer-events-none">
                <button onClick={onExit} className="pointer-events-auto bg-white/20 backdrop-blur-md p-3 rounded-full border-2 border-white/50 text-white shadow-xl hover:scale-110 transition-transform">
                    <ArrowLeft size={32} />
                </button>

                <div className="flex flex-col items-center">
                    <div className="bg-black/30 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-white font-bold text-xl shadow-lg flex items-center gap-2">
                        <Star className="text-yellow-400 fill-yellow-400" /> {score}
                    </div>
                    <div className="w-64 h-3 bg-black/30 rounded-full mt-2 overflow-hidden border border-white/10">
                        <motion.div
                            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_10px_rgba(255,200,0,0.5)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Ground Layers */}
            <div className="absolute bottom-0 w-[200%] h-[60vh] opacity-40 origin-bottom skew-y-3 pointer-events-none"
                style={{
                    background: `linear-gradient(to top, ${currentTheme.ground.split(' ')[1]}, transparent)`,
                    transform: `translateX(${-((sceneOffset * 0.2) % 50)}%) skewY(-2deg)`
                }}>
            </div>

            <div className={`absolute bottom-0 w-full h-[35vh] bg-gradient-to-t ${currentTheme.ground} skew-x-12 origin-bottom scale-110 shadow-[0_-20px_40px_rgba(0,0,0,0.2)]`}></div>

            {/* Decor Objects (Trees/Rocks) */}
            <div className="absolute inset-0 pointer-events-none">
                {worldObjects.map(obj => {
                    // Parallax Scroll Calculation
                    const realX = obj.x - sceneOffset * (obj.depth > 0.5 ? 1.2 : 0.8);
                    // Wrap around logic
                    const wrapWidth = 3000;
                    const loopX = ((realX % wrapWidth) + wrapWidth) % wrapWidth - 200;

                    const isFront = obj.depth > 0.5;
                    const blur = isFront ? '0px' : '2px';
                    const opacity = isFront ? 1 : 0.7;

                    return (
                        <div key={obj.id}
                            className="absolute bottom-[20vh] transition-transform will-change-transform flex items-end justify-center"
                            style={{
                                transform: `translate3d(${loopX}px, ${obj.y}px, 0) scale(${obj.scale})`,
                                zIndex: isFront ? 30 : 10,
                                filter: `blur(${blur})`
                            }}>
                            <span className="text-[8rem] leading-none drop-shadow-lg" style={{ opacity }}>{obj.icon}</span>
                        </div>
                    );
                })}
            </div>

            {/* --- CHARACTERS & ACTION --- */}
            <div className="absolute inset-0 z-40 pointer-events-none">

                {/* SVG Leash */}
                <svg className="absolute inset-0 w-full h-full overflow-visible drop-shadow-md z-50">
                    <path d={getLeashPath()} fill="none" stroke="#5D4037" strokeWidth="6" strokeLinecap="round" />
                    <path d={getLeashPath()} fill="none" stroke="#8D6E63" strokeWidth="3" strokeLinecap="round" strokeDasharray="5,5" />
                </svg>

                {/* Avatar Sprite */}
                {/* Positioned fixed on left screen usually, ground is moving */}
                <div
                    className="absolute bottom-[25vh] z-40 transition-transform"
                    style={{
                        left: avatarPos.x,
                        width: '200px',
                        height: '200px',
                        transform: 'scaleX(1)' // Facing right
                    }}
                >
                    <SpriteAnimator
                        spriteSheet={playerSprite}
                        frames={6} // Our sprite sheets have 6 frames usually
                        fps={gameState === 'walking' ? 12 : 0} // Stop animation if not walking
                        scale={1}
                    />
                </div>

                {/* Pet Sprite */}
                <div
                    className="absolute bottom-[23vh] z-40 transition-transform"
                    style={{
                        left: petPos.x,
                        width: '150px',
                        height: '150px',
                        transform: 'scaleX(1)'
                    }}
                >
                    <SpriteAnimator
                        spriteSheet={petSprite}
                        frames={6}
                        fps={gameState !== 'found' ? 14 : 0} // Run normally, stop when found
                        scale={1}
                    />
                    {gameState === 'sniffing' && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-12 left-8 text-7xl filter drop-shadow-lg">🧐</motion.div>
                    )}
                </div>

            </div>

            {/* Interaction Layer (Questions) */}
            <AnimatePresence>
                {(gameState === 'found' || gameState === 'correct' || gameState === 'wrong') && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm pointer-events-auto">
                        <motion.div
                            initial={{ scale: 0.5, y: 100, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1, rotate: [-1, 1, 0] }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white/90 backdrop-blur-xl rounded-[3rem] p-8 max-w-2xl w-full border-[6px] border-white shadow-2xl relative overflow-hidden"
                        >
                            <div className={`absolute top-0 left-0 w-full h-2 rounded-t-full bg-gradient-to-r ${currentTheme.accent}`}></div>

                            <div className="flex flex-col items-center">
                                <motion.div
                                    animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                                    className="text-[8rem] mb-4 filter drop-shadow-2xl"
                                >
                                    {currentWord?.icon}
                                </motion.div>

                                <h2 className="text-4xl font-black text-slate-800 mb-2 drop-shadow-sm text-center">
                                    {pet.name} מצא <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">{currentWord?.he}</span>!
                                </h2>
                                <p className="text-xl text-slate-500 font-bold mb-8">איך קוראים לזה באנגלית?</p>

                                <div className="grid grid-cols-1 gap-4 w-full">
                                    {options.map((opt) => (
                                        <button
                                            key={opt.en}
                                            onClick={() => handleAnswer(opt)}
                                            className={`p-6 rounded-2xl text-3xl font-black transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg border-b-8 pointer-events-auto ${gameState === 'correct' && opt.en === currentWord.en
                                                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-700'
                                                : gameState === 'wrong' && opt.en !== currentWord.en
                                                    ? 'bg-slate-200 text-slate-400 border-slate-300'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:text-purple-600'
                                                }`}
                                        >
                                            {opt.en}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
