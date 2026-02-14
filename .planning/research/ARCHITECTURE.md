# Architecture Research

**Domain:** Hebrew-English language-learning adventure game (React SPA)
**Researched:** 2026-02-14
**Confidence:** HIGH

## Current Architecture Assessment

### What Exists Today

The app is a React 19 SPA built with Vite, using hooks-based state management and localStorage for persistence. The critical structural problem is `WordAdventure.jsx` -- a 627-line mega-component that owns all game state, rendering logic, and screen routing. Although extracted hooks (`useGameState`, `useStoryProgress`, `useUserProgress`, `useDailyStats`, `useItemEffects`) exist, they are **not used** by the main component. `WordAdventure.jsx` duplicates their logic inline with raw `useState` calls and manual `localStorage` persistence via `useEffect`.

Screen components (`StartScreen`, `MapScreen`, `PlayingScreen`, `ResultScreen`) exist in `src/components/screens/` but are **also not imported** by `WordAdventure.jsx`. The main component renders everything inline with a single `gameState` string controlling which JSX block appears.

The word bank is a 13-item flat array hardcoded at the top of `WordAdventure.jsx` (duplicated in `src/data/words.js`). There are no themed categories, no metadata for challenge-type variation, and only one challenge mechanic (letter-picker spelling).

### Problems This Architecture Cannot Support

1. **200+ words** -- A flat array with no categories means every word loads at once, level filtering is primitive, and adding words requires touching a single massive file
2. **10+ levels** -- Levels are currently tied 1:1 to difficulty strings (`easy`, `medium`, `hard`, `expert`, `master`), with no concept of sub-levels, zones, or themed progression
3. **Multiple challenge types** -- Only `LetterPicker` (spelling) exists. Adding matching, fill-in-blank, or listening challenges requires invasive changes to the monolithic playing section
4. **Adventure gameplay** -- The story system exists in data (`story.js`) and hooks (`useStoryProgress`) but has no structural home. World map is a flat list of buttons, not an explorable space

## Recommended Architecture

### System Overview

