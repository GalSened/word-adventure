# Roadmap: Word Adventure — Improvement Milestone

## Overview

This milestone transforms Word Adventure from a 13-word prototype with one challenge type into a 200+ word learning game with five challenge mechanics, a redesigned adventure mode, and properly tuned progression. The work flows through six phases: test safety net, architecture refactoring, content and SRS foundation, challenge variety, adventure game, and polish. Each phase delivers a coherent, verifiable capability that unblocks the next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Test Safety Net** - Vitest configured with unit and snapshot tests covering core utilities before any refactoring begins (completed 2026-02-14)
- [x] **Phase 2: Architecture Refactoring** - Mega-component decomposed, state centralized, unified word schema established, gender source of truth fixed (completed 2026-02-15)
- [x] **Phase 3: Word Bank and SRS Foundation** - 200+ words authored across themed categories with working SRS at scale (completed 2026-02-15)
- [x] **Phase 4: Challenge Types and Levels** - Five challenge mechanics, 10+ progressive levels, adaptive difficulty, and visual theming (completed 2026-02-15)
- [x] **Phase 5: Adventure Game** - New adventure component with themed encounter zones reusing challenge mechanics (completed 2026-02-15)
- [ ] **Phase 6: Polish and Integration** - Word book, progress tracker, onboarding, threshold tuning, and memory game improvements

## Phase Details

### Phase 1: Test Safety Net
**Goal**: Developers can refactor with confidence because pure utility functions have characterization tests and the main component has snapshot coverage
**Depends on**: Nothing (first phase)
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05
**Success Criteria** (what must be TRUE):
  1. Running `npx vitest run` executes a full test suite with zero configuration errors
  2. SRS algorithm tests verify that interval calculation, ease factor adjustment, and quality score mapping produce correct outputs for known inputs
  3. Grammar engine tests verify that sentence generation, gender agreement, and verb conjugation produce correct Hebrew output
  4. Storage utility tests verify that safeGetJSON/safeSetJSON handle missing keys, corrupted JSON, and quota errors gracefully
  5. Snapshot tests capture the rendered output of WordAdventure for each gameState value (start, welcome, map, playing, levelComplete, gameOver)
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Vitest setup and pure utility tests (srs.js, grammarEngine.js, storage.js)
- [x] 01-02-PLAN.md — Component snapshot tests for WordAdventure gameState values

### Phase 2: Architecture Refactoring
**Goal**: The codebase has a clean component architecture, centralized state, a validated word schema, and a single gender source of truth — ready for content at scale
**Depends on**: Phase 1
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, ARCH-06, ARCH-07, ARCH-08, ARCH-09, CONT-10
**Success Criteria** (what must be TRUE):
  1. WordAdventure.jsx is under 80 lines and delegates all rendering to screen components selected by ScreenRouter
  2. Game state, user progress, story progress, daily stats, and item effects are accessed via a single GameContext provider (no prop drilling of these values)
  3. All localStorage persistence flows through Zustand with persist middleware — no direct safeGetJSON/safeSetJSON calls remain in components
  4. A Zod schema validates every word entry at build/load time, and adding a word with a missing required field (id, word, hebrew, hint, category, emoji, level, type, gender, exampleSentence) produces a clear validation error
  5. Player gender is read from exactly one source (userProfile.gender) everywhere in the app — PetWalkingGame no longer infers gender from avatar emoji
**Plans**: 5 plans

Plans:
- [x] 02-01-PLAN.md — Install deps (zustand, zod, nanoid), create Zustand store with persist middleware and localStorage migration
- [x] 02-02-PLAN.md — GameContext provider wrapping Zustand store, rewire 4 hooks as thin wrappers
- [x] 02-03-PLAN.md — Decompose WordAdventure.jsx into ScreenRouter + 5 new screen components, fix gender inference, remove duplicate word data
- [x] 02-04-PLAN.md — Zod word schema, enrich 13 words, nanoid IDs in grammarEngine
- [x] 02-05-PLAN.md — [Gap closure] Wire WordAdventure to Zustand store, eliminate all direct localStorage access

### Phase 3: Word Bank and SRS Foundation
**Goal**: The game has 200+ validated words across themed categories with audio, gender-aware hints, and an SRS system that correctly manages review scheduling at scale
**Depends on**: Phase 2
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-08, CONT-09, PROG-01, PROG-02, PROG-03, PROG-04
**Success Criteria** (what must be TRUE):
  1. The word bank contains 200+ entries across 8-10 themed categories, each validated against the Zod schema with no validation errors
  2. Every word has a playable English audio pronunciation via Web Speech API (tapping a speaker icon speaks the word)
  3. Hints display correct Hebrew gender forms — gender-neutral where grammar allows, hint_m/hint_f variants where Hebrew requires it
  4. Grammar engine sentences use words from the unified word bank (no separate VOCAB list)
  5. Review mode surfaces only previously-played words (never unseen words), caps sessions at 3 new + 7 review words, and spaces reviews with jitter to prevent clustering
**Plans**: 4 plans

