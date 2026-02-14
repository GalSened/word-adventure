# Project Research Summary

**Project:** Word Adventure -- Improvement Milestone
**Domain:** Hebrew-English bilingual vocabulary learning game (React PWA with RPG elements)
**Researched:** 2026-02-14
**Confidence:** MEDIUM-HIGH

## Executive Summary

Word Adventure is a Hebrew-first React PWA that teaches English vocabulary through RPG-style gameplay -- story chapters, pet evolution, shop/inventory, and mini-games. The app has strong gamification scaffolding (SRS algorithm, grammar engine, 6 story chapters, 30+ shop items, pet evolution, daily quests) but is critically starved for content: only 13 words in the word bank, one challenge type (letter-picker spelling), and a flat difficulty model. The central finding across all four research tracks is that **content is the bottleneck, not features**. The game has more systems than it has words to exercise them.

The recommended approach is a four-phase build: (0) add minimal tests as a safety net, (1) refactor the 627-line mega-component and establish a unified word data schema, (2) populate 200+ words across themed categories and build 3-5 challenge types, (3) redesign the adventure mini-game with scoped encounters rather than an open-world exploration. The existing stack (React 19, Vite 7, Tailwind, Framer Motion) is solid and does not need replacement. New libraries should be limited to Zustand for state management, dnd-kit for drag-and-drop challenges, use-sound for audio feedback, and Vitest for testing. Dexie.js (IndexedDB) is recommended for future-proofing but can be deferred until word count exceeds 500+.

The primary risks are: (1) refactoring the mega-component without tests causes silent regressions, (2) word data quality degrades at scale without schema validation and Hebrew gender consistency, (3) the SRS algorithm floods new users with 200 "due" words because it cannot distinguish "unseen" from "needs review," and (4) the adventure game redesign explodes in scope. All four are preventable with upfront architectural decisions before content work begins.

## Key Findings

### Recommended Stack

The existing stack is retained. New additions are strictly additive.

**Core technologies (new):**
- **Zustand** (^5.0.11) + **Immer** (^11.1.4): Replaces scattered localStorage calls and prop drilling with centralized state. The persist middleware eliminates custom `safeGetJSON`/`safeSetJSON` patterns. Critical for managing 200+ words of SRS state, inventory, and game progression without Context re-render problems.
- **Dexie.js** (^4.3.0): IndexedDB wrapper for when vocabulary exceeds localStorage's 5MB limit. Provides schema versioning and reactive queries. Recommended to adopt for SRS data storage; keep localStorage for small UI state (settings, avatar).
- **@dnd-kit** (core ^6.3.1, sortable ^10.0.0): Modern drag-and-drop for sentence-building and matching challenges. Replaces the deprecated react-beautiful-dnd. Touch-friendly and accessible.
- **use-sound** (^5.0.0): React hook for audio feedback (correct/incorrect sounds, level-up celebrations). Wraps Howler.js with lifecycle management.
- **Vitest** (^4.0.18) + **Testing Library**: Zero-config testing for a Vite 7 project. No tests exist today -- this is a prerequisite for safe refactoring.
- **Zod** (^4.3.6): Runtime schema validation for word data integrity across 200+ entries. Locales API supports Hebrew error messages.
- **nanoid** (^5.1.6): Replaces collision-prone `Date.now() + Math.random()` ID generation.

**Deferred:** Lottie animations (needs asset pipeline), XState (Zustand handles current complexity).

**Avoided:** Redux (overkill), Firebase/Supabase (no backend needed), i18next (app is Hebrew-first, not multilingual), TypeScript migration (too disruptive during feature expansion).

### Expected Features

**Must have (table stakes) -- P1:**
- Expanded word bank (200+ words across 8-10 themed categories) -- the single most critical gap
- Themed word categories with selection UI (Animals, Food, Family, Colors, Nature, Body, Actions, Home/School)
- 3-5 challenge types: spelling (exists), multiple choice (both directions), listening/select, sentence building
- Audio pronunciation for all words (Web Speech API for English, SpeechSynthesis or pre-recorded for Hebrew)
- Progressive difficulty with 10+ levels across themed zones (replaces flat easy/medium/hard/expert)
- Word data schema enrichment (category, emoji, audio flag, tier, gender, example sentences)
- Onboarding revision (guided first lesson instead of multi-step story intro)

**Should have (differentiators) -- P2:**
- Hebrew gender-aware grammar challenges at lower levels (unique -- no competitor does this)
- Story-driven vocabulary discovery (word categories tied to story chapters thematically)
- Adventure exploration mini-game (redesigned PetWalkingGame with themed zones)
- Adaptive difficulty based on SRS data (select challenge type by mastery level)
- Word book / dictionary UI for reviewing learned words
- Bilingual contextual sentences

