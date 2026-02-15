# Phase 5: Adventure Game - Research

**Researched:** 2026-02-15
**Domain:** React game loop architecture, CSS-only themed environments, encounter system design, framer-motion animation hooks
**Confidence:** HIGH

## Summary

Phase 5 builds a new `AdventureGame` component that replaces the existing `PetWalkingGame` as the main "exploration" mini-game. The existing PetWalkingGame (513 lines, `src/components/PetWalkingGame.jsx`) provides the architectural blueprint: a requestAnimationFrame-driven game loop with procedural scene generation, encounter triggers, and inline question dialogs. However, the new AdventureGame differs fundamentally in three ways: (1) it uses framer-motion's `useAnimationFrame` hook instead of raw requestAnimationFrame for automatic cleanup, (2) encounters delegate to the Phase 4 ChallengeDispatcher instead of hardcoded multiple-choice, and (3) the visual environment is zone-based with themed CSS backgrounds rather than a single scrolling scene.

The codebase is well-positioned for this work. The challenge infrastructure from Phase 4 (ChallengeDispatcher, 6 challenge types, challengeSelector, distractorGenerator) provides all encounter mechanics. The word bank has 201 words across 10 categories with 15-22 words per category, providing sufficient vocabulary for 5 themed zones. The Zustand gameStore already has all needed state slots (gameState, activePet, completedLevels, userProgress). The key architectural decision is building AdventureGame as a completely separate component from PetWalkingGame (ADVN-02), allowing easy rollback if needed.

The riskiest area is **visual quality** (ADVN-06) -- moving beyond emoji sprites to "better character representations" with CSS-only techniques. Since the project already has `SpriteAnimator.jsx` and sprite sheet assets (`boy_walk.png`, `girl_walk.png`, `dog_walk.png`), the adventure game should use these real sprites rather than emoji characters, layered over CSS gradient/pattern backgrounds for themed zones.

**Primary recommendation:** Build AdventureGame with a state machine (exploring/approaching/encountering/resolved), use framer-motion `useAnimationFrame` for the game loop, create 5 zone configs mapping to word categories, and reuse ChallengeDispatcher for encounters with pet hint overlays.

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.0 | UI framework | Already in project |
| framer-motion | 12.23.26 | `useAnimationFrame` for game loop, `motion` for character/UI animation, `AnimatePresence` for encounter transitions | Already in project; `useAnimationFrame` provides automatic cleanup solving ADVN-01 |
| zustand | 5.0.11 | Game state management (gameState, score, userProgress) | Already in project |
| lucide-react | 0.562.0 | UI icons (ArrowLeft, Star, Heart, etc.) | Already in project |
| canvas-confetti | 1.9.4 | Reward celebrations on correct answers | Already in project |
| tailwindcss | 3.4.17 | Zone-themed CSS backgrounds, responsive layout | Already in project |

### Supporting (No New Dependencies Needed)
| Tool | Purpose | When Used |
|------|---------|-----------|
| CSS gradients + backdrop-filter | Zone-specific visual environments (forest=greens, beach=blues, city=grays) | Zone background rendering |
| SpriteAnimator component | Sprite sheet animation for characters | Already exists at `src/components/SpriteAnimator.jsx` |
| Existing sprite assets | boy_walk.png, girl_walk.png, dog_walk.png | Already in `src/assets/sprites/` |
| ChallengeDispatcher | Routes to correct challenge component during encounters | Already exists from Phase 4 |
| challengeSelector + distractorGenerator | Adaptive challenge type selection and wrong answer generation | Already exist from Phase 4 |
| Web Speech API | Audio pronunciation for ListeningChallenge encounters | Already wired via `src/utils/speech.js` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| framer-motion `useAnimationFrame` | Raw `requestAnimationFrame` with manual cleanup | Raw rAF is what PetWalkingGame uses and is the source of ADVN-01 memory leak. `useAnimationFrame` from framer-motion handles cleanup automatically via React effect lifecycle. Use framer-motion. |
| CSS gradient backgrounds | HTML Canvas for zone rendering | Canvas would allow more complex visuals but adds significant complexity, breaks React's declarative model, and is overkill for themed backgrounds. CSS gradients + decorative elements are sufficient and already proven in PetWalkingGame's THEMES system. |
| Inline encounter UI | Modal/portal-based encounter UI | Inline (overlay within the game container) is simpler and matches PetWalkingGame's existing pattern. No need for portals. |
| New state management for adventure | Extend existing gameStore | Keep adventure state local to the component (zone, encounter state, progress) since it's ephemeral session state. Only scores/completed levels persist through gameStore. This matches the existing pattern where PetWalkingGame manages its own local state. |

