---
phase: 04-challenge-types-and-levels
plan: 02
subsystem: ui
tags: [react, framer-motion, reorder, drag-and-drop, grammar, spelling, challenge-types]

# Dependency graph
requires:
  - phase: 03-word-bank-and-srs-foundation
    provides: "grammarEngine.js with generateChallenge(), word bank with 201 words"
provides:
  - "SentenceBuildChallenge with framer-motion Reorder drag-and-drop"
  - "GrammarChallenge with grammar engine distractor generation"
  - "SpellingChallenge wrapper for LetterPicker with challenge interface"
affects: [04-03, 04-04, PlayingScreen integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [framer-motion Reorder for drag-and-drop reorder, grammar engine as distractor source]

key-files:
  created:
    - src/components/challenges/SentenceBuildChallenge.jsx
    - src/components/challenges/GrammarChallenge.jsx
    - src/components/challenges/SpellingChallenge.jsx
  modified: []

key-decisions:
  - "Fisher-Yates shuffle used for both tile randomization and option shuffling (consistent with project pattern)"
  - "GrammarChallenge generates distractors via grammarEngine rather than word bank (grammar sentences not in word bank)"
  - "SpellingChallenge receives extended props (scrambledContent, userInput, setUserInput, onCheck) beyond standard interface"

patterns-established:
  - "Grammar distractor generation: call generateChallenge() multiple times, deduplicate by Hebrew text"
  - "Reorder items use {id, text} objects with unique IDs to handle duplicate words in sentences"

# Metrics
duration: 2min
completed: 2026-02-15
---

# Phase 4 Plan 2: Challenge Components Summary

**Three challenge components: sentence building with framer-motion Reorder drag-and-drop, grammar multiple-choice via grammarEngine distractors, and LetterPicker spelling wrapper**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-15T08:49:23Z
- **Completed:** 2026-02-15T08:51:15Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- SentenceBuildChallenge renders draggable word tiles via Reorder.Group/Item with unique IDs for duplicate word handling
- GrammarChallenge generates 4 Hebrew translation options using grammarEngine's generateChallenge() with deduplication
- SpellingChallenge wraps LetterPicker with the challenge interface contract, extracting rendering from PlayingScreen

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SentenceBuildChallenge with framer-motion Reorder** - `4582719` (feat)
2. **Task 2: Create GrammarChallenge and SpellingChallenge wrapper** - `1ce5934` (feat)

## Files Created/Modified
- `src/components/challenges/SentenceBuildChallenge.jsx` - Drag-and-drop sentence building with framer-motion Reorder
- `src/components/challenges/GrammarChallenge.jsx` - Grammar challenge with emerald/teal multiple-choice from grammar engine
- `src/components/challenges/SpellingChallenge.jsx` - LetterPicker wrapper with standard challenge props interface

## Decisions Made
- Fisher-Yates shuffle used consistently for tile randomization and option shuffling
- GrammarChallenge generates distractors by calling generateChallenge() 3 more times (up to 10 attempts to avoid duplicates) since grammar sentences are procedurally generated and not in the word bank
- SpellingChallenge receives extended props beyond the standard {word, onAnswer, disabled, playerGender, t} interface because LetterPicker requires scrambledContent, userInput, setUserInput, and onCheck managed by useGameLogic

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 6 challenge type components now exist (3 from plan 01, 3 from this plan)
- ChallengeDispatcher (plan 01) needs updating to import these 3 new components
- Plan 03 will wire ChallengeDispatcher into PlayingScreen
- Plan 04 will add level definitions and themed progression

## Self-Check: PASSED

- [x] src/components/challenges/SentenceBuildChallenge.jsx exists
- [x] src/components/challenges/GrammarChallenge.jsx exists
- [x] src/components/challenges/SpellingChallenge.jsx exists
- [x] Commit 4582719 found in git log
- [x] Commit 1ce5934 found in git log

---
*Phase: 04-challenge-types-and-levels*
*Completed: 2026-02-15*
