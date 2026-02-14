# Phase 2: Architecture Refactoring - Research

**Researched:** 2026-02-14
**Domain:** React component architecture, centralized state management, data validation
**Confidence:** HIGH

## Summary

Phase 2 transforms a monolithic 627-line WordAdventure.jsx into a clean architecture with four workstreams: component decomposition, centralized state via Zustand, localStorage migration to persist middleware, and data validation via Zod + nanoid. The codebase already has partial extraction started (four screen components exist in `src/components/screens/`, five custom hooks exist in `src/hooks/`), but WordAdventure.jsx still duplicates all their logic internally -- the extracted code is unused. The refactoring is therefore largely a rewiring exercise: make WordAdventure.jsx delegate to the existing hooks and screen components, replace direct localStorage calls with Zustand persist, add Zod validation to word data, and fix PetWalkingGame's gender inference.

All three new libraries (Zustand, Zod, nanoid) are mature, well-documented, and have straightforward APIs. The project is plain JavaScript (not TypeScript), React 19, Vite 7, with happy-dom/vitest for testing. The existing 51 tests (45 unit + 6 snapshot) must remain green throughout.

**Primary recommendation:** Work in four sequential plans (decompose first, then context, then Zustand, then schema), because each depends on the prior -- screen components need to consume context, context needs Zustand underneath, and schema validation validates the data that flows through all of them.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | ^5.0.11 | Centralized state management with persist middleware | De facto React state management for medium apps; 2KB gzipped; built-in persist middleware eliminates all manual localStorage serialization |
| zod | ^4.3.6 | Word data schema validation | Latest stable; works in plain JS despite TypeScript-first branding; `safeParse` gives clear error messages for missing fields |
| nanoid | ^5.1.6 | Unique ID generation for word entries | 130 bytes; URL-friendly; cryptographically secure; replaces `Date.now() + Math.random()` pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod/mini | (included in zod) | Smaller Zod variant | Consider if bundle size becomes a concern -- 50% smaller core, same `parse`/`safeParse` API |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | React Context + useReducer | Already built into React, but requires more boilerplate, no built-in persist, manual optimization for re-renders |
| Zustand | Jotai | Atomic model better for fine-grained state, but overkill here -- game state is mostly read together |
| Zod | Yup / Joi | Zod has better tree-shaking, lighter bundle, and native `safeParse` without try/catch |
| nanoid | uuid | uuid generates 36-char strings; nanoid generates 21-char URL-friendly strings; smaller bundle |

**Installation:**
```bash
npm install zustand zod nanoid
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── WordAdventure.jsx          # Thin orchestrator (~50-80 lines): providers + ScreenRouter
├── App.jsx                    # Unchanged
├── components/
│   ├── screens/               # One component per gameState value
│   │   ├── StartScreen.jsx    # Already exists (needs context wiring)
│   │   ├── MapScreen.jsx      # Already exists (needs context wiring)
│   │   ├── PlayingScreen.jsx  # Already exists (needs context wiring)
│   │   ├── ResultScreen.jsx   # Already exists (needs context wiring)
│   │   ├── StoreScreen.jsx    # Extract from WordAdventure inline JSX
│   │   ├── InventoryScreen.jsx# Extract from WordAdventure inline JSX
│   │   ├── MemoryScreen.jsx   # Extract from WordAdventure inline JSX
│   │   ├── PetWalkingScreen.jsx # Extract from WordAdventure inline JSX
│   │   ├── AvatarScreen.jsx   # Extract from WordAdventure inline JSX
│   │   ├── ScreenRouter.jsx   # Switch on gameState -> render correct screen
│   │   └── index.js           # Barrel export
│   ├── GameHeader.jsx         # Top bar (home, store, inventory, score, avatar)
│   ├── LetterPicker.jsx       # Challenge component (already has { challenge-like, onCheck, disabled })
│   ├── MemoryGame.jsx         # Challenge component
│   ├── PetWalkingGame.jsx     # Fix: use userProfile.gender instead of avatar inference
│   └── ...                    # Other existing components unchanged
├── context/
│   └── GameContext.jsx        # React Context provider composing Zustand store
├── store/
│   └── gameStore.js           # Zustand store with persist middleware + slices
├── data/
│   ├── words.js               # Single source of truth (remove duplicate from WordAdventure)
│   └── wordSchema.js          # Zod schema + validation function
├── hooks/
│   ├── useGameState.js        # Already exists -- will be consumed by Zustand store
│   ├── useUserProgress.js     # Already exists -- will be consumed by Zustand store
│   ├── useDailyStats.js       # Already exists -- will be consumed by Zustand store
│   ├── useStoryProgress.js    # Already exists -- uses safeGetJSON internally (migrate)
│   ├── useItemEffects.js      # Already exists -- uses safeGetJSON internally (migrate)
│   └── index.js               # Barrel export
├── utils/
│   ├── storage.js             # Keep for backward compatibility, but components stop calling it directly
│   └── ...
└── config/
    └── constants.js           # Already exists
```