**Installation:**
```bash
# No new packages needed -- all dependencies already exist in the project
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    PetWalkingGame.jsx         # KEEP UNCHANGED (ADVN-02: clean architecture, easy rollback)
    SpriteAnimator.jsx         # EXISTING: sprite sheet animation
    adventure/                 # NEW: Adventure game module
      AdventureGame.jsx        # Main component with game loop and state machine
      ZoneRenderer.jsx         # Renders zone background, decorations, parallax layers
      EncounterOverlay.jsx     # Encounter UI wrapping ChallengeDispatcher with pet hints
      PetCompanion.jsx         # Pet display with hint/sniff/idle states
      adventureConfig.js       # Zone definitions, category mappings, visual configs
    challenges/                # EXISTING: Reused for encounters
      ChallengeDispatcher.jsx
      SpellingChallenge.jsx
      MultipleChoiceChallenge.jsx
      ... (all 6 challenge types)
  components/screens/
    AdventureScreen.jsx        # NEW: Screen wrapper for ScreenRouter integration
    PetWalkingScreen.jsx       # KEEP UNCHANGED
    ScreenRouter.jsx           # MODIFY: Add 'adventure' case
  data/
    words.js                   # EXISTING: 201 words with categories
    levels.js                  # EXISTING: May add adventure zone references
  hooks/
    useGameLogic.js            # MODIFY: Add adventure handlers
  store/
    gameStore.js               # MODIFY: Add adventure state if persistence needed
```

### Pattern 1: State Machine for Game Flow
**What:** The adventure game uses a finite state machine with clear transitions instead of ad-hoc state flags.
**When to use:** Always -- this is the core game flow control.

States and transitions:
```
exploring --> approaching --> encountering --> resolved --> exploring
    |                                                         |
    +--> zone_transition (when player reaches zone boundary) -+
    |
    +--> complete (when all zones visited or progress reaches 100%)
```

```javascript
// Source: Pattern derived from PetWalkingGame states + improvement
const ADVENTURE_STATES = {
  EXPLORING: 'exploring',       // Walking through zone, background scrolls
  APPROACHING: 'approaching',   // Pet sniffing, visual cues appear (1-2 seconds)
  ENCOUNTERING: 'encountering', // Challenge overlay visible, player answering
  RESOLVED: 'resolved',         // Correct/wrong feedback shown (1.5-2.5 seconds)
  ZONE_TRANSITION: 'zoneTransition', // Moving between zones
  COMPLETE: 'complete',         // Adventure finished
};
```

### Pattern 2: useAnimationFrame for Game Loop (ADVN-01 Fix)
**What:** Replace raw requestAnimationFrame with framer-motion's `useAnimationFrame` hook.
**When to use:** For the main game loop driving scene scrolling and encounter triggers.

```javascript
// Source: framer-motion v12 source (verified in node_modules)
// Signature: useAnimationFrame(callback: (time: number, delta: number) => void)
// - time: milliseconds since the hook first ran
// - delta: milliseconds since the last frame
// - Automatically cleans up via cancelFrame in useEffect return
// - Callback is called on every animation frame when component is mounted
// - Set to a no-op or guard with state to "pause"

import { useAnimationFrame } from 'framer-motion';

function AdventureGame() {
  const [gamePhase, setGamePhase] = useState('exploring');

  useAnimationFrame((time, delta) => {
    if (gamePhase !== 'exploring') return; // Only scroll during exploration

    // Update scene offset for parallax scrolling
    sceneOffsetRef.current += SCROLL_SPEED * (delta / 16.67); // Normalize to 60fps

    // Check for encounter trigger
    if (shouldTriggerEncounter(time)) {
      setGamePhase('approaching');
    }

    // Update progress
    progressRef.current += PROGRESS_INCREMENT * (delta / 16.67);
  });

  // No cleanup needed -- useAnimationFrame handles it automatically
}
```

