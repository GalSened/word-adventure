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
    FETCH_CONFIG,
    buildWalkPool,
    milestoneDue,
    computeWalkRewards,
    skyPhaseFor,
    moodModifiers,
    buildBonusCoinSpots,
    fetchRewards,
} from '../utils/walkSession';
import { ANIMATION_CONFIG } from '../config/constants';
import { DogWalker, KidWalker, RoundTree, PineTree } from './WalkArt';

const FLORA = ['🌿', '🌾', '🌷', '🌻', '🌼', '🍄'];
const FAUNA = ['🦋', '🐦', '🐝'];

// Stable stage glyphs for non-dog pets (no frame swapping — the old
// emoji-cycling gait made the characters visibly flicker).
const PET_STAGE_EMOJI = {
    dog: '🐕',
    cat: '🐱',
    unicorn: '🦄',
    dragon: '🐉',
    owl: '🦉',
    phoenix: '🔥',
};

// Deterministic bounce paths for the fetch minigame — a fresh path per catch
// so the ball "escapes" somewhere new each time the kid grabs it.
const BALL_PATHS = [
    { x: ['5vw', '70vw', '30vw', '80vw', '5vw'], y: [0, -180, -40, -220, 0] },
    { x: ['80vw', '20vw', '60vw', '10vw', '80vw'], y: [-30, -200, 0, -160, -30] },
    { x: ['40vw', '85vw', '15vw', '55vw', '40vw'], y: [-100, -20, -240, -60, -100] },
];

// Fixed character layout inside the stage box (px, from its bottom-left).
const STAGE = { left: 16, width: 640, height: 300 };
const KID = { left: 60, bottom: 34, width: 118 };
const DOG = { left: 300, bottom: 0, width: 180 };
// Leash anchors in stage SVG coordinates (y measured from the top of the box)
const LEASH = { hand: [168, 158], mid: [300, 268], collar: [430, 216] };

