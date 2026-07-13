import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { hapticFeedback } from '../utils/mobile';
import { useGameStore } from '../store/gameStore';
import { initialWordData } from '../data/words';
import { STORE_ITEMS } from '../data/storeItems';
import { generateDistractors } from '../utils/distractorGenerator';
import { seededShuffle } from '../utils/seededRandom';
import { calculateNextReview } from '../utils/srs';
import {
    LANDMARKS,
    WORLD_LENGTH,
    buildWalkPool,
    milestoneDue,
    computeWalkRewards,
    skyPhaseFor,
} from '../utils/walkSession';
import { ANIMATION_CONFIG } from '../config/constants';

const FLORA = ['🌳', '🌲', '🌿', '🌾', '🌷', '🌻'];
const FAUNA = ['🦋', '🐦', '🐝'];

// Pet emoji representations with walking animation
const PET_EMOJIS = {
    dog: { idle: '🐕', walk: ['🐕', '🐕‍🦺', '🐕'], sniff: '🐶', happy: '🐶' },
    cat: { idle: '🐱', walk: ['🐱', '🐈', '🐱'], sniff: '😺', happy: '😸' },
    unicorn: { idle: '🦄', walk: ['🦄', '🐴', '🦄'], sniff: '🦄', happy: '🦄' },
    dragon: { idle: '🐉', walk: ['🐉', '🐲', '🐉'], sniff: '🐉', happy: '🐲' },
    owl: { idle: '🦉', walk: ['🦉', '🦉', '🦉'], sniff: '🦉', happy: '🦉' },
    phoenix: { idle: '🔥', walk: ['🔥', '🔥', '🔥'], sniff: '🔥', happy: '🔥' },
};

const AVATAR_WALK_FRAMES = {
    girl: ['👸', '🚶‍♀️', '👸'],
    boy: ['🤴', '🚶‍♂️', '🤴'],
};

function petTypeFromIcon(icon) {
    const match = Object.entries(PET_EMOJIS).find(([type]) =>
        STORE_ITEMS[type]?.icon === icon
    );
    return match ? match[0] : 'dog';
}