### Pattern 3: Zone Configuration Data Structure
**What:** Static configuration objects defining each zone's visual theme, word categories, and encounter settings.
**When to use:** Zone rendering and word selection.

```javascript
// Source: Derived from PetWalkingGame THEMES + levels.js LEVELS patterns
const ADVENTURE_ZONES = [
  {
    id: 'forest',
    name: 'היער הקסום',        // The Enchanted Forest
    subtitle: 'Enchanted Forest',
    categories: ['nature', 'animals'],  // Maps to word bank categories
    theme: {
      sky: 'from-emerald-200 via-green-100 to-lime-50',
      ground: 'from-emerald-600 to-green-800',
      accent: 'from-green-400 to-emerald-500',
      filter: 'contrast(1.1) saturate(1.2)',
      decorEmojis: ['🌳', '🌲', '🍄', '🌿', '🦋', '🐿️'],
      encounterCue: '🌿',     // Rustling bush visual
    },
    encounterChance: 0.004,    // Per-frame probability during exploring
    wordCount: 5,              // Encounters per zone
  },
  {
    id: 'beach',
    name: 'חוף הים',            // The Beach
    subtitle: 'Ocean Beach',
    categories: ['colors', 'food'],
    theme: {
      sky: 'from-sky-300 via-blue-200 to-cyan-100',
      ground: 'from-yellow-300 to-amber-400',
      accent: 'from-cyan-400 to-blue-500',
      filter: 'brightness(1.05) saturate(1.1)',
      decorEmojis: ['🏖️', '🐚', '🌊', '🦀', '⛱️', '🐠'],
      encounterCue: '🐚',
    },
    encounterChance: 0.004,
    wordCount: 5,
  },
  {
    id: 'city',
    name: 'העיר הגדולה',         // The Big City
    subtitle: 'The Big City',
    categories: ['professions', 'home'],
    theme: {
      sky: 'from-slate-300 via-gray-200 to-blue-100',
      ground: 'from-gray-500 to-slate-700',
      accent: 'from-amber-400 to-yellow-500',
      filter: 'contrast(1.05)',
      decorEmojis: ['🏢', '🏬', '🚗', '🚦', '🏪', '🏗️'],
      encounterCue: '📦',
    },
    encounterChance: 0.004,
    wordCount: 5,
  },
  {
    id: 'mountain',
    name: 'פסגת ההרים',          // Mountain Summit
    subtitle: 'Mountain Summit',
    categories: ['body', 'actions'],
    theme: {
      sky: 'from-indigo-300 via-purple-200 to-pink-100',
      ground: 'from-stone-500 to-gray-700',
      accent: 'from-purple-400 to-indigo-500',
      filter: 'contrast(1.15) brightness(0.95)',
      decorEmojis: ['⛰️', '🏔️', '🦅', '🌄', '🪨', '❄️'],
      encounterCue: '🪨',
    },
    encounterChance: 0.004,
    wordCount: 5,
  },
  {
    id: 'space',
    name: 'החלל החיצון',         // Outer Space
    subtitle: 'Outer Space',
    categories: ['emotions', 'family'],
    theme: {
      sky: 'from-indigo-950 via-purple-900 to-slate-900',
      ground: 'from-slate-800 to-indigo-950',
      accent: 'from-blue-500 to-violet-600',
      filter: 'brightness(0.9) contrast(1.3)',
      decorEmojis: ['🌟', '🪐', '🚀', '🛸', '🌌', '👽'],
      encounterCue: '🌟',
    },
    encounterChance: 0.004,
    wordCount: 5,
  },
];
```