```
+---------------------------------------------------------------+
|                      App Shell (App.jsx)                       |
|  GameProvider (Context) wraps everything                       |
+---------------------------------------------------------------+
|                                                                |
|  +------------------+  +------------------+  +--------------+  |
|  | Screen Router    |  | Overlay Manager  |  | HUD / TopBar |  |
|  | (gameState FSM)  |  | (dialogue, pet   |  | (score,lives |  |
|  |                  |  |  evolution, etc.) |  |  avatar,nav) |  |
|  +--------+---------+  +--------+---------+  +--------------+  |
|           |                      |                              |
+-----------|----------------------|------------------------------+
|           v                      |                              |
|  +------------------+            |                              |
|  | Screen Layer     |            |                              |
|  |                  |            |                              |
|  | StartScreen      |            |                              |
|  | WorldMapScreen   |            |                              |
|  | LevelScreen      |-----> Challenge Components                |
|  | StoreScreen      |       SpellingChallenge                   |
|  | InventoryScreen  |       MatchingChallenge                   |
|  | PetWalkScreen    |       FillInBlankChallenge                |
|  | ResultScreen     |       ListeningChallenge                  |
|  | MemoryGame       |       SentenceBuilderChallenge            |
|  +------------------+                                           |
|                                                                 |
+-----------------------------------------------------------------+
|                       Data Layer                                |
|  +-------------+  +-------------+  +--------------+             |
|  | WordBank    |  | StoryData   |  | StoreItems   |             |
|  | (by theme & |  | (chapters,  |  | (items,pets, |             |
|  |  level)     |  |  NPCs,lore) |  |  effects)    |             |
|  +-------------+  +-------------+  +--------------+             |
|                                                                 |
|  +-------------+  +-------------+  +--------------+             |
|  | Hooks Layer |  | Utils       |  | Storage      |             |
|  | useGame     |  | srs.js      |  | persistence  |             |
|  | useProgress |  | grammar.js  |  | abstraction  |             |
|  | useStory    |  | voice.js    |  |              |             |
|  | useDailyStats| | mobile.js   |  |              |             |
|  | useItemFx   |  |             |  |              |             |
|  +-------------+  +-------------+  +--------------+             |
+-----------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `GameProvider` | Central context providing all game state from hooks. Single source of truth. | All components consume it |
| `ScreenRouter` | Reads `gameState` from context, renders the correct screen. Pure switch logic. | GameProvider (reads), Screen components (renders) |
| `OverlayManager` | Renders modal overlays (StoryDialogue, PetEvolution, StoryPathChoice, StoryIntro). | GameProvider (reads dialogue/evolution state) |
| `HUD` | Persistent top bar: score, avatar, navigation buttons. Always visible. | GameProvider (reads score/avatar, dispatches navigation) |
| `StartScreen` | Main menu with daily quests and mode selection buttons. | GameProvider (reads dailyStats, dispatches navigation) |
| `WorldMapScreen` | Visual world map with themed zones containing multiple levels. | GameProvider (reads story progress), WordBank (reads level metadata) |
| `LevelScreen` | Orchestrates a sequence of challenges for a given level. Picks challenge types. | GameProvider (reads/writes game state), Challenge components (renders) |
| `SpellingChallenge` | Letter-picker mechanic (current LetterPicker). | LevelScreen (receives word, reports result) |
| `MatchingChallenge` | Drag-and-drop or tap-to-match pairs (English-Hebrew). | LevelScreen (receives word set, reports result) |
| `FillInBlankChallenge` | Sentence with missing word, multiple choice options. | LevelScreen (receives sentence data, reports result) |
| `ListeningChallenge` | Audio plays word, child types or selects what they heard. | LevelScreen (receives word, reports result) |
| `SentenceBuilderChallenge` | Reorder words to form sentence (current sentence mode, extracted). | LevelScreen (receives sentence, reports result) |
| `WordBank` | Data module: words organized by theme and level. Provides query functions. | LevelScreen, WorldMapScreen, MemoryGame (all read-only) |
| `StoreScreen` | Item shop UI. | GameProvider (reads/writes score and inventory) |
| `InventoryScreen` | Equipped items and pet management. | GameProvider (reads/writes inventory and equipped state) |
| `PetWalkScreen` | Existing PetWalkingGame, cleaned up. | GameProvider (writes score on completion) |
| `MemoryGame` | Existing card matching mini-game, no changes needed. | GameProvider (writes score on completion) |
| `ResultScreen` | Level complete / game over with stats summary. | GameProvider (reads final stats) |

## Recommended Project Structure

```
src/
├── App.jsx                    # Wraps GameProvider + WordAdventure shell
├── WordAdventure.jsx          # Shell: HUD + ScreenRouter + OverlayManager
├── context/
│   └── GameContext.jsx        # GameProvider using all hooks, exposes via context
├── components/
│   ├── HUD.jsx                # Top bar (score, avatar, nav)
│   ├── ScreenRouter.jsx       # Renders screen based on gameState
│   ├── OverlayManager.jsx     # Story dialogue, pet evolution overlays
│   ├── screens/
│   │   ├── StartScreen.jsx    # Main menu
│   │   ├── WorldMapScreen.jsx # World map with themed zones
│   │   ├── LevelScreen.jsx    # Challenge orchestrator
│   │   ├── StoreScreen.jsx    # Item shop (rename from Store.jsx)
│   │   ├── InventoryScreen.jsx# Equipped items (rename from Inventory.jsx)
│   │   ├── PetWalkScreen.jsx  # Pet walking (rename from PetWalkingGame.jsx)
│   │   ├── MemoryGameScreen.jsx # Memory card game wrapper
│   │   ├── ResultScreen.jsx   # Level complete / game over
│   │   └── index.js           # Barrel export
│   ├── challenges/
│   │   ├── SpellingChallenge.jsx      # Letter picker (current)
│   │   ├── MatchingChallenge.jsx      # Pair matching
│   │   ├── FillInBlankChallenge.jsx   # Cloze sentences
│   │   ├── ListeningChallenge.jsx     # Audio recognition
│   │   ├── SentenceBuilderChallenge.jsx # Word reordering
│   │   ├── ChallengeWrapper.jsx       # Shared chrome: lives, hints, timer
│   │   └── index.js                   # Barrel export
│   ├── overlays/
│   │   ├── StoryDialogue.jsx
│   │   ├── StoryIntro.jsx
│   │   ├── StoryPathChoice.jsx
│   │   ├── PetEvolution.jsx
│   │   └── index.js
│   └── shared/
│       ├── AvatarSelect.jsx
│       ├── DailyQuests.jsx
│       ├── GameHeader.jsx
│       ├── Leaderboard.jsx
│       ├── SpriteAnimator.jsx
│       └── WelcomeScreen.jsx
├── data/
│   ├── wordBank/
│   │   ├── index.js           # Query API: getWordsForLevel(), getWordsByTheme()
│   │   ├── schema.js          # Word shape definition and validation
│   │   ├── themes/
│   │   │   ├── animals.js     # { theme: 'animals', words: [...] }
│   │   │   ├── food.js
│   │   │   ├── nature.js
│   │   │   ├── house.js
│   │   │   ├── school.js
│   │   │   ├── body.js
│   │   │   ├── feelings.js
│   │   │   ├── travel.js
│   │   │   ├── colors.js
│   │   │   └── actions.js
│   │   └── levels.js          # Level definitions: which themes, how many words, challenge types
│   ├── story.js               # Chapter narratives, NPCs, mysteries (existing)
│   └── storeItems.js          # Store items (existing)
├── hooks/
│   ├── index.js
│   ├── useGameState.js        # Screen state + active challenge state
│   ├── useUserProgress.js     # Score, stars, inventory, SRS
│   ├── useStoryProgress.js    # Story chapters, achievements, secrets
│   ├── useDailyStats.js       # Daily quests, streaks
│   ├── useItemEffects.js      # Equipped items and bonuses
│   └── useChallengeEngine.js  # NEW: Selects challenge type, validates answers
├── utils/
│   ├── grammarEngine.js       # Procedural sentence generation
│   ├── srs.js                 # Spaced repetition algorithm
│   ├── voice.js               # Speech recognition
│   ├── mobile.js              # Haptic feedback
│   └── storage.js             # localStorage abstraction
└── config/
    └── constants.js            # Game tuning parameters
