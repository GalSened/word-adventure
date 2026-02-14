# Word Adventure — Improvement Milestone

## What This Is

A Hebrew-English bilingual word-learning game with RPG/adventure elements, targeting mixed ages (kids through adults). Players translate words, progress through story chapters, collect items, evolve pets, and play mini-games. Built as a React PWA with Framer Motion animations, SRS-based learning, and offline support.

## Core Value

Players learn English vocabulary through genuinely fun, varied gameplay that feels like an adventure — not a flashcard app.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. Inferred from existing codebase. -->

- ✓ Basic word translation gameplay (spell English word from Hebrew prompt) — existing
- ✓ Avatar selection with gender-aware dialogue — existing
- ✓ 4 difficulty levels (Easy, Medium, Hard, Expert) with word bank — existing
- ✓ Master level with procedural grammar engine — existing
- ✓ Spaced Repetition System (SRS/SM-2) for review mode — existing
- ✓ Story progression with 6 chapters, NPC dialogue, and branching choices — existing
- ✓ Pet system with evolution tiers — existing
- ✓ Shop/inventory system with 20+ items, effects, and daily deals — existing
- ✓ Daily quests and streak tracking — existing
- ✓ High score leaderboard — existing
- ✓ Memory match mini-game — existing
- ✓ Pet walking mini-game (basic version) — existing
- ✓ PWA with offline support and mobile haptics — existing
- ✓ Hebrew RTL UI with gender-aware conjugations — existing
- ✓ ErrorBoundary and safe localStorage persistence — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] Expand word bank to 200+ words with Hebrew translations and hints
- [ ] Organize words into themed categories (Animals, Colors, Food, Family, Body, Clothes, School, Sports, Hobbies, Days/Months, Weather, Nature, Transportation, Home, Emotions, Professions, Verbs, Adjectives, etc.)
- [ ] Create 10+ progressive difficulty levels with gradual complexity
- [ ] Each level has visually distinct theme (unique backgrounds, colors, atmosphere)
- [ ] Multiple challenge mechanics beyond spelling (matching, fill-in-blank, listening, sentence building, etc.)
- [ ] Levels feel like a journey with story continuity between them
- [ ] Enough words per level that they don't complete instantly
- [ ] Redesign pet walking game as adventure game (explore areas, find items, solve word puzzles)
- [ ] Adventure game has multiple distinct areas/environments to explore
- [ ] Adventure game has varied encounter types (not just multiple choice)
- [ ] Improve adventure game visuals beyond basic emoji sprites
- [ ] Fix PetWalkingGame memory leak (requestAnimationFrame not cleaned up)
- [ ] Fix voice recognition error handling (silent failures)
- [ ] Fix gender source-of-truth inconsistency
- [ ] Improve animation polish and feedback across the app
- [ ] Clean up WordAdventure.jsx mega-component (627 lines → smaller modules)

### Out of Scope

<!-- Explicit boundaries. -->

- Backend/server — stays fully client-side with localStorage
- User accounts/authentication — single-player offline game
- Real-time multiplayer features
- Mobile native app (stays as PWA)
- TypeScript migration (improvement, not rewrite)
- Monetization/payments

## Context

- Existing codebase has strong foundations: SRS algorithm, grammar engine, story system, shop — but is starved for content
- Only 13 words in the entire static word bank — critically small
- PetWalkingGame has only 8 encounter words and a known memory leak
- WordAdventure.jsx is a 627-line mega-component that needs refactoring
- Game targets Hebrew-speaking audience learning English
- All text/UI is Hebrew (RTL), learning content is English with Hebrew hints
- No test infrastructure exists (zero tests)
- Codebase map available at `.planning/codebase/`

## Constraints

- **Stack**: React 19 + Vite + Tailwind CSS + Framer Motion — no framework changes
- **Client-only**: No backend, no database — localStorage and static data only
- **Language**: Hebrew UI, English learning content — must maintain RTL support
- **PWA**: Must remain installable and offline-capable
- **Audience**: Mixed ages — word difficulty must scale from young kids to adults

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 200+ words across 10+ levels | Current 13 words is unplayable after one session | — Pending |
| Themed word categories | Organized learning is more effective than random words | — Pending |
| Adventure game redesign for pet walking | Current version is boring, repetitive, and visually weak | — Pending |
| Full improvement (bugs + polish + content) | Game needs holistic improvement, not just content | — Pending |
| Keep client-side only | No need for backend complexity for a vocabulary game | — Pending |

---
*Last updated: 2026-02-14 after initialization*
