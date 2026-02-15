---
phase: 03-word-bank-and-srs-foundation
plan: 02
subsystem: ui
tags: [web-speech-api, audio, hebrew, gender-hints, lucide-react, accessibility]

# Dependency graph
requires:
  - phase: 03-word-bank-and-srs-foundation
    plan: 01
    provides: 201 word entries with hint, hint_m, hint_f fields
provides:
  - speakWord() utility for English pronunciation via Web Speech API
  - isSpeechSupported() browser capability detection
  - Speaker icon button on PlayingScreen with 44px touch target
  - Gender-aware hint display (hint_m/hint_f/hint fallback)
  - playerGender prop threaded from userProfile through ScreenRouter
affects: [03-04 grammar engine sync, future pronunciation features]

# Tech tracking
tech-stack:
  added: [Web Speech API (SpeechSynthesis)]
  patterns:
    - "Speech utility with lazy voice initialization and graceful degradation"
    - "Gender-aware content selection using playerGender prop with neutral fallback"

key-files:
  created:
    - src/utils/speech.js
  modified:
    - src/components/screens/PlayingScreen.jsx
    - src/components/screens/ScreenRouter.jsx

key-decisions:
  - "Speech rate set to 0.8x for child-friendly pronunciation speed"
  - "Speaker icon hidden entirely when SpeechSynthesis unavailable (no broken UI)"
  - "Gender hint fallback chain: hint_m (boys) -> hint_f (girls) -> hint (neutral default)"
  - "playerGender defaults to 'boy' when userProfile.gender is undefined for backward compat"

patterns-established:
  - "Graceful feature degradation: check capability before rendering UI elements"
  - "Gender-aware content: triple-fallback pattern (gendered_m, gendered_f, neutral)"

# Metrics
duration: 3min
completed: 2026-02-15
---

# Phase 3 Plan 2: Audio and Hints Summary

**Web Speech API pronunciation with speaker icon and gender-aware Hebrew hint display on PlayingScreen**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-15T07:59:25Z
- **Completed:** 2026-02-15T08:02:19Z
- **Tasks:** 2
- **Files modified:** 3 (+ 1 snapshot)

## Accomplishments
- Created speech.js utility with speakWord() at 0.8x rate and isSpeechSupported() detection
- Added Volume2 speaker icon button to PlayingScreen with 44px minimum touch target
- Implemented gender-aware hint display using hint_m/hint_f/hint fallback chain
- Wired playerGender prop from userProfile.gender through ScreenRouter to PlayingScreen
- All 69 tests pass with updated snapshots

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SpeechSynthesis utility and add speaker icon + hint display** - `4e561e7` (feat)
2. **Task 2: Wire playerGender prop through ScreenRouter** - `e2d8aff` (feat)

## Files Created/Modified
- `src/utils/speech.js` - SpeechSynthesis wrapper with speakWord(), isSpeechSupported(), lazy voice init
- `src/components/screens/PlayingScreen.jsx` - Speaker icon button, gender-aware hint display, Volume2 import
- `src/components/screens/ScreenRouter.jsx` - playerGender prop threading from userProfile.gender
- `src/__tests__/__snapshots__/WordAdventure.snapshot.test.jsx.snap` - Updated snapshots for new layout

## Decisions Made
- Speech rate 0.8x chosen for child-appropriate pronunciation speed
- Speaker icon completely hidden (not disabled) when SpeechSynthesis unavailable to avoid confusing children
- Gender hint uses triple fallback: hint_m for boys, hint_f for girls, hint as universal default
- playerGender defaults to 'boy' when userProfile is undefined for backward compatibility with existing tests

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Snapshot tests required updating twice (once for Task 1 layout changes, once for Task 2 gender-aware rendering) -- expected behavior, handled with --update flag

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Audio pronunciation available for all 201 words via speaker icon
- Gender-aware hints active for ~10% of words with hint_m/hint_f data
- Ready for grammar engine sync (03-04) which can leverage gender-aware patterns

## Self-Check: PASSED

All files exist, all commits found, all functionality verified (speech utility exports, speaker icon rendering, gender hint logic, prop threading).

---
*Phase: 03-word-bank-and-srs-foundation*
*Completed: 2026-02-15*