**Defer (v2+) -- P3:**
- Cultural/holiday content packs (needs established user base)
- Parent/teacher dashboard (needs usage pattern data)
- Additional mini-games beyond core set
- Competitive weekly challenges (needs user base for meaningful competition)

**Anti-features (avoid):**
- Real-time multiplayer (infrastructure cost dwarfs educational value)
- AI-generated content (LLM costs, Hebrew grammar errors, backend dependency)
- User-created word lists (quality control nightmare with Hebrew vowelization)
- Timed challenges (research shows time pressure reduces retention in children)
- Social features / chat (COPPA compliance far outside scope)

### Architecture Approach

The current architecture cannot support the improvement milestone. `WordAdventure.jsx` is a 627-line mega-component that contains all game state, rendering, and persistence in a single function. Extracted hooks (`useGameState`, `useUserProgress`, etc.) exist but are not actually used -- the component duplicates their logic inline. The word bank is a 13-item array hardcoded in two places. Three separate vocabulary systems (main words, grammar engine, pet walking) have no shared data source.

**Major components (target architecture):**
1. **GameContext / GameProvider** -- Single context composing all existing hooks (`useGameState`, `useUserProgress`, `useStoryProgress`, `useDailyStats`, `useItemEffects`) plus new `useChallengeEngine`. Eliminates 20+ useState calls and prop drilling from WordAdventure.jsx.
2. **ScreenRouter** -- Renders the correct screen component based on `gameState`. Replaces scattered if/else blocks. WordAdventure.jsx becomes a ~50-line shell.
3. **Word Bank Query API** -- Words stored in themed files (`data/wordBank/themes/`), queried through functions (`getWordsForLevel()`, `getWordsByTheme()`). Single source of truth replaces three divergent word lists.
4. **Challenge Interface Contract** -- Every challenge component implements `{ challenge, onResult, disabled }`. LevelScreen orchestrates challenges without knowing their internals. Adding a challenge type = adding one file.
5. **Level Definitions as Data** -- Levels defined as data objects specifying themes, difficulty range, word count, allowed challenge types, and story chapter. Adding a level = adding one object.

**Key patterns:** Challenge Interface Contract (uniform component API), Word Bank Query API (data indirection), GameContext Provider (centralized state), Level Definition as Data (declarative levels).

### Critical Pitfalls

1. **Refactoring without tests** -- The mega-component has 15+ useState, 5+ useEffect, and 9+ gameState values. Extracting hooks or components without characterization tests creates silent regressions. Prevention: Write tests for pure utilities (srs.js, grammarEngine.js, storage.js) BEFORE any refactoring. Use Strangler Fig pattern: wrap, add alongside, verify, remove.

2. **SRS algorithm breaking at scale** -- With 200+ words, all unplayed words register as "due" in review mode. First review session randomly samples 10 from 200 unplayed words. Words reviewed in the same session get identical `nextReviewDate` values, causing review clustering. Prevention: Distinguish "learned" (played at least once in a level) from "unseen." Add jitter to review dates. Cap new words per review session at 3.

3. **Word data quality degradation** -- Three separate vocabulary systems (words.js, grammarEngine.js VOCAB, PetWalkingGame quests) with no shared data source. At 200+ words, Hebrew gender agreement errors, duplicate IDs, and inconsistent hints compound. Prevention: Unified word schema with validation. Gender field mandatory. Native Hebrew speaker review in batches of 20-30.

4. **Gender source-of-truth corruption** -- Gender is determined three different ways: `userProfile.gender`, avatar emoji inference (`avatar === princess`), and the `t()` helper. Hints are written in masculine-only forms. At 200 words, every hint needs gender-correct conjugation. Prevention: Single gender source (`userProfile.gender`). Write gender-neutral hints where possible, add `hint_m`/`hint_f` fields where not. Audit all ENCOURAGEMENT messages.

5. **Adventure game scope explosion** -- "Redesign pet walking as adventure game" is an unbounded requirement. The current PetWalkingGame is already the most complex component (513 lines) with a known memory leak. Prevention: Define adventure as discrete themed encounters, NOT a persistent explorable world. Limit v1 to 3-5 visual themes using the same encounter mechanics. Time-box to 30% of total milestone effort. Build as a new component, not a modification of the existing one.

## Implications for Roadmap

Based on combined research, the following phase structure respects dependencies, groups related work, and front-loads risk mitigation.