### Pattern 4: Encounter Integration with ChallengeDispatcher
**What:** Reuse Phase 4 challenge infrastructure for adventure encounters.
**When to use:** When the game transitions from approaching to encountering state.

```javascript
// Select a word from the current zone's categories
function selectEncounterWord(zone, usedWordIds) {
  const pool = initialWordData.filter(
    w => zone.categories.includes(w.category) && !usedWordIds.includes(w.id)
  );
  return pool[Math.floor(Math.random() * pool.length)];
}

// Select challenge type using existing adaptive selector
function selectEncounterChallenge(word, userProgress) {
  const srsState = userProgress[word.id];
  return selectChallengeType(word, srsState, []);
}

// In EncounterOverlay, render via ChallengeDispatcher
<ChallengeDispatcher
  challengeType={challengeType}
  word={encounterWord}
  onAnswer={handleEncounterAnswer}
  disabled={isResolved}
  playerGender={playerGender}
  t={t}
  scrambledContent={scrambledContent}
  userInput={userInput}
  setUserInput={setUserInput}
  onCheck={handleCheck}
/>
```

### Pattern 5: Pet Companion with Contextual Abilities (ADVN-07, ADVN-08)
**What:** Pet provides visual cues before encounters and hints during them.
**When to use:** Pet behavior changes based on game state.

```javascript
const PET_BEHAVIORS = {
  exploring: {
    animation: 'walk',     // Normal walking animation
    emoji: PET_EMOJIS[petType].walk,
  },
  approaching: {
    animation: 'sniff',    // Pet sniffing, alert animation
    emoji: PET_EMOJIS[petType].sniff,
    cueIcon: zone.theme.encounterCue, // Rustling bush / glowing star
    cueDelay: 1200,        // Duration of approach phase
  },
  encountering: {
    animation: 'idle',     // Pet watches encounter
    hintBubble: true,      // Show thought bubble with hint after delay
    hintDelay: 8000,       // Wait 8 seconds before showing hint
  },
  resolved: {
    animation: 'celebrate', // Pet celebrates correct / comforts wrong
  },
};

// Pet hint implementation: after hintDelay, show word's emoji in thought bubble
// This gives player chance to answer without help first
```

### Anti-Patterns to Avoid
- **Modifying PetWalkingGame:** ADVN-02 explicitly requires building AdventureGame separately. Do not refactor PetWalkingGame. Leave it completely untouched.
- **State in requestAnimationFrame callback:** Do not read React state inside the rAF callback via stale closures. Use refs for mutable values that the game loop reads (sceneOffset, progress, encounterCount). Only use setState for values that trigger re-renders (gamePhase, currentZone).
- **Overly frequent re-renders:** PetWalkingGame's `sceneRenderTrigger` state counter triggers re-renders every 2 frames (33ms). Instead, use CSS transforms and refs for continuous motion, and only setState when game phase actually changes. `useAnimationFrame` already runs on every frame -- use it to update refs, not state.
- **Hardcoded word lists in the component:** PetWalkingGame has 8 hardcoded quest words. AdventureGame must draw from `initialWordData` filtered by zone categories.
- **Inline challenge UI:** PetWalkingGame renders its own question buttons. AdventureGame must delegate to ChallengeDispatcher for challenge rendering to get all 6 challenge types.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animation frame loop with cleanup | Custom requestAnimationFrame + isActive flag + cancelAnimationFrame | `useAnimationFrame` from framer-motion | Automatically handles cleanup on unmount, normalizes timing via delta, already in project |
| Challenge type selection | Hardcoded "always multiple choice" | `selectChallengeType()` from `src/utils/challengeSelector.js` | Adaptive difficulty based on SRS mastery bands, already built in Phase 4 |
| Wrong answer generation | Random word picking for distractors | `generateDistractors()` from `src/utils/distractorGenerator.js` | Same-category preference for harder distractors, already built in Phase 4 |
| Challenge UI rendering | Custom buttons/inputs per challenge type | `ChallengeDispatcher` from Phase 4 | Routes to all 6 challenge types with consistent props interface |
| Word shuffling for spelling | Ad-hoc Array.sort() | `shuffleArray()` from `src/utils/distractorGenerator.js` | Proper Fisher-Yates shuffle, already exported |
| Score/progress persistence | Direct localStorage calls | `useGameStore` actions (addScore, addStars, updateDailyStats) | Debounced storage adapter, migration-safe, centralized |
| Sprite animation | Manual background-position manipulation | `SpriteAnimator` component | Already handles sprite sheet stepping with framer-motion |
| Haptic feedback | Navigator.vibrate() calls | `hapticFeedback()` from `src/utils/mobile.js` | Already handles browser support detection |
| Audio pronunciation | SpeechSynthesis API calls | `speakWord()` from `src/utils/speech.js` | Already handles browser support, used by ListeningChallenge |

