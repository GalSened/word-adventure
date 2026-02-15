---
phase: 06-polish-and-integration
plan: 02
subsystem: ui
tags: [onboarding, progression, game-balance, zustand, react]

# Dependency graph
requires:
  - phase: 04-challenge-types-and-levels
    provides: "Level system with LEVEL_CHAPTERS and completedLevels tracking"
  - phase: 05-adventure-game
    provides: "PET_EVOLUTION consumed by useStoryProgress for pet evolution stages"
provides:
  - "Recalibrated PET_EVOLUTION thresholds (0/30/80/150) for 200-word corpus"
  - "Recalibrated CHAPTERS unlock thresholds (0/15/40/80/130) for 200-word corpus"
  - "Recalibrated MYSTERIES.lore thresholds (15/40/80/120/175) for 200-word corpus"
  - "Guided first lesson onboarding: auto-start level 1 for new players"
  - "hasCompletedOnboarding persisted flag in gameStore"
  - "Backward compat: existing users with hasSeenStoryIntro=true skip onboarding"
affects: [06-polish-and-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Onboarding via gameplay (auto-start level 1) rather than modal overlay"
    - "Backward compat via onRehydrateStorage callback for flag migration"

key-files:
  created: []
  modified:
    - "src/data/story.js"
    - "src/store/gameStore.js"
    - "src/WordAdventure.jsx"
    - "src/hooks/useGameLogic.js"
    - "src/__tests__/WordAdventure.snapshot.test.jsx"

key-decisions:
  - "Onboarding completes on first level finish (not step-based mid-level tracking) for simplicity and reliability"
  - "StoryIntro.jsx file preserved for potential reuse; only removed from render"
  - "StoryPathChoice deferred to after hasCompletedOnboarding instead of hasSeenStoryIntro"

patterns-established:
  - "Onboarding-via-gameplay: new users learn mechanics through actual level 1 play, not tutorial overlays"

# Metrics
duration: 4min
completed: 2026-02-15
---

# Phase 6 Plan 2: Progression Recalibration and Onboarding Summary

**Recalibrated pet evolution/chapter/lore thresholds for 200-word corpus and replaced StoryIntro modal with guided first lesson auto-start**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-15T15:26:18Z
- **Completed:** 2026-02-15T15:30:49Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Pet evolution stages now require 0/30/80/150 words (was 0/10/25/50), properly paced for 201-word bank
- Chapter unlocks at 0/15/40/80/130 words (was 0/5/10/15/20), preventing premature access
- Lore fragments unlock at 15/40/80/120/175 words (was 5/10/15/20/30), spacing discovery over full corpus
- New players auto-start level 1 after profile creation -- no blocking StoryIntro overlay
- StoryPathChoice deferred to after first level completion for better flow
- Existing users with hasSeenStoryIntro=true automatically marked as onboarded

## Task Commits

Each task was committed atomically:

1. **Task 1: Recalibrate PET_EVOLUTION and CHAPTERS thresholds** - `5ff7387` (feat)
2. **Task 2: Replace StoryIntro with guided first lesson onboarding** - `a9946fd` (feat)

## Files Created/Modified
- `src/data/story.js` - Recalibrated PET_EVOLUTION (3 pets), CHAPTERS (5 levels), MYSTERIES.lore (5 fragments)
- `src/store/gameStore.js` - Added hasCompletedOnboarding/onboardingStep with persistence and backward compat
- `src/WordAdventure.jsx` - Auto-start level 1 for new players, removed StoryIntro overlay, deferred StoryPathChoice
- `src/hooks/useGameLogic.js` - Mark onboarding complete on first level completion
- `src/__tests__/WordAdventure.snapshot.test.jsx` - Updated test state with onboarding fields, refreshed snapshots

## Decisions Made
- Onboarding tracks level completion (not individual answer steps) -- simpler and more reliable than step-based tracking within a level
- StoryIntro.jsx file preserved (not deleted) for potential future reuse as cinematic overlay
- StoryPathChoice gated on hasCompletedOnboarding rather than hasSeenStoryIntro -- defers meaningful story choice to after the player has context from playing

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated snapshot test state with onboarding fields**
- **Found during:** Task 2 (test verification)
- **Issue:** Snapshot tests set hasSeenStoryIntro=true but not hasCompletedOnboarding=true, causing auto-start useEffect to fire and break test navigation flow
- **Fix:** Added hasCompletedOnboarding: true and onboardingStep: 3 to resetZustandStore and setupLoggedInState in snapshot tests
- **Files modified:** src/__tests__/WordAdventure.snapshot.test.jsx
- **Verification:** All 69 tests pass after update
- **Committed in:** a9946fd (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Necessary test update for new onboarding state. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Progression system fully recalibrated for 200-word scale
- Onboarding flow provides smooth new-player experience
- Ready for Plan 06-03 (final polish tasks)

## Self-Check: PASSED

All files exist. All commits verified (5ff7387, a9946fd).

---
*Phase: 06-polish-and-integration*
*Completed: 2026-02-15*
