# Requirements: Word Adventure — Improvement Milestone

**Defined:** 2026-02-14
**Core Value:** Players learn English vocabulary through genuinely fun, varied gameplay that feels like an adventure — not a flashcard app.

## v1 Requirements

Requirements for the improvement milestone. Each maps to roadmap phases.

### Testing & Safety Net

- [ ] **TEST-01**: Vitest configured with happy-dom and @testing-library/react for the Vite 7 project
- [ ] **TEST-02**: SRS algorithm (srs.js) has unit tests covering interval calculation, ease factor adjustment, and quality score mapping
- [ ] **TEST-03**: Grammar engine (grammarEngine.js) has unit tests covering sentence generation, gender agreement, and verb conjugation
- [ ] **TEST-04**: Storage utilities (storage.js) have unit tests covering safeGetJSON, safeSetJSON, and error fallback behavior
- [ ] **TEST-05**: WordAdventure component has snapshot tests for each gameState value (start, welcome, map, playing, levelComplete, gameOver)

### Architecture & Refactoring

- [ ] **ARCH-01**: WordAdventure.jsx decomposed from 627 lines to a thin orchestrator (~50 lines) delegating to screen components
- [ ] **ARCH-02**: ScreenRouter component renders correct screen based on gameState value
- [ ] **ARCH-03**: GameContext provider composes existing hooks (useGameState, useUserProgress, useStoryProgress, useDailyStats, useItemEffects)
- [ ] **ARCH-04**: Centralized state management via Zustand with persist middleware replaces scattered localStorage calls
- [ ] **ARCH-05**: Duplicated initialWordData in WordAdventure.jsx eliminated — single import from src/data/words.js
- [ ] **ARCH-06**: Single gender source of truth via userProfile.gender — PetWalkingGame no longer infers gender from avatar emoji
- [ ] **ARCH-07**: Challenge Interface Contract defined — every challenge component implements { challenge, onResult, disabled } props
- [ ] **ARCH-08**: Debounced localStorage/Zustand writes prevent serialization-per-keystroke at scale
- [ ] **ARCH-09**: Unified word data schema validated by Zod with fields: id, word, hebrew, hint, category, emoji, level, type, gender, exampleSentence

### Word Bank & Content

- [ ] **CONT-01**: Word bank expanded to 200+ words with English words, Hebrew translations, and quality hints
- [ ] **CONT-02**: Words organized into 8-10 themed categories (Animals, Food, Family, Colors, Nature, Body, Actions, Home/School, Emotions, Professions)
- [ ] **CONT-03**: Each word entry includes Hebrew grammatical gender (m/f) for correct conjugation
- [ ] **CONT-04**: Gender-aware hints — gender-neutral where possible, hint_m/hint_f variants where Hebrew grammar requires it
- [ ] **CONT-05**: Audio pronunciation for English words via Web Speech API SpeechSynthesis
- [ ] **CONT-06**: Bilingual contextual example sentences per word (English sentence + Hebrew translation)
- [ ] **CONT-07**: Word book / dictionary UI where player can browse and review all learned words
- [ ] **CONT-08**: Grammar engine VOCAB synchronized with main word bank — sentences use words from the unified data source
- [ ] **CONT-09**: All ENCOURAGEMENT messages and NPC dialogues audited for gender variants or gender-neutral forms
- [ ] **CONT-10**: nanoid replaces Date.now() + Math.random() for word ID generation

### Challenge Types & Levels

- [ ] **CHAL-01**: Spelling challenge (existing) integrated into Challenge Interface Contract
- [ ] **CHAL-02**: Multiple choice challenge — show Hebrew word, pick correct English from 4 options
- [ ] **CHAL-03**: Reverse multiple choice — show English word, pick correct Hebrew from 4 options
- [ ] **CHAL-04**: Listening challenge — hear English pronunciation, select correct word from options
- [ ] **CHAL-05**: Sentence building challenge — drag-and-drop words to form correct English sentence using @dnd-kit
- [ ] **CHAL-06**: Hebrew grammar challenges at lower difficulty levels leveraging grammarEngine.js (unique differentiator)
- [ ] **CHAL-07**: Adaptive difficulty selects challenge type based on word's SRS mastery level (new words get easier challenges, mastered words get harder ones)
- [ ] **CHAL-08**: 10+ progressive levels across themed zones with gradual complexity increase
- [ ] **CHAL-09**: Each level has visually distinct theme (unique background colors, atmospheric styling, themed decorations)
- [ ] **CHAL-10**: Levels feel like a journey with story continuity and enough words per level that they don't complete instantly

