# Codebase Structure

**Analysis Date:** 2026-02-14

## Directory Layout

```
word-adventure/
├── src/
│   ├── main.jsx                 # React app entry point
│   ├── App.jsx                  # Root component wrapper
│   ├── WordAdventure.jsx        # Main game component and orchestrator
│   ├── index.css                # Global styles
│   ├── App.css                  # App-specific styles
│   ├── components/              # Reusable React components
│   │   ├── screens/             # Full-screen game states
│   │   │   ├── StartScreen.jsx
│   │   │   ├── MapScreen.jsx
│   │   │   ├── PlayingScreen.jsx
│   │   │   ├── ResultScreen.jsx
│   │   │   └── index.js         # Barrel export
│   │   ├── AvatarSelect.jsx
│   │   ├── DailyQuests.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── GameHeader.jsx
│   │   ├── Inventory.jsx
│   │   ├── Leaderboard.jsx
│   │   ├── LetterPicker.jsx     # Interactive letter selection
│   │   ├── MemoryGame.jsx
│   │   ├── PetEvolution.jsx
│   │   ├── PetWalkingGame.jsx
│   │   ├── SpriteAnimator.jsx
│   │   ├── Store.jsx
│   │   ├── StoryDialogue.jsx
│   │   ├── StoryIntro.jsx
│   │   ├── StoryPathChoice.jsx
│   │   └── WelcomeScreen.jsx
│   ├── hooks/                   # Custom React hooks for state
│   │   ├── index.js             # Barrel export
│   │   ├── useGameState.js
│   │   ├── useUserProgress.js
│   │   ├── useStoryProgress.js
│   │   ├── useDailyStats.js
│   │   └── useItemEffects.js
│   ├── utils/                   # Utility functions and helpers
│   │   ├── storage.js           # Safe localStorage operations
│   │   ├── srs.js               # Spaced Repetition System algorithm
│   │   ├── grammarEngine.js     # Procedural sentence generation
│   │   ├── voice.js             # Web Speech API wrapper
│   │   └── mobile.js            # Mobile-specific features (haptic)
│   ├── data/                    # Static game content
│   │   ├── story.js             # Story chapters, NPCs, dialogue
│   │   ├── words.js             # Vocabulary word database
│   │   └── storeItems.js        # Purchasable items and their effects
│   ├── config/                  # Game configuration
│   │   └── constants.js         # Magic numbers, game settings
│   └── assets/
│       └── sprites/             # Game sprite assets
├── public/                      # Static assets
├── index.html                   # HTML entry point
├── vite.config.js               # Vite build + PWA configuration
├── postcss.config.js            # Tailwind CSS post-processing
├── tailwind.config.js           # Tailwind CSS theming
├── eslint.config.js             # ESLint rules
├── vercel.json                  # Vercel deployment config
├── package.json                 # Dependencies and scripts
└── package-lock.json
```

## Directory Purposes

**src/:**
- Purpose: All source code
- Contains: Components, hooks, utilities, data, configuration
- Key files: `WordAdventure.jsx` (main game component), `main.jsx` (entry)

**src/components/:**
- Purpose: React UI components
- Contains: 20 JSX files for game UI, screens, and gameplay elements
- Key files: `WordAdventure.jsx` (orchestrator), Screen components

**src/components/screens/:**
- Purpose: Full-screen game states
- Contains: 4 screen components that represent major game phases
- Key files: `StartScreen.jsx`, `MapScreen.jsx`, `PlayingScreen.jsx`, `ResultScreen.jsx`

**src/hooks/:**
- Purpose: Custom React hooks for state management
- Contains: 5 hooks managing different concerns
- Key files: `useStoryProgress.js` (narrative), `useUserProgress.js` (profile/scores), `useGameState.js` (gameplay)

**src/utils/:**
- Purpose: Business logic and browser API integrations
- Contains: SRS algorithm, storage helpers, voice recognition, text generation
- Key files: `srs.js` (learning algorithm), `storage.js` (persistent data), `grammarEngine.js` (sentences)

**src/data/:**
- Purpose: Static game content (read-only data)
- Contains: Story lines with NPC dialogue, word vocabulary, item definitions
- Key files: `story.js` (8KB, all chapters/NPCs), `words.js` (vocabulary), `storeItems.js` (item effects)

**src/config/:**
- Purpose: Centralized game configuration
- Contains: Constants like lives count, score multipliers, level definitions
- Key files: `constants.js` (all magic numbers)

## Key File Locations

**Entry Points:**
- `src/main.jsx`: React app initialization, mounts to DOM
- `src/App.jsx`: Minimal wrapper, renders WordAdventure
- `src/WordAdventure.jsx`: Central game component - orchestrates all state and screen rendering