```

### Structure Rationale

- **`context/`:** A single `GameProvider` replaces the current pattern of 20+ useState calls in `WordAdventure.jsx`. Every hook is consumed once here and exposed through context. This eliminates prop drilling (currently 10+ props passed to each screen component).
- **`components/challenges/`:** Each challenge type is a self-contained component with the same interface: receives a word/challenge object, calls `onCorrect()`/`onIncorrect()`. `LevelScreen` orchestrates them. Adding a new challenge type means adding one file -- zero changes to existing code.
- **`data/wordBank/themes/`:** Words organized by thematic category in separate files. Each file exports an array of word objects. The `index.js` provides a query API that filters by theme, level, and challenge-type compatibility. Adding 50 words to the "animals" theme means editing one file.
- **`components/overlays/`:** Story/dialogue overlays separated from screens. The `OverlayManager` renders them as portals above the current screen. This removes conditional rendering from `WordAdventure.jsx`.

## Architectural Patterns

### Pattern 1: Challenge Interface Contract

**What:** Every challenge component implements the same prop interface, so `LevelScreen` can render any challenge type without knowing its internals.
**When to use:** Every time a new challenge type is added.
**Trade-offs:** Slightly more boilerplate per challenge, but zero coupling between challenge types. New developers can add challenges without understanding the rest of the system.

**Example:**
```jsx
// Every challenge component has this interface
function SpellingChallenge({ challenge, onResult, disabled }) {
    // challenge = { id, word, hebrew, hint, type, theme, level }
    // onResult = (isCorrect: boolean) => void
    // disabled = boolean (while feedback is showing)

    const handleSubmit = (answer) => {
        const isCorrect = normalize(answer) === normalize(challenge.word);
        onResult(isCorrect);
    };

    return (/* challenge-specific UI */);
}

