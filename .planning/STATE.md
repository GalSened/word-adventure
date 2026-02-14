# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-14)

**Core value:** Players learn English vocabulary through genuinely fun, varied gameplay that feels like an adventure — not a flashcard app.
**Current focus:** Phase 2 — Architecture Refactoring

## Current Position

Phase: 2 of 6 (Architecture Refactoring)
Plan: 4 of 4 in current phase
Status: Executing
Last activity: 2026-02-14 — Completed 02-04 (Word schema and data enrichment)

Progress: [████░░░░░░] 36%

## Performance Metrics

**Velocity:**
- Total plans completed: 4
- Average duration: 3 min
- Total execution time: 0.18 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-test-safety-net | 2 | 7 min | 3.5 min |
| 02-architecture-refactoring | 2 | 4 min | 2 min |

**Recent Trend:**
- Last 5 plans: 01-01 (3 min), 01-02 (4 min), 02-01 (2 min), 02-04 (2 min)
- Trend: Accelerating

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
- [02-04]: All 10 word fields required (no optional) to enforce data completeness for Phase 3 content expansion
- [02-04]: Validation runs at module import time (fail-fast) rather than lazily at runtime
- [02-04]: Hebrew grammatical gender uses 'm', 'f', 'n' enum values matching grammarEngine convention

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-14
Stopped at: Completed 02-04-PLAN.md (Word schema and data enrichment)
Resume file: None
