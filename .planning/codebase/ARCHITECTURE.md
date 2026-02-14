# Architecture

**Analysis Date:** 2026-02-14

## Pattern Overview

**Overall:** Component-driven React SPA with localized state management and persistent browser storage

**Key Characteristics:**
- Single-page React application with Vite build tooling
- Centralized game state management via custom React hooks
- LocalStorage-based persistence for all user data
- Spaced Repetition System (SRS) for vocabulary learning
- Story progression system with branching narrative
- Mobile-first UI with Framer Motion animations
- Progressive Web App (PWA) capable with offline support

## Layers

**Presentation Layer (Components):**
- Purpose: Render UI and handle user interactions
- Location: `src/components/` and `src/components/screens/`
- Contains: React JSX components for gameplay, story, store, inventory, screens
- Depends on: Custom hooks, utilities, data files
- Used by: Main application entry point

**State Management Layer (Custom Hooks):**
- Purpose: Manage game state, user progress, story progression, and item effects
- Location: `src/hooks/`
- Contains: `useGameState()`, `useStoryProgress()`, `useUserProgress()`, `useDailyStats()`, `useItemEffects()`
- Depends on: Storage utilities, data files, React hooks
- Used by: Components and other hooks

**Business Logic Layer (Utilities):**
- Purpose: Implement game algorithms, storage operations, voice recognition
- Location: `src/utils/`
- Contains: SRS algorithm, grammar engine, storage helpers, voice recognition, mobile utilities
- Depends on: Data files, browser APIs
- Used by: Hooks and components

**Data Layer (Static Data & Configuration):**
- Purpose: Provide static game content, story lines, item definitions, word lists
- Location: `src/data/` and `src/config/`
- Contains: Story chapters with NPC dialogue, store items, vocabulary words, game constants
- Depends on: Nothing (pure data)
- Used by: Hooks, utilities, components

**Integration Layer (External APIs):**
- Purpose: Browser APIs for speech recognition, storage, haptic feedback
- Location: Scattered across utilities and hooks
- Contains: Web Speech API, localStorage, Vibration API, PWA service worker
- Depends on: Nothing (uses browser APIs directly)
- Used by: Utilities and hooks

## Data Flow

**Game Initialization:**

1. App mounts (`main.jsx` → `App.jsx` → `WordAdventure.jsx`)
2. `WordAdventure` component initializes state from localStorage using safe storage utilities
3. Custom hooks (`useGameState`, `useUserProgress`, `useStoryProgress`) restore persisted data
4. User sees appropriate screen based on game state (welcome, map, playing, results)

**Gameplay Round:**

1. User selects difficulty/chapter from map
2. `useStoryProgress.startChapter()` validates unlock requirements
3. Words loaded via `getDueWords()` (SRS algorithm filters due items)
4. User input collected via letter picker or voice recognition
5. Answer checked against word's English form
6. SRS state updated via `calculateNextReview()` with quality score
7. Score/stars awarded, progress saved to localStorage
8. Story progression checked (achievements, pet evolution, lore unlocks)
9. Results screen shows feedback, then returns to map

**State Persistence:**

1. All state changes trigger useEffect cleanup functions
2. Each state modification calls `safeSetJSON()` or `localStorage.setItem()`
3. On next mount, `safeGetJSON()` restores from localStorage with error handling
4. Storage keys centralized in `STORAGE_KEYS` constant in `src/utils/storage.js`

**Story Progression:**

1. User completes chapters to unlock subsequent ones
2. Chapter unlock tied to `totalWordsLearned` threshold
3. Chapter completion awards collectibles and unlocks dialogue
4. Perfect completion (no lives lost) unlocks secret achievements
5. Pet evolution checked after each word learned
6. Time-based secrets checked on app mount (early bird, night owl)

## Key Abstractions

**SRS State Object:**
- Purpose: Track word review scheduling using SM-2 algorithm variant
- Examples: `{ interval, repetition, easeFactor, nextReviewDate }`
- Pattern: Immutable updates via `calculateNextReview(prevState, quality)` returns new state

**Story Progress Object:**
- Purpose: Track narrative choices, pet evolution, achievements, and unlocks
- Examples: `{ currentChapter, completedChapters, activePetId, discoveredSecrets }`
- Pattern: Merged updates via `updateProgress({...updates})` in `useStoryProgress`

**Game State Object:**
- Purpose: Track current gameplay session state
- Examples: `{ gameState, currentWordIndex, lives, feedback, userInput }`
- Pattern: Separated concerns - gameplay logic in `useGameState`, persistence in `useUserProgress`

**Item Effect Object:**
- Purpose: Represent special items that modify gameplay (boosters, themes, modifiers)
- Examples: `{ id, equipable, effect, category, consumable }`
- Pattern: Items defined in `src/data/storeItems.js`, effects applied by `useItemEffects.applyEffects()`

## Entry Points

**Application Entry:**
- Location: `src/main.jsx`
- Triggers: Browser load
- Responsibilities: React app initialization, mounts root component

**Main Component:**
- Location: `src/App.jsx`
- Triggers: Application entry
- Responsibilities: Simple wrapper, renders `WordAdventure`

**Game Component:**
- Location: `src/WordAdventure.jsx`
- Triggers: App mount
- Responsibilities: Central game orchestration - manages all game state, renders screens based on `gameState`, coordinates hooks, handles gameplay logic

**Screen Selection:**
- Based on `gameState` value: `'start'`, `'welcome'`, `'map'`, `'playing'`, `'levelComplete'`, `'gameOver'`, etc.
- Screens in `src/components/screens/`: `StartScreen`, `MapScreen`, `PlayingScreen`, `ResultScreen`

## Error Handling

**Strategy:** Defensive programming with safe storage utilities and error boundaries

**Patterns:**
- `safeGetJSON()`, `safeSetJSON()`, `safeGetNumber()` wrap localStorage with try-catch
- Failed JSON parsing returns default values, logs errors to console
- `ErrorBoundary` component (`src/components/ErrorBoundary.jsx`) catches render-time errors
- Voice recognition errors silently disable feature, no game interruption
- Corrupted progress data falls back to defaults, user keeps current session

## Cross-Cutting Concerns

**Logging:** Console-based via `console.error()` calls in storage utilities and voice recognition

**Validation:**
- Chapter unlock checked via `isChapterUnlocked(level, totalWordsLearned)` before allowing chapter start
- Word spelling checked case-insensitively against word object
- Lives validation prevents negative values

**Authentication:** Not applicable - single-player offline-first game with no backend

**Localization:** Hebrew (he) + English (en) support
- Text in story data and components uses Hebrew/English parallel strings
- Gender-aware text via `userProfile.gender` ('boy' or 'girl')
- `t()` helper function selects gendered text: `t(maleText, femaleText)`

**Mobile Support:**
- Haptic feedback via `hapticFeedback()` in `src/utils/mobile.js`
- Touch-friendly UI with Lucide React icons
- Voice input as alternative to letter picker
- PWA manifest in `vite.config.js` for app installation

---

*Architecture analysis: 2026-02-14*