export default function PetWalkingGame({
    pet = { icon: '🐕', name: 'כלבלב' },
    userProfile,
    onExit,
    onComplete,
}) {
    const isGirl = userProfile?.gender === 'girl';
    const reduceMotion = useReducedMotion();
    const petType = petTypeFromIcon(pet.icon);

    // --- STORE WIRING (fresh reads via getState inside handlers) ---
    const petCare = useGameStore((s) => s.petCare);
    const inventory = useGameStore((s) => s.inventory);

    const ownedTreats = useMemo(
        () => inventory.filter((id) => STORE_ITEMS[id]?.treat),
        [inventory]
    );
    const bestToy = useMemo(() => {
        const toys = inventory
            .map((id) => STORE_ITEMS[id])
            .filter((item) => item?.toy);
        return toys.sort((a, b) => b.effect.happiness - a.effect.happiness)[0] || null;
    }, [inventory]);

    // --- WALK SESSION (built once per walk) ---
    const walkPool = useMemo(
        () => buildWalkPool(initialWordData, useGameStore.getState().userProgress),
        []
    );

    // --- STATE ---
    // walking | found | correct | wrong | feeding | playing | summary
    const [gameState, setGameState] = useState('walking');
    const [progress, setProgress] = useState(0);
    const [coinsEarned, setCoinsEarned] = useState(0);
    const [walkFrame, setWalkFrame] = useState(0);
    const [currentWord, setCurrentWord] = useState(null);
    const [options, setOptions] = useState([]);
    const [banner, setBanner] = useState(null); // { icon, text }
    const [correctCount, setCorrectCount] = useState(0);

    // --- LOOP-OWNED REFS ---
    const sceneOffsetRef = useRef(0);
    const [, setSceneRenderTrigger] = useState(0);
    const petPosRef = useRef({ x: 400, y: 0, bobOffset: 0 });
    const avatarPosRef = useRef({ x: 100, y: 0 });
    const animationFrameRef = useRef(null);
    const progressRef = useRef(0);
    const servedRef = useRef(0); // word encounters served
    const landmarksSeenRef = useRef(new Set());
    const summaryShownRef = useRef(false);
    const rewardsAppliedRef = useRef(false);
    const correctCountRef = useRef(0);

    // Decay once per walk: walking is hungry work.
    // Ref-guarded — StrictMode double-invokes mount effects in dev.
    const decayedRef = useRef(false);
    useEffect(() => {
        if (decayedRef.current) return;
        decayedRef.current = true;
        useGameStore.getState().decayPetCare();
    }, []);

    // --- PROCEDURAL SCENERY (deterministic per mount) ---
    const worldObjects = useMemo(() => {
        return Array.from({ length: 48 }).map((_, i) => ({
            id: i,
            icon:
                i % 7 === 3
                    ? FAUNA[i % FAUNA.length]
                    : FLORA[(i * 13) % FLORA.length],
            x: i * 260 + ((i * 97) % 120),
            y: (i * 31) % 20,
            scale: 0.5 + ((i * 53) % 100) / 80,
            depth: ((i * 71) % 100) / 100,
        }));
    }, []);

    const stars = useMemo(
        () =>
            Array.from({ length: 26 }).map((_, i) => ({
                id: i,
                left: (i * 37) % 100,
                top: (i * 23) % 45,
                size: 2 + ((i * 7) % 3),
            })),
        []
    );

    const phase = skyPhaseFor(progress);

    // --- ENCOUNTER TRIGGERS ---
    const triggerWord = useCallback(() => {
        const word = walkPool[servedRef.current];
        servedRef.current += 1;
        if (!word) return;
        setGameState('found');
        hapticFeedback('medium');
        setCurrentWord(word);
        const distractors = generateDistractors(word, 2, 'word');
        setOptions(seededShuffle([word, ...distractors], word.id));
    }, [walkPool]);

    const triggerLandmark = useCallback((landmark) => {
        landmarksSeenRef.current.add(landmark.id);
        const text = isGirl ? landmark.line.girl : landmark.line.boy;
        setBanner({ icon: landmark.icon, text });

        if (landmark.id === 'fountain') {
            setGameState('feeding');
        } else if (landmark.id === 'meadow' && bestToy) {
            setGameState('playing');
            // Auto-resolved play moment
            setTimeout(() => {
                useGameStore.getState().boostPetHappiness(bestToy.effect.happiness);
                hapticFeedback('success');
                setGameState('walking');
            }, 2600);
        } else {
            // Non-blocking story beat
            setTimeout(() => setBanner(null), 2800);
        }
    }, [isGirl, bestToy]);

    // --- GAME LOOP ---
    useEffect(() => {
        let isActive = true;
        let frameCount = 0;

        const animate = (currentTime) => {
            if (!isActive) return;

            if (gameState === 'walking') {
                sceneOffsetRef.current += ANIMATION_CONFIG.PET_WALK_SCROLL_SPEED;

                petPosRef.current.bobOffset = Math.sin(currentTime * 0.003) * 15;
                petPosRef.current.x = 400 + Math.sin(currentTime * 0.001) * 30;

                progressRef.current = Math.min(
                    100,
                    progressRef.current + ANIMATION_CONFIG.PET_WALK_PROGRESS_INCREMENT
                );
                setProgress(progressRef.current);

                // Word encounters at fixed milestones — deterministic journey
                if (milestoneDue(progressRef.current, servedRef.current)) {
                    triggerWord();
                }

                // Story landmarks
                for (const lm of LANDMARKS) {
                    if (
                        lm.at > 0 && lm.at < 100 &&
                        progressRef.current >= lm.at &&
                        !landmarksSeenRef.current.has(lm.id)
                    ) {
                        triggerLandmark(lm);
                        break;
                    }
                }

                if (progressRef.current >= 100 && !summaryShownRef.current) {
                    summaryShownRef.current = true;
                    isActive = false;
                    setGameState('summary');
                    return;
                }

                frameCount++;
                if (frameCount % 5 === 0) setWalkFrame((prev) => (prev + 1) % 3);
                if (frameCount % 2 === 0) setSceneRenderTrigger((prev) => prev + 1);
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);
        return () => {
            isActive = false;
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [gameState, triggerWord, triggerLandmark]);

    // Show the opening story beat once
    useEffect(() => {
        const gate = LANDMARKS[0];
        setBanner({ icon: gate.icon, text: isGirl ? gate.line.girl : gate.line.boy });
        const t = setTimeout(() => setBanner(null), 2800);
        return () => clearTimeout(t);
    }, [isGirl]);

    // --- ANSWERS (real SRS, single gentle attempt) ---
    const handleAnswer = useCallback(
        (selected) => {
            const store = useGameStore.getState();
            const isCorrect = selected.id === currentWord.id;

            if (!currentWord.id.startsWith('gen_')) {
                store.updateWordProgress(
                    currentWord.id,
                    calculateNextReview(store.userProgress[currentWord.id], isCorrect ? 5 : 0)
                );
            }

            if (isCorrect) {
                setGameState('correct');
                setCoinsEarned((c) => c + 40);
                correctCountRef.current += 1;
                setCorrectCount(correctCountRef.current);
                hapticFeedback('success');
                confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
            } else {
                setGameState('wrong');
                hapticFeedback('error');
            }

            setTimeout(() => {
                setCurrentWord(null);
                setGameState('walking');
            }, isCorrect ? 1800 : 2200);
        },
        [currentWord]
    );

    // --- FEEDING ---
    const feedWith = useCallback((treatId) => {
        const store = useGameStore.getState();
        const item = STORE_ITEMS[treatId];
        const idx = store.inventory.indexOf(treatId);
        if (!item || idx === -1) return;
        const next = [...store.inventory];
        next.splice(idx, 1);
        store.setInventory(next);
        store.feedPet(item.effect.satiety);
        hapticFeedback('success');
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 }, colors: ['#f59e0b', '#fbbf24'] });
        setTimeout(() => {
            setBanner(null);
            setGameState('walking');
        }, 1400);
    }, []);

    const skipFeeding = useCallback(() => {
        setBanner(null);
        setGameState('walking');
    }, []);

    // --- SUMMARY / REWARDS ---
    const finishWalk = useCallback(() => {
        if (rewardsAppliedRef.current) return;
        rewardsAppliedRef.current = true;
        const store = useGameStore.getState();
        const rewards = computeWalkRewards({
            correctCount: correctCountRef.current,
            total: walkPool.length,
        });
        store.boostPetHappiness(rewards.happiness);
        store.recordWalkCompleted();
        if (rewards.treats > 0) {
            store.setInventory([
                ...store.inventory,
                ...Array(rewards.treats).fill('treat_bone'),
            ]);
        }
        onComplete(rewards.coins);
    }, [walkPool.length, onComplete]);

    // --- VISUAL HELPERS ---
    const petEmoji = PET_EMOJIS[petType];
    const getCurrentPetEmoji = () => {
        if (gameState === 'found') return petEmoji.sniff;
        if (gameState === 'feeding' || gameState === 'playing') return petEmoji.happy;
        if (gameState === 'walking') return petEmoji.walk[walkFrame];
        return petEmoji.idle;
    };
    const getCurrentAvatarEmoji = () => {
        const frames = AVATAR_WALK_FRAMES[isGirl ? 'girl' : 'boy'];
        if (gameState === 'walking') return frames[walkFrame];
        return isGirl ? '👸' : '🤴';
    };

    const getLeashPath = useCallback(() => {
        const handX = avatarPosRef.current.x + 100;
        const handY = 520;
        const collarX = petPosRef.current.x + 40;
        const collarY = 580 + petPosRef.current.bobOffset;
        const distance = Math.abs(collarX - handX);
        const midX = (handX + collarX) / 2;
        const sag = distance * 0.4 + (gameState === 'walking' ? Math.sin(Date.now() / 300) * 8 : 15);
        const midY = Math.max(handY, collarY) + sag;
        return `M ${handX} ${handY} Q ${midX} ${midY} ${collarX} ${collarY}`;
    }, [gameState]);

    // Sun/moon arcs down toward the horizon as the walk progresses
    const orbTop = 6 + (progress % 40) * 0.9;

    const moodEmoji = petCare.happiness >= 75 ? '😍' : petCare.happiness >= 40 ? '🙂' : '🥺';

    return (
        <div
            className="fixed inset-0 overflow-hidden font-sans select-none"
            role="application"
            aria-label="Pet walking adventure"
            dir="rtl"
        >
            {/* Sky — crossfades between day/sunset/night with walk progress */}
            <div className={`absolute inset-0 bg-gradient-to-b ${phase.sky} transition-all duration-[3000ms]`} />

            {/* Sun / moon */}
            <div
                className="absolute right-[12%] text-7xl transition-all duration-[2000ms] drop-shadow-xl"
                style={{ top: `${orbTop}%` }}
                aria-hidden="true"
            >
                {phase.orb}
            </div>

            {/* Stars (night only) */}
            {phase.stars && (
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    {stars.map((s) => (
                        <motion.div
                            key={s.id}
                            className="absolute rounded-full bg-white"
                            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
                            animate={reduceMotion ? {} : { opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 2 + (s.id % 3), repeat: Infinity }}
                        />
                    ))}
                </div>
            )}

            {/* Far hills (SVG silhouettes, slow parallax) */}
            <svg
                className="absolute bottom-[28vh] w-[220%] h-[30vh] opacity-50 transition-all duration-[3000ms]"
                style={{ transform: `translateX(${-((sceneOffsetRef.current * 0.1) % (window.innerWidth * 0.5))}px)` }}
                viewBox="0 0 1200 200"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path
                    d="M0,200 L0,120 Q150,40 300,110 T600,100 T900,120 T1200,90 L1200,200 Z"
                    fill={phase.hills}
                />
            </svg>
            <svg
                className="absolute bottom-[24vh] w-[220%] h-[26vh] opacity-70 transition-all duration-[3000ms]"
                style={{ transform: `translateX(${-((sceneOffsetRef.current * 0.25) % (window.innerWidth * 0.5))}px)` }}
                viewBox="0 0 1200 200"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path
                    d="M0,200 L0,150 Q200,70 400,140 T800,130 T1200,150 L1200,200 Z"
                    fill={phase.hills}
                />
            </svg>

            {/* HUD */}
            <div className="absolute top-0 w-full p-4 md:p-6 z-50 flex justify-between items-start pointer-events-none">
                <button
                    onClick={onExit}
                    className="pointer-events-auto bg-white/20 backdrop-blur-md p-3 rounded-full border-2 border-white/50 text-white shadow-xl hover:scale-110 active:scale-95 transition-transform"
                    aria-label="Exit walk"
                >
                    <ArrowLeft size={28} />
                </button>

                <div className="flex flex-col items-center gap-2">
                    <div
                        className="bg-black/30 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 text-white font-bold text-lg shadow-lg flex items-center gap-2"
                        role="status"
                        aria-label={`Coins earned: ${coinsEarned}`}
                    >
                        <Star className="text-yellow-400 fill-yellow-400" size={20} /> {coinsEarned}
                    </div>
                    <div
                        className="w-56 md:w-64 h-3 bg-black/30 rounded-full overflow-hidden border border-white/10"
                        role="progressbar"
                        aria-valuenow={Math.round(progress)}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label="Walk progress"
                    >
                        <motion.div
                            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500"
                            animate={{ width: `${progress}%` }}
                            transition={{ type: 'spring', stiffness: 50 }}
                        />
                    </div>
                </div>

                {/* Pet meters */}
                <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-white shadow-lg flex flex-col gap-1 text-sm font-bold">
                    <div className="flex items-center gap-2" aria-label={`Happiness ${petCare.happiness}`}>
                        <span>❤️</span>
                        <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-pink-400 rounded-full transition-all duration-700" style={{ width: `${petCare.happiness}%` }} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2" aria-label={`Satiety ${petCare.satiety}`}>
                        <span>🦴</span>
                        <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${petCare.satiety}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Ground */}
            <div className={`absolute bottom-0 w-full h-[35vh] bg-gradient-to-t ${phase.ground} transition-all duration-[3000ms] shadow-[0_-20px_40px_rgba(0,0,0,0.2)]`} aria-hidden="true" />

            {/* Path stripe */}
            <div className="absolute bottom-[16vh] w-full h-[6vh] bg-black/10 overflow-hidden" aria-hidden="true">
                <div
                    className="h-1/2 mt-[1.5vh] w-[200%] opacity-60"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(to right, rgba(255,255,255,0.7) 0 40px, transparent 40px 110px)',
                        transform: `translateX(${-(sceneOffsetRef.current % 110)}px)`,
                    }}
                />
            </div>

            {/* World landmarks approach as you walk */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                {LANDMARKS.filter((lm) => lm.at > 0).map((lm) => {
                    const worldX = (lm.at / 100) * WORLD_LENGTH + 500;
                    const x = worldX - sceneOffsetRef.current;
                    if (x < -300 || x > window.innerWidth + 300) return null;
                    return (
                        <div
                            key={lm.id}
                            className="absolute bottom-[22vh] will-change-transform"
                            style={{ transform: `translate3d(${x}px, 0, 0)` }}
                        >
                            <span className="text-[9rem] leading-none drop-shadow-2xl">{lm.icon}</span>
                        </div>
                    );
                })}
            </div>

            {/* Decor objects */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                {worldObjects.map((obj) => {
                    const realX = obj.x - sceneOffsetRef.current * (obj.depth > 0.5 ? 1.2 : 0.8);
                    const wrapWidth = 3600;
                    const loopX = ((realX % wrapWidth) + wrapWidth) % wrapWidth - 200;
                    const isFront = obj.depth > 0.5;
                    return (
                        <div
                            key={obj.id}
                            className="absolute bottom-[20vh] will-change-transform flex items-end justify-center"
                            style={{
                                transform: `translate3d(${loopX}px, ${obj.y}px, 0) scale(${obj.scale})`,
                                zIndex: isFront ? 30 : 10,
                                filter: isFront ? 'none' : 'blur(2px)',
                                opacity: isFront ? 1 : 0.7,
                            }}
                        >
                            <span className="text-[7rem] leading-none drop-shadow-lg">{obj.icon}</span>
                        </div>
                    );
                })}
            </div>

            {/* Fireflies at night */}
            {phase.stars && !reduceMotion && (
                <div className="absolute inset-0 pointer-events-none z-30" aria-hidden="true">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_8px_rgba(253,224,71,0.9)]"
                            style={{ left: `${15 + i * 14}%`, bottom: '30vh' }}
                            animate={{ y: [0, -40, 10, -20, 0], x: [0, 20, -15, 10, 0], opacity: [0.3, 1, 0.5, 1, 0.3] }}
                            transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    ))}
                </div>
            )}

            {/* Characters */}
            <div className="absolute inset-0 z-40 pointer-events-none">
                <svg className="absolute inset-0 w-full h-full overflow-visible drop-shadow-md z-50" aria-hidden="true">
                    <path d={getLeashPath()} fill="none" stroke="#5D4037" strokeWidth="6" strokeLinecap="round" />
                    <path d={getLeashPath()} fill="none" stroke="#8D6E63" strokeWidth="3" strokeLinecap="round" strokeDasharray="5,5" />
                </svg>

                <motion.div
                    className="absolute bottom-[25vh] z-40"
                    style={{ left: avatarPosRef.current.x, fontSize: '8rem' }}
                    animate={{ y: gameState === 'walking' && !reduceMotion ? [0, -5, 0] : 0 }}
                    transition={{ duration: 0.4, repeat: gameState === 'walking' && !reduceMotion ? Infinity : 0, ease: 'easeInOut' }}
                    role="img"
                    aria-label="Your character"
                >
                    {getCurrentAvatarEmoji()}
                </motion.div>

                <motion.div
                    className="absolute bottom-[23vh] z-40"
                    style={{ left: petPosRef.current.x, fontSize: '7rem' }}
                    animate={{
                        y: gameState === 'walking' ? petPosRef.current.bobOffset : 0,
                        rotate: gameState === 'found' && !reduceMotion ? [0, -5, 5, 0] : 0,
                    }}
                    transition={{
                        y: { type: 'spring', stiffness: 200, damping: 10 },
                        rotate: { duration: 0.5, repeat: gameState === 'found' ? Infinity : 0 },
                    }}
                    role="img"
                    aria-label={pet.name}
                >
                    {getCurrentPetEmoji()}
                    {gameState === 'found' && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-12 left-8 text-5xl drop-shadow-lg">
                            🔍
                        </motion.div>
                    )}
                    {gameState === 'playing' && bestToy && (
                        <motion.div
                            className="absolute -top-8 -left-16 text-6xl"
                            animate={{ x: [-80, 60, -10, 0], y: [-60, -120, -30, 0], rotate: [0, 360, 720, 720] }}
                            transition={{ duration: 2.4, ease: 'easeInOut' }}
                        >
                            {bestToy.icon}
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Story banner */}
            <AnimatePresence>
                {banner && gameState !== 'feeding' && (
                    <motion.div
                        initial={{ y: -80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -80, opacity: 0 }}
                        className="absolute top-24 inset-x-0 z-50 flex justify-center pointer-events-none px-4"
                    >
                        <div className="bg-white/90 backdrop-blur-md rounded-3xl px-6 py-3 shadow-2xl border-2 border-white flex items-center gap-3 max-w-xl">
                            <span className="text-4xl">{banner.icon}</span>
                            <span className="text-lg md:text-xl font-bold text-slate-700">{banner.text}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Word encounter */}
            <AnimatePresence>
                {(gameState === 'found' || gameState === 'correct' || gameState === 'wrong') && currentWord && (
                    <motion.div
                        className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0.6, y: 80, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 max-w-xl w-full border-[6px] border-white shadow-2xl relative overflow-hidden"
                            role="dialog"
                            aria-labelledby="walk-question-title"
                        >
                            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${phase.accent}`} />

                            <div className="flex flex-col items-center">
                                <motion.div
                                    animate={reduceMotion ? {} : { y: [0, -14, 0] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                    className="text-7xl md:text-8xl mb-3 drop-shadow-2xl"
                                    role="img"
                                    aria-label={currentWord.hebrew}
                                >
                                    {currentWord.emoji}
                                </motion.div>

                                <h2 id="walk-question-title" className="text-3xl md:text-4xl font-black text-slate-800 mb-1 text-center">
                                    {pet.name} מצא: <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">{currentWord.hebrew}</span>
                                </h2>
                                <p className="text-lg md:text-xl text-slate-500 font-bold mb-6">איך אומרים את זה באנגלית?</p>

                                <div className="grid grid-cols-1 gap-3 w-full" role="group" aria-label="Answer options">
                                    {options.map((opt) => (
                                        <motion.button
                                            key={opt.id}
                                            onClick={() => handleAnswer(opt)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.96 }}
                                            dir="ltr"
                                            className={`p-5 rounded-2xl text-2xl md:text-3xl font-black transition-all shadow-lg border-b-8 ${
                                                gameState !== 'found' && opt.id === currentWord.id
                                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-700'
                                                    : gameState === 'wrong' && opt.id !== currentWord.id
                                                        ? 'bg-slate-200 text-slate-400 border-slate-300'
                                                        : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:text-purple-600'
                                            }`}
                                            disabled={gameState !== 'found'}
                                            aria-label={`Option: ${opt.word}`}
                                        >
                                            {opt.word}
                                        </motion.button>
                                    ))}
                                </div>

                                {gameState === 'correct' && (
                                    <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-4 text-2xl font-black text-emerald-600">
                                        +40 🪙 {pet.name} גאה בך!
                                    </motion.p>
                                )}
                                {gameState === 'wrong' && (
                                    <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-4 text-xl font-bold text-slate-600">
                                        זו הייתה <span className="font-black text-emerald-600" dir="ltr">{currentWord.word}</span> — נתרגל שוב בפעם הבאה!
                                    </motion.p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feeding moment at the fountain */}
            <AnimatePresence>
                {gameState === 'feeding' && (
                    <motion.div
                        className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            className="bg-white/95 rounded-[2.5rem] p-8 max-w-md w-full border-[6px] border-white shadow-2xl text-center"
                            role="dialog"
                            aria-label="Feeding time"
                        >
                            <div className="text-7xl mb-2">⛲</div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-1">
                                {pet.name} רעב! {moodEmoji}
                            </h2>
                            <p className="text-lg text-slate-500 font-bold mb-6">
                                {ownedTreats.length > 0
                                    ? (isGirl ? 'תני לו חטיף מהתיק!' : 'תן לו חטיף מהתיק!')
                                    : 'אין חטיפים בתיק... אפשר לקנות בחנות ההפתעות! 🛍️'}
                            </p>

                            {ownedTreats.length > 0 && (
                                <div className="flex justify-center gap-3 mb-4">
                                    {[...new Set(ownedTreats)].map((treatId) => {
                                        const item = STORE_ITEMS[treatId];
                                        const count = ownedTreats.filter((t) => t === treatId).length;
                                        return (
                                            <button
                                                key={treatId}
                                                onClick={() => feedWith(treatId)}
                                                className="bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-2xl px-5 py-3 text-4xl shadow-md hover:scale-105 active:scale-95 transition-transform"
                                                aria-label={`Feed ${item.name}`}
                                            >
                                                {item.icon}
                                                <span className="block text-sm font-bold text-amber-700 mt-1">×{count}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <button
                                onClick={skipFeeding}
                                className="text-slate-400 font-bold underline hover:text-slate-600"
                            >
                                {ownedTreats.length > 0 ? 'אולי אחר כך' : 'ממשיכים בטיול'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Walk summary */}
            <AnimatePresence>
                {gameState === 'summary' && (
                    <motion.div
                        className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            initial={{ scale: 0.7, y: 60, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                            className="bg-white/95 rounded-[2.5rem] p-8 max-w-md w-full border-[6px] border-white shadow-2xl text-center"
                            role="dialog"
                            aria-label="Walk summary"
                        >
                            <div className="text-7xl mb-2">🏡</div>
                            <h2 className="text-3xl font-black text-slate-800 mb-4">חזרתם הביתה!</h2>

                            <div className="grid grid-cols-3 gap-3 mb-6 text-center">
                                <div className="bg-purple-50 rounded-2xl p-3">
                                    <div className="text-3xl">📚</div>
                                    <div className="text-xl font-black text-purple-700">{correctCount}/{walkPool.length}</div>
                                    <div className="text-xs font-bold text-slate-500">מילים</div>
                                </div>
                                <div className="bg-amber-50 rounded-2xl p-3">
                                    <div className="text-3xl">🪙</div>
                                    <div className="text-xl font-black text-amber-700">{computeWalkRewards({ correctCount, total: walkPool.length }).coins}</div>
                                    <div className="text-xs font-bold text-slate-500">מטבעות</div>
                                </div>
                                <div className="bg-pink-50 rounded-2xl p-3">
                                    <div className="text-3xl">{moodEmoji}</div>
                                    <div className="text-xl font-black text-pink-700">{petCare.happiness}%</div>
                                    <div className="text-xs font-bold text-slate-500">אושר</div>
                                </div>
                            </div>

                            {computeWalkRewards({ correctCount, total: walkPool.length }).treats > 0 && (
                                <p className="text-lg font-bold text-amber-600 mb-4">
                                    🦴 מצאתם {computeWalkRewards({ correctCount, total: walkPool.length }).treats} עצמות בדרך!
                                </p>
                            )}

                            <button
                                onClick={finishWalk}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-black text-xl hover:shadow-lg transition-shadow"
                            >
                                לאסוף את הפרסים! 🎉
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
