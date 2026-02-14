---
phase: 02-architecture-refactoring
plan: 03
subsystem: ui
tags: [react, screen-router, component-extraction, thin-orchestrator, gender-fix]

# Dependency graph
requires:
  - phase: 02-architecture-refactoring
    plan: 02
    provides: "GameContext provider, rewired hooks with Zustand selectors"
provides:
  - "ScreenRouter mapping all 10 gameState values to screen components"
  - "5 new screen components (Store, Inventory, Memory, PetWalking, Avatar)"
  - "useGameLogic hook with all core game logic extracted from WordAdventure"
  - "Thin WordAdventure orchestrator (106 lines, down from 627)"
  - "PetWalkingGame gender from userProfile.gender only (ARCH-06)"
  - "Single initialWordData import from src/data/words.js (ARCH-05)"
affects: [03-content-expansion]

# Tech tracking
tech-stack:
  added: []
  patterns: [screen-router-pattern, game-logic-hook, thin-orchestrator]

key-files:
  created:
    - src/components/screens/ScreenRouter.jsx
    - src/components/screens/StoreScreen.jsx
    - src/components/screens/InventoryScreen.jsx
    - src/components/screens/MemoryScreen.jsx
    - src/components/screens/PetWalkingScreen.jsx
    - src/components/screens/AvatarScreen.jsx
    - src/hooks/useGameLogic.js
  modified:
    - src/WordAdventure.jsx
    - src/components/PetWalkingGame.jsx
    - src/components/screens/index.js
    - src/__tests__/__snapshots__/WordAdventure.snapshot.test.jsx.snap

key-decisions:
  - "Extracted game logic into useGameLogic hook to achieve thin orchestrator (WordAdventure 106 lines vs target 80)"
  - "ScreenRouter uses switch/case with explicit prop mapping per screen for clarity over generic spread"
  - "New screen components use prop drilling (not useGame context) to avoid breaking snapshot tests"
  - "PetWalkingGame gender inference simplified to userProfile.gender only -- removes avatar emoji fallback"

patterns-established:
  - "ScreenRouter pattern: centralized gameState-to-component mapping with AnimatePresence wrapping"
  - "useGameLogic hook: game logic functions separated from UI state and rendering"
  - "Screen component pattern: thin wrappers receiving props, wrapping child components in motion.div"

# Metrics
duration: 4min
completed: 2026-02-14
---

# Phase 2 Plan 3: WordAdventure Decomposition Summary

**ScreenRouter with 10 game states, useGameLogic hook extraction, WordAdventure slimmed from 627 to 106 lines, gender fix (ARCH-06), duplicate data removal (ARCH-05)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-14T14:10:13Z
- **Completed:** 2026-02-14T14:14:15Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Created ScreenRouter mapping all 10 gameState values (start, map, playing, levelComplete, gameOver, store, inventory, memory, petWalking, avatar) to screen components
- Extracted 5 new screen components from WordAdventure inline JSX (StoreScreen, InventoryScreen, MemoryScreen, PetWalkingScreen, AvatarScreen)
- Extracted all game logic into useGameLogic hook (startLevel, processAnswer, handleCheck, handleBuy, handleInventoryClose, plus new handlers for use/walk/memory/avatar)
- Reduced WordAdventure.jsx from 627 lines to 106 lines (83% reduction)
- Fixed PetWalkingGame gender inference to use only userProfile.gender (ARCH-06)
- Eliminated duplicate initialWordData -- single import from src/data/words.js (ARCH-05)
- Updated 4 snapshot tests for new component structure, all 51 tests passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ScreenRouter and 5 new screen components** - `2381acf` (feat)
2. **Task 2: Slim WordAdventure, fix gender, remove duplicate data, update tests** - `76a227c` (feat)

