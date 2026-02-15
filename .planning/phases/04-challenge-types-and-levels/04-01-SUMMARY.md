---
phase: 04-challenge-types-and-levels
plan: 01
subsystem: ui
tags: [react, framer-motion, speech-api, multiple-choice, srs, challenge-types]

# Dependency graph
requires:
  - phase: 03-word-bank-and-srs-foundation
    provides: "201-word bank with categories, SRS algorithm, speech utility, gender-aware text"
provides:
  - "Adaptive challenge type selector (selectChallengeType) based on SRS mastery bands"
  - "Distractor generator (generateDistractors) with same-category preference"
  - "Shared shuffleArray utility extracted from useGameLogic pattern"
  - "MultipleChoiceChallenge component (Hebrew->English)"
  - "ReverseChoiceChallenge component (English->Hebrew)"
  - "ListeningChallenge component (audio-based with speech fallback)"
  - "ChallengeDispatcher switch-routing component"
  - "CHALLENGE_TYPES enum in constants.js"
affects: [04-02, 04-03, 04-04]

# Tech tracking
tech-stack:
  added: []
  patterns: ["challenge component interface: { word, onAnswer, disabled, playerGender, t }", "mastery-band challenge pools for adaptive difficulty"]

key-files:
  created:
    - src/utils/challengeSelector.js
    - src/utils/distractorGenerator.js
    - src/components/challenges/MultipleChoiceChallenge.jsx
    - src/components/challenges/ReverseChoiceChallenge.jsx
    - src/components/challenges/ListeningChallenge.jsx
    - src/components/challenges/ChallengeDispatcher.jsx
  modified:
    - src/config/constants.js

key-decisions:
  - "Challenge components use shared props interface { word, onAnswer, disabled, playerGender, t } for uniform dispatch"
  - "Distractor generator returns full word objects (not strings) so caller decides which field to display"
  - "Each challenge type uses distinct gradient color for visual differentiation (blue/green/purple)"

patterns-established:
  - "Challenge component pattern: useMemo for option generation keyed on word.id, hapticFeedback on answer, motion.button with whileTap"
  - "ChallengeDispatcher switch-case routing with null placeholders for unimplemented types"

# Metrics
duration: 2min
completed: 2026-02-15
---

# Phase 4 Plan 1: Challenge Infrastructure Summary

**Adaptive challenge selector with 4 mastery bands, distractor generator with same-category preference, 3 challenge components (MultipleChoice, ReverseChoice, Listening), and ChallengeDispatcher routing**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-15T08:49:16Z
- **Completed:** 2026-02-15T08:51:26Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Adaptive challenge selector maps SRS repetition to mastery bands (new/learning/familiar/mastered) with appropriate challenge pools
- Distractor generator creates 3 plausible wrong answers preferring same-category words from the 201-word bank
- Three challenge components with distinct visual identities: MultipleChoice (blue, Hebrew->English), ReverseChoice (green, English->Hebrew), Listening (purple, audio+English)
- ChallengeDispatcher provides unified switch-based routing for all challenge types

## Task Commits

Each task was committed atomically:

1. **Task 1: Create challenge selector and distractor generator utilities** - `6bdfd7d` (feat)
2. **Task 2: Create MultipleChoice, ReverseChoice, and Listening challenge components** - `882eb59` (feat)
3. **Task 3: Create ChallengeDispatcher routing component** - `4b37e26` (feat)

## Files Created/Modified
- `src/config/constants.js` - Added CHALLENGE_TYPES enum (spelling, multipleChoice, reverseChoice, listening, sentenceBuild, grammar)
- `src/utils/challengeSelector.js` - Adaptive challenge type selection based on SRS mastery bands
- `src/utils/distractorGenerator.js` - Wrong answer generation with same-category preference, shuffleArray utility
- `src/components/challenges/MultipleChoiceChallenge.jsx` - Hebrew-to-English 2x2 grid multiple choice (blue gradient)
- `src/components/challenges/ReverseChoiceChallenge.jsx` - English-to-Hebrew 2x2 grid multiple choice (green gradient)
- `src/components/challenges/ListeningChallenge.jsx` - Audio playback with English option grid (purple gradient), speech fallback
- `src/components/challenges/ChallengeDispatcher.jsx` - Switch-based routing from challengeType to component

## Decisions Made
- Challenge components use shared props interface `{ word, onAnswer, disabled, playerGender, t }` for uniform dispatch through ChallengeDispatcher
- Distractor generator returns full word objects (not strings) so the calling component decides which field to display (word vs hebrew)
- Each challenge type uses a distinct gradient color (blue/green/purple) for visual differentiation
- sentenceBuild filtered from challenge pools when word.type is not 'sentence' (future-proofing)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Challenge infrastructure ready for Plan 02 (SentenceBuild and Grammar challenges)
- ChallengeDispatcher has null placeholders for spelling, sentenceBuild, grammar types
- Challenge components ready for integration into game loop (Plan 04)

## Self-Check: PASSED

All 7 files verified present. All 3 task commits verified in git log.

---
*Phase: 04-challenge-types-and-levels*
*Completed: 2026-02-15*