// LevelScreen picks challenge type and renders
function LevelScreen() {
    const { currentChallenge, challengeType } = useContext(GameContext);

    const ChallengeComponent = {
        spelling: SpellingChallenge,
        matching: MatchingChallenge,
        fillblank: FillInBlankChallenge,
        listening: ListeningChallenge,
        sentence: SentenceBuilderChallenge,
    }[challengeType];

    return (
        <ChallengeWrapper lives={lives} progress={progress}>
            <ChallengeComponent
                challenge={currentChallenge}
                onResult={handleResult}
                disabled={showingFeedback}
            />
        </ChallengeWrapper>
    );
}
```

### Pattern 2: Word Bank Query API

**What:** Words stored in themed files, queried through a functional API. No component ever imports a raw word array directly.
**When to use:** Anywhere words are needed -- level selection, review mode, memory game, pet walking encounters.
**Trade-offs:** One layer of indirection, but enables lazy loading themes, adding new themes without refactoring, and consistent word shape validation.

**Example:**
```js
// data/wordBank/themes/animals.js
export default [
    {
        id: 'cat',
        word: 'CAT',
        hebrew: 'חתול',
        hint: 'חיה שאוהבת חלב',
        emoji: '🐱',
        theme: 'animals',
        level: 1,           // 1-10 difficulty within theme
        globalLevel: 'easy', // backwards-compatible difficulty tier
        challengeTypes: ['spelling', 'matching', 'listening', 'fillblank'],
        audioKey: 'cat',     // for listening challenges
        sentences: [         // for fill-in-blank and sentence builder
            { en: 'The CAT is sleeping', he: 'החתול ישן', blank: 'CAT' },
            { en: 'I see a CAT', he: 'אני רואה חתול', blank: 'CAT' },
        ],
    },
    // ... more animal words
];

// data/wordBank/index.js
import animals from './themes/animals.js';
import food from './themes/food.js';
// ... etc

const ALL_WORDS = [...animals, ...food, /* ... */];

export const getWordsForLevel = (levelId) => {
    const levelDef = LEVELS.find(l => l.id === levelId);
    return ALL_WORDS
        .filter(w => levelDef.themes.includes(w.theme))
        .filter(w => w.level >= levelDef.minDifficulty && w.level <= levelDef.maxDifficulty);
};

export const getWordsByTheme = (theme) => ALL_WORDS.filter(w => w.theme === theme);
export const getWordsForChallenge = (type) => ALL_WORDS.filter(w => w.challengeTypes.includes(type));
export const getWordById = (id) => ALL_WORDS.find(w => w.id === id);
```

### Pattern 3: GameContext Provider (Centralized State)

**What:** A single context provider that composes all existing hooks and exposes a unified API. Components consume only what they need.
**When to use:** Instead of the current pattern where `WordAdventure.jsx` manually creates 20+ state variables and passes them as props.
**Trade-offs:** One large provider file, but it removes all prop drilling and means screen components receive clean, minimal interfaces. React 19's improved context performance makes this viable without excessive re-renders.

**Example:**
```jsx
// context/GameContext.jsx
const GameContext = createContext(null);