### Pattern 1: ScreenRouter (ARCH-01, ARCH-02)
**What:** A pure switching component that maps `gameState` string to the correct screen component.
**When to use:** When a parent component has a large switch/conditional render block.
**Example:**
```jsx
// Source: Standard React pattern
import { AnimatePresence } from 'framer-motion';

const SCREEN_MAP = {
  start: StartScreen,
  map: MapScreen,
  playing: PlayingScreen,
  levelComplete: ResultScreen,
  gameOver: ResultScreen,
  store: StoreScreen,
  inventory: InventoryScreen,
  memory: MemoryScreen,
  petWalking: PetWalkingScreen,
  avatar: AvatarScreen,
};

export default function ScreenRouter({ gameState }) {
  const Screen = SCREEN_MAP[gameState];
  if (!Screen) return null;

  return (
    <AnimatePresence mode="wait">
      <Screen key={gameState} />
    </AnimatePresence>
  );
}
```

### Pattern 2: Zustand Store with Persist + Slices (ARCH-03, ARCH-04)
**What:** A single Zustand store composed from "slices" (logical groupings), wrapped with persist middleware.
**When to use:** When multiple React hooks each manage their own localStorage and you want one source of truth.
**Example:**
```jsx
// Source: Context7 /pmndrs/zustand - Slices Pattern + Persist
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const createUserSlice = (set) => ({
  userProfile: null,
  score: 0,
  stars: 0,
  inventory: [],
  setUserProfile: (profile) => set({ userProfile: profile }),
  addScore: (points) => set((s) => ({ score: s.score + points })),
});

const createGameSlice = (set) => ({
  gameState: 'start',
  currentWordIndex: 0,
  lives: 3,
  feedback: null,
  setGameState: (state) => set({ gameState: state }),
});

export const useGameStore = create(
  persist(
    (...a) => ({
      ...createUserSlice(...a),
      ...createGameSlice(...a),
    }),
    {
      name: 'word-adventure',
      partialize: (state) => ({
        // Only persist what needs to survive page refresh
        userProfile: state.userProfile,
        score: state.score,
        stars: state.stars,
        inventory: state.inventory,
        userProgress: state.userProgress,
        highScores: state.highScores,
        dailyStats: state.dailyStats,
        // Do NOT persist: gameState, currentWordIndex, lives, feedback (ephemeral)
      }),
    }
  )
);
```

### Pattern 3: GameContext Provider (ARCH-03)
**What:** A React Context that wraps the Zustand store and exposes it to the component tree. This satisfies the requirement that "game state, user progress, story progress, daily stats, and item effects are accessed via a single GameContext provider."
**When to use:** When the requirements call for a context provider but you want Zustand's performance underneath.
**Example:**
```jsx
// Source: Context7 /pmndrs/zustand - React Context pattern
import { createContext, useContext } from 'react';
import { useGameStore } from '../store/gameStore';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  // Compose the store values that components need
  const store = useGameStore();
  return (
    <GameContext.Provider value={store}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
```

### Pattern 4: Zod Word Schema (ARCH-09, CONT-10)
**What:** A Zod schema that validates every word entry at load time.
**When to use:** When data integrity is critical and you want clear error messages for malformed entries.
**Example:**
```jsx
// Source: Context7 /colinhacks/zod - object schema + safeParse
import { z } from 'zod';

export const WordSchema = z.object({
  id: z.string().min(1),
  word: z.string().min(1),
  hebrew: z.string().min(1),
  hint: z.string().min(1),
  category: z.string().optional(), // optional until content phase adds categories
  emoji: z.string().optional(),    // optional until content phase adds emojis
  level: z.enum(['easy', 'medium', 'hard', 'expert']),
  type: z.enum(['word', 'sentence']),
  gender: z.enum(['m', 'f', 'n']).optional(), // Hebrew grammatical gender
  exampleSentence: z.string().optional(),     // optional until content phase
});

export const WordListSchema = z.array(WordSchema);

export function validateWords(words) {
  const result = WordListSchema.safeParse(words);
  if (!result.success) {
    const issues = result.error.issues.map(
      (i) => `Word ${i.path.join('.')}: ${i.message}`
    );
    throw new Error(`Word validation failed:\n${issues.join('\n')}`);
  }
  return result.data;
}
```