function petTypeFromIcon(icon) {
    const match = Object.entries(PET_STAGE_EMOJI).find(([type]) =>
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

    // A happy pet sniffs out bonus coins — decided by mood at the gate.
    const bonusSpots = useMemo(
        () => buildBonusCoinSpots(moodModifiers(useGameStore.getState().petCare).bonusSpots),
        []
    );

    // --- STATE ---
    // walking | found | correct | wrong | feeding | playing | fetchGame | summary
    const [gameState, setGameState] = useState('walking');
    const [progress, setProgress] = useState(0); // integer 0-100, for HUD/phase only
    const [coinsEarned, setCoinsEarned] = useState(0);
    const [currentWord, setCurrentWord] = useState(null);
    const [options, setOptions] = useState([]);
    const [banner, setBanner] = useState(null); // { icon, text }
    const [correctCount, setCorrectCount] = useState(0);
    const [collectedSpots, setCollectedSpots] = useState(() => new Set());
    const [fetchCatches, setFetchCatches] = useState(0);

    // --- LOOP-OWNED REFS ---
    const sceneOffsetRef = useRef(0);
    const animationFrameRef = useRef(null);
    const progressRef = useRef(0);
    const progressIntRef = useRef(0);
    const servedRef = useRef(0); // word encounters served
    const landmarksSeenRef = useRef(new Set());
    const summaryShownRef = useRef(false);
    const rewardsAppliedRef = useRef(false);
    const correctCountRef = useRef(0);
    const bonusCoinsRef = useRef(0); // tapped path coins + fetch winnings
    const fetchTimeoutRef = useRef(null);
    const fetchCatchesRef = useRef(0);
    const collectedSpotsRef = useRef(new Set()); // tap-race guard for coins

    // Scroll layers, moved imperatively each frame (GPU transforms — no
    // React re-render churn, which caused visible scenery judder).
    const hillsFarRef = useRef(null);
    const hillsNearRef = useRef(null);
    const pathRef = useRef(null);
    const backLayerRef = useRef(null);
    const mainLayerRef = useRef(null);
    const frontLayerRef = useRef(null);

    // Decay once per walk: walking is hungry work.
    // Ref-guarded — StrictMode double-invokes mount effects in dev.
    const decayedRef = useRef(false);
    useEffect(() => {
        if (decayedRef.current) return;
        decayedRef.current = true;
        useGameStore.getState().decayPetCare();
    }, []);

    // --- PROCEDURAL SCENERY (deterministic, laid out once in world coords) ---
    // Two parallax bands; children are static, only the container moves.
    const backObjects = useMemo(
        () =>
            Array.from({ length: 27 }).map((_, i) => ({
                id: `b${i}`,
                kind: i % 4 === 1 ? 'pine' : i % 4 === 3 ? 'flora' : 'round',
                icon: FLORA[(i * 13) % FLORA.length],
                x: i * 450 + ((i * 97) % 160),
                scale: 0.55 + ((i * 53) % 100) / 170,
            })),
        []
    );
    const frontObjects = useMemo(
        () =>
            Array.from({ length: 30 }).map((_, i) => ({
                id: `f${i}`,
                kind:
                    i % 8 === 5
                        ? 'lamp'
                        : i % 7 === 3
                            ? 'fauna'
                            : i % 4 === 1
                                ? (i % 2 === 0 ? 'round' : 'pine')
                                : 'flora',
                icon: i % 7 === 3 ? FAUNA[i % FAUNA.length] : FLORA[(i * 11) % FLORA.length],
                x: i * 520 + ((i * 71) % 200),
                scale: 0.8 + ((i * 37) % 100) / 130,
            })),
        []
    );

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

    // --- FETCH MINIGAME (meadow) ---
    const resolveFetch = useCallback(() => {
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
            fetchTimeoutRef.current = null;
        }
        const catches = fetchCatchesRef.current;
        const reward = fetchRewards(catches, bestToy?.effect.happiness ?? 10);
        useGameStore.getState().boostPetHappiness(reward.happiness);
        if (reward.coins > 0) {
            bonusCoinsRef.current += reward.coins;
            setCoinsEarned((c) => c + reward.coins);
        }
        hapticFeedback('success');
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: ['#4ade80', '#fbbf24'] });
        setBanner({
            icon: '🎾',
            text:
                catches >= FETCH_CONFIG.catchesTarget
                    ? 'תפיסה מושלמת! ' + pet.name + ' באושר עילאי!'
                    : pet.name + ' רץ והביא את הצעצוע בעצמו!',
        });
        setGameState('walking');
        setTimeout(() => setBanner(null), 2400);
    }, [bestToy, pet.name]);

    const catchBall = useCallback(() => {
        if (fetchCatchesRef.current >= FETCH_CONFIG.catchesTarget) return;
        fetchCatchesRef.current += 1;
        setFetchCatches(fetchCatchesRef.current);
        hapticFeedback('medium');
        if (fetchCatchesRef.current >= FETCH_CONFIG.catchesTarget) {
            resolveFetch();
        }
    }, [resolveFetch]);

    // Never leave a fetch timer running past unmount
    useEffect(() => () => {
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    }, []);

    const triggerLandmark = useCallback((landmark) => {
        landmarksSeenRef.current.add(landmark.id);
        const text = isGirl ? landmark.line.girl : landmark.line.boy;
        setBanner({ icon: landmark.icon, text });

        if (landmark.id === 'fountain') {
            setGameState('feeding');
        } else if (landmark.id === 'meadow' && bestToy) {
            if (reduceMotion) {
                // Reduced motion: calm auto-resolved play moment
                setGameState('playing');
                setTimeout(() => {
                    useGameStore.getState().boostPetHappiness(bestToy.effect.happiness);
                    hapticFeedback('success');
                    setGameState('walking');
                }, 2600);
            } else {
                fetchCatchesRef.current = 0;
                setFetchCatches(0);
                setGameState('fetchGame');
                fetchTimeoutRef.current = setTimeout(resolveFetch, FETCH_CONFIG.timeoutMs);
            }
        } else {
            // Non-blocking story beat
            setTimeout(() => setBanner(null), 2800);
        }
    }, [isGirl, bestToy, reduceMotion, resolveFetch]);

    // --- GAME LOOP ---
    useEffect(() => {
        let isActive = true;

        const animate = () => {
            if (!isActive) return;

            if (gameState === 'walking') {
                // Hungry pet drags its paws; scroll and progress scale together
                // so world-position math (landmarks, coins) stays in sync.
                const { speedMult } = moodModifiers(useGameStore.getState().petCare);
                sceneOffsetRef.current += ANIMATION_CONFIG.PET_WALK_SCROLL_SPEED * speedMult;

                progressRef.current = Math.min(
                    100,
                    progressRef.current + ANIMATION_CONFIG.PET_WALK_PROGRESS_INCREMENT * speedMult
                );

                // Move the world: one GPU transform per layer, zero re-renders.
                const w = window.innerWidth;
                const o = sceneOffsetRef.current;
                if (hillsFarRef.current) hillsFarRef.current.style.transform = `translate3d(${-((o * 0.1) % (w * 0.5))}px,0,0)`;
                if (hillsNearRef.current) hillsNearRef.current.style.transform = `translate3d(${-((o * 0.25) % (w * 0.5))}px,0,0)`;
                if (pathRef.current) pathRef.current.style.transform = `translate3d(${-(o % 260)}px,0,0)`;
                if (backLayerRef.current) backLayerRef.current.style.transform = `translate3d(${-o * 0.8}px,0,0)`;
                if (mainLayerRef.current) mainLayerRef.current.style.transform = `translate3d(${-o}px,0,0)`;
                if (frontLayerRef.current) frontLayerRef.current.style.transform = `translate3d(${-o * 1.2}px,0,0)`;

                // React only needs whole-percent updates (HUD + sky phase).
                const intProgress = Math.floor(progressRef.current);
                if (intProgress !== progressIntRef.current) {
                    progressIntRef.current = intProgress;
                    setProgress(intProgress);
                }

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

    // --- BONUS COINS (happy-pet finds) ---
    const collectCoin = useCallback((spot) => {
        if (collectedSpotsRef.current.has(spot)) return;
        collectedSpotsRef.current.add(spot);
        setCollectedSpots(new Set(collectedSpotsRef.current));
        bonusCoinsRef.current += 10;
        setCoinsEarned((c) => c + 10);
        hapticFeedback('light');
    }, []);

    // --- SUMMARY / REWARDS ---
    const finishWalk = useCallback(() => {
        if (rewardsAppliedRef.current) return;
        rewardsAppliedRef.current = true;
        const store = useGameStore.getState();
        const rewards = computeWalkRewards({
            correctCount: correctCountRef.current,
            total: walkPool.length,
            bonusCoins: bonusCoinsRef.current,
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
    const walking = gameState === 'walking';
    const dogMood =
        gameState === 'feeding' || gameState === 'playing' || gameState === 'fetchGame' || gameState === 'correct'
            ? 'happy'
            : 'walk';

    // The orb slides down (or the moon up) within each phase — no modulo jumps.
    const phaseSpan = phase.id === 'day' ? [0, 40] : phase.id === 'sunset' ? [40, 75] : [75, 100];
    const orbFrac = Math.max(0, Math.min(1, (progress - phaseSpan[0]) / (phaseSpan[1] - phaseSpan[0])));
    const orbTop = phase.id === 'night' ? 36 - orbFrac * 26 : 6 + orbFrac * 30;

    const hazeColor =
        phase.id === 'day'
            ? 'rgba(255,255,255,0.35)'
            : phase.id === 'sunset'
                ? 'rgba(255,171,64,0.35)'
                : 'rgba(30,27,75,0.55)';
    const nightDim = phase.id === 'night' ? 'brightness(0.62) saturate(0.85)' : 'none';

    const moodEmoji = petCare.happiness >= 75 ? '😍' : petCare.happiness >= 40 ? '🙂' : '🥺';
    const hungryNow = moodModifiers(petCare).hungry;
    const summaryRewards = computeWalkRewards({
        correctCount,
        total: walkPool.length,
        bonusCoins: bonusCoinsRef.current,
    });

    return (
        <div
            className="fixed inset-0 overflow-hidden font-sans select-none"
            role="application"
            aria-label="Pet walking adventure"
            dir="rtl"
        >
            {/* Sky — crossfades between day/sunset/night with walk progress */}
            <div className={`absolute inset-0 bg-gradient-to-b ${phase.sky} transition-all duration-[3000ms]`} />

            {/* Sun / moon with a real glow */}
            <div
                className="absolute right-[12%] transition-all duration-[2000ms]"
                style={{ top: `${orbTop}%` }}
                aria-hidden="true"
            >
                {phase.id === 'night' ? (
                    <div
                        className="relative w-20 h-20 rounded-full bg-slate-100"
                        style={{ boxShadow: '0 0 44px 14px rgba(226,232,240,0.5)' }}
                    >
                        <div className="absolute w-4 h-4 rounded-full bg-slate-300/70" style={{ top: '22%', left: '28%' }} />
                        <div className="absolute w-3 h-3 rounded-full bg-slate-300/60" style={{ top: '55%', left: '55%' }} />
                        <div className="absolute w-2 h-2 rounded-full bg-slate-300/60" style={{ top: '38%', left: '64%' }} />
                    </div>
                ) : (
                    <div
                        className={reduceMotion ? 'w-24 h-24 rounded-full' : 'sun-pulse w-24 h-24 rounded-full'}
                        style={{
                            background:
                                phase.id === 'sunset'
                                    ? 'radial-gradient(circle, #ffd54f 0%, #ff8f00 72%)'
                                    : 'radial-gradient(circle, #fff59d 0%, #ffb300 75%)',
                            boxShadow:
                                phase.id === 'sunset'
                                    ? '0 0 60px 22px rgba(255,143,0,0.45)'
                                    : '0 0 70px 26px rgba(255,193,7,0.4)',
                        }}
                    />
                )}
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

            {/* Drifting clouds until nightfall */}
            {!phase.stars && (
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="absolute text-6xl opacity-80"
                            style={{ top: `${8 + i * 9}%` }}
                            animate={reduceMotion ? {} : { x: ['110vw', '-20vw'] }}
                            transition={{ duration: 60 + i * 25, repeat: Infinity, ease: 'linear', delay: i * -30 }}
                        >
                            ☁️
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Far hills (SVG silhouettes, slow parallax) */}
            <svg
                ref={hillsFarRef}
                className="absolute bottom-[28vh] w-[220%] h-[30vh] opacity-50 transition-colors duration-[3000ms] will-change-transform"
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
                ref={hillsNearRef}
                className="absolute bottom-[24vh] w-[220%] h-[26vh] opacity-70 transition-colors duration-[3000ms] will-change-transform"
                viewBox="0 0 1200 200"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path
                    d="M0,200 L0,150 Q200,70 400,140 T800,130 T1200,150 L1200,200 Z"
                    fill={phase.hills}
                />
            </svg>

            {/* Horizon haze */}
            <div
                className="absolute bottom-[30vh] w-full h-[9vh] pointer-events-none transition-all duration-[3000ms]"
                style={{ background: `linear-gradient(to top, ${hazeColor}, transparent)` }}
                aria-hidden="true"
            />

            {/* Ground */}
            <div className={`absolute bottom-0 w-full h-[35vh] bg-gradient-to-t ${phase.ground} transition-all duration-[3000ms] shadow-[0_-20px_40px_rgba(0,0,0,0.2)]`} aria-hidden="true" />

            {/* Distant scenery band (slow parallax) */}
            <div
                ref={backLayerRef}
                className="absolute inset-0 pointer-events-none will-change-transform transition-[filter] duration-[3000ms]"
                style={{ filter: nightDim }}
                aria-hidden="true"
            >
                {backObjects.map((obj) => (
                    <div
                        key={obj.id}
                        className="absolute bottom-[29vh] opacity-80"
                        style={{ left: obj.x, transform: `scale(${obj.scale})`, transformOrigin: 'bottom center', filter: 'blur(1px)' }}
                    >
                        {obj.kind === 'pine' ? (
                            <PineTree style={{ width: 80 }} />
                        ) : obj.kind === 'round' ? (
                            <RoundTree style={{ width: 92 }} />
                        ) : (
                            <span className="text-5xl leading-none">{obj.icon}</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Stone path */}
            <div
                className="absolute bottom-[16vh] w-full h-[7vh] overflow-hidden"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.06))' }}
                aria-hidden="true"
            >
                <div
                    ref={pathRef}
                    className="h-full w-[200%] will-change-transform"
                    style={{
                        backgroundImage:
                            'radial-gradient(ellipse 46px 15px at 40px 55%, rgba(255,255,255,0.3) 60%, transparent 62%),' +
                            'radial-gradient(ellipse 34px 12px at 128px 28%, rgba(255,255,255,0.22) 60%, transparent 62%),' +
                            'radial-gradient(ellipse 40px 13px at 208px 72%, rgba(255,255,255,0.26) 60%, transparent 62%)',
                        backgroundSize: '260px 100%',
                    }}
                />
            </div>

            {/* World landmarks + bonus coins (true-speed layer) */}
            <div
                ref={mainLayerRef}
                className="absolute inset-0 pointer-events-none will-change-transform"
            >
                {LANDMARKS.filter((lm) => lm.at > 0).map((lm) => (
                    <div
                        key={lm.id}
                        className="absolute bottom-[21vh]"
                        style={{ left: (lm.at / 100) * WORLD_LENGTH + 500 }}
                        aria-hidden="true"
                    >
                        <span className="text-[9rem] leading-none drop-shadow-2xl">{lm.icon}</span>
                    </div>
                ))}

                {bonusSpots
                    .filter((s) => !collectedSpots.has(s))
                    .map((spot) => (
                        <motion.button
                            key={spot}
                            onClick={() => collectCoin(spot)}
                            className="absolute bottom-[26vh] text-6xl drop-shadow-xl pointer-events-auto cursor-pointer"
                            style={{ left: (spot / 100) * WORLD_LENGTH + 500 }}
                            animate={reduceMotion ? {} : { y: [0, -16, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                            whileTap={{ scale: 1.6, opacity: 0 }}
                            aria-label="מטבע בונוס"
                        >
                            🪙
                        </motion.button>
                    ))}
            </div>

            {/* Near scenery band (fast parallax, in front of the path) */}
            <div
                ref={frontLayerRef}
                className="absolute inset-0 pointer-events-none will-change-transform transition-[filter] duration-[3000ms] z-30"
                style={{ filter: nightDim }}
                aria-hidden="true"
            >
                {frontObjects.map((obj) => (
                    <div
                        key={obj.id}
                        className="absolute bottom-[13vh]"
                        style={{ left: obj.x, transform: `scale(${obj.scale})`, transformOrigin: 'bottom center' }}
                    >
                        {obj.kind === 'lamp' ? (
                            <div className="flex flex-col items-center h-48">
                                <div
                                    className={`w-6 h-6 rounded-full transition-all duration-1000 ${
                                        phase.stars
                                            ? 'bg-yellow-300 shadow-[0_0_30px_16px_rgba(253,224,71,0.55)]'
                                            : 'bg-slate-300'
                                    }`}
                                />
                                <div className="w-1.5 flex-1 bg-slate-700 rounded-full" />
                            </div>
                        ) : obj.kind === 'round' ? (
                            <RoundTree style={{ width: 120 }} />
                        ) : obj.kind === 'pine' ? (
                            <PineTree style={{ width: 105 }} />
                        ) : (
                            <span className="text-6xl leading-none drop-shadow-lg">{obj.icon}</span>
                        )}
                    </div>
                ))}
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
                        aria-valuenow={progress}
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

            {/* Characters — rigged SVG walkers on a fixed stage, gait via CSS */}
            <div
                className={`absolute z-40 pointer-events-none ${walking ? '' : 'walk-paused'}`}
                style={{ left: STAGE.left, bottom: '21vh', width: STAGE.width, height: STAGE.height }}
            >
                {/* Leash: static curve with a gentle sway — no per-frame recompute */}
                <svg
                    className="absolute inset-0 w-full h-full overflow-visible"
                    viewBox={`0 0 ${STAGE.width} ${STAGE.height}`}
                    aria-hidden="true"
                >
                    <g className={reduceMotion ? '' : 'leash-sway'}>
                        <path
                            d={`M ${LEASH.hand[0]} ${LEASH.hand[1]} Q ${LEASH.mid[0]} ${LEASH.mid[1]} ${LEASH.collar[0]} ${LEASH.collar[1]}`}
                            fill="none"
                            stroke="#5D4037"
                            strokeWidth="6"
                            strokeLinecap="round"
                        />
                        <path
                            d={`M ${LEASH.hand[0]} ${LEASH.hand[1]} Q ${LEASH.mid[0]} ${LEASH.mid[1]} ${LEASH.collar[0]} ${LEASH.collar[1]}`}
                            fill="none"
                            stroke="#8D6E63"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="5,5"
                        />
                    </g>
                </svg>

                <div
                    className="absolute"
                    style={{ left: KID.left, bottom: KID.bottom, width: KID.width }}
                    role="img"
                    aria-label="Your character"
                >
                    <KidWalker gender={isGirl ? 'girl' : 'boy'} style={{ width: '100%' }} />
                </div>

                <div
                    className="absolute"
                    style={{ left: DOG.left, bottom: DOG.bottom, width: DOG.width }}
                    role="img"
                    aria-label={pet.name}
                >
                    {petType === 'dog' ? (
                        <DogWalker mood={dogMood} style={{ width: '100%' }} />
                    ) : (
                        <div className="walk-bob text-8xl leading-none drop-shadow-xl">
                            {PET_STAGE_EMOJI[petType]}
                        </div>
                    )}

                    {hungryNow && walking && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-14 left-32 bg-white/90 rounded-2xl px-3 py-1.5 text-4xl shadow-lg border-2 border-amber-300"
                            aria-label="הכלב רעב"
                        >
                            🍖
                        </motion.div>
                    )}
                    {gameState === 'found' && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-12 left-24 text-5xl drop-shadow-lg">
                            🔍
                        </motion.div>
                    )}
                    {gameState === 'playing' && bestToy && (
                        <motion.div
                            className="absolute -top-8 -left-8 text-6xl"
                            animate={{ x: [-80, 60, -10, 0], y: [-60, -120, -30, 0], rotate: [0, 360, 720, 720] }}
                            transition={{ duration: 2.4, ease: 'easeInOut' }}
                        >
                            {bestToy.icon}
                        </motion.div>
                    )}
                </div>
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

            {/* Fetch minigame at the meadow — tap the bouncing toy */}
            <AnimatePresence>
                {gameState === 'fetchGame' && bestToy && (
                    <motion.div
                        className="absolute inset-0 z-[60]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute top-24 inset-x-0 flex justify-center pointer-events-none px-4">
                            <div className="bg-white/90 backdrop-blur-md rounded-3xl px-6 py-3 shadow-2xl border-2 border-white flex items-center gap-3">
                                <span className="text-4xl">🎾</span>
                                <span className="text-lg md:text-xl font-bold text-slate-700">
                                    {isGirl ? 'תפסי את הצעצוע!' : 'תפוס את הצעצוע!'}{' '}
                                    <span className="text-emerald-600 font-black" dir="ltr">
                                        {fetchCatches}/{FETCH_CONFIG.catchesTarget}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <motion.button
                            key={fetchCatches}
                            onClick={catchBall}
                            className="absolute bottom-[32vh] text-8xl drop-shadow-2xl cursor-pointer"
                            style={{ left: 0 }}
                            animate={{
                                x: BALL_PATHS[fetchCatches % BALL_PATHS.length].x,
                                y: BALL_PATHS[fetchCatches % BALL_PATHS.length].y,
                            }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                            aria-label="לתפוס את הצעצוע"
                        >
                            {bestToy.icon}
                        </motion.button>
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
                                    <div className="text-xl font-black text-amber-700">{summaryRewards.coins}</div>
                                    <div className="text-xs font-bold text-slate-500">מטבעות</div>
                                </div>
                                <div className="bg-pink-50 rounded-2xl p-3">
                                    <div className="text-3xl">{moodEmoji}</div>
                                    <div className="text-xl font-black text-pink-700">{petCare.happiness}%</div>
                                    <div className="text-xs font-bold text-slate-500">אושר</div>
                                </div>
                            </div>

                            {summaryRewards.treats > 0 && (
                                <p className="text-lg font-bold text-amber-600 mb-4">
                                    🦴 מצאתם {summaryRewards.treats} עצמות בדרך!
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