**Key insight:** Phase 4 already built the entire challenge/encounter infrastructure. AdventureGame is primarily a **wrapper and orchestrator** that provides the exploration context around those challenges. The heavy lifting (challenge types, adaptive selection, distractors, scoring) is already done.

## Common Pitfalls

### Pitfall 1: Memory Leak from Animation Loop (ADVN-01)
**What goes wrong:** requestAnimationFrame continues running after component unmount, causing setState on unmounted component.
**Why it happens:** The existing PetWalkingGame already has this bug (though partially mitigated with isActive flag). If the isActive flag check races with component unmount, the loop leaks.
**How to avoid:** Use framer-motion's `useAnimationFrame` hook which handles cleanup automatically via its internal useEffect. Verified in framer-motion v12.23.26 source: the cleanup function calls `cancelFrame(provideTimeSinceStart)`.
**Warning signs:** Console warnings about "setState on unmounted component", increasing memory usage in DevTools, frame rate degradation after multiple mount/unmount cycles.

### Pitfall 2: Stale Closures in Game Loop
**What goes wrong:** The `useAnimationFrame` callback captures stale values of React state variables because the callback is recreated only when its dependencies change.
**Why it happens:** React's closure model means the callback sees the state values from when it was last created, not the current values.
**How to avoid:** Use refs for values the game loop needs to read/write frequently (sceneOffset, progress, encounterCount). Use state only for values that should trigger re-renders (gamePhase, currentZoneIndex). Wrap the callback in useCallback with appropriate deps, or read from refs inside the callback.
**Warning signs:** Game loop uses old state values, encounters don't trigger, progress jumps.

### Pitfall 3: Re-render Storm from Game Loop State Updates
**What goes wrong:** Calling setState on every animation frame (60fps) causes 60 React re-renders per second, degrading performance.
**Why it happens:** PetWalkingGame does this with `setSceneRenderTrigger(prev => prev + 1)` every 2 frames and `setProgress()` every frame.
**How to avoid:** Store continuously-changing values (scrollOffset, character positions) in refs. Apply them via `style` prop with `transform: translate3d()` for GPU acceleration. Only use setState for discrete state transitions (exploring -> approaching -> encountering). Use `will-change: transform` CSS property on animated elements.
**Warning signs:** React DevTools shows constant re-renders, janky scrolling, high CPU usage.

### Pitfall 4: SpellingChallenge Props Mismatch
**What goes wrong:** SpellingChallenge requires extra props beyond the standard challenge interface: `scrambledContent`, `userInput`, `setUserInput`, `onCheck`. These are managed by useGameLogic, not locally.
**Why it happens:** SpellingChallenge wraps LetterPicker which needs these interactive state values.
**How to avoid:** When spelling challenge is selected for an encounter, the EncounterOverlay must manage its own local `userInput` and `scrambledContent` state (or wire into existing useGameLogic). The simplest approach is to manage encounter-specific input state locally in the encounter component.
**Warning signs:** SpellingChallenge renders but input doesn't work, or input affects the main game's state.