**Configuration:**
- `src/config/constants.js`: All magic numbers (INITIAL_LIVES=3, SCORE_PER_CORRECT=150, etc.)
- `vite.config.js`: Build system and PWA manifest configuration
- `tailwind.config.js`: CSS theming and colors
- `.env` file (if present): Environment variables

**Core Game Logic:**
- `src/hooks/useStoryProgress.js`: Story progression, chapter unlocks, achievements (600+ lines)
- `src/utils/srs.js`: Spaced Repetition algorithm - `calculateNextReview()`, `getDueWords()`
- `src/utils/grammarEngine.js`: Procedural sentence generation for variety
- `src/WordAdventure.jsx`: Main game orchestration and state (900+ lines)

**Testing:**
- No test files currently (not detected)

**Data:**
- `src/data/story.js`: Story chapters with intro/completion dialogue and NPC definitions
- `src/data/words.js`: Word objects with `{ id, word, hebrew, hint, level, type }`
- `src/data/storeItems.js`: Item catalog with effects, prices, and consumable flags

## Naming Conventions

**Files:**
- React components: PascalCase, `.jsx` extension (e.g., `WordAdventure.jsx`, `StartScreen.jsx`)
- Hooks: camelCase prefixed with `use`, `.js` extension (e.g., `useGameState.js`)
- Utilities: camelCase, `.js` extension (e.g., `storage.js`, `srs.js`)
- Data files: camelCase, `.js` extension (e.g., `storeItems.js`, `words.js`)
- Directories: camelCase, plural for collections (e.g., `components/`, `hooks/`, `utils/`, `data/`)

**Directories:**
- `components/` - React UI components
- `screens/` - Full-screen game states
- `hooks/` - Custom React hooks
- `utils/` - Helper functions and business logic
- `data/` - Static content and constants
- `config/` - Configuration files
- `assets/` - Images and sprites

**Functions:**
- React components: PascalCase (e.g., `function WordAdventure() {}`)
- Hooks: camelCase prefixed with `use` (e.g., `export function useGameState() {}`)
- Utility functions: camelCase (e.g., `calculateNextReview()`, `safeGetJSON()`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `STORAGE_KEYS`, `GAME_CONFIG`, `CHAPTERS`)

**Variables:**
- State variables: camelCase (e.g., `gameState`, `currentWordIndex`, `userProgress`)
- State setters: camelCase `set` prefix (e.g., `setGameState`, `setScore`)
- UI/Component props: camelCase (e.g., `isListening`, `handleCheck`, `currentWord`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `INITIAL_LIVES`)

## Where to Add New Code

**New Feature (e.g., new mini-game):**
- Primary component: `src/components/NewGameName.jsx`
- State management: Add hook `src/hooks/useNewGameState.js` if complex state needed
- Export hook from: `src/hooks/index.js` (barrel export)
- Integration: Import into `src/WordAdventure.jsx` and wire into game state
- Data: If needs configuration, add to `src/data/` or `src/config/constants.js`

**New Component/Module (reusable UI piece):**
- Implementation: `src/components/ComponentName.jsx`
- Export from: `src/components/index.js` if intended for reuse
- Use: Import directly in parent components

**New Utility Function (shared logic):**
- Algorithm: `src/utils/functionName.js`
- Export: Named export or `export default`
- Tests: Create `src/utils/__tests__/functionName.test.js` when tests are added

**New Data/Content:**
- Story chapters: `src/data/story.js` (CHAPTERS object)
- Game items: `src/data/storeItems.js` (STORE_ITEMS object)
- Words: `src/data/words.js` (initialWordData array)
- Constants: `src/config/constants.js` (GAME_CONFIG, etc.)

**New Screen:**
- Component: `src/components/screens/ScreenName.jsx`
- Export from: `src/components/screens/index.js`
- Usage: Import in `WordAdventure.jsx`, add state case to conditional render
- Route via: `gameState === 'screenName'` check

**Mobile/Platform Features:**
- Utility: `src/utils/mobile.js` or `src/utils/platform.js`
- Integration: Call from hook or component, check feature support first

## Special Directories

**src/assets/sprites/:**
- Purpose: Game sprite assets for characters and animations
- Generated: No (manually created/provided)
- Committed: Yes

**public/:**
- Purpose: Static assets served directly (favicons, PWA icons, manifest)
- Generated: No
- Committed: Yes

**.planning/codebase/:**
- Purpose: Documentation generated by GSD tooling
- Generated: Yes (by `/gsd:map-codebase`)
- Committed: Yes (part of GSD planning workflow)

**.git/:**
- Purpose: Git version control
- Generated: Yes
- Committed: No (git metadata)

---

*Structure analysis: 2026-02-14*
