# Pitfalls Research

**Domain:** Hebrew-English vocabulary learning game (React PWA) -- content scaling, mini-game redesign, and comprehensive refactoring
**Researched:** 2026-02-14
**Confidence:** HIGH (based on direct codebase analysis + established patterns)

## Critical Pitfalls

### Pitfall 1: localStorage Quota Exhaustion at Scale

**What goes wrong:**
The app stores all user progress, SRS state, inventory, daily stats, high scores, story progress, and equipped items in localStorage. Currently with 13 words, `userProgress` stores SRS data for ~13 keys. At 200+ words, the `userProgress` object alone could hold 200+ entries each with `interval`, `repetition`, `easeFactor`, and `nextReviewDate`. Combined with story progress arrays (`completedChapters`, `discoveredSecrets`, `unlockedLore`, `collectibles`, `achievements`, `seenIntros`, `seenEvolutions`, `perfectLevelIds`, `choicesMade`), inventory arrays, and daily stats, the cumulative JSON payloads approach the 5MB localStorage limit -- especially since every state change triggers `safeSetJSON` which serializes the entire object.

**Why it happens:**
The current codebase writes to localStorage on every state change via individual `useEffect` hooks (lines 98-112 of `WordAdventure.jsx`). With 200+ words, each correct/incorrect answer triggers serialization of the entire `userProgress` object. The `useStoryProgress` hook also persists its full progress object on every change. These writes are unbatched and synchronous.

**How to avoid:**
- Calculate projected storage size before building: 200 words x ~100 bytes SRS state = ~20KB for word progress alone. Add story, inventory, equipped, daily stats = likely under 200KB total. This is safely within the 5MB limit, BUT the write frequency is the real problem.
- Debounce localStorage writes (batch saves every 2-3 seconds instead of per-keystroke).
- Separate hot data (current session state) from cold data (SRS history) in different storage keys so serialization cost stays low per write.
- Add a storage usage monitor during development (log `JSON.stringify(localStorage).length` periodically).
- Do NOT migrate to IndexedDB yet -- the data volume does not justify the complexity. Only consider IndexedDB if word count exceeds 1000+ or if audio/image assets are added.

**Warning signs:**
- `safeSetJSON` returning `false` in console logs (already exists but nobody checks the return value).
- Game freezing briefly after answering (synchronous JSON.stringify blocking the main thread).
- Players losing progress after clearing browser data (no export/import yet).

**Phase to address:**
Phase 1 (Refactoring/Architecture) -- debounce writes and restructure storage keys before adding content.

---

### Pitfall 2: Refactoring the 627-Line Mega-Component Without Tests

**What goes wrong:**
`WordAdventure.jsx` is a 627-line component that contains word data, game logic, UI rendering, state management, persistence, scoring, streak tracking, voice integration, story integration, pet walking integration, store integration, and inventory management -- all in one function. Refactoring this without tests means every extraction has unknown blast radius. The component has at least 15 `useState` calls, 5 `useEffect` calls, and handles 9+ different `gameState` values. Extracting hooks or sub-components will silently break state synchronization between features (e.g., streak tracking depends on feedback timing which depends on animation delays).

**Why it happens:**
No test infrastructure exists. Zero tests. The IMPLEMENTATION_PLAN.md puts testing in Phase 4 (after architecture refactoring in Phase 2), which means the riskiest changes happen without a safety net. The existing `useGameState` hook is already created but NOT actually used by `WordAdventure.jsx` -- the component still manages its own `gameState` directly, creating a dead-code trap where developers think extraction happened but it did not.

**How to avoid:**
- Write characterization tests BEFORE refactoring, not after. At minimum:
  - Test the SRS algorithm (`srs.js`) -- pure functions, easy to test.
  - Test the grammar engine (`grammarEngine.js`) -- pure functions, easy to test.
  - Snapshot test `WordAdventure` at each `gameState` value.
  - Test `storage.js` utilities (already pure, trivial to test).
- Use the Strangler Fig pattern: wrap existing behavior, add new behavior alongside, verify both work, then remove old.
- Refactor one screen at a time (start screen, map screen, playing screen, result screen) -- each is already visually distinct in the JSX.
- Keep `WordAdventure.jsx` as a thin router/orchestrator that delegates to screen components. Do NOT try to also change game logic during the screen extraction.
- Delete the unused `useGameState` hook or actually integrate it -- dead code misleads future developers.

