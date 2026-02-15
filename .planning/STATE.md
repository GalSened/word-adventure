# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-14)

**Core value:** Players learn English vocabulary through genuinely fun, varied gameplay that feels like an adventure — not a flashcard app.
**Current focus:** Phase 6 — Polish and Integration

## Current Position

Phase: 6 of 6 (Polish and Integration)
Plan: 2 of 3 in current phase (IN PROGRESS)
Status: Executing — Plan 06-02 complete
Last activity: 2026-02-15 — Completed 06-02 (Progression Recalibration and Onboarding)

Progress: [██████████] 96%

## Performance Metrics

**Velocity:**
- Total plans completed: 22
- Average duration: 4 min
- Total execution time: 1.30 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-test-safety-net | 2 | 7 min | 3.5 min |
| 02-architecture-refactoring | 5 | 16 min | 3.2 min |
| 03-word-bank-and-srs-foundation | 4 | 18 min | 4.5 min |
| 04-challenge-types-and-levels | 4 | 12 min | 3.0 min |
| 05-adventure-game | 2 | 7 min | 3.5 min |
| 06-polish-and-integration | 2 | 6 min | 3.0 min |

**Recent Trend:**
- Last 5 plans: 04-04 (6 min), 05-01 (3 min), 05-02 (4 min), 06-01 (2 min), 06-02 (4 min)
- Trend: Stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: CONT-10 (nanoid) placed in Phase 2 with architecture work since it is an infrastructure concern
- [Roadmap]: SRS algorithm fixes (PROG-01 through PROG-04) placed in Phase 3 alongside content since they are verified together at 200-word scale
- [Roadmap]: Polish items (CONT-07, PROG-05 through PROG-09) collected into Phase 6 as independently shippable enhancements
- [01-01]: Used vi.useFakeTimers with vi.setSystemTime for deterministic SRS date tests
- [01-01]: Used spy.mockRestore() for localStorage mocks to prevent cross-test leakage in happy-dom
- [01-01]: Used mockReturnValueOnce sequences for deterministic grammar engine template testing
- [01-02]: Used Proxy-based vi.mock for framer-motion to strip all animation props and render plain HTML elements
- [01-02]: Pre-seeded storyProgress with seenIntros for all chapters to suppress StoryDialogue overlays during tests
- [01-02]: Mocked STORE_ITEMS as empty object since snapshot tests focus on game state rendering
- [01-02]: Used DOM button querying with fireEvent.click for LetterPicker interaction in snapshot tests
- [02-01]: Debounced localStorage writes at 300ms to prevent serialization per keystroke
- [02-01]: Legacy keys NOT deleted during migration -- old code still reads them until 02-02 rewires hooks
- [02-01]: Story slice kept minimal (hasSeenStoryIntro + storyPath only) -- complex story logic stays in hook
- [02-01]: Ephemeral game state excluded from persist via partialize
- [02-02]: Hooks use useGameStore(selector) directly rather than useGame() context for provider-independent usage
- [02-02]: Composite actions use useGameStore.getState() for multi-step mutations to avoid stale closures
- [02-02]: useStoryProgress intentionally unchanged -- 472 lines of complex dialogue/pet/choice logic stays in hook
- [02-02]: useItemEffects keeps inventory parameter for backward compatibility
- [02-04]: All 10 word fields required (no optional) to enforce data completeness for Phase 3 content expansion
- [02-04]: Validation runs at module import time (fail-fast) rather than lazily at runtime
- [02-04]: Hebrew grammatical gender uses 'm', 'f', 'n' enum values matching grammarEngine convention
- [02-03]: Game logic extracted into useGameLogic hook -- WordAdventure at 106 lines (not 80) due to 20 irreducible useState declarations
- [02-03]: ScreenRouter uses switch/case with explicit prop mapping per screen for visibility
- [02-03]: New screen components use prop drilling (not useGame context) to preserve snapshot test compatibility
- [02-03]: PetWalkingGame gender simplified to userProfile.gender only -- avatar emoji inference removed (ARCH-06)
- [02-05]: Store setUserInput supports function updaters for LetterPicker backward compat
- [02-05]: Tests reset Zustand in-memory state via setState() (not replace mode) to preserve action functions
- [02-05]: Daily reset useEffect kept in WordAdventure as single remaining side effect on mount
- [02-05]: showStoryIntro derived from !hasSeenStoryIntro via store field rather than separate useState
- [03-01]: Category enum locked to 10 values (animals, food, family, colors, nature, body, actions, home, emotions, professions)
- [03-01]: exampleSentence_he is required (not optional) to enforce bilingual completeness
- [03-01]: hint_m/hint_f only added where hint directly addresses player with gendered Hebrew (~10% of words)
- [03-01]: Original 13 words preserved with updated categories (objects -> home) and new required fields
- [03-03]: Base interval stays un-jittered for SM-2 algorithm continuity; only nextReviewDate uses jittered value
- [03-03]: Low-rep threshold set to repetition < 3 for new-slot eligibility in review sessions
- [03-03]: getDueWords kept exported for potential direct use, though useGameLogic now uses buildReviewSession
- [03-02]: Speech rate 0.8x for child-friendly pronunciation speed
- [03-02]: Speaker icon hidden (not disabled) when SpeechSynthesis unavailable
- [03-02]: Gender hint fallback chain: hint_m (boys) -> hint_f (girls) -> hint (neutral default)
- [03-02]: playerGender defaults to 'boy' when userProfile.gender is undefined
- [03-04]: Only animals, family, professions categories used as grammar engine noun sources (sentence-suitable subjects)
- [03-04]: Adjectives/verbs/objects remain hardcoded in grammar engine (require he_m/he_f forms not in word schema)
- [03-04]: ENCOURAGEMENT messages prefer gender-neutral rewrites; { boy, girl } only when genuinely unavoidable
- [03-04]: getNPCDialogue defaults to 'boy' gender for backward compatibility with existing callers
- [04-01]: Challenge components use shared props interface { word, onAnswer, disabled, playerGender, t } for uniform dispatch
- [04-01]: Distractor generator returns full word objects (not strings) so caller decides which field to display
- [04-01]: Each challenge type uses distinct gradient color for visual differentiation (blue/green/purple)
- [04-02]: GrammarChallenge generates distractors via grammarEngine.generateChallenge() (not word bank) since grammar sentences are procedural
- [04-02]: SpellingChallenge receives extended props (scrambledContent, userInput, setUserInput, onCheck) beyond standard challenge interface
- [04-02]: Reorder items use {id, text} objects with unique IDs to handle duplicate words in sentences
- [04-03]: Snapshot tests mock selectChallengeType to 'spelling' for deterministic LetterPicker-based test flow
- [04-03]: ChallengeDispatcher default fallback changed from MultipleChoice to Spelling for behavior preservation
- [04-03]: recentChallengeTypes tracked as useRef (last 3) to prevent repetitive challenge sequences
- [04-03]: Voice input removed from PlayingScreen (can be re-added per-challenge in Phase 6)
- [04-04]: Level difficulty fallback: when primary band has too few words, adjacent difficulties tried (easy->medium, medium->easy/hard, etc.)
- [04-04]: Grammar injection uses GRAMMAR_INJECTION_INTERVAL=4 constant (every 4th vocab word triggers grammar challenge)
- [04-04]: completedLevels stored as persisted array in gameStore user slice, separate from story progress
- [04-04]: Legacy difficulty strings (master/easy/medium/hard/expert) kept as fallback in startLevel for backward compatibility
- [04-04]: LEVEL_CHAPTERS added alongside existing CHAPTERS (not replacing) for backward compatibility
- [05-01]: Encounters auto-resolve in Plan 01 (no EncounterOverlay yet) -- approach/encounter/resolve cycle simulated with timeouts
- [05-01]: Zone progress uses ref-based tracking with throttled setState (integer-only updates, max 100 re-renders per zone)
- [05-01]: Timeout tracking via timeoutsRef for proper cleanup on unmount alongside useAnimationFrame auto-cleanup
- [05-01]: Pet behavior derived from game phase via pure function (not state)
- [05-02]: EncounterOverlay manages own userInput/scrambledContent state to isolate encounter from main game
- [05-02]: SRS updates in AdventureGame directly (not via useGameLogic.processAnswer) to avoid advancing main word index
- [05-02]: Default pet { name: Buddy, icon: dog } provided when no activePet for store-free adventure access
- [05-02]: World Map emoji changed from map to globe to differentiate from Adventure button
- [06-01]: Progress tracker uses SRS userProgress (repetition >= 6 = mastered) as single source of truth, not totalWordsLearned counter
- [06-01]: Mastery band thresholds recreated locally in WordBookScreen (getMasteryBand not exported from challengeSelector)
- [06-01]: framer-motion AnimatePresence used only on category container transitions, not individual cards (performance)
- [06-02]: Onboarding completes on first level finish (not step-based mid-level tracking) for simplicity and reliability
- [06-02]: StoryIntro.jsx file preserved for potential reuse; only removed from render
- [06-02]: StoryPathChoice deferred to after hasCompletedOnboarding instead of hasSeenStoryIntro

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-15
Stopped at: Completed 06-02-PLAN.md (Progression Recalibration and Onboarding)
Resume file: None
