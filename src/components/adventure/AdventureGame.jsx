import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAnimationFrame, motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ADVENTURE_ZONES, ADVENTURE_STATES, ADVENTURE_CONFIG } from './adventureConfig';
import ZoneRenderer from './ZoneRenderer';
import PetCompanion from './PetCompanion';
import { useGameStore } from '../../store/gameStore';
import { initialWordData } from '../../data/words';

/**
 * Derive pet behavior from the current game phase.
 */
function petBehaviorFromPhase(phase) {
  switch (phase) {
    case ADVENTURE_STATES.EXPLORING:
      return 'walk';
    case ADVENTURE_STATES.APPROACHING:
      return 'sniff';
    case ADVENTURE_STATES.ENCOUNTERING:
      return 'idle';
    case ADVENTURE_STATES.RESOLVED:
      return 'celebrate';
    case ADVENTURE_STATES.ZONE_TRANSITION:
      return 'walk';
    case ADVENTURE_STATES.COMPLETE:
      return 'celebrate';
    default:
      return 'walk';
  }
}

/**
 * AdventureGame - Main adventure component with state machine and
 * useAnimationFrame game loop for smooth 60fps scrolling.
 *
 * @param {Object} props
 * @param {Object} props.pet - Pet object with name and icon
 * @param {Object} props.userProfile - User profile with avatar, gender, etc.
 * @param {Function} props.onExit - Callback to leave adventure
 * @param {Function} props.onComplete - Callback with score when adventure finishes
 */