**Warning signs:**
- `WordAdventure.jsx` imports growing rather than shrinking during "refactoring."
- New hooks duplicating state that still exists in the parent component.
- `gameState` being set in both the parent and a child component.
- Features silently breaking (e.g., streak count resets unexpectedly, daily stats stop updating, story dialogues stop appearing).

**Phase to address:**
Phase 0 (before anything else) -- add minimal characterization tests for pure utilities, THEN begin refactoring in Phase 1.

---

### Pitfall 3: Word Data Quality at Scale -- The 200-Word Content Trap

**What goes wrong:**
Scaling from 13 words to 200+ means authoring ~187 new word entries, each requiring: `id`, `word` (English), `hint` (Hebrew with emoji), `hebrew` (translation), `level` (difficulty), and `type`. The current 13 words are hand-crafted with high-quality hints (e.g., "Animal that loves milk" for CAT). At scale, hint quality degrades, translations contain errors (especially Hebrew gender agreement), difficulty assignments become inconsistent, and duplicate IDs or overlapping words slip in. The grammar engine (`grammarEngine.js`) also has its own separate vocabulary (`VOCAB.nouns`, `VOCAB.adjectives`, etc.) that must stay synchronized. The pet walking game (`PetWalkingGame.jsx`) has yet another independent word list (`quests` array with 8 words) that overlaps with but is not connected to the main word data.

**Why it happens:**
Three separate word/vocabulary systems exist with no shared data source:
1. `src/data/words.js` -- main word bank (13 words)
2. `src/utils/grammarEngine.js` VOCAB -- grammar nouns, adjectives, verbs (10 nouns, 8 adjectives, 5+6 verbs, 6 objects)
3. `src/components/PetWalkingGame.jsx` quests -- 8 adventure words

Authoring 200 words is tedious work prone to copy-paste errors. Hebrew is a gendered language where nouns, adjectives, and verbs must agree in gender. A word like "sun" (shemesh) is feminine in Hebrew but gender-neutral in English -- getting this wrong produces incorrect grammar engine output. The current data has no validation or schema enforcement.

**How to avoid:**
- Create a single canonical word data file that all systems import from. The grammar engine and pet walking game should derive their word pools from this source.
- Define a clear schema for word entries and validate it (even a simple runtime check at startup).
- Include Hebrew grammatical gender (`m`/`f`) in the word data schema -- this is already done in `grammarEngine.js` VOCAB but NOT in `words.js`.
- Build word data incrementally: start with 50 words across 5 categories, verify quality, then expand. Do not dump 200 words in one batch.
- Have a native Hebrew speaker review translations and hints, especially for gender agreement and idiomatic correctness.
- Add category/theme field to word data (Animals, Colors, Food, etc.) since the project requirements call for themed categories.

**Warning signs:**
- Duplicate word IDs causing SRS to track the wrong word.
- Grammar engine producing sentences with incorrect gender agreement.
- Pet walking game showing words that the player has never encountered in the main game.
- Hints that are vague or nonsensical at scale ("something you find" for 15 different words).
- Hebrew translations that disagree between `words.js` and `grammarEngine.js`.

**Phase to address:**
Phase 2 (Content) -- but the unified data schema must be designed in Phase 1 (Architecture), before content authoring begins.

---

### Pitfall 4: SRS Algorithm Breaking at Scale

**What goes wrong:**
The current SRS implementation (`srs.js`) stores review state per word in a flat `userProgress` object. With 13 words, `getDueWords` scans the entire array on every "Smart Review" session. At 200+ words, two problems emerge: (1) review queue flooding -- on first use, ALL 200+ words have no SRS state, so `getDueWords` returns all of them as "due immediately," and the review session picks 10 at random with `.slice(0, 10)`. The player gets overwhelmed. (2) The SRS intervals are calculated in days (`interval * 24 * 60 * 60 * 1000`), but words within the same session have nearly identical `nextReviewDate` timestamps, causing them to all come due simultaneously in future sessions.

**Why it happens:**
The `startLevel` function (line 163-166 in `WordAdventure.jsx`) filters due words and takes the first 10. New words are always "due" because `!word.srs` returns true. With 200 words, a new player's first review session is a random sampling of 10 from 200, with no pedagogical ordering. The SM-2 algorithm also uses discrete integer intervals (1, 6, then multiplied by ease factor), so words reviewed in the same minute get identical next-review timestamps.