### Phase 0: Test Safety Net
**Rationale:** Every other phase involves modifying code with zero test coverage. The mega-component refactoring (Phase 1) is the highest-risk activity and must not proceed without characterization tests. Pure utility functions (srs.js, grammarEngine.js, storage.js) are trivially testable and provide the most value per test-minute invested.
**Delivers:** Vitest configured, 20+ tests covering SRS algorithm, grammar engine, and storage utilities. Snapshot tests for WordAdventure at each gameState value.
**Addresses:** Pitfall 2 (refactoring without tests)
**Stack:** Vitest, @testing-library/react, happy-dom

### Phase 1: Architecture Refactoring
**Rationale:** The 627-line mega-component, duplicated data, and scattered state management cannot support 200+ words or new challenge types. This phase creates the structural foundation that all subsequent phases build on. Must happen before content authoring because the word data schema must be designed before 200 words are written.
**Delivers:** GameContext provider composing existing hooks. ScreenRouter replacing inline gameState switches. WordAdventure.jsx reduced from 627 to ~50 lines. Unified word data schema with gender, category, challenge type, and sentence fields. Single gender source of truth. Debounced localStorage writes. Elimination of duplicated word data.
**Addresses:** Table stakes (schema enrichment), Pitfalls 1, 2, 3, 6 (storage, refactoring, data quality, gender)
**Stack:** Zustand + Immer (state management), Zod (schema validation), nanoid (ID generation)

### Phase 2: Content and Challenge Types
**Rationale:** Content is the single biggest gap. All gamification systems are decorating 13 words. This phase fills the content vacuum and adds the challenge variety that prevents monotony. Word authoring depends on the schema from Phase 1. Challenge types depend on the Challenge Interface Contract from Phase 1.
**Delivers:** 200+ words across 8-10 themed categories. 5 challenge types (spelling, matching, multiple choice both directions, listening, sentence building). Audio pronunciation via Web Speech API. Progressive levels (10+) across 5 themed zones tied to story chapters. Redesigned world map with zone-based navigation. SRS fix for learned vs. unseen words. Recalibrated story/pet evolution thresholds for 200-word scale.
**Addresses:** All P1 features (word bank, categories, challenges, audio, levels), Pitfalls 3, 4 (data quality, SRS at scale)
**Stack:** @dnd-kit (matching and sentence-building challenges), use-sound (audio feedback)

### Phase 3: Adventure Game Redesign
**Rationale:** Depends on themed word categories from Phase 2 (adventure zones map to word themes). Must be scoped tightly to avoid the scope explosion pitfall. The current PetWalkingGame has a memory leak that must be fixed regardless.
**Delivers:** New adventure component with 3-5 themed encounter zones. Each zone draws vocabulary from the corresponding word category. Varied encounter types using the challenge components built in Phase 2. Fixed memory leak. Improved visuals (themed backgrounds, better character sprites). Pet abilities integrated with encounters.
**Addresses:** P2 features (adventure mini-game, story-driven discovery), Pitfall 5 (scope explosion -- mitigated by reusing Phase 2 challenge components)

### Phase 4: Polish and Differentiation
**Rationale:** P2 features that enhance but do not define the core experience. These depend on having a working content base and engaged users.
**Delivers:** Adaptive difficulty (challenge type selection based on SRS mastery level). Word book / dictionary UI. Hebrew grammar challenges extended to lower levels. Bilingual contextual sentences on word detail screens. Onboarding revision. Overall animation and feedback polish.
**Addresses:** All P2 features, overall UX quality

### Phase Ordering Rationale

- **Phase 0 before Phase 1:** Refactoring without tests is the single highest-risk activity identified in pitfalls research. 20 tests for pure utilities cost hours, not days, and prevent cascading regressions.
- **Phase 1 before Phase 2:** Content authoring requires the schema. Challenge types require the interface contract. State management requires the provider. Every Phase 2 deliverable depends on Phase 1 infrastructure.
- **Phase 2 before Phase 3:** Adventure zones are themed around word categories. Encounter types reuse challenge components. Without content and challenges, there is nothing for the adventure game to present.
- **Phase 4 after Phase 3:** Polish features like adaptive difficulty and word book are enhancements that add value only when the core content loop is complete. They are independently shippable increments.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Content):** Hebrew word data authoring at scale needs native speaker validation. Web Speech API quality for Hebrew TTS varies by browser/device and needs testing. Level pacing (words per level, unlock thresholds) needs playtesting -- no research can substitute for this.
- **Phase 3 (Adventure):** The visual design and encounter flow need prototyping. Research identified the scope risk but cannot prescribe the exact encounter mechanics. Consider a design spike before full implementation.