### Pattern 5: Debounced Zustand Persist (ARCH-08)
**What:** Zustand's persist middleware writes to localStorage on every state change. For high-frequency updates (typing, streaks), this can cause serialization-per-keystroke.
**When to use:** When state updates happen faster than ~100ms.
**Example:**
```jsx
// Approach: use Zustand subscribeWithSelector + debounce
// The persist middleware already batches reasonably, but for extra safety:
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Option A: partialize to exclude ephemeral state (preferred)
// This naturally prevents high-frequency writes since userInput/feedback
// are not persisted.

// Option B: Custom storage adapter with debounce
const debouncedStorage = {
  getItem: (name) => {
    const str = localStorage.getItem(name);
    return str ? JSON.parse(str) : null;
  },
  setItem: (() => {
    let timeout;
    return (name, value) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.setItem(name, JSON.stringify(value));
      }, 300);
    };
  })(),
  removeItem: (name) => localStorage.removeItem(name),
};
```

### Anti-Patterns to Avoid
- **Persisting ephemeral state:** Do not persist gameState, currentWordIndex, userInput, feedback, lives in localStorage. These reset on page load. Only persist user data (profile, score, progress, inventory).
- **Prop drilling through ScreenRouter:** Screen components should consume context directly, not receive 15+ props from the router. The ScreenRouter should pass at most `gameState` and component-specific callback overrides.
- **Zustand store as God object:** Keep logical slices (user, game, story, daily). Even though they merge into one store, the slice pattern keeps code organized.
- **Synchronous validation on every render:** Validate words once at module load time or in a build step, not on every render cycle.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State persistence to localStorage | Manual useEffect + safeSetJSON per state field | Zustand persist middleware | Handles serialization, rehydration, partial state, storage errors automatically |
| Data validation | Manual if-checks for required fields | Zod safeParse | Catches all issues at once, gives structured error messages, composable |
| Unique ID generation | `Date.now() + Math.random().toString(36)` | nanoid | Cryptographically secure, collision-resistant, smaller output |
| Debounced writes | Custom debounce function | Zustand partialize (exclude ephemeral) | Simpler approach: just don't persist what changes fast |

**Key insight:** The current codebase has 5 separate hooks, each with their own useEffect -> localStorage persistence cycle. This results in ~10 independent useEffect calls that serialize to localStorage on every state change. Zustand persist replaces all of them with a single middleware that handles serialization, batching, and rehydration.

## Common Pitfalls

### Pitfall 1: Breaking Existing Snapshots During Decomposition
**What goes wrong:** Extracting JSX from WordAdventure.jsx into screen components changes the DOM structure, breaking all 6 snapshot tests.
**Why it happens:** Snapshot tests capture exact HTML output. Any wrapper div or component boundary change breaks them.
**How to avoid:** Update snapshots deliberately after each plan. Run `npx vitest run -u` to regenerate snapshots after confirming the UI renders correctly. Do NOT auto-update without verifying.
**Warning signs:** Tests fail with "Received value does not match stored snapshot."

### Pitfall 2: Double-Loading State from localStorage
**What goes wrong:** When migrating from direct localStorage reads to Zustand persist, there's a period where both systems coexist. Components may initialize state from localStorage AND get state from Zustand, causing flicker or double-initialization.
**Why it happens:** Zustand persist rehydrates asynchronously after the initial render. During hydration, the store has default values, not the persisted ones.
**How to avoid:** Migrate storage fully in one plan. Use `onRehydrateStorage` callback to know when persist has loaded. Consider the `skipHydration` option if needed during testing.
**Warning signs:** State values flash/reset on page load, then correct themselves.

### Pitfall 3: PetWalkingGame Gender Inference Removal
**What goes wrong:** PetWalkingGame line 56 currently infers gender from avatar emoji: `const isGirl = (userProfile?.gender === 'girl') || (avatar === '👸') || (userProfile?.avatar === '👸')`. Simply removing the avatar-based fallback without ensuring `userProfile.gender` is always passed could break the component for users who created profiles before gender was a required field.
**Why it happens:** Legacy code path. Early users may have profiles without a gender field.
**How to avoid:** When fixing ARCH-06, add a default gender value ('boy') for profiles that lack one. The fix is: `const isGirl = userProfile?.gender === 'girl';` -- but ensure `userProfile` is always provided (via context).
**Warning signs:** PetWalkingGame shows wrong avatar animation after refactoring.