### Adventure Mini-Game

- [ ] **ADVN-01**: PetWalkingGame memory leak fixed — requestAnimationFrame properly cleaned up on unmount
- [ ] **ADVN-02**: New AdventureGame component built separately from PetWalkingGame (clean architecture, easy rollback)
- [ ] **ADVN-03**: 3-5 themed encounter zones with distinct visual environments (forest, beach, city, mountain, space)
- [ ] **ADVN-04**: Each zone draws vocabulary from corresponding word category (forest → Nature words, city → Professions words, etc.)
- [ ] **ADVN-05**: Varied encounter types reusing challenge components from CHAL-01 through CHAL-05
- [ ] **ADVN-06**: Improved visuals beyond emoji sprites — themed CSS backgrounds with better character representations
- [ ] **ADVN-07**: Pet abilities integrated with encounters (pet hints at correct answer, pet finds bonus items)
- [ ] **ADVN-08**: Visual cues before encounters (pet sniffing, rustling bushes) so encounters feel like discoveries, not interruptions

### Progression & SRS

- [ ] **PROG-01**: SRS distinguishes "learned" (played at least once) from "unseen" words — review mode only surfaces learned words
- [ ] **PROG-02**: Review sessions capped at max 3 new words + 7 review words per session
- [ ] **PROG-03**: Jitter added to nextReviewDate (+/- 10% of interval) to prevent review clustering
- [ ] **PROG-04**: Due words sorted by priority: overdue first, then new words
- [ ] **PROG-05**: Story chapter unlock thresholds recalibrated for 200-word scale (not all unlocked after 20 words)
- [ ] **PROG-06**: Pet evolution thresholds recalibrated proportionally for 200-word scale
- [ ] **PROG-07**: Total progress tracker visible on start screen ("42/200 words mastered")
- [ ] **PROG-08**: Onboarding revised — guided first lesson instead of multi-step story intro
- [ ] **PROG-09**: Memory match mini-game rotates word pool based on recently learned words / SRS data

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Content Expansion

- **V2-CONT-01**: Cultural/holiday content packs (Hanukkah, Passover vocabulary)
- **V2-CONT-02**: Parent/teacher dashboard showing learning progress
- **V2-CONT-03**: Pre-recorded Hebrew audio pronunciation (fallback for poor TTS quality)

### Gameplay

- **V2-GAME-01**: Additional mini-games beyond core set
- **V2-GAME-02**: Competitive weekly challenges between players
- **V2-GAME-03**: Lottie animations for celebration sequences

### Infrastructure

- **V2-INFR-01**: Dexie.js (IndexedDB) migration when word count exceeds 500+
- **V2-INFR-02**: Export/import progress data for backup

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Backend / server | Stays fully client-side with localStorage — no infrastructure cost needed for a vocabulary game |
| User accounts / authentication | Single-player offline game — no need for accounts |
| Real-time multiplayer | Infrastructure cost dwarfs educational value for a vocabulary game |
| Mobile native app | Stays as PWA — sufficient for the use case |
| TypeScript migration | Improvement milestone, not a rewrite — too disruptive during feature expansion |
| Monetization / payments | Out of scope for this milestone |
| AI-generated content | LLM costs, Hebrew grammar errors, backend dependency — all problems |
| User-created word lists | Quality control nightmare with Hebrew vowelization and gender agreement |
| Timed challenges | Research shows time pressure reduces retention in children |
| Social features / chat | COPPA compliance far outside scope |
| i18next integration | App is Hebrew-first, not multilingual — current t() helper is sufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| — | — | — |

**Coverage:**
- v1 requirements: 43 total
- Mapped to phases: 0
- Unmapped: 43 ⚠️

---
*Requirements defined: 2026-02-14*
*Last updated: 2026-02-14 after initial definition*