Phases with standard patterns (skip research-phase):
- **Phase 0 (Tests):** Vitest setup for Vite projects is well-documented. Testing pure functions is straightforward.
- **Phase 1 (Refactoring):** React Context composition, component extraction, and Zustand integration follow established patterns with extensive documentation. The architecture research provides concrete code examples.
- **Phase 4 (Polish):** Adaptive difficulty is a well-understood SRS enhancement. Word book and grammar challenge extension build on existing systems.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommended libraries verified via npm with exact versions and React 19 compatibility. Migration paths from current utilities are clearly mapped. No speculative recommendations. |
| Features | MEDIUM | Table stakes and anti-features are well-established from competitor analysis (Duolingo, Drops, Gus on the Go). Differentiator value (Hebrew grammar awareness, story-driven discovery) is promising but untested with actual users. Word count target (200+) is industry baseline but optimal number requires user data. |
| Architecture | HIGH | Based on direct codebase analysis. Problems (mega-component, duplicated data, three vocabulary systems) are concrete and verified. Recommended patterns (Challenge Interface Contract, Word Bank Query API) are standard React architecture with code examples. |
| Pitfalls | HIGH | All pitfalls derived from direct codebase analysis with specific line numbers and code references. Prevention strategies are concrete and actionable. Recovery costs assessed realistically. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Hebrew TTS quality:** Web Speech API's Hebrew voice quality varies significantly across browsers and devices. Must be tested on target devices before committing to SpeechSynthesis-only. Fallback plan: pre-recorded audio for the most common 50-100 Hebrew words. Test during Phase 2 planning.
- **Word content authoring process:** No research addressed HOW to author 200 words efficiently. Need a content authoring workflow: spreadsheet/JSON template, validation script, batch review process. Define during Phase 2 planning.
- **Level pacing and difficulty curve:** Research identified that levels should be themed and progressive, but the exact number of words per level, unlock thresholds, and challenge-type distribution per level need playtesting. Cannot be determined from research alone. Build with tunable constants and iterate.
- **Adventure game visual approach:** Research recommends against Lottie (deferred) and against full game engines. The gap between "better than emoji sprites" and "custom illustrations" is undefined. Consider CSS-based themed backgrounds with slightly improved character sprites as a middle ground. Prototype during Phase 3.
- **Dexie.js timing:** Recommended but explicitly deferred. The 200-word milestone fits within localStorage limits (~200KB projected). The migration path is clean (Zustand persist can switch backends), but the trigger for adoption (500+ words or audio assets) may not arrive during this milestone. Monitor storage usage.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis of `/Users/galsened/word-adventure/src/` -- all architecture and pitfall findings
- [Zustand npm/GitHub](https://www.npmjs.com/package/zustand) -- v5.0.11, persist middleware API
- [Dexie.js](https://dexie.org/) -- v4.3.0, IndexedDB wrapper API
- [@dnd-kit](https://docs.dndkit.com/) -- v6.3.1, sortable presets, collision detection
- [use-sound](https://www.npmjs.com/package/use-sound) -- v5.0.0, Howler integration
- [Vitest](https://www.npmjs.com/package/vitest) -- v4.0.18, Vite 7 integration
- [Zod](https://zod.dev/v4) -- v4.3.6, locales API
- [MDN: Storage Quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) -- localStorage 5MB limit

### Secondary (MEDIUM confidence)
- [Duolingo gamification case studies](https://www.youngurbanproject.com/duolingo-case-study/) -- feature expectations and retention mechanics
- [Drops vs Duolingo comparison](https://duolingoguides.com/drops-vs-duolingo/) -- competitor feature baselines
- [Gus on the Go Hebrew](https://www.gusonthego.com/gus-on-the-go-languages/gus-on-the-go-hebrew/) -- Hebrew-specific kids' app feature set
- [React architecture patterns 2026](https://www.bacancytechnology.com/blog/react-architecture-patterns-and-best-practices) -- Context API and component separation
- [IvritMaster: Hebrew gender agreement](https://ivritmaster.com/gender-agreement-and-its-importance-in-hebrew-grammar/) -- gender correctness in Hebrew vocabulary
- [Strangler Fig pattern](https://shopify.engineering/refactoring-legacy-code-strangler-fig-pattern) -- refactoring strategy

### Tertiary (LOW confidence)
- [React state management 2025 patterns](https://makersden.io/blog/react-state-management-in-2025) -- Zustand recommendation for game-like apps (single web source)
- [Vocabulary treatment in adventure/RPG games](https://link.springer.com/chapter/10.1007/978-3-642-20074-8_11) -- academic paper on game-based vocabulary learning (relevant but older)

---
*Research completed: 2026-02-14*
*Ready for roadmap: yes*