### Pitfall 4: Zustand Persist Migration Key Conflicts
**What goes wrong:** The current code uses 8+ separate localStorage keys (userProfile, score, stars, userProgress, highScores, inventory, dailyStats, avatar, storyProgress, word_adventure_equipped, word_adventure_consumable_counts, hasSeenStoryIntro). Zustand persist stores everything under ONE key. If you don't migrate, old data is orphaned.
**Why it happens:** Zustand persist uses its own storage key namespace.
**How to avoid:** Either: (a) write a one-time migration function that reads old keys and seeds the Zustand store, then deletes old keys; or (b) keep the same key structure by using multiple Zustand stores or a custom storage adapter. Recommendation: use a single Zustand store key ('word-adventure') with a migration function.
**Warning signs:** Users lose progress after deployment.

### Pitfall 5: Circular Dependencies in Context/Store
**What goes wrong:** GameContext imports from store, store imports hooks, hooks import from context.
**Why it happens:** When composing existing hooks into a Zustand store, it's tempting to import the hooks inside the store definition.
**How to avoid:** Zustand store should be self-contained (no React hook imports). Move the logic from hooks INTO the store slices. The hooks become thin wrappers that call `useGameStore(selector)`.
**Warning signs:** Runtime error "Cannot access X before initialization."

### Pitfall 6: Zod Validation Making Optional Fields Required Prematurely
**What goes wrong:** The schema requires `category`, `emoji`, `gender`, `exampleSentence` but existing words don't have all these fields. Validation fails on load.
**Why it happens:** Schema is stricter than current data.
**How to avoid:** Make fields that don't exist in current data optional in the schema (with `.optional()`). Add them to the word data in the same plan or mark them as optional until Phase 3 content expansion. The success criteria says "adding a word with a missing required field produces a clear validation error" -- the key fields are id, word, hebrew, hint, level, type. The others can be optional with defaults.
**Warning signs:** App crashes on startup because validation rejects existing word data.

## Code Examples

### Existing gameState Values (10 screens to route)
```
'start'         -> StartScreen (main menu)
'map'           -> MapScreen (world selection)
'playing'       -> PlayingScreen (active challenge)
'levelComplete' -> ResultScreen (success)
'gameOver'      -> ResultScreen (failure)
'store'         -> StoreScreen (shop)
'inventory'     -> InventoryScreen (items)
'memory'        -> MemoryScreen (memory game)
'petWalking'    -> PetWalkingScreen (pet adventure)
'avatar'        -> AvatarScreen (avatar selection)
```

### Current localStorage Key Inventory (must migrate all)
```
Key                          | Current Owner           | Type
-----------------------------|-------------------------|--------
userProfile                  | WordAdventure + useUserProgress | JSON object
score                        | WordAdventure + useUserProgress | raw number
stars                        | WordAdventure + useUserProgress | raw number
userProgress                 | WordAdventure + useUserProgress | JSON object
highScores                   | WordAdventure + useUserProgress | JSON array
inventory                    | WordAdventure + useUserProgress | JSON array
dailyStats                   | WordAdventure + useDailyStats   | JSON object
avatar                       | WordAdventure + useUserProgress | raw string
storyProgress                | useStoryProgress (own key)      | JSON object
word_adventure_equipped      | useItemEffects (own key)        | JSON object
word_adventure_consumable_counts | (unused, declared but not read) | -
hasSeenStoryIntro            | WordAdventure (inline)          | JSON boolean
```

### Duplicate Code to Eliminate (ARCH-05)
WordAdventure.jsx lines 29-43 contain a hardcoded `initialWordData` array identical to `src/data/words.js` lines 6-27. The fix: delete lines 29-43 from WordAdventure.jsx and `import { initialWordData } from './data/words'`.

### Challenge Interface Contract Pattern (ARCH-07)
Current challenge components have inconsistent interfaces:
```
LetterPicker:   { letters, currentInput, setCurrentInput, onCheck, isWord, disabled }
MemoryGame:     { words, onComplete, onExit }
PetWalkingGame: { pet, avatar, userProfile, onExit, onComplete }
```
The target contract: `{ challenge, onResult, disabled }` where:
- `challenge`: the data object describing what to solve
- `onResult`: callback with `{ correct: boolean, score: number }`
- `disabled`: prevents interaction during feedback animation

