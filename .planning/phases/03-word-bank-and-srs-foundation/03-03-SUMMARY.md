---
phase: 03-word-bank-and-srs-foundation
plan: 03
subsystem: srs
tags: [srs, spaced-repetition, sm2, jitter, review-session]

# Dependency graph
requires:
  - phase: 01-test-safety-net
    provides: SRS unit tests and vitest infrastructure
  - phase: 02-architecture-refactoring
    provides: useGameLogic hook, Zustand store, word schema validation
provides:
  - getDueWords excludes unseen words (learned-only filtering)
  - addJitter function for review interval randomization
  - buildReviewSession with 7-overdue + 3-low-rep cap and priority sorting
  - useGameLogic review mode uses buildReviewSession
affects: [03-04, 04-content-integration, review-ui]

# Tech tracking
tech-stack:
  added: []
  patterns: [jitter-on-nextReviewDate, learned-only-filtering, session-cap-pattern]

key-files:
  created: []
  modified:
    - src/utils/srs.js
    - src/utils/srs.test.js
    - src/hooks/useGameLogic.js

key-decisions:
  - "Base interval field stays un-jittered for algorithm continuity; only nextReviewDate uses jittered value"
  - "Low-rep threshold set to repetition < 3 for new-slot eligibility in review sessions"
  - "getDueWords kept exported for potential direct use, though useGameLogic now uses buildReviewSession"

patterns-established:
  - "Jitter pattern: addJitter(interval) applies +/-10% via Math.round(interval * 0.1 * (2 * Math.random() - 1)), clamped >= 1"
  - "Session builder pattern: separate overdue (sorted ascending) from low-rep (not-yet-due), combine with caps"
  - "Math.random mock pattern: vi.spyOn(Math, 'random').mockReturnValue(X) for deterministic jitter tests"

# Metrics
duration: 3min
completed: 2026-02-15
---

# Phase 03 Plan 03: SRS Algorithm Fixes Summary

**SRS learned-only filtering, +/-10% jitter randomization, and buildReviewSession with 7+3=10 cap and most-overdue-first sorting**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-15T07:48:07Z
- **Completed:** 2026-02-15T07:50:46Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Fixed getDueWords to exclude unseen words (PROG-01): `if (!word.srs) return false` replaces `return true`
- Added addJitter with +/-10% randomization for intervals > 1 day, preventing review clustering (PROG-03)
- Implemented buildReviewSession with 7 overdue (sorted most-overdue-first) + 3 low-rep cap = max 10 words (PROG-02 + PROG-04)
- Wired buildReviewSession into useGameLogic review mode, replacing manual getDueWords + slice approach

## Task Commits

Each task was committed atomically:

1. **Task 1: RED -- failing tests for SRS learned-only, jitter, session builder** - `b9c0058` (test)
2. **Task 2: GREEN -- implement SRS fixes and wire into useGameLogic** - `a568c17` (feat)

_TDD plan: RED committed with 18 failing tests, GREEN committed with all 33 passing._

## Files Created/Modified
- `src/utils/srs.js` - Added addJitter, buildReviewSession; fixed getDueWords; applied jitter in calculateNextReview
- `src/utils/srs.test.js` - 33 tests total (was 24): updated getDueWords tests for PROG-01, new addJitter (7 tests), new buildReviewSession (7 tests), jitter-aware calculateNextReview tests
- `src/hooks/useGameLogic.js` - Review mode uses buildReviewSession instead of getDueWords + slice

## Decisions Made
- Base interval stays un-jittered for SM-2 algorithm continuity; only nextReviewDate gets jittered value for scheduling
- Low-rep threshold set at repetition < 3 for "new slot" eligibility in buildReviewSession
- getDueWords export kept even though useGameLogic no longer imports it, for potential direct use elsewhere

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing snapshot test failure in `WordAdventure.snapshot.test.jsx` due to word schema validation (exampleSentence_he field missing from word data). Not caused by our changes -- confirmed by running tests against pre-change code. Tracked as a known issue from Phase 2 word schema enforcement.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- SRS algorithm fully fixed and tested for 200-word scale
- buildReviewSession ready for UI integration (review screen can call it directly)
- Phase 03 Plan 04 can proceed with content integration knowing SRS correctly filters learned vs unseen

## Self-Check: PASSED

- All 4 files verified on disk (srs.js, srs.test.js, useGameLogic.js, SUMMARY.md)
- Both commits verified in git log (b9c0058, a568c17)
- All 4 required exports confirmed (calculateNextReview, getDueWords, addJitter, buildReviewSession)
- 33/33 SRS tests passing

---
*Phase: 03-word-bank-and-srs-foundation*
*Completed: 2026-02-15*