Plans:
- [x] 03-01-PLAN.md — Extend Zod schema (hint_m/hint_f, exampleSentence_he, category enum) and author 200+ words across 10 themed categories
- [x] 03-02-PLAN.md — SpeechSynthesis audio utility, speaker icon on PlayingScreen, gender-aware hint display
- [x] 03-03-PLAN.md — [TDD] SRS algorithm fixes: getDueWords learned-only, addJitter, buildReviewSession with caps and priority sorting
- [x] 03-04-PLAN.md — Grammar engine noun sync from word bank, ENCOURAGEMENT and NPC dialogue gender audit

### Phase 4: Challenge Types and Levels
**Goal**: Players experience five distinct challenge mechanics across 10+ themed levels that adapt difficulty based on word mastery
**Depends on**: Phase 2 (Challenge Interface Contract), Phase 3 (word bank)
**Requirements**: CHAL-01, CHAL-02, CHAL-03, CHAL-04, CHAL-05, CHAL-06, CHAL-07, CHAL-08, CHAL-09, CHAL-10
**Success Criteria** (what must be TRUE):
  1. Players encounter five distinct challenge types during normal play: spelling (letter picker), multiple choice (Hebrew to English), reverse multiple choice (English to Hebrew), listening (hear word, select answer), and sentence building (drag-and-drop)
  2. Hebrew grammar challenges appear at lower difficulty levels, testing gender agreement and verb conjugation using the grammar engine
  3. The game presents easier challenge types (multiple choice) for newly-encountered words and harder types (spelling, sentence building) for words the player has demonstrated mastery of
  4. Players progress through 10+ levels with each level having a visually distinct theme (unique background, colors, decorations) and story continuity between levels
  5. Each level contains enough words and challenge variety that completion requires sustained engagement (not finishable in under a minute)
**Plans**: 4 plans

Plans:
- [x] 04-01-PLAN.md — Challenge infrastructure (selector, distractors) + multiple choice, reverse choice, listening components
- [x] 04-02-PLAN.md — Sentence building (framer-motion Reorder), grammar challenge, spelling wrapper
- [x] 04-03-PLAN.md — PlayingScreen integration, ChallengeDispatcher wiring, adaptive difficulty in useGameLogic
- [x] 04-04-PLAN.md — 12 themed levels, MapScreen redesign, story expansion, grammar injection

### Phase 5: Adventure Game
**Goal**: Players explore themed zones in an adventure mini-game that integrates vocabulary challenges as natural encounters rather than interruptions
**Depends on**: Phase 3 (word categories for zone mapping), Phase 4 (challenge components for encounters)
**Requirements**: ADVN-01, ADVN-02, ADVN-03, ADVN-04, ADVN-05, ADVN-06, ADVN-07, ADVN-08
**Success Criteria** (what must be TRUE):
  1. A new AdventureGame component loads without memory leaks (requestAnimationFrame properly cleaned up on unmount, verified by mounting/unmounting in tests)
  2. Players can enter 3-5 visually distinct zones (e.g., forest, beach, city) each with themed CSS backgrounds and character representations beyond emoji sprites
  3. Each zone draws vocabulary from its corresponding word category (forest zone uses Nature words, city zone uses Professions words)
  4. Encounters present varied challenge types (spelling, multiple choice, listening) reusing the challenge components from Phase 4
  5. The pet provides contextual help during encounters (hints at correct answer, finds bonus items) and visual cues signal upcoming encounters (pet sniffing, rustling bushes) so discoveries feel organic
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md — AdventureGame core: state machine, useAnimationFrame game loop, 5 zone configs, ZoneRenderer, PetCompanion
- [x] 05-02-PLAN.md — EncounterOverlay with ChallengeDispatcher, SRS updates, pet hints, app integration (ScreenRouter + StartScreen)

### Phase 6: Polish and Integration
**Goal**: The complete game has a word book for review, visible progress tracking, a welcoming onboarding experience, and properly calibrated progression thresholds
**Depends on**: Phase 3 (word bank for thresholds), Phase 4 (levels for progress tracking)
**Requirements**: CONT-07, PROG-05, PROG-06, PROG-07, PROG-08, PROG-09
**Success Criteria** (what must be TRUE):
  1. Players can open a word book from the main screen and browse all learned words organized by category, with each entry showing the word, translation, hint, example sentence, and mastery level
  2. The start screen displays total progress ("42/200 words mastered") that accurately reflects SRS mastery state
  3. Story chapter unlocks and pet evolution thresholds are calibrated for 200-word scale (first chapter does not unlock after only 20 words; pet evolution milestones feel appropriately spaced)
  4. New players experience a guided first lesson that teaches core mechanics through play — no multi-step story intro blocking gameplay
  5. The memory match mini-game draws its word pool from recently learned words based on SRS data rather than a static or random selection
**Plans**: TBD

Plans:
- [ ] 06-01: Word book UI and progress tracker
- [ ] 06-02: Onboarding revision and threshold recalibration
- [ ] 06-03: Memory game SRS integration

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Test Safety Net | 2/2 | ✓ Complete | 2026-02-14 |
| 2. Architecture Refactoring | 5/5 | ✓ Complete | 2026-02-15 |
| 3. Word Bank and SRS Foundation | 4/4 | ✓ Complete | 2026-02-15 |
| 4. Challenge Types and Levels | 4/4 | ✓ Complete | 2026-02-15 |
| 5. Adventure Game | 2/2 | ✓ Complete | 2026-02-15 |
| 6. Polish and Integration | 0/3 | Not started | - |