### nanoid Usage for Word IDs (CONT-10)
```javascript
// Current (grammarEngine.js line 112):
id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// New:
import { nanoid } from 'nanoid';
id: `gen_${nanoid()}`
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Context + useReducer for state | Zustand for state management | 2022+ | Simpler API, built-in persistence, better performance |
| Manual JSON.parse/stringify + localStorage | Zustand persist middleware | Built-in since Zustand v3 | Eliminates ~10 useEffect persistence hooks |
| PropTypes / manual validation | Zod runtime schema validation | 2022+ | TypeScript-quality validation in plain JS |
| uuid for IDs | nanoid | 2020+ | 60% smaller bundle, shorter IDs |
| Zod v3 | Zod v4 (latest stable) | 2025 | 14x faster string parsing, 2x smaller core bundle, same API |

**Deprecated/outdated:**
- Zustand `createContext` (removed in v4): Use React's native `createContext` + Zustand's `createStore` + `useStore`
- Zod v3: Still works but v4 is `latest` on npm; v4 API is backward-compatible for basic usage

## Open Questions

1. **Zustand persist key migration strategy**
   - What we know: Current code uses 12+ separate localStorage keys. Zustand persist uses one key by default.
   - What's unclear: Whether to do a one-time migration (read old keys, write to new store, delete old keys) or use multiple small Zustand stores each with their own key.
   - Recommendation: Single store with `partialize` + a one-time migration function that runs on first load. Check for old keys, seed the store, delete old keys. This is simpler long-term and matches ARCH-04 (single centralized store).

2. **Schema strictness for required fields**
   - What we know: Success criteria requires validation error for missing `id, word, hebrew, hint, category, emoji, level, type, gender, exampleSentence`. But current words lack `category`, `emoji`, `gender`, `exampleSentence`.
   - What's unclear: Whether Phase 2 should add these fields to existing words or make them optional.
   - Recommendation: Add the missing fields to the 13 existing words in `src/data/words.js` as part of plan 02-04 (schema plan). This is only 13 words -- trivial data entry. Then make all fields required in the schema. This fully satisfies success criterion 4.

3. **Should existing hooks be deleted or kept as thin wrappers?**
   - What we know: Five hooks exist (useGameState, useUserProgress, useDailyStats, useStoryProgress, useItemEffects). Moving their logic into Zustand slices makes them redundant.
   - What's unclear: Whether to delete them (breaking change for tests) or keep them as re-export wrappers.
   - Recommendation: Keep them as thin wrappers that call `useGameStore(selector)`. This minimizes test breakage and provides a familiar API. They become one-liners.

4. **GameContext vs direct Zustand hook access**
   - What we know: ARCH-03 requires "a single GameContext provider." Zustand stores can be accessed without context via `useGameStore()`.
   - What's unclear: Whether `GameContext` should wrap Zustand or replace it.
   - Recommendation: GameContext wraps Zustand. The provider renders at the top of WordAdventure.jsx. Components use `useGame()` hook. This satisfies ARCH-03 literally while getting Zustand's persistence benefits. The context layer is thin -- it just re-exports the Zustand store.

## Sources

### Primary (HIGH confidence)
- Context7 `/pmndrs/zustand` - persist middleware, slices pattern, React Context integration, TypeScript patterns
- Context7 `/colinhacks/zod` - object schema, safeParse, required fields
- Context7 `/ai/nanoid` - basic usage, import pattern, custom alphabet
- Context7 `/websites/zod_dev_v4` - Zod 4 API compatibility, zod/mini option

### Secondary (MEDIUM confidence)
- npm registry (`npm info zustand/zod/nanoid version`) - confirmed latest versions: zustand 5.0.11, zod 4.3.6, nanoid 5.1.6
- Codebase analysis - all 40+ source files read to map current architecture

### Tertiary (LOW confidence)
- None. All findings verified against Context7 or direct codebase inspection.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all three libraries verified via Context7 with current versions and working code examples
- Architecture: HIGH - patterns derived from actual codebase analysis (627-line file, 12 localStorage keys, 10 game states, 5 hooks) and verified Zustand documentation
- Pitfalls: HIGH - identified from direct code inspection (duplicate data, gender inference, key conflicts) not speculation

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (stable libraries, 30-day validity)