### Pitfall 5: Zone Word Pool Exhaustion
**What goes wrong:** A zone's category pool runs out of words if the player encounters the same zone repeatedly.
**Why it happens:** With 5 encounters per zone and categories having 15-22 words, heavy replay could exhaust the pool if tracking "used words" persists across sessions.
**How to avoid:** Track used words only within a single adventure session (not persisted). Reset the used-word set when starting a new adventure. If the pool is genuinely exhausted within a session (unlikely with 15+ words for 5 encounters), wrap around.
**Warning signs:** `undefined` word in encounter, repeated identical words.

### Pitfall 6: ChallengeDispatcher Integration with Encounter Lifecycle
**What goes wrong:** The encounter doesn't properly transition from encountering to resolved state after answer, or the feedback overlay from PlayingScreen conflicts with encounter UI.
**Why it happens:** In the normal game flow, `useGameLogic.processAnswer()` manages feedback, lives, word progression. In adventure mode, the encounter should only report score/correctness, not advance the word index or check lives.
**How to avoid:** Create a lightweight `handleEncounterAnswer(isCorrect)` that (1) plays confetti/haptic, (2) updates score via gameStore, (3) updates SRS state for the word, (4) transitions encounter to resolved state, and (5) after delay, returns to exploring. Do NOT reuse `processAnswer()` directly as it manages level progression.
**Warning signs:** Answering an encounter advances the main game's word index, or causes a "level complete" screen.

## Code Examples

### Example 1: AdventureGame Component Shell with useAnimationFrame

```javascript
// Source: Pattern combining PetWalkingGame structure + framer-motion useAnimationFrame API
import { useState, useRef, useCallback } from 'react';
import { useAnimationFrame, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { ADVENTURE_ZONES } from './adventureConfig';

export default function AdventureGame({ pet, userProfile, onExit, onComplete }) {
  const [gamePhase, setGamePhase] = useState('exploring');
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
  const [encounterWord, setEncounterWord] = useState(null);

  // Mutable refs for game loop (no re-renders)
  const sceneOffsetRef = useRef(0);
  const progressRef = useRef(0);
  const encounterCountRef = useRef(0);
  const usedWordIdsRef = useRef([]);

  const zone = ADVENTURE_ZONES[currentZoneIndex];

  // Game loop -- automatically cleaned up on unmount (ADVN-01)
  useAnimationFrame(useCallback((time, delta) => {
    if (gamePhase !== 'exploring') return;

    const normalizedDelta = delta / 16.67; // Normalize to 60fps baseline
    sceneOffsetRef.current += 4 * normalizedDelta;
    progressRef.current += 0.03 * normalizedDelta;

    // Apply scroll offset via ref (no setState)
    if (sceneRef.current) {
      sceneRef.current.style.transform =
        `translate3d(${-sceneOffsetRef.current}px, 0, 0)`;
    }

    // Check zone completion
    if (progressRef.current >= 100) {
      onComplete(score);
      return;
    }

    // Encounter trigger (random with minimum distance)
    if (Math.random() < zone.encounterChance && encounterCountRef.current < zone.wordCount) {
      setGamePhase('approaching');
    }
  }, [gamePhase, zone]));

  // ... render zone background, characters, encounter overlay
}
```

### Example 2: Zone Background Rendering with CSS

```javascript
// Source: Pattern derived from PetWalkingGame THEMES
function ZoneRenderer({ zone, sceneOffset, children }) {
  return (
    <div className="fixed inset-0 overflow-hidden select-none">
      {/* Sky layer */}
      <div className={`absolute inset-0 bg-gradient-to-b ${zone.theme.sky} transition-all duration-[3000ms]`} />

      {/* Ground layer */}
      <div className={`absolute bottom-0 w-full h-[35vh] bg-gradient-to-t ${zone.theme.ground}`} />

      {/* Decorative elements (parallax) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {zone.theme.decorEmojis.map((emoji, i) => (
          <div
            key={i}
            className="absolute bottom-[20vh] will-change-transform text-6xl"
            style={{
              transform: `translate3d(${(i * 200 - sceneOffset * 0.8) % window.innerWidth}px, 0, 0)`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Characters and UI overlay */}
      {children}
    </div>
  );
}
```