**How to avoid:**
- Introduce a "learned" vs "not yet seen" distinction. Only words the player has encountered in level play should enter the SRS review pool. Currently, `getDueWords` treats every word without SRS state as due.
- Add a small random jitter to `nextReviewDate` (e.g., +/- 10% of interval) to spread out review clustering.
- Limit new words per review session (e.g., max 3 new + 7 review).
- Sort due words by priority: overdue words first, then new words, rather than arbitrary array order.
- Consider capping the review session dynamically based on how many words are actually due vs. new.

**Warning signs:**
- Players getting the same 10 random words every review session (because all 200 are "new" and `.slice(0, 10)` picks from the front).
- Review sessions feeling repetitive despite having 200 words.
- After a few days, a massive "review backlog" appears where 50+ words come due on the same day.
- SRS progress feeling meaningless because there is no difference between "words I've studied" and "words I haven't seen."

**Phase to address:**
Phase 1 (Architecture) -- the "learned" vs "unseen" distinction is an architectural decision. Implementation happens in Phase 2 (Content).

---

### Pitfall 5: Adventure Game Redesign Scope Explosion

**What goes wrong:**
The PetWalkingGame is being redesigned from a simple auto-scrolling walk with random encounters into a full "adventure game" with "multiple distinct areas/environments," "varied encounter types," and "improved visuals." This is effectively building an entirely new game within the existing app. The current PetWalkingGame is already the most complex component (513 lines) with a custom game loop, procedural world generation, parallax scrolling, leash physics, theme switching, and animation frame management. Redesigning it risks: scope creep into a multi-week effort, introducing new performance problems (the existing game loop already has a known memory leak), and creating a second mega-component that is harder to maintain than WordAdventure.jsx.

**Why it happens:**
"Adventure game" is an unbounded requirement. Without concrete scope limits, it tends to expand: first areas, then items, then NPCs, then dialog trees, then a map, then save states per area, then puzzles. Each addition requires its own state management, persistence, and UI. The existing `PetWalkingGame` already uses `requestAnimationFrame` manually (not through a game library), meaning every new feature requires hand-rolling animation and interaction logic.

**How to avoid:**
- Define the adventure game as a series of discrete "encounters" (word puzzles in themed settings), NOT as a persistent explorable world. This keeps scope finite.
- Limit v1 to 3-5 area themes with different visual treatments, each using the SAME encounter mechanics (just different word pools and visual styles).
- Fix the existing memory leak BEFORE redesigning. The `isActive` flag exists in the animation loop but `onComplete` callback in the dependency array of `useEffect` (line 183) causes the effect to re-run when `onComplete` changes identity, restarting the animation loop.
- Consider using a lightweight canvas/game library (like Phaser or PixiJS) only if the current emoji/CSS approach cannot achieve the visual goals. Do not half-adopt a game engine.
- Build the new adventure as a SEPARATE component (`AdventureGame.jsx`) rather than modifying `PetWalkingGame.jsx`. This allows parallel development and easy rollback.

**Warning signs:**
- Adventure game development taking more than 40% of total milestone effort.
- Adding persistent state (area progress, collected items, NPC relationships) that requires its own localStorage management.
- Frame rate drops on mobile devices (the current game loop runs `requestAnimationFrame` at 60fps with React state updates every 2 frames).
- "Just one more feature" pattern: area transitions, cutscenes, boss fights.

**Phase to address:**
Phase 3 (Adventure Game) -- but scope limits and architecture decisions must happen in Phase 1 planning.

---

### Pitfall 6: Gender Source of Truth Corruption Across 200+ Words

**What goes wrong:**
The codebase has an inconsistent gender system that will compound at scale. Currently, gender is determined in three different ways: (1) `userProfile.gender` stored during onboarding as 'boy'/'girl', (2) `PetWalkingGame.jsx` line 56 infers gender from avatar emoji (`avatar === '👸'`), and (3) the `t()` helper function in `WordAdventure.jsx` (line 128) selects male/female Hebrew text based on `userProfile.gender`. When scaling to 200+ words with Hebrew hints, every hint needs gender-correct conjugation. The grammar engine already handles this for sentences (`he_m`/`he_f`), but the static word hints in `words.js` are written in one gender only (currently masculine default). A girl player sees masculine-gendered hints throughout.