export default function AdventureGame({ pet, userProfile, onExit, onComplete }) {
  // --- State (triggers re-renders) ---
  const [gamePhase, setGamePhase] = useState(ADVENTURE_STATES.EXPLORING);
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
  const [encounterWord, setEncounterWord] = useState(null);
  const [score, setScore] = useState(0);
  const [zoneProgress, setZoneProgress] = useState(0);

  // --- Refs (mutable values for game loop -- no re-renders) ---
  const sceneOffsetRef = useRef(0);
  const sceneRef = useRef(null);
  const progressRef = useRef(0);
  const encounterCountRef = useRef(0);
  const usedWordIdsRef = useRef([]);
  const lastEncounterProgressRef = useRef(0);

  // Track timeouts for cleanup
  const timeoutsRef = useRef([]);

  // Derived values
  const zone = ADVENTURE_ZONES[currentZoneIndex];
  const petBehavior = petBehaviorFromPhase(gamePhase);

  // Store access for SRS updates
  const addScore = useGameStore((s) => s.addScore);

  /**
   * Select a random word from the current zone's categories,
   * avoiding already-used words within this session.
   */
  const selectWord = useCallback((currentZone) => {
    let pool = initialWordData.filter(
      (w) => currentZone.categories.includes(w.category) && !usedWordIdsRef.current.includes(w.id)
    );
    // If pool exhausted within session, allow repeats
    if (pool.length === 0) {
      pool = initialWordData.filter((w) => currentZone.categories.includes(w.category));
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  /**
   * Register a timeout and track it for cleanup on unmount.
   */
  const safeTimeout = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  /**
   * Trigger the approach phase: pet sniffs, visual cue appears.
   * After approachDuration, auto-resolve (Plan 01 -- no EncounterOverlay yet).
   */
  const triggerApproach = useCallback(() => {
    setGamePhase(ADVENTURE_STATES.APPROACHING);

    safeTimeout(() => {
      // Select encounter word
      const word = selectWord(ADVENTURE_ZONES[currentZoneIndex]);
      if (word) {
        setEncounterWord(word);
        usedWordIdsRef.current.push(word.id);
      }
      encounterCountRef.current += 1;
      lastEncounterProgressRef.current = progressRef.current;

      // Plan 01: No EncounterOverlay yet, so auto-resolve.
      // Transition to ENCOUNTERING briefly, then RESOLVED, then back to EXPLORING.
      setGamePhase(ADVENTURE_STATES.ENCOUNTERING);

      safeTimeout(() => {
        // Auto-resolve with bonus points (simulates correct answer)
        setScore((prev) => prev + ADVENTURE_CONFIG.bonusPoints);
        setGamePhase(ADVENTURE_STATES.RESOLVED);

        safeTimeout(() => {
          setEncounterWord(null);
          setGamePhase(ADVENTURE_STATES.EXPLORING);
        }, ADVENTURE_CONFIG.resolvedDuration);
      }, 500); // Brief encountering pause
    }, ADVENTURE_CONFIG.approachDuration);
  }, [currentZoneIndex, selectWord, safeTimeout]);

  /**
   * Handle zone completion: transition to next zone or finish adventure.
   */
  const handleZoneComplete = useCallback(() => {
    if (currentZoneIndex < ADVENTURE_ZONES.length - 1) {
      setGamePhase(ADVENTURE_STATES.ZONE_TRANSITION);

      safeTimeout(() => {
        setCurrentZoneIndex((prev) => prev + 1);
        // Reset refs for next zone
        sceneOffsetRef.current = 0;
        progressRef.current = 0;
        encounterCountRef.current = 0;
        lastEncounterProgressRef.current = 0;
        setZoneProgress(0);
        setGamePhase(ADVENTURE_STATES.EXPLORING);
      }, ADVENTURE_CONFIG.resolvedDuration);
    } else {
      setGamePhase(ADVENTURE_STATES.COMPLETE);
      safeTimeout(() => {
        if (onComplete) onComplete(score);
      }, 1000);
    }
  }, [currentZoneIndex, score, onComplete, safeTimeout]);

  // --- Game loop via useAnimationFrame (auto-cleanup on unmount) ---
  useAnimationFrame(
    useCallback(
      (time, delta) => {
        if (gamePhase !== ADVENTURE_STATES.EXPLORING) return;

        const norm = delta / 16.67; // Normalize to 60fps
        sceneOffsetRef.current += ADVENTURE_CONFIG.scrollSpeed * norm;
        progressRef.current += ADVENTURE_CONFIG.progressIncrement * norm;

        // Apply scroll via ref (no re-render)
        if (sceneRef.current) {
          sceneRef.current.style.transform = `translate3d(${-sceneOffsetRef.current}px, 0, 0)`;
        }

        // Update visible progress (throttled -- only on integer change)
        const newProgress = Math.min(100, progressRef.current);
        if (Math.floor(newProgress) !== Math.floor(zoneProgress)) {
          setZoneProgress(Math.floor(newProgress));
        }

        // Check zone completion
        if (encounterCountRef.current >= zone.wordCount && progressRef.current >= 80) {
          handleZoneComplete();
          return;
        }

        // Encounter trigger: random chance with minimum distance
        const distSinceLastEncounter = progressRef.current - lastEncounterProgressRef.current;
        if (
          distSinceLastEncounter > 15 &&
          encounterCountRef.current < zone.wordCount &&
          Math.random() < zone.encounterChance
        ) {
          triggerApproach();
        }
      },
      [gamePhase, zone, zoneProgress, handleZoneComplete, triggerApproach]
    )
  );

  // Cleanup all tracked timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  return (
    <ZoneRenderer zone={zone} sceneRef={sceneRef}>
      {/* Player character */}
      <div className="absolute bottom-[22vh] left-[45%] text-6xl">
        {userProfile?.avatar || '\uD83D\uDC78'}
      </div>

      {/* Pet companion */}
      <PetCompanion pet={pet} behavior={petBehavior} />

      {/* Top bar: exit, zone name, score */}
      <div className="absolute top-4 left-4 right-4 z-40">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onExit}
            className="bg-white/80 backdrop-blur rounded-xl p-2 shadow"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="bg-white/80 backdrop-blur rounded-xl px-4 py-2 shadow font-bold">
            {zone.name} - {zone.subtitle}
          </div>
          <div className="bg-white/80 backdrop-blur rounded-xl px-4 py-2 shadow font-bold text-yellow-600">
            {score} pts
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white/30 rounded-full h-3 backdrop-blur">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${zone.theme.accent}`}
            animate={{ width: `${zoneProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Zone transition overlay */}
      <AnimatePresence>
        {gamePhase === ADVENTURE_STATES.ZONE_TRANSITION && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="text-center text-white"
            >
              <div className="text-6xl mb-4">
                {ADVENTURE_ZONES[currentZoneIndex + 1]?.theme?.decorEmojis?.[0] || '\u2728'}
              </div>
              <div className="text-3xl font-bold">
                {ADVENTURE_ZONES[currentZoneIndex + 1]?.name || 'Complete!'}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Adventure complete overlay */}
      <AnimatePresence>
        {gamePhase === ADVENTURE_STATES.COMPLETE && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center text-white bg-white/20 backdrop-blur-xl rounded-3xl p-8"
            >
              <div className="text-6xl mb-4">{'\uD83C\uDFC6'}</div>
              <div className="text-3xl font-bold mb-2">!{'\u05D4\u05E8\u05E4\u05EA\u05E7\u05D4 \u05D4\u05D5\u05E9\u05DC\u05DE\u05D4'}</div>
              <div className="text-xl mb-6">{'\u05E6\u05D1\u05E8\u05EA'} {score} {'\u05E0\u05E7\u05D5\u05D3\u05D5\u05EA'}</div>
              <button
                onClick={onExit}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-2xl text-xl font-bold shadow-lg"
              >
                {'\u05D7\u05D6\u05E8\u05D4 \u05D4\u05D1\u05D9\u05EA\u05D4'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approaching cue (ADVN-08) */}
      <AnimatePresence>
        {gamePhase === ADVENTURE_STATES.APPROACHING && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.8], rotate: [0, -5, 5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            className="absolute bottom-[25vh] right-[30%] text-8xl z-30 drop-shadow-2xl"
          >
            {zone.theme.encounterCue}
          </motion.div>
        )}
      </AnimatePresence>
    </ZoneRenderer>
  );
}
