# Word Adventure

## What This Is

A Hebrew-English bilingual word-learning game with RPG/adventure elements, targeting mixed ages (kids through adults). Players learn 201 English words across 10 themed categories through 6 adaptive challenge types, progress through 12 themed levels with story chapters, explore 5 adventure zones with vocabulary encounters, collect items, evolve pets, and play mini-games. Built as a React PWA with Framer Motion animations, SRS-based spaced repetition, Zustand state management, and offline support.

## Core Value

Players learn English vocabulary through genuinely fun, varied gameplay that feels like an adventure — not a flashcard app.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

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
- ✓ 69 Vitest tests covering SRS, grammar engine, storage, and component snapshots — v1.0
- ✓ Clean architecture: WordAdventure 76 lines, Zustand centralized state, Zod-validated word schema — v1.0
- ✓ Single gender source of truth (userProfile.gender) — v1.0
- ✓ 201-word content bank across 10 themed categories with gender-aware hints — v1.0
- ✓ Web Speech API audio pronunciation on all words — v1.0
- ✓ SRS fixes: learned-only reviews, jitter, session caps (3 new + 7 review) — v1.0
- ✓ 6 challenge types: spelling, MC, reverse MC, listening, sentence building, grammar — v1.0
- ✓ 12 themed levels with adaptive difficulty based on SRS mastery bands — v1.0
- ✓ Adventure mini-game with 5 zones, useAnimationFrame game loop, encounter system — v1.0
- ✓ Word book with category navigation and mastery badges — v1.0
- ✓ Progress tracker showing mastered/total words from SRS data — v1.0
- ✓ Calibrated thresholds for 200-word scale (pet evolution, chapter unlocks) — v1.0
- ✓ Guided first lesson onboarding replacing blocking story intro — v1.0
- ✓ SRS-driven memory game word pool — v1.0

### Active

<!-- Next milestone scope. To be defined by /gsd:new-milestone. -->

(None yet — run `/gsd:new-milestone` to define next scope)

### Out of Scope

- Backend/server — stays fully client-side with localStorage
- User accounts/authentication — single-player offline game
- Real-time multiplayer features
- Mobile native app (stays as PWA)
- TypeScript migration (improvement, not rewrite)
- Monetization/payments

## Context

Shipped v1.0 Improvement milestone with 73 source files, 13,118 LOC JavaScript/JSX.
Tech stack: React 19, Vite 7, Zustand 5, Zod 4, framer-motion 12, Tailwind CSS, Vitest 4.
201 words across 10 categories (animals, food, family, colors, nature, body, actions, home, emotions, professions).
6 challenge types with adaptive difficulty across 4 SRS mastery bands.
5 adventure zones with vocabulary encounters and pet companion.
69 tests passing (unit + snapshot).
Codebase map available at `.planning/codebase/`.

## Constraints

- **Stack**: React 19 + Vite 7 + Tailwind CSS + Framer Motion 12 + Zustand 5 — no framework changes
- **Client-only**: No backend, no database — localStorage and static data only
- **Language**: Hebrew UI, English learning content — must maintain RTL support
- **PWA**: Must remain installable and offline-capable
- **Audience**: Mixed ages — word difficulty must scale from young kids to adults

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 200+ words across 10+ levels | Current 13 words is unplayable after one session | ✓ 201 words, 12 levels, 10 categories |
| Themed word categories | Organized learning is more effective than random words | ✓ 10 categories matching adventure zones |
| Adventure game redesign for pet walking | Current version is boring, repetitive, and visually weak | ✓ 5-zone adventure with encounters, pet companion |
| Full improvement (bugs + polish + content) | Game needs holistic improvement, not just content | ✓ Architecture + content + features + polish |
| Keep client-side only | No need for backend complexity for a vocabulary game | ✓ Zustand + localStorage works well |
| Zustand over Context API | Centralized state with persist middleware replaces scattered localStorage | ✓ Clean, debounced persistence |
| Zod word schema validation | Fail-fast at import time catches missing fields before runtime | ✓ 13 required fields per word |
| useAnimationFrame (framer-motion) | Automatic cleanup on unmount prevents memory leaks | ✓ No requestAnimationFrame leaks |
| Refs + CSS transforms for game loop | Avoids 30 setState calls/second in adventure rendering | ✓ Smooth scrolling without re-renders |
| SM-2 SRS with jitter | Prevents review clustering while maintaining spaced repetition | ✓ Reviews spread naturally |
| Challenge interface contract | Uniform `{ word, onAnswer, disabled, playerGender, t }` props | ✓ 6 challenge types dispatch cleanly |
| Adaptive difficulty via mastery bands | New words get easy challenges, mastered words get hard ones | ✓ 4 bands map SRS repetition to challenge type pools |

---
*Last updated: 2026-02-15 after v1.0 milestone*