### Example 3: Encounter Overlay with ChallengeDispatcher

```javascript
// Source: Pattern combining PetWalkingGame question dialog + PlayingScreen ChallengeDispatcher usage
function EncounterOverlay({ word, zone, pet, playerGender, t, onAnswer }) {
  const [userInput, setUserInput] = useState('');
  const [isResolved, setIsResolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Pet hint timer (ADVN-07)
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(true), 8000);
    return () => clearTimeout(timer);
  }, [word.id]);

  // Determine challenge type using existing selector
  const challengeType = useMemo(() => {
    const srsState = useGameStore.getState().userProgress[word.id];
    return selectChallengeType(word, srsState, []);
  }, [word.id]);

  const scrambledContent = useMemo(() => {
    if (word.type === 'sentence') return shuffleArray(word.word.split(' '));
    return shuffleArray(word.word.split(''));
  }, [word.id]);

  const handleCheck = () => {
    const isCorrect = userInput.trim().toUpperCase() === word.word.toUpperCase();
    handleAnswer(isCorrect);
  };

  const handleAnswer = (isCorrect) => {
    setIsResolved(true);
    onAnswer(isCorrect);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative"
      >
        {/* Pet hint bubble (ADVN-07) */}
        {showHint && !isResolved && (
          <div className="absolute -top-16 right-4 bg-yellow-100 rounded-2xl p-3 text-2xl shadow-lg">
            {pet.icon} {word.emoji}
          </div>
        )}

        <ChallengeDispatcher
          challengeType={challengeType}
          word={word}
          onAnswer={handleAnswer}
          disabled={isResolved}
          playerGender={playerGender}
          t={t}
          scrambledContent={scrambledContent}
          userInput={userInput}
          setUserInput={setUserInput}
          onCheck={handleCheck}
        />
      </motion.div>
    </motion.div>
  );
}
```

### Example 4: Approaching Phase Visual Cues (ADVN-08)

```javascript
// Visual cues that signal upcoming encounter
// During 'approaching' state (1.2s), show rustling/glowing effects
function ApproachingCue({ zone, onApproachComplete }) {
  useEffect(() => {
    const timer = setTimeout(onApproachComplete, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 1.2, 1],
        opacity: [0, 1, 0.8],
        rotate: [0, -5, 5, 0],
      }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="absolute bottom-[25vh] right-[30%] text-8xl filter drop-shadow-2xl z-30"
    >
      {zone.theme.encounterCue}
    </motion.div>
  );
}
```

## State of the Art

| Old Approach (PetWalkingGame) | New Approach (AdventureGame) | Why Changed | Impact |
|-------------------------------|------------------------------|-------------|--------|
| Raw requestAnimationFrame with isActive flag | framer-motion `useAnimationFrame` hook | Automatic cleanup eliminates memory leak (ADVN-01) | No more leaked animation frames on unmount |
| setState every 2 frames for scroll offset | Refs + CSS transform for continuous motion | Eliminates 30 unnecessary re-renders/second | Much better performance, no jank |
| Hardcoded 8-word quest list | initialWordData filtered by zone categories | 201 words across 10 categories | Real vocabulary practice, not placeholder content |
| Single "multiple choice" question type | ChallengeDispatcher with 6 challenge types | Reuses Phase 4 infrastructure | Varied encounters (spelling, MC, reverse, listening, sentence, grammar) |
| Emoji-only characters (princess, dog) | SpriteAnimator with sprite sheet assets | ADVN-06: improved visuals beyond emoji | More polished character rendering |
| Single scrolling scene | 5 themed zones with distinct CSS backgrounds | ADVN-03: 3-5 themed encounter zones | Visual variety tied to vocabulary categories |
| No pet abilities | Pet hints, sniffing cues, bonus items | ADVN-07, ADVN-08: pet integration | Organic discovery feel, pet companionship value |

