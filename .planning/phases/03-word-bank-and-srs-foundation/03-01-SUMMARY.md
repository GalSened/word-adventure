---
phase: 03-word-bank-and-srs-foundation
plan: 01
subsystem: content
tags: [zod, hebrew, word-bank, i18n, vocabulary, srs]

# Dependency graph
requires:
  - phase: 02-architecture-refactoring
    provides: Zod word schema with 10 required fields, fail-fast validation
provides:
  - Extended WordSchema with 13 fields (hint_m, hint_f, exampleSentence_he)
  - WORD_CATEGORIES exported constant (10 category enum)
  - 201 validated word entries across 10 themed categories
  - Bilingual example sentences for every word
  - Gender-aware hints for ~10% of words
affects: [03-02 audio integration, 03-03 SRS at scale, 03-04 grammar engine sync]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Category enum replaces free-form string for type safety"
    - "Gender-aware hint_m/hint_f optional fields for Hebrew grammar addressing player"

key-files:
  created: []
  modified:
    - src/data/wordSchema.js
    - src/data/words.js

key-decisions:
  - "Category enum locked to 10 values: animals, food, family, colors, nature, body, actions, home, emotions, professions"
  - "exampleSentence_he is required (not optional) to enforce bilingual completeness"
  - "hint_m/hint_f only added where hint directly addresses player with gendered Hebrew (~10%)"
  - "Original 13 words preserved with updated categories (objects -> home) and new required fields"

patterns-established:
  - "Word entries organized by category section with header comments"
  - "Gender-aware hints only when Hebrew grammar requires addressing the player directly"

# Metrics
duration: 8min
completed: 2026-02-15
---

# Phase 3 Plan 1: Word Bank Summary

**201 Zod-validated bilingual word entries across 10 themed categories with gender-aware Hebrew hints and example sentences**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-15T07:48:07Z
- **Completed:** 2026-02-15T07:56:37Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Extended WordSchema with 3 new fields (hint_m optional, hint_f optional, exampleSentence_he required) and category enum
- Authored 201 word entries spanning 10 categories with minimum 15 words per category
- Every word has correct Hebrew grammatical gender, natural Hebrew hint, and bilingual example sentences
- All 66 existing tests continue to pass with updated snapshot

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend Zod word schema** - `f91d158` (feat)
2. **Task 2: Author ~100 words for animals, food, family, colors, nature** - `da7df20` (feat)
3. **Task 3: Author ~100 words for body, actions, home, emotions, professions** - `3195450` (feat)

## Files Created/Modified
- `src/data/wordSchema.js` - Extended WordSchema with hint_m, hint_f, exampleSentence_he, category enum; exports WORD_CATEGORIES
- `src/data/words.js` - 201 validated word entries across 10 categories with bilingual content
- `src/__tests__/__snapshots__/WordAdventure.snapshot.test.jsx.snap` - Updated snapshot for new word data

## Decisions Made
- Category enum locked to 10 values matching CONT-02 specification
- exampleSentence_he made required (not optional) to enforce data completeness for Phase 3
- hint_m/hint_f used sparingly (~10% of words) only where Hebrew grammar requires gendered player-addressing (e.g., actions, emotions categories)
- Original 13 words from Phase 2 preserved with updated categories: `objects` -> `home` for book/treasure
- WORD_CATEGORIES exported as named constant for use by other modules

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Restored missing original 13 words after initial Task 2 write**
- **Found during:** Task 2 (word authoring)
- **Issue:** Initial rewrite of words.js omitted 6 original words (book, happy, adventure, treasure, mysterious, extraordinary) that had non-enum categories
- **Fix:** Added all 6 words back with corrected categories (objects -> home, emotions kept) and new exampleSentence_he fields
- **Files modified:** src/data/words.js
- **Verification:** All 13 original word IDs confirmed present, tests pass
- **Committed in:** da7df20 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Auto-fix ensured backward compatibility with existing word IDs. No scope creep.

## Issues Encountered
- Snapshot test needed updating after word data expansion (expected, updated with --update flag)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- 201 words validated and ready for audio integration (03-02)
- SRS algorithm can now be tested at scale with 200+ words (03-03)
- Grammar engine sync can reference all 10 categories (03-04)
- WORD_CATEGORIES export available for category-based filtering

## Self-Check: PASSED

All files exist, all commits found, all content claims verified (201 words, 10 categories 15+, WORD_CATEGORIES export, schema fields).

---
*Phase: 03-word-bank-and-srs-foundation*
*Completed: 2026-02-15*