**Why it happens:**
The initial 13 words use generic hints that mostly avoid gender-specific language (e.g., "swims in water" rather than "you swim in water"). But as hints become more descriptive and context-rich at scale, gendered verbs and adjectives are unavoidable in Hebrew. The ENCOURAGEMENT messages in `story.js` already use masculine forms exclusively ("you can!" = "aata yachol" not "at yechola"). Adding 200 words means 200 hints that need gender-aware variants.

**How to avoid:**
- Establish a single gender source of truth: `userProfile.gender` from the profile, period. Remove all emoji-based gender inference.
- For word hints at scale, use one of two strategies:
  1. Write gender-neutral hints where possible (most Hebrew vocabulary hints CAN be neutral).
  2. Where gender is unavoidable, add `hint_m` and `hint_f` fields to the word schema.
- Audit all ENCOURAGEMENT messages in `story.js` -- several use masculine forms. Add gender variants or make them gender-neutral.
- Fix `PetWalkingGame.jsx` line 56 BEFORE other work -- it is a latent bug waiting to produce wrong behavior.

**Warning signs:**
- Hebrew speakers reporting "the game talks to me like I'm a boy" (or vice versa).
- Mixed masculine/feminine language in the same session.
- Content authors writing all hints in masculine and saying "we'll add feminine later" (they won't).

**Phase to address:**
Phase 1 (Architecture) -- fix the gender source of truth and establish the schema pattern before content authoring in Phase 2.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded word data in JSX (`initialWordData` in WordAdventure.jsx line 29-43) | Quick to add words | Duplicates `src/data/words.js`; changes must be made in two places | Never -- the data already exists in `words.js`. The copy in WordAdventure.jsx should be removed. |
| Individual `useEffect` per storage key (lines 98-102) | Simple persistence | Each state change triggers its own serialize+write; at scale this is O(n) writes per interaction | Acceptable for MVP; replace with debounced batch writer before 50+ words |
| `Math.random()` for shuffling and encounter triggering | Simple randomization | Not reproducible; makes testing impossible; biased shuffle | Acceptable for gameplay; problematic for testing. Replace with seeded PRNG if tests need determinism. |
| No category/theme field on word data | Fewer fields to manage | Cannot organize words into themed levels; level assignment is by difficulty only | Never for the 200-word milestone -- themed categories are a core requirement |
| Using emoji sprites for game characters | Zero asset pipeline | Visual ceiling; cannot animate smoothly; accessibility concerns for screen readers | Acceptable for current scope; reassess if "improved visuals" requirement demands more |
| `setTimeout` for game flow timing (lines 258, 265, 283) | Quick state transitions | Timers not cleaned up on unmount; race conditions when navigating away mid-transition; untestable | Acceptable for now but must use refs or cleanup functions when refactoring |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| SpeechRecognition API | Assuming `webkitSpeechRecognition` exists on all browsers; no `onnomatch` handler; not handling "not-allowed" permission denial gracefully | Check `isSupported` before rendering voice button (already done); show user-facing error when permission denied; add timeout for recognition sessions that produce no result |
| PWA (vite-plugin-pwa) | Caching stale word data after content update; service worker serving old `words.js` while new words exist in the codebase | Use proper cache versioning in the PWA config; consider `workbox-precache` with revision hashing; test that clearing cache picks up new content |
| Framer Motion AnimatePresence | Nested `AnimatePresence` components or missing `key` props causing exit animations to not fire; `mode="wait"` blocking screen transitions | Ensure every direct child of `AnimatePresence` has a unique `key` tied to `gameState`; already mostly correct but adding new screens risks breaking this |
| canvas-confetti | Calling confetti during unmount or after component disposal; confetti canvas not cleaned up | Already used responsibly; risk increases if confetti is triggered in the adventure game's `requestAnimationFrame` loop (can stack up) |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Full `userProgress` serialization on every answer | UI jank after answering; brief freeze on mobile | Debounce writes; serialize incrementally (only changed word's SRS state) | Noticeable at 100+ words with fast answer sequences |
| `useMemo` dependency on `currentWord?.id` (line 224) | Scrambled letters not updating when word changes but ID is the same | Ensure word IDs are truly unique across all data sources; `gen_` prefix words use timestamp which is unique | When duplicate IDs exist across data sources or procedural generation collides |
| PetWalkingGame `requestAnimationFrame` loop with React state updates every 2 frames (line 167) | High CPU usage; battery drain on mobile; 30+ state updates per second triggering React re-renders | Move animation state to refs instead of state; only trigger re-render for UI-visible changes (score, progress bar) | Already a problem -- visible as high CPU usage even on desktop |
| `worldObjects` and `clouds` useMemo in PetWalkingGame creating 40+ DOM elements | Scroll jank; memory pressure from 40+ absolutely-positioned divs with transforms | Cull off-screen objects; reduce object count; use canvas instead of DOM for parallax | Mobile devices with limited GPU memory |
| Inline function definitions in JSX (callbacks in AnimatePresence children) | Unnecessary re-renders; animation restart on parent re-render | Extract handlers to `useCallback`; already partially done but not consistently | When adding more animated children to the screen router |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| No input sanitization on player name (stored in `userProfile.name`, rendered in JSX) | Low risk -- React JSX escaping handles this. The string interpolation in `getNPCDialogue` (line 521 of story.js) is safe because the result goes through JSX rendering. | No action needed unless raw innerHTML is ever introduced. Keep using JSX rendering for all user-supplied strings. |
| localStorage accessible to any script on the same origin | Malicious browser extensions could modify scores, inventory, or progress | Not a real risk for a client-side game with no competitive multiplayer. Accept this. |
| Voice recognition data sent to browser's cloud speech service | Player's voice audio leaves the device | Document this for privacy-conscious parents. Consider adding a "voice off" setting that persists. |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| 200 words dumped into the game at once with no progression gating | Player sees "200 words available" and feels overwhelmed; analysis paralysis on where to start | Unlock words progressively through level completion. Only show categories/levels that contain words the player is ready for. |
| All encouragement messages use masculine Hebrew forms | Female players feel the app was not made for them; parents notice and lose trust | Add gender-variant encouragement messages; audit every string in `ENCOURAGEMENT` and NPC dialogues |
| Review mode mixes brand-new words with review words | Player cannot distinguish "learning" from "reviewing"; new words with no context are confusing | Separate "Learn New Words" from "Review" modes; only put words in review that have been practiced at least once in a level |
| Memory game always uses the same word pool when no level is active | Game gets boring; always the same 12 cards | Rotate word pool based on recently learned words; prefer words that need review (combine with SRS data) |
| Adventure game interrupts with word questions randomly | Breaks flow; unpredictable; player cannot control pacing | Show visual cues before encounters (pet sniffing is a good start); let player choose difficulty of encounters; make encounters feel like discoveries, not interruptions |
| No progress indicator for overall game completion | Player does not know how much content remains; no "light at the end of the tunnel" | Add a total progress tracker: "42/200 words mastered" visible on start screen |

