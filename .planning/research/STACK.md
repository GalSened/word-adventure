# Stack Research

**Domain:** Hebrew-English vocabulary learning game with adventure/RPG elements (React PWA)
**Researched:** 2026-02-14
**Confidence:** MEDIUM-HIGH

> **Scope:** Additional libraries only. The existing stack (React 19, Vite 7, Tailwind CSS 3.4, Framer Motion 12, canvas-confetti, Lucide React, vite-plugin-pwa) is not re-evaluated here.

## Recommended Stack

### Core Technologies (New Additions)

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Zustand | ^5.0.11 | Global state management | The app currently uses scattered localStorage calls and prop drilling. Scaling to 200+ words, 10+ levels, inventory, quests, and pet state requires centralized state. Zustand is 1.2kb, has zero boilerplate, built-in `persist` middleware (replaces custom `safeGetJSON`/`safeSetJSON`), and `immer` middleware for nested game state updates. The existing `useGameState`, `useUserProgress`, `useDailyStats`, and `useItemEffects` hooks can be consolidated into 2-3 Zustand stores. Works with React 19 out of the box. | HIGH |
| Immer | ^11.1.4 | Immutable state updates | Game state has deeply nested objects (word SRS data, inventory items, level progression, pet stats). Writing spread-operator chains for nested updates is error-prone. Immer's `produce()` + Zustand's immer middleware lets you write `state.player.inventory.push(item)` instead of immutable spread chains. Required by zustand/middleware/immer. | HIGH |
| Dexie.js | ^4.3.0 | IndexedDB wrapper for vocabulary storage | localStorage caps at 5-10MB. With 200+ words, SRS history, level progress, achievements, and story state, you will hit limits. Dexie wraps IndexedDB (1GB+ quota) with a clean API, supports schema versioning for data migrations, and has `liveQuery()` for reactive data binding in React components. Critical for PWA offline-first reliability. | HIGH |

### Supporting Libraries

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| @dnd-kit/core | ^6.3.1 | Drag-and-drop interactions | Sentence-building challenges (drag words into order), matching exercises (drag Hebrew to English), inventory management. The modern replacement for deprecated react-beautiful-dnd. Lightweight (~10kb), accessible, supports sortable lists, grids, and free-form dragging. | HIGH |
| @dnd-kit/sortable | ^10.0.0 | Sortable list presets for dnd-kit | Sentence word-ordering challenges specifically. Provides ready-made sortable containers that reduce boilerplate for the most common drag-drop pattern in language games. | HIGH |
| @dnd-kit/utilities | ^3.2.2 | Helper utilities for dnd-kit | CSS transform utilities and sensors. Install alongside core and sortable. | HIGH |
| use-sound | ^5.0.0 | React hook for sound effects | Correct/incorrect answer feedback, level-up celebrations, adventure encounter sounds, UI interaction sounds. Wraps Howler.js with a React-native API. Supports sprites (multiple sounds from one file), volume control, and playback rate. Adds ~1kb + async 10kb Howler load. | HIGH |
| nanoid | ^5.1.6 | Unique ID generation | Generating stable IDs for dynamically created vocabulary entries, procedural grammar challenges, and game events. The existing `Date.now() + Math.random()` pattern in `grammarEngine.js` is collision-prone. Nanoid is 118 bytes, cryptographically secure, and URL-friendly. | HIGH |
| Zod | ^4.3.6 | Schema validation | Validating word data schemas (200+ entries need structure enforcement), validating save game data on load (detect corruption), validating level configuration. 2kb gzipped. Zod 4 includes locales API useful for Hebrew error messages. Project is JSX not TypeScript, but Zod's runtime validation is still valuable for data integrity at scale. | MEDIUM |

### Development Tools