export function GameProvider({ children }) {
    const game = useGameState();
    const progress = useUserProgress();
    const story = useStoryProgress(progress.userProfile);
    const daily = useDailyStats();
    const items = useItemEffects(progress.inventory);
    const challenge = useChallengeEngine();

    const value = useMemo(() => ({
        game, progress, story, daily, items, challenge,
        // Convenience shortcuts
        navigate: game.setGameState,
        score: progress.score,
        lives: game.lives,
    }), [game, progress, story, daily, items, challenge]);

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => useContext(GameContext);
```

### Pattern 4: Level Definition as Data

**What:** Levels defined as data objects that specify which themes to draw from, how many words, which challenge types to include, and what story chapter they belong to.
**When to use:** When creating the world map and level progression. Adding a new level means adding one object, not writing new code.

**Example:**
```js
// data/wordBank/levels.js
export const LEVELS = [
    // Zone 1: The Enchanted Kingdom (easy)
    {
        id: 'kingdom-1',
        zone: 'enchanted_kingdom',
        name: 'גן החיות',
        order: 1,
        themes: ['animals'],
        minDifficulty: 1,
        maxDifficulty: 3,
        wordCount: 5,
        challengeTypes: ['spelling'],
        storyChapter: 'easy',
        unlockRequirement: { wordsLearned: 0 },
    },
    {
        id: 'kingdom-2',
        zone: 'enchanted_kingdom',
        name: 'המטבח המלכותי',
        order: 2,
        themes: ['food'],
        minDifficulty: 1,
        maxDifficulty: 3,
        wordCount: 5,
        challengeTypes: ['spelling', 'matching'],
        storyChapter: 'easy',
        unlockRequirement: { wordsLearned: 5 },
    },
    // Zone 2: The Magical Forest (medium)
    {
        id: 'forest-1',
        zone: 'magical_forest',
        name: 'שביל הטבע',
        order: 1,
        themes: ['nature', 'colors'],
        minDifficulty: 3,
        maxDifficulty: 5,
        wordCount: 6,
        challengeTypes: ['spelling', 'matching', 'fillblank'],
        storyChapter: 'medium',
        unlockRequirement: { wordsLearned: 15 },
    },
    // ... more levels
];

export const ZONES = [
    { id: 'enchanted_kingdom', name: 'הממלכה הקסומה', color: 'from-green-400 to-emerald-600', character: '👸', storyChapter: 'easy' },
    { id: 'magical_forest', name: 'היער הקסום', color: 'from-blue-400 to-indigo-600', character: '🧚', storyChapter: 'medium' },
    { id: 'wizard_tower', name: 'מגדל הקוסם', color: 'from-purple-500 to-fuchsia-600', character: '🧙', storyChapter: 'hard' },
    { id: 'infinite_universe', name: 'היקום האינסופי', color: 'from-rose-500 to-pink-600', character: '👽', storyChapter: 'expert' },
    { id: 'hall_of_sages', name: 'היכל החכמים', color: 'from-amber-500 to-red-600', character: '🏛️', storyChapter: 'master' },
];
```

## Data Flow

### Main Game Loop

```
User taps level on WorldMap
    |
    v
LevelScreen loads level definition (data/wordBank/levels.js)
    |
    v
Query WordBank for words matching level's themes + difficulty
    |
    v
useChallengeEngine selects challenge type for each word
    (based on level's allowed challengeTypes + word's supported types)
    |
    v
Render ChallengeComponent with current word
    |
    v
User interacts --> ChallengeComponent calls onResult(isCorrect)
    |
    v
LevelScreen processes result:
    +--> useUserProgress.updateWordProgress (SRS)
    +--> useUserProgress.addScore (with itemEffects.calculatePoints)
    +--> useDailyStats.recordCorrectAnswer / recordIncorrectAnswer
    +--> useStoryProgress.recordWordLearned
    +--> useStoryProgress.getDialogue (contextual NPC feedback)
    +--> Advance to next word or complete level
    |
    v
On level complete:
    +--> useStoryProgress.completeChapter
    +--> ResultScreen shows stats
```

### State Management Flow

```
GameContext (single provider, composes all hooks)
    |
    +-- useGameState: screen navigation, current challenge state
    |       Persisted: NO (ephemeral session state)
    |
    +-- useUserProgress: score, stars, inventory, SRS word progress
    |       Persisted: YES (localStorage via storage.js)
    |
    +-- useStoryProgress: chapters, achievements, pet evolution, secrets
    |       Persisted: YES (localStorage via storage.js)
    |
    +-- useDailyStats: daily quests, current streak
    |       Persisted: YES (localStorage, resets daily)
    |
    +-- useItemEffects: equipped items, active bonuses
    |       Persisted: YES (localStorage for equipped state)
    |       Derived: bonuses computed from equipped + STORE_ITEMS
    |
    +-- useChallengeEngine: NEW - challenge type selection, answer validation
            Persisted: NO (ephemeral)
```

### Key Data Flows

1. **Word selection:** `WorldMapScreen` --> user picks level --> `LevelScreen` queries `WordBank.getWordsForLevel(levelId)` --> words shuffled --> first word + challenge type rendered
2. **Answer validation:** `ChallengeComponent` --> `onResult(bool)` --> `LevelScreen` --> updates SRS, score, story, streaks via context hooks
3. **Score economy:** Correct answer --> `useItemEffects.calculatePoints(base, streak)` --> `useUserProgress.addScore(points)` --> score persisted --> `StoreScreen` reads score for purchasing
4. **Story progression:** Level complete --> `useStoryProgress.completeChapter()` --> checks pet evolution, secret unlocks --> `OverlayManager` shows dialogue/evolution notifications
5. **SRS review:** `StartScreen` "Smart Review" button --> `useUserProgress.userProgress` + `srs.getDueWords()` --> words due for review fed into `LevelScreen` in 'srs' mode

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-200 words (current + near-term) | All words in JS modules, load synchronously. Keep it simple. |
| 200-1000 words | Split word bank themes into lazy-loaded chunks via `import()`. Only load themes needed for current level. |
| 1000+ words | Move word data to JSON files, fetch on demand. Consider IndexedDB for SRS state instead of localStorage (5MB limit). |

### Scaling Priorities

1. **First bottleneck: localStorage size.** SRS state for each word grows linearly. At ~500 words with full SRS state, localStorage usage approaches meaningful size. **Fix:** Batch SRS state into a single key with versioned schema rather than individual entries.
2. **Second bottleneck: Initial bundle size.** 200+ words with sentences, hints, and metadata in JS modules adds to bundle. **Fix:** Code-split word theme files so only active themes load. Vite dynamic imports handle this natively.
3. **Third bottleneck: Context re-renders.** A single large context can cause unnecessary re-renders. **Fix:** Split into 2-3 contexts if profiling shows issues (e.g., `GameStateContext` for ephemeral state, `ProgressContext` for persisted state). Use `useMemo` on provider value. React 19 handles this better than older versions.

## Anti-Patterns

### Anti-Pattern 1: Mega-Component with Inline State (CURRENT PROBLEM)

**What people do:** Put all state, logic, and rendering in one component (the current `WordAdventure.jsx` at 627 lines with 20+ useState calls).
**Why it's wrong:** Every state change re-renders the entire game. Adding features requires modifying one massive file. Testing is impossible. Multiple developers cannot work in parallel.
**Do this instead:** Extract state into hooks (already done but unused), compose hooks in a context provider, render screens via a router component. Each screen is independently testable.

### Anti-Pattern 2: Duplicating Data Across Files

**What people do:** Define word data in both `WordAdventure.jsx` (lines 29-43) and `src/data/words.js`. Define story chapter metadata in both `WordAdventure.jsx` (lines 45-52) and `src/config/constants.js` and `src/data/story.js`.
**Why it's wrong:** Edits in one place don't propagate. Bugs from stale copies. No single source of truth.
**Do this instead:** One canonical location for each data type. Components import from it. Never copy data into component files.

### Anti-Pattern 3: String-Based Screen Routing Without Constraints

**What people do:** Use a free-form string (`gameState`) with no type safety and scattered `if/else` blocks to render screens.
**Why it's wrong:** Typos cause silent failures. No exhaustiveness checking. Adding a screen requires finding every place `gameState` is checked. Valid transitions are undocumented.
**Do this instead:** Define valid states as constants. Use a switch statement or component map in one place (`ScreenRouter`). Optionally define valid transitions to prevent impossible states.

### Anti-Pattern 4: Challenge Logic Coupled to Rendering

**What people do:** Embed answer validation, SRS updates, score calculation, and story progression inline in the rendering component (current `processAnswer` function in `WordAdventure.jsx`).
**Why it's wrong:** Cannot reuse validation logic for new challenge types. Cannot test scoring without rendering. Adding a challenge type means duplicating all side-effect logic.
**Do this instead:** Challenge components report results via callback. A central handler (`LevelScreen` or `useChallengeEngine`) processes the result through all side-effect hooks. Challenge components stay pure UI.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `Screen` <-> `GameContext` | React Context (read) + callback functions (write) | Screens never call hooks directly; they consume context |
| `LevelScreen` <-> `ChallengeComponent` | Props down (`challenge` object), callbacks up (`onResult`) | Challenge components are stateless regarding game progress |
| `WordBank` <-> `LevelScreen` | Function call (pure data query, no side effects) | WordBank is a data module, not a React component |
| `Hooks` <-> `Storage` | Hooks call `storage.js` utilities internally | No component ever touches localStorage directly |
| `OverlayManager` <-> `GameContext` | Context read (dialogue/evolution state) + dismiss callbacks | Overlays render above all screens, not inside them |

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Web Speech API | `useVoiceRecognition` hook wraps `SpeechRecognition` | Feature-detected, graceful degradation. Only used by `ListeningChallenge` and voice input toggle |
| Web Audio API | Future: `useAudioPlayback` hook for word pronunciation | Needed for `ListeningChallenge`. Can use `SpeechSynthesis` as fallback |
| localStorage | Wrapped by `storage.js` (`safeGetJSON`/`safeSetJSON`) | All persistence goes through this abstraction. Migration path to IndexedDB if needed |
| Service Worker (PWA) | `vite-plugin-pwa` already in dependencies | Enables offline play. Word data bundled in app, no server dependency |

## Build Order (Dependencies Between Components)

The following sequence ensures each piece can be built and tested before the next depends on it:

### Phase 1: Foundation (no new features, pure refactor)
1. **GameContext** -- Compose existing hooks into context provider. Wire into `App.jsx`.
2. **ScreenRouter** -- Replace inline `gameState` switch in `WordAdventure.jsx` with component map.
3. **HUD** -- Extract top bar from `WordAdventure.jsx`.
4. **OverlayManager** -- Extract overlay rendering from `WordAdventure.jsx`.
5. **Delete duplicated state** from `WordAdventure.jsx`. Use hooks that already exist.

*After Phase 1:* `WordAdventure.jsx` shrinks from 627 lines to ~50 (shell only). All existing behavior preserved.

### Phase 2: Word Bank Infrastructure
1. **Word schema** (`data/wordBank/schema.js`) -- Define canonical word shape with `challengeTypes` and `sentences` fields.
2. **Theme files** -- Migrate 13 existing words into themed files, add 187+ new words across 10 themes.
3. **Query API** (`data/wordBank/index.js`) -- `getWordsForLevel()`, `getWordsByTheme()`, `getWordsForChallenge()`.
4. **Level definitions** (`data/wordBank/levels.js`) -- Define 10+ levels across 5 zones, mapping to themes and challenge types.

*After Phase 2:* Word content can scale independently. New words added by editing theme files.

### Phase 3: Challenge Engine
1. **ChallengeWrapper** -- Shared UI chrome: lives display, progress bar, hint button, timer.
2. **SpellingChallenge** -- Extract from current `PlayingScreen` + `LetterPicker`. Implement challenge interface.
3. **useChallengeEngine** -- Hook that selects challenge type per word, manages challenge queue.
4. **LevelScreen** -- Orchestrates challenge sequence. Replaces current `playing` state rendering.
5. **MatchingChallenge** -- New. Tap-to-match pairs of English-Hebrew words.
6. **FillInBlankChallenge** -- New. Sentence with blank, multiple-choice options.
7. **SentenceBuilderChallenge** -- Extract from current sentence mode.
8. **ListeningChallenge** -- New. Depends on audio playback.

*After Phase 3:* Multiple challenge types work. Adding new types requires one file.

### Phase 4: Adventure Gameplay
1. **WorldMapScreen** -- Visual map with zones, level progression, unlock indicators. Replaces current button list.
2. **Enhanced story integration** -- NPC dialogues trigger per-level, not per-difficulty-tier.
3. **Level rewards** -- Stars per level, zone completion rewards.
4. **Pet system integration** -- Pet abilities affect gameplay (hints, streak protection tied to pet stage).

*After Phase 4:* Full adventure experience with visual world map, story beats per level, reward progression.

## Sources

- Direct analysis of existing codebase at `/Users/galsened/word-adventure/src/`
- [React Architecture Patterns and Best Practices for 2026](https://www.bacancytechnology.com/blog/react-architecture-patterns-and-best-practices) -- Context API and component separation patterns
- [React Design Patterns for 2026 Projects](https://www.sayonetech.com/blog/react-design-patterns/) -- Container/presentational separation, custom hooks composition
- [Gamified Language Learning App Architecture](https://edutech-journals.org/index.php/j-hytel/article/view/193) -- JSON-based vocabulary organization by thematic categories
- [GeeksforGeeks React Architecture](https://www.geeksforgeeks.org/reactjs/react-architecture-pattern-and-best-practices/) -- State management decision framework

---
*Architecture research for: Word Adventure language-learning game*
*Researched: 2026-02-14*