## Files Created/Modified
- `src/components/screens/ScreenRouter.jsx` - Centralized gameState-to-component router with AnimatePresence
- `src/components/screens/StoreScreen.jsx` - Store screen wrapper with motion.div animation
- `src/components/screens/InventoryScreen.jsx` - Inventory management screen wrapper
- `src/components/screens/MemoryScreen.jsx` - Memory game screen wrapper
- `src/components/screens/PetWalkingScreen.jsx` - Pet walking screen with userProfile for gender
- `src/components/screens/AvatarScreen.jsx` - Avatar selection screen wrapper
- `src/components/screens/index.js` - Barrel export updated with all 10 components + ScreenRouter
- `src/hooks/useGameLogic.js` - Core game logic hook (startLevel, processAnswer, handleCheck, handleBuy, etc.)
- `src/WordAdventure.jsx` - Thin orchestrator: state, hooks, effects, screenProps, JSX shell
- `src/components/PetWalkingGame.jsx` - Gender inference simplified (ARCH-06)
- `src/__tests__/__snapshots__/WordAdventure.snapshot.test.jsx.snap` - 4 snapshots updated

## Decisions Made
- **useGameLogic hook extraction:** The plan suggested extracting game logic into a hook "if needed to hit 80 lines." With 20 useState declarations, 12 persistence effects, and the screenProps object, WordAdventure reached 106 lines even after extracting ALL game logic. The 20 state declarations alone take 20 lines. Accepted 106 lines as the practical minimum for this component's orchestration responsibilities.
- **ScreenRouter uses switch/case:** Chose explicit switch/case with per-screen prop mapping over generic SCREEN_MAP + spread. This makes prop dependencies visible per screen and avoids passing unnecessary props.
- **Prop drilling preserved:** New screen components receive props rather than using useGame() context, preserving backward compatibility with existing snapshot tests that render WordAdventure without GameProvider.
- **Gender inference simplification (ARCH-06):** Removed `(avatar === '👸') || (userProfile?.avatar === '👸')` fallback from PetWalkingGame. The userProfile already contains the authoritative gender field.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created useGameLogic hook to enable thin orchestrator**
- **Found during:** Task 2
- **Issue:** WordAdventure contained ~180 lines of game logic functions (startLevel, processAnswer, handleCheck, handleBuy, etc.) that prevented hitting the 80-line target even after removing all inline JSX
- **Fix:** Extracted all game logic into src/hooks/useGameLogic.js custom hook. Also consolidated onUse, onWalkPet, onComplete, and onSelect handlers into the hook as handleUse, handleWalkPet, handlePetWalkComplete, handleMemoryComplete, and handleAvatarSelect
- **Files modified:** src/hooks/useGameLogic.js (created), src/WordAdventure.jsx (rewritten)
- **Verification:** All 51 tests pass, WordAdventure reduced to 106 lines
- **Committed in:** 76a227c (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking -- plan anticipated this: "ONLY create useGameLogic if needed to hit the 80-line target")
**Impact on plan:** The plan explicitly suggested this extraction. WordAdventure at 106 lines (not 80) because 20 useState declarations + persistence effects are irreducible orchestration overhead. No scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 10 screens routed via ScreenRouter -- future changes to screen rendering go through screen components only
- useGameLogic hook ready for future migration to Zustand store actions
- WordAdventure is a thin shell: state + hooks + effects + JSX -- easy to wrap in GameProvider when ready
- storyChapters constant removed from WordAdventure (MapScreen imports CHAPTERS from story.js directly)

## Self-Check: PASSED

- [x] src/components/screens/ScreenRouter.jsx exists
- [x] src/components/screens/StoreScreen.jsx exists
- [x] src/components/screens/InventoryScreen.jsx exists
- [x] src/components/screens/MemoryScreen.jsx exists
- [x] src/components/screens/PetWalkingScreen.jsx exists
- [x] src/components/screens/AvatarScreen.jsx exists
- [x] src/hooks/useGameLogic.js exists
- [x] src/WordAdventure.jsx exists (106 lines)
- [x] 02-03-SUMMARY.md exists
- [x] Commit 2381acf exists in git log
- [x] Commit 76a227c exists in git log

---
*Phase: 02-architecture-refactoring*
*Completed: 2026-02-14*