| Tool | Version | Purpose | Notes | Confidence |
|------|---------|---------|-------|------------|
| Vitest | ^4.0.18 | Unit and component testing | Native Vite integration (zero extra config), same transform pipeline as dev server. The project has zero tests currently. Essential before scaling to 200+ words and 10+ levels to catch SRS algorithm regressions and data migration bugs. | HIGH |
| @testing-library/react | ^16.3.0 | React component testing | Test game interactions (card flips, drag-drop, answer submission) from user perspective. Works with React 19. | HIGH |
| @testing-library/jest-dom | ^6.6.3 | DOM assertion matchers | `toBeVisible()`, `toHaveTextContent()`, `toBeDisabled()` for game UI assertions. | HIGH |
| happy-dom | ^20.5.3 | Fast DOM environment for Vitest | 2-3x faster than jsdom for test execution. Sufficient for this app's DOM needs (no complex browser APIs beyond Web Speech, which is mocked anyway). | MEDIUM |

### Considered But Deferred

| Library | Version | Purpose | Why Deferred | Confidence |
|---------|---------|---------|--------------|------------|
| @lottiefiles/dotlottie-react | ^0.17.15 | Vector animations for level themes | Would enable designer-quality themed animations per level (enchanted forest, wizard tower, etc). Deferred because: (1) requires After Effects animation assets to be created first, (2) adds WebAssembly runtime complexity, (3) Framer Motion + CSS can handle initial level visuals. Revisit after core game loop is stable. | MEDIUM |
| XState | ^5.x | State machine for game flow | Would formalize level transitions, quest state, and adventure encounters as explicit state machines. Deferred because: (1) significant learning curve, (2) Zustand handles the current complexity, (3) can be introduced later if game flow becomes hard to reason about. | LOW |

## Installation

```bash
# Core state & storage
npm install zustand immer dexie

# Game interaction libraries
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities use-sound

# Utility libraries
npm install nanoid zod

# Dev dependencies - testing
npm install -D vitest @testing-library/react @testing-library/jest-dom happy-dom
```

## Alternatives Considered

