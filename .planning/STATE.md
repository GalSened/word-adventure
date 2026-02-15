# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-14)

**Core value:** Players learn English vocabulary through genuinely fun, varied gameplay that feels like an adventure — not a flashcard app.
**Current focus:** Phase 2 — Architecture Refactoring

## Current Position

Phase: 2 of 6 (Architecture Refactoring)
Plan: 5 of 5 in current phase (all complete)
Status: Phase Complete
Last activity: 2026-02-15 — Completed 02-05 (Zustand store wiring gap closure)

Progress: [█████░░░░░] 47%

## Performance Metrics

**Velocity:**
- Total plans completed: 7
- Average duration: 3 min
- Total execution time: 0.38 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-test-safety-net | 2 | 7 min | 3.5 min |
| 02-architecture-refactoring | 5 | 16 min | 3.2 min |

**Recent Trend:**
- Last 5 plans: 02-01 (2 min), 02-02 (2 min), 02-04 (2 min), 02-03 (4 min), 02-05 (6 min)
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

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-15
Stopped at: Completed 02-05-PLAN.md (Zustand store wiring gap closure) -- Phase 2 all 5 plans complete
Resume file: None