## Open Questions

1. **Character sprites for adventure zones**
   - What we know: `src/assets/sprites/` has boy_walk.png, girl_walk.png, dog_walk.png. SpriteAnimator component exists.
   - What's unclear: Are the existing sprites suitable for all zones, or do zones need different character sprites? Do we need idle/celebrate sprite variants?
   - Recommendation: Use existing sprites for walking state. For idle/sniff/celebrate states, fall back to emoji representations like PetWalkingGame does. This is a pragmatic balance between ADVN-06 ("beyond emoji") and not requiring new art assets.

2. **Adventure entry point in the UI**
   - What we know: PetWalkingGame is accessed via inventory (walk pet). Adventure game needs its own entry point.
   - What's unclear: Should adventure be on StartScreen as a main game mode? On MapScreen? Replace pet walking entirely?
   - Recommendation: Add an "Adventure" button on StartScreen alongside existing modes (Review, Map, Memory, Store). Keep pet walking as a separate mode for now (ADVN-02 says build separately). Future phases could merge or replace.

3. **Adventure progress persistence**
   - What we know: PetWalkingGame progress is ephemeral (resets each session). GameStore has completedLevels array.
   - What's unclear: Should completed adventure zones be persisted? Should there be a "per-zone high score"?
   - Recommendation: Start with ephemeral session state (simpler, matches PetWalkingGame pattern). Only persist the score earned (already done via gameStore.addScore). Defer per-zone tracking to a future phase.

4. **Zone transition mechanics**
   - What we know: Requirement says 3-5 zones. Player must move between them.
   - What's unclear: Automatic progression (zone 1 -> 2 -> 3) or player choice?
   - Recommendation: Automatic linear progression. When a zone's encounter quota is met, auto-transition to next zone with a brief transition animation. This is simpler and guarantees exposure to all category-zone pairs.

5. **Bonus items from pet (ADVN-07)**
   - What we know: "Pet finds bonus items" is listed as a requirement.
   - What's unclear: What are bonus items? Score multipliers? Extra lives? Store items?
   - Recommendation: After correct answers, random chance (20%) that pet "finds" a bonus (+25 bonus points). Keep it simple -- a score bonus with a fun animation, not inventory items. This avoids coupling with the store/inventory system.

## Sources

### Primary (HIGH confidence)
- **framer-motion v12.23.26 source code** (node_modules) -- `useAnimationFrame` implementation verified: callback receives `(time, delta)`, automatic cleanup via `cancelFrame` in useEffect return
- **Project codebase** -- PetWalkingGame.jsx (513 lines), ChallengeDispatcher.jsx, all 6 challenge components, challengeSelector.js, distractorGenerator.js, gameStore.js, words.js (201 words), levels.js, constants.js
- **Phase 4 Research and Summaries** -- Challenge props interface `{ word, onAnswer, disabled, playerGender, t }`, distractor generator returns full word objects, ChallengeDispatcher routing pattern

### Secondary (MEDIUM confidence)
- [framer-motion useAnimationFrame docs](https://motion.dev/motion/use-animation-frame/) -- API signature and usage confirmed via source code
- [React memory leak prevention patterns](https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/) -- useEffect cleanup for rAF, AbortController for fetch
- [CSS parallax with Tailwind](https://www.slingacademy.com/article/tailwind-css-how-to-create-parallax-scrolling-effect/) -- bg-fixed, transform-based parallax layers

### Tertiary (LOW confidence)
- None -- all critical findings verified against project source code or official framer-motion source.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in project, no new dependencies
- Architecture: HIGH -- patterns directly derived from existing PetWalkingGame, verified framer-motion APIs
- Pitfalls: HIGH -- pitfalls observed in existing PetWalkingGame source code (memory leak, stale closures, render storms)
- Zone/category mapping: HIGH -- word counts verified by grep (15-22 words per category across 10 categories)
- Challenge integration: HIGH -- all Phase 4 components and utils verified in codebase

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (stable -- no fast-moving dependencies)