| Recommended | Alternative | Why Not Alternative |
|-------------|-------------|---------------------|
| Zustand | Redux Toolkit | Overkill for a client-side game. Redux adds ~10kb + boilerplate (slices, reducers, middleware config). Zustand achieves the same with 1.2kb and zero boilerplate. No actions/dispatchers pattern needed. |
| Zustand | Jotai | Jotai's atomic model is better for forms and independent state atoms. Game state is interconnected (scoring affects levels affects inventory affects pet). Zustand's single-store model fits better. |
| Zustand | React Context + useReducer | Performance degrades with frequent updates (every answer, every animation tick). Context re-renders all consumers. Zustand uses selector-based subscriptions for surgical re-renders. |
| Dexie.js | localForage | localForage is simpler but lacks schema versioning, compound indexes, and reactive queries. When vocabulary grows to 200+ words with SRS metadata, you need proper querying (words due for review, words by category, words by mastery level). |
| Dexie.js | RxDB | RxDB is designed for sync-capable apps with backends. This is a fully client-side PWA. RxDB adds unnecessary complexity and bundle size (~50kb vs Dexie's ~20kb). |
| @dnd-kit | @hello-pangea/dnd | hello-pangea/dnd (react-beautiful-dnd fork) only handles sortable lists. dnd-kit supports grids, free-form drag, and custom collision detection needed for matching exercises and sentence building. |
| @dnd-kit | HTML5 Drag API | Native drag-and-drop has poor mobile support, no touch handling, and no animation primitives. A language learning game for kids needs smooth, touch-friendly interactions. |
| use-sound | howler.js directly | use-sound wraps Howler with React hooks, handling lifecycle (pause on unmount, play on mount). Using Howler directly means manual cleanup in useEffect, which is error-prone across 10+ game screens. |
| Vitest | Jest | Jest requires separate Babel/transform config, doesn't share Vite's pipeline, and is slower for Vite projects. Vitest 4 is the natural choice for Vite 7 projects. |
| Zod | Yup / Joi | Zod 4 is smaller (2kb), has better TypeScript inference (useful if project migrates to TS later), and the locales API supports Hebrew. Yup and Joi are larger and designed for form validation, not data schema validation. |
| happy-dom | jsdom | happy-dom is 2-3x faster for test runs. This game doesn't need jsdom's more complete browser simulation. If specific tests need full DOM compliance, annotate those files with `@vitest-environment jsdom`. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| react-beautiful-dnd | Deprecated by Atlassian (Aug 2025), archived repo, no React 19 support, no maintenance. | @dnd-kit/core ^6.3.1 |
| Redux / Redux Toolkit | Massive overhead for a client-side game with no API calls. Actions/reducers/middleware pattern is designed for complex async flows, not local game state. | Zustand ^5.0.11 |
| Firebase / Supabase | Adding a backend changes the entire architecture. The project requirement is "no backend, fully client-side." These add auth complexity, cost, and latency. | Dexie.js ^4.3.0 (IndexedDB) |
| Anime.js | Overlaps with Framer Motion already in the project. Adding a second animation library creates inconsistency and bundle bloat. | Framer Motion (already installed) |
| react-spring | Same problem as Anime.js. Framer Motion is already handling animations well. Switching mid-project creates inconsistency. If physics-based animations are needed, Framer Motion's spring configs cover it. | Framer Motion (already installed) |
| Moment.js / date-fns | Unnecessary. The only date logic is SRS `nextReviewDate` timestamps. `Date.now()` arithmetic is sufficient. Don't add a date library for one calculation. | Native Date.now() (already used) |
| i18next | The app is Hebrew-first with English vocabulary words. It's not a multilingual app needing runtime locale switching. Hard-coding Hebrew UI strings is appropriate. | Hard-coded Hebrew strings |
| TypeScript migration now | Converting 40+ JSX files to TypeScript during a feature expansion is a recipe for stalled progress. Zod provides runtime validation where it matters (data schemas). TypeScript can be adopted incrementally later. | Zod for data validation, JSDoc for type hints |

## Stack Patterns by Variant

**If game complexity grows beyond 15 levels / 500+ words:**
- Add IndexedDB indexes on `category`, `level`, `masteryScore` for efficient querying
- Consider splitting Zustand into domain stores: `useGameStore`, `useProgressStore`, `useAdventureStore`
- Dexie's `liveQuery()` becomes essential to avoid loading entire vocabulary into memory

**If audio becomes important (background music, ambient sounds):**
- Graduate from use-sound to Howler.js directly for background music (use-sound is designed for short SFX)
- Use Howler's sprite feature to pack multiple sound effects into a single audio file
- Add a global `useAudioStore` in Zustand to manage mute/volume state across app

**If multiplayer/leaderboards are added later:**
- Dexie Cloud (commercial add-on) can sync IndexedDB to a server without rewriting storage layer
- Zustand stores remain unchanged; sync happens at the persistence layer

**If TypeScript is adopted later:**
- Zustand 5 has first-class TypeScript support
- Dexie 4 supports typed table definitions
- Zod schemas can generate TypeScript types with `z.infer<>`
- Incremental migration: rename `.jsx` to `.tsx` one file at a time

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| zustand@^5.0.11 | react@^19.2.0 | Zustand 5 requires React 18+ (uses useSyncExternalStore). React 19 fully supported. |
| zustand@^5.0.11 | immer@^11.1.4 | zustand/middleware/immer requires immer as peer dependency. |
| dexie@^4.3.0 | All modern browsers | No React dependency. Works with any framework or vanilla JS. PWA Service Worker compatible. |
| @dnd-kit/core@^6.3.1 | react@^19.2.0 | Uses React 16.8+ hooks. Tested with React 19. |
| @dnd-kit/sortable@^10.0.0 | @dnd-kit/core@^6.3.1 | Must install core as peer dependency alongside sortable. |
| use-sound@^5.0.0 | react@^19.2.0 | Built on howler@^2.2.4 (loaded async). Requires @types/howler for TypeScript projects (not needed for JSX). |
| vitest@^4.0.18 | vite@^7.2.4 | Vitest 4 supports Vite 7. Same config resolution and transform pipeline. |
| @testing-library/react@^16.3.0 | react@^19.2.0 | RTL 16 added React 19 support. Also requires @testing-library/dom as peer dependency. |
| zod@^4.3.6 | N/A | Zero dependencies. Framework-agnostic. |
| nanoid@^5.1.6 | N/A | Zero dependencies. ESM-only (compatible with Vite's ESM-first approach). |

## Migration Path from Current Stack

The existing custom utilities map cleanly to the new libraries:

| Current | Replacement | Migration Notes |
|---------|-------------|-----------------|
| `src/utils/storage.js` (safeGetJSON/safeSetJSON) | Zustand persist middleware | Create stores with `persist()`, remove manual localStorage calls one hook at a time |
| `localStorage` for all data | Dexie.js for vocabulary + SRS data | Keep Zustand persist on localStorage for small UI state (settings, avatar). Move large data (words, SRS history, achievements) to Dexie. |
| `src/utils/srs.js` (SM-2) | Same algorithm, Dexie-backed | SRS logic stays. Storage moves from in-memory arrays to Dexie queries (`db.words.where('nextReviewDate').below(Date.now())`) |
| `Date.now() + Math.random()` IDs | nanoid() | Replace in grammarEngine.js and any future generators |
| Manual prop drilling | Zustand stores | GameHeader, Inventory, Store, DailyQuests stop receiving props and read from stores directly |
| No tests | Vitest + RTL | Add tests alongside new features. Prioritize SRS algorithm tests and data migration tests. |

## Sources

- [Zustand npm](https://www.npmjs.com/package/zustand) -- version 5.0.11 confirmed (HIGH confidence)
- [Zustand GitHub/Context7 /pmndrs/zustand](https://github.com/pmndrs/zustand) -- persist middleware API verified (HIGH confidence)
- [Dexie.js official site](https://dexie.org/) -- version 4.3.0, IndexedDB wrapper API verified via Context7 (HIGH confidence)
- [Dexie npm](https://www.npmjs.com/package/dexie) -- version confirmed (HIGH confidence)
- [use-sound npm](https://www.npmjs.com/package/use-sound) -- version 5.0.0, sprite API verified via Context7 (HIGH confidence)
- [use-sound GitHub/Context7 /joshwcomeau/use-sound](https://github.com/joshwcomeau/use-sound) -- hook API and Howler integration verified (HIGH confidence)
- [@dnd-kit/core npm](https://www.npmjs.com/package/@dnd-kit/core) -- version 6.3.1 confirmed (HIGH confidence)
- [@dnd-kit/sortable npm](https://www.npmjs.com/package/@dnd-kit/sortable) -- version 10.0.0 confirmed (HIGH confidence)
- [dnd-kit docs](https://docs.dndkit.com/) -- sortable preset, collision detection (HIGH confidence)
- [react-beautiful-dnd deprecated](https://github.com/atlassian/react-beautiful-dnd/issues/2672) -- archived Aug 2025 (HIGH confidence)
- [Immer npm](https://www.npmjs.com/package/immer) -- version 11.1.4 confirmed (HIGH confidence)
- [Zustand Immer middleware docs](https://zustand.docs.pmnd.rs/middlewares/immer) -- integration pattern verified (HIGH confidence)
- [Vitest npm](https://www.npmjs.com/package/vitest) -- version 4.0.18, Vitest 4 announcement (HIGH confidence)
- [@testing-library/react npm](https://www.npmjs.com/package/@testing-library/react) -- version 16.3.0, React 19 support (HIGH confidence)
- [happy-dom npm](https://www.npmjs.com/package/happy-dom) -- version 20.5.3 (HIGH confidence)
- [nanoid npm](https://www.npmjs.com/package/nanoid) -- version 5.1.6, 118 bytes (HIGH confidence)
- [Zod npm / release notes](https://zod.dev/v4) -- version 4.3.6, locales API (HIGH confidence)
- [Framer Motion npm](https://www.npmjs.com/package/framer-motion) -- version 12.34.0 current, already in project (HIGH confidence)
- [IndexedDB storage quotas (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) -- localStorage 5-10MB limit vs IndexedDB 1GB+ (HIGH confidence)
- [Dexie limitations docs](https://dexie.org/docs/The-Main-Limitations-of-IndexedDB) -- IndexedDB constraints documented (HIGH confidence)
- [React state management 2025 patterns](https://makersden.io/blog/react-state-management-in-2025) -- Zustand recommended for game-like apps (MEDIUM confidence, WebSearch only)
- [@lottiefiles/dotlottie-react npm](https://www.npmjs.com/package/@lottiefiles/dotlottie-react) -- version 0.17.15, deferred recommendation (MEDIUM confidence)

---
*Stack research for: Hebrew-English vocabulary learning adventure game (React PWA)*
*Researched: 2026-02-14*