## "Looks Done But Isn't" Checklist

- [ ] **Word data migration:** The `initialWordData` array in `WordAdventure.jsx` (line 29-43) is a COPY of `src/data/words.js`. If you update one, you must update the other. This duplication must be eliminated before adding words, or content will diverge silently.
- [ ] **SRS review pool:** Adding 200 words to `words.js` does NOT mean they are in the SRS system. Words only enter SRS after being played (`calculateNextReview` is called). But `getDueWords` treats ALL words without SRS state as "due," so review mode will immediately surface unplayed words.
- [ ] **Story unlock requirements:** `CHAPTERS` in `story.js` has `unlockRequirement` based on `totalWordsLearned`. With only 13 words, the expert level (requires 15) and master level (requires 20) are nearly unreachable. With 200 words, all chapters unlock quickly. Recalibrate unlock thresholds.
- [ ] **Grammar engine vocabulary sync:** Adding words to `words.js` does NOT add them to the grammar engine's `VOCAB` in `grammarEngine.js`. Sentences will still use the same 10 nouns and 8 adjectives unless explicitly expanded.
- [ ] **Pet evolution thresholds:** `PET_EVOLUTION` stages use `wordsRequired` values (0, 10, 25, 50). With 200 words, all pet evolution happens in the first quarter of the game. Consider scaling thresholds proportionally.
- [ ] **Adventure game word pool:** `PetWalkingGame.jsx` has its own hardcoded `quests` array (8 words). Adding 200 words to the main game does not affect the adventure mini-game unless explicitly connected.
- [ ] **PWA cache invalidation:** Adding/changing word data requires the service worker to serve the new bundle. If the old cached version is still active, players see the old word set until cache refreshes.
- [ ] **Daily deals randomization:** `getDailyDeals()` in `storeItems.js` uses `Math.random()` with no seed, so "daily" deals change on every page load, not once per day.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| localStorage quota exceeded | LOW | Implement storage cleanup: prune old daily stats, compress SRS data (remove redundant fields), add storage size monitoring |
| Mega-component refactoring breaks features | MEDIUM | If features break during refactoring: revert the extraction, add characterization tests for the broken behavior, then re-attempt extraction with tests in place |
| Word data quality issues at scale | HIGH | Bad translations or hints require native speaker review of all 200 entries. Prevent by reviewing in batches of 20-30 during authoring. |
| SRS flooding users with 200 due words | LOW | Add the "seen" flag retroactively; filter getDueWords to only include words with existing SRS state; set unseen words to a future nextReviewDate |
| Adventure game scope explosion | MEDIUM | Descope to "themed encounter screens" -- keep the walking animation + encounter popup pattern but with better visuals and varied word challenges. Cut areas, NPCs, and persistent state. |
| Gender inconsistency in 200 hints | HIGH | Audit all hints post-authoring. Prevention is much cheaper: establish gender-neutral hint writing guidelines BEFORE content authoring begins. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| localStorage quota exhaustion | Phase 1 (Architecture) | Run `JSON.stringify(localStorage).length` after test with 200 words; must be under 500KB |
| Refactoring without tests | Phase 0 (Pre-work) | At least 20 tests for pure utilities (srs.js, grammarEngine.js, storage.js) before any refactoring begins |
| Word data quality at scale | Phase 1 (Schema) + Phase 2 (Content) | Schema validation passes for all 200 entries; native speaker review of at least category-level batches |
| SRS algorithm breaking at scale | Phase 1 (Architecture) + Phase 2 (Content) | Test with simulated 200-word progress data; review session never shows more than 3 unseen words |
| Adventure game scope explosion | Phase 1 (Planning) | Written scope document with finite feature list; time-boxed to 30% of milestone effort |
| Gender source of truth corruption | Phase 1 (Architecture) | Single gender check function used everywhere; `PetWalkingGame` no longer infers gender from emoji |
| Duplicate word data across files | Phase 1 (Architecture) | `WordAdventure.jsx` no longer contains `initialWordData`; single import from `src/data/words.js` |
| Story/pet thresholds miscalibrated for 200 words | Phase 2 (Content) | Playtester completes game start-to-finish; all chapters and pet evolutions occur at satisfying intervals |
| PWA serving stale content after update | Phase 2 (Content) | Build includes cache-busting; manual test: update word data, build, verify new words appear without manual cache clear |
| Encouragement messages gender mismatch | Phase 2 (Content) | All strings in `ENCOURAGEMENT` and NPC dialogues reviewed for gender variants or neutrality |

## Sources

- Direct codebase analysis of all source files in `/Users/galsened/word-adventure/src/`
- [MDN: Storage Quotas and Eviction Criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [Problems and Solutions for Spaced Repetition Software](https://rickcarlino.com/2019/problems-and-solutions-for-spaced-repetition-software.html)
- [Shopify: Refactoring Legacy Code with the Strangler Fig Pattern](https://shopify.engineering/refactoring-legacy-code-strangler-fig-pattern)
- [IvritMaster: Understanding Common Mistakes in Hebrew Vocabulary Usage](https://ivritmaster.com/understanding-common-mistakes-in-hebrew-vocabulary-usage/)
- [IvritMaster: Gender Agreement and Its Importance in Hebrew Grammar](https://ivritmaster.com/gender-agreement-and-its-importance-in-hebrew-grammar/)
- [Spaced Repetition Systems Have Gotten Way Better (FSRS)](https://domenic.me/fsrs/)
- [6 Common React Anti-Patterns](https://itnext.io/6-common-react-anti-patterns-that-are-hurting-your-code-quality-904b9c32e933)

---
*Pitfalls research for: Hebrew-English vocabulary learning game -- content scaling, refactoring, and mini-game redesign*
*Researched: 2026-02-14*
