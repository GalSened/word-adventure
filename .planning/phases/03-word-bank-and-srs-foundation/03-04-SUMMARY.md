---
phase: 03-word-bank-and-srs-foundation
plan: 04
subsystem: content
tags: [grammar-engine, gender-agreement, word-bank, hebrew, i18n]

# Dependency graph
requires:
  - phase: 03-01
    provides: "Unified word bank with 201 entries across 10 categories"
provides:
  - "Grammar engine nouns derived from unified word bank via buildNounsFromWordBank()"
  - "Gender-audited ENCOURAGEMENT messages (neutral or { boy, girl } variants)"
  - "Gender-aware NPC dialogues with { boy, girl } text objects"
  - "getNPCDialogue() with gender parameter (backward-compatible default 'boy')"
  - "resolveGenderedText() helper for mixed string/object text resolution"
affects: [phase-04, phase-06, ui-components]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Gendered text objects: { boy: string, girl: string } for player-facing Hebrew"
    - "resolveGenderedText() for resolving mixed string/object text values"
    - "buildNounsFromWordBank() derives grammar nouns from word bank at module load"

key-files:
  created: []
  modified:
    - src/utils/grammarEngine.js
    - src/utils/grammarEngine.test.js
    - src/data/story.js
    - src/hooks/useStoryProgress.js
    - src/__tests__/__snapshots__/WordAdventure.snapshot.test.jsx.snap

key-decisions:
  - "Only animals, family, professions categories used as grammar engine noun sources (sentence-suitable subjects)"
  - "Adjectives/verbs/objects remain hardcoded in grammar engine (require he_m/he_f forms not in word schema)"
  - "ENCOURAGEMENT messages prefer gender-neutral rewrites; only use { boy, girl } when genuinely unavoidable"
  - "getNPCDialogue defaults to 'boy' gender for backward compatibility with existing callers"

patterns-established:
  - "Gendered dialogue pattern: { boy, girl } objects alongside plain strings, resolved via resolveGenderedText()"
  - "Word bank noun sync: buildNounsFromWordBank() filters by NOUN_CATEGORIES and maps to grammar engine format"

# Metrics
duration: 4min
completed: 2026-02-15
---

# Phase 3 Plan 4: Grammar Engine Noun Sync and Gender Audit Summary

**Grammar engine nouns sourced from unified word bank; all ENCOURAGEMENT and NPC dialogues gender-audited with { boy, girl } Hebrew variants**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-15T07:59:50Z
- **Completed:** 2026-02-15T08:03:50Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Grammar engine nouns now derived from the unified word bank (animals, family, professions categories) via `buildNounsFromWordBank()`
- All ENCOURAGEMENT messages are either gender-neutral or provide { boy, girl } variants
- All NPC dialogues across 5 chapters that address the player use { boy, girl } text objects
- `getNPCDialogue()` accepts `gender` parameter with backward-compatible 'boy' default
- `resolveGenderedText()` helper added for mixed text resolution in consumers
- 13 grammar engine tests + 69 total tests passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Sync grammar engine nouns from word bank and update tests** - `8723746` (feat)
2. **Task 2: Audit and fix gender usage in ENCOURAGEMENT and NPC dialogues** - `bb8e2c1` (feat)

## Files Created/Modified
- `src/utils/grammarEngine.js` - Import word bank, buildNounsFromWordBank(), NOUN_CATEGORIES filter
- `src/utils/grammarEngine.test.js` - Dynamic noun-index tests, buildNounsFromWordBank tests (13 tests)
- `src/data/story.js` - Gender-audited ENCOURAGEMENT, gendered NPC dialogues, resolveGenderedText(), updated getNPCDialogue()
- `src/hooks/useStoryProgress.js` - Gender-aware getDialogue() with resolveGenderedText() and gender param
- `src/__tests__/__snapshots__/WordAdventure.snapshot.test.jsx.snap` - Updated snapshot for new word bank nouns

## Decisions Made
- Only animals, family, professions categories are used as grammar engine noun sources -- these represent things/beings that work as sentence subjects ("The X is big", "The X runs"). Food, colors, nature, body, actions, home, emotions are excluded.
- Adjectives, verbs, and objects remain hardcoded in the grammar engine because they require he_m/he_f gender-agreement forms that are not in the word bank schema.
- ENCOURAGEMENT messages prefer gender-neutral rewrites (e.g., dropping pronouns: "כוכב!" instead of "אתה כוכב!"). Only messages that genuinely cannot be neutralized use { boy, girl } objects.
- `getNPCDialogue()` defaults to `gender = 'boy'` for backward compatibility -- existing callers that do not pass gender get unchanged behavior.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added resolveGenderedText() helper and wired ENCOURAGEMENT gender resolution in useStoryProgress**
- **Found during:** Task 2 (gender audit)
- **Issue:** Plan introduced { boy, girl } objects in ENCOURAGEMENT arrays but did not address that getRandomItem() callers would receive objects instead of strings
- **Fix:** Added resolveGenderedText() export to story.js, imported it in useStoryProgress.js, wrapped all getRandomItem(ENCOURAGEMENT.*) calls with resolveGenderedText()
- **Files modified:** src/data/story.js, src/hooks/useStoryProgress.js
- **Verification:** All 69 tests pass
- **Committed in:** bb8e2c1 (Task 2 commit)

**2. [Rule 1 - Bug] Updated snapshot test for word bank-driven grammar engine**
- **Found during:** Task 2 (verification)
- **Issue:** Snapshot test contained hardcoded CAT noun from old grammar engine; new word bank nouns produced different letter tiles
- **Fix:** Updated snapshot via `npx vitest run --update`
- **Files modified:** src/__tests__/__snapshots__/WordAdventure.snapshot.test.jsx.snap
- **Verification:** All 69 tests pass including snapshot test
- **Committed in:** bb8e2c1 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 bug)
**Impact on plan:** Both auto-fixes necessary for correctness. The ENCOURAGEMENT consumer fix was an omission in the plan (mixed types require resolution). The snapshot update was an expected consequence of Task 1's noun source change. No scope creep.

## Issues Encountered
None -- plan executed smoothly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 3 complete: word bank (201 entries), SRS algorithm, grammar engine noun sync, and gender audit all done
- Ready for Phase 4: game mechanics and UI improvements
- Gender-aware text pattern established for future UI components to consume

## Self-Check: PASSED

All created/modified files verified present. Both task commits (8723746, bb8e2c1) verified in git log.

---
*Phase: 03-word-bank-and-srs-foundation*
*Completed: 2026-02-15*
