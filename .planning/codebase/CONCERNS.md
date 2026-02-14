# Codebase Concerns

**Analysis Date:** 2026-02-14

## Tech Debt

**Component Size Explosion:**
- Issue: `src/WordAdventure.jsx` (627 lines) contains the entire application state, game logic, and UI rendering. This mega-component manages 20+ useState calls, makes decisions about game flow, handles voice input, item effects, story progression, and renders all game screens.
- Files: `src/WordAdventure.jsx`
- Impact: Difficult to test, debug, or modify any single feature without affecting others. Future feature additions will exponentially increase complexity. Rendering performance degrades as state grows.
- Fix approach: Refactor into feature-based component structure with context providers. Extract game state management into `useGameState` hook. Separate screen components (`GameScreen`, `PlayingScreen`, `MapScreen`, etc.) into their own files with isolated state. Use custom hooks for domain logic (`useGameFlow`, `useAudio`, `useProgress`).

**Multiple Storage Mechanisms Without Unified Interface:**
- Issue: Code uses both `localStorage.getItem`/`setItem` directly (line 62: `localStorage.getItem(STORAGE_KEYS.AVATAR)`) and the safe utility functions from `src/utils/storage.js`. Mix causes data consistency issues and multiple error handling patterns.
- Files: `src/WordAdventure.jsx` (lines 62, 100, 586), `src/utils/storage.js`, `src/hooks/useStoryProgress.js`
- Impact: If localStorage quota is exceeded, some parts of app fail gracefully while others crash. Debugging data corruption is difficult. Migration of storage format requires changes in multiple places.
- Fix approach: Make all storage access go through `safeGetJSON`/`safeSetJSON`. Create a storage schema version number to handle migrations. Add `safeRemoveItem` and `safeClearStorage` functions for completeness. Consider IndexedDB for larger data structures.

**Inconsistent Error Handling Patterns:**
- Issue: Error handling is scattered: `src/utils/voice.js` logs to console with try-catch, `src/utils/storage.js` silently returns defaults, `src/components/ErrorBoundary.jsx` catches React errors, but network/API errors have no handler pattern defined.
- Files: `src/utils/voice.js`, `src/utils/storage.js`, `src/components/ErrorBoundary.jsx`
- Impact: Some errors silently fail (storage), some crash the app (unhandled exceptions), some log warnings that users won't see. Difficult to diagnose production issues.
- Fix approach: Create standardized error handling: `createErrorHandler` utility that normalizes error logging/reporting across the app. Implement error boundary for async operations in game loop. Add Sentry or similar for production error tracking.

**Procedural Generation with No Collision Detection:**
- Issue: `src/utils/grammarEngine.js` generates infinite sentence variations but does not prevent duplicate sentences in the same session. Random generation can produce same word multiple times, reducing learning diversity.
- Files: `src/utils/grammarEngine.js` (lines 107-119), `src/WordAdventure.jsx` (line 159)
- Impact: Player sees same generated challenge multiple times without realizing it. Spaced repetition becomes less effective. Player may memorize patterns rather than learn actual grammar.
- Fix approach: Add `seenChallenges` Set to track generated IDs. Modify `generateChallenge` to accept `excludeIds` parameter. Reset set at chapter boundaries. Add deduplication test in test suite.

**Inadequate Type Safety:**
- Issue: Codebase uses JavaScript (not TypeScript). No prop validation on complex components. Store item effects, story data, and inventory operations have implicit contracts with no runtime validation.
- Files: All JSX components, `src/data/story.js`, `src/data/storeItems.js`
- Impact: Props mismatch crashes component. Story data format changes break dialogue system without warning. Item effects object missing required field silently fails. Refactoring requires manual code inspection.
- Fix approach: Migrate to TypeScript incrementally (start with type definitions for store items and story system). Add PropTypes validation on components. Create runtime schema validators using Zod or similar for external data (especially story/items data that could be loaded dynamically).

## Known Bugs

**Voice Recognition Transcript Accumulation:**
- Symptoms: When user speaks multiple times, transcript from previous input sometimes carries over, creating concatenated answers like "CATDOG" when user intended only "DOG"
- Files: `src/utils/voice.js`, `src/WordAdventure.jsx` (line 269)
- Trigger: Use voice input twice in quick succession without pausing between
- Workaround: User must wait 2+ seconds between voice inputs or manually clear input field
- Fix approach: Ensure `setTranscript('')` is called BEFORE `stopListening()` returns, not after. Add `resetTranscript()` method that clears internal state in the recognition hook. Consider adding manual "Clear" button in voice UI.

**Daily Stats Reset Edge Case:**
- Symptoms: If user plays during timezone change or near midnight, daily stats may not reset properly, showing incomplete data
- Files: `src/WordAdventure.jsx` (lines 105-112)
- Trigger: Play game around midnight or in timezone with DST change
- Workaround: Force clear browser cache to reset `dailyStats`
- Fix approach: Store timestamp as ISO string not `toDateString()`. Compare `new Date().toDateString()` with stored value at component mount in useEffect. Add unit test with mock dates at midnight boundary.

**Pet Walking Game Progress Not Persisted:**
- Symptoms: Score earned in `PetWalkingGame` is added to total score but no record kept of pet walking activity
- Files: `src/components/PetWalkingGame.jsx` (line 149), `src/WordAdventure.jsx` (line 450)
- Trigger: Complete pet walking game, exit to map
- Workaround: None - data is not persisted but reflected in current session
- Fix approach: Add `onComplete` to persist pet walking activity to story progress. Update `useStoryProgress` to track pet walking achievements separately.

## Security Considerations

**localStorage Contains Sensitive Learning Data:**
- Risk: User profile, learning progress, and scores stored in localStorage (human-readable, unencrypted). Any script with access to window object can read user data. XSS vulnerability could leak data.
- Files: `src/utils/storage.js` (localStorage), all components using `safeGetJSON`
- Current mitigation: Basic error handling in storage utilities. No other protection.
- Recommendations: (1) Identify if any data is truly sensitive (user age is sensitive in COPPA context). (2) Add localStorage access logs for audit trail. (3) Consider IndexedDB with encryption for sensitive fields. (4) Implement CSP headers to prevent XSS. (5) For production, add server-side validation of user progress to prevent client-side cheating.

**Voice Data Handling:**
- Risk: `src/utils/voice.js` uses Web Speech API which may send audio to Google servers (depending on browser implementation). No privacy notice shown to user.
- Files: `src/utils/voice.js`
- Current mitigation: Feature detection checks browser support
- Recommendations: (1) Add clear privacy disclosure before enabling voice input. (2) Log when voice feature is enabled. (3) Consider on-device ML alternative (Tensorflow.js). (4) Add ability to disable voice input entirely.

**Story Data Injection Risk:**
- Risk: If `src/data/story.js` is ever loaded from external source or user-modifiable, dialogue text could contain HTML/scripts
- Files: `src/data/story.js`, `src/components/StoryDialogue.jsx`
- Current mitigation: Story is static data in repository
- Recommendations: If story ever becomes dynamic, sanitize all text output with DOMPurify. Add Content Security Policy. Validate story schema at load time.

## Performance Bottlenecks

**Expensive Re-renders on State Changes:**
- Problem: `src/WordAdventure.jsx` component re-renders entire app on any state change (score, lives, inventory, etc.). All 20+ child components re-render even when their props didn't change.
- Files: `src/WordAdventure.jsx` (lines 338-627)
- Cause: No memoization of child components. Props passed directly without dependency tracking. AnimatePresence causes DOM churn.
- Improvement path: (1) Wrap child component renderings with `useMemo` based on specific state. (2) Use `React.memo` on `Store`, `Inventory`, `MemoryGame` components. (3) Pass only relevant state to each child. (4) Separate game state from UI state.

**PetWalkingGame requestAnimationFrame in useEffect:**
- Problem: Animation frame loop in `src/components/PetWalkingGame.jsx` (lines 122-183) updates state 60 times per second. setProgress triggers full component re-render. Throttling is done with `frameCount % 2` but still causes excessive renders.
- Files: `src/components/PetWalkingGame.jsx` (lines 122-183)
- Cause: setProgress and setSceneRenderTrigger called on every frame. React batching doesn't help with animation frame timing.
- Improvement path: (1) Use useRef for non-render state (sceneOffsetRef, petPosRef already do this well). (2) Separate render-driving state (only setProgress/setWalkFrame when game state changes). (3) Use CSS animations for parallax instead of JS calculations. (4) Profile with React DevTools Profiler to quantify impact.

**Large Inventory List Rendering:**
- Problem: `src/components/Inventory.jsx` renders all inventory items in a grid. If user has 100+ items, all render in DOM simultaneously.
- Files: `src/components/Inventory.jsx` (lines 32-58)
- Cause: No pagination or virtualization. groupedInventory memoization helps but doesn't prevent DOM bloat.
- Improvement path: (1) Add virtualization with react-window for large lists. (2) Implement pagination (show 10 items at a time). (3) Add search/filter to reduce visible items. (4) Lazy-load item images/icons if added later.

**Story Data Structure is Deeply Nested:**
- Problem: `src/data/story.js` has CHAPTERS > NPC > dialogues array repeated 5+ times with same structure. JSON is 2000+ lines. When accessing dialogue, app traverses nested objects.
- Files: `src/data/story.js` (150+ lines read, likely 500+ total)
- Cause: Hierarchical structure made sense for narrative but creates bloat and lookup overhead.
- Improvement path: (1) Flatten story data: store all dialogues in a map `{ chapterId_dialogueType: { text, icon } }`. (2) Use ID-based references instead of nesting. (3) Consider loading story chapters on-demand. (4) Benchmark before/after with performance profiler.

## Fragile Areas

**Spaced Repetition Calculation:**
- Files: `src/utils/srs.js`
- Why fragile: SM-2 algorithm implementation has hardcoded values (quality threshold 3, easeFactor defaults). Changing learning difficulty requires tweaking these magic numbers. No test suite validates algorithm correctness.
- Safe modification: (1) Add unit tests for `calculateNextReview` with quality scores 0-5. (2) Extract magic numbers to named constants at top of file. (3) Document SM-2 algorithm assumptions. (4) Add property-based tests to validate interval always increases with success.
- Test coverage: No tests exist for SRS logic

**Pet Evolution State Machine:**
- Files: `src/data/story.js` (PET_EVOLUTION), `src/hooks/useStoryProgress.js` (evolution logic)
- Why fragile: Pet evolution logic depends on multiple conditions (words learned, streaks, special achievements). State transitions are implicit in `canPetEvolve` function logic. Adding new evolution stage requires changes in multiple files.
- Safe modification: (1) Create explicit state machine definition as separate data structure. (2) Extract `canPetEvolve` logic into pure function with clear preconditions. (3) Add integration test that simulates a full pet evolution path.
- Test coverage: No automated tests for pet evolution

**Dialogue Trigger System:**
- Files: `src/data/story.js` (NPC dialogues array), `src/hooks/useStoryProgress.js` (getDialogue function)
- Why fragile: Trigger names are strings ('correct', 'wrong', 'low_lives') with no validation. Typos in trigger name silently fail. Adding new trigger type requires coordination between data and hook.
- Safe modification: (1) Create enum for trigger types. (2) Add runtime validation that trigger exists. (3) Implement mock dialogue for missing triggers. (4) Add TypeScript or PropTypes to story data.
- Test coverage: No tests validate all trigger types are defined

**Voice Recognition Browser Support Detection:**
- Files: `src/utils/voice.js` (lines ~9-15)
- Why fragile: Code checks `window.SpeechRecognition || window.webkitSpeechRecognition` but doesn't validate recognition actually works. Browsers may advertise API but fail to initialize. Older browsers have different implementation details.
- Safe modification: (1) Lazy-initialize voice on first use, not module load. (2) Add actual initialization test before enabling button. (3) Gracefully degrade if initialization fails. (4) Test on target browser set.
- Test coverage: No tests for voice feature availability

## Scaling Limits

**localStorage Storage Quota:**
- Current capacity: ~5-10MB per origin in most browsers (varies by browser/OS)
- Limit: If app accumulates 50,000+ inventory items, user progress structures, and score history, localStorage quota will be exceeded
- Scaling path: (1) Implement data cleanup (archive old daily stats, prune score history to top 100). (2) Migrate to IndexedDB for unlimited storage. (3) Add server-side backup (optional) for user progress. (4) Monitor storage usage and warn user at 80% capacity.

**Story Dialogue Memory Usage:**
- Current capacity: Entire story tree (all chapters, NPCs, dialogues) loaded at app start
- Limit: With 10+ chapters and 50+ unique dialogue variations per chapter, memory footprint grows linearly. Tree structure also adds overhead.
- Scaling path: (1) Load story chapters on-demand when entering chapter. (2) Keep only active chapter dialogue in memory. (3) Pre-load next chapter in background. (4) Consider story as external JSON to compress/lazy-load.

**SRS Review Queue:**
- Current capacity: All words with their SRS metadata stored in userProgress
- Limit: 1000+ words with full SRS state (interval, repetition, easeFactor, nextReviewDate) becomes slow to filter in getDueWords
- Scaling path: (1) Index words by nextReviewDate to avoid filtering all words. (2) Migrate SRS tracking to separate data structure optimized for date queries. (3) Use binary search instead of filter for finding due words.

## Dependencies at Risk

**framer-motion Version 12.23.26:**
- Risk: Major version 12 is recent and active development. Breaking changes possible in patch releases. AnimatePresence behavior varies by version.
- Impact: Animation timing inconsistencies or broken transitions between versions. Particle effects in confetti may render differently.
- Migration plan: (1) Lock to specific patch version `~12.23.26`. (2) Monitor releases for breaking changes. (3) Test animation heavy features on upgrade. (4) Alternative: Migrate complex animations to CSS transitions (less flexible but more stable).

**Web Speech API (Browser Built-in, Not Npm):**
- Risk: API is non-standard, vendor implementations differ significantly. Android Chrome, Safari iOS, Firefox all have different capabilities and behaviors.
- Impact: Voice input works on Chrome desktop but fails silently on iOS. User experience is platform-dependent.
- Migration plan: (1) Implement comprehensive fallback when Web Speech API unavailable. (2) Add in-app messaging about platform limitations. (3) Consider Speechly or similar for cross-platform alternative. (4) Make voice input optional feature, not core.

## Missing Critical Features

**No Error Recovery for Failed Answers:**
- Problem: If user's answer partially matches (case difference, trailing space), it counts as wrong with no partial credit system. No "close call" feedback.
- Blocks: Reducing frustration for learners, providing confidence on near-correct answers

**No User Onboarding or Tutorial:**
- Problem: App has no guided first-play experience. Users land on welcome screen with little explanation of game mechanics (lives system, scoring, pet walking, inventory).
- Blocks: Retention of new users, understanding of advanced features like item effects

**No Data Export or Account System:**
- Problem: All progress is stored locally. If user loses device or clears localStorage, all progress is lost permanently. No way to migrate progress between devices.
- Blocks: Cross-device play, data backup, account recovery

**No Offline Tracking Without Analytics:**
- Problem: App works offline but has no way to measure user engagement, drop-off points, or effective learning outcomes.
- Blocks: Understanding what works/doesn't work, prioritizing improvements

**No Difficulty Customization:**
- Problem: Difficulty is locked to chapter. User cannot adjust word difficulty, SRS interval, or lives count per their learning pace.
- Blocks: Accessibility for struggling learners, challenge for advanced learners

## Test Coverage Gaps

**Spaced Repetition System:**
- What's not tested: SRS algorithm correctness. Interval calculations for quality scores 0-5. Ease factor convergence. getDueWords filtering logic.
- Files: `src/utils/srs.js`
- Risk: Changing algorithm math can silently break learning effectiveness. Users get suboptimal review schedules.
- Priority: High (core learning feature)

**Game Flow State Machine:**
- What's not tested: Transitions between game states (start → playing → levelComplete → gameOver). Invalid state transitions. State persistence across session.
- Files: `src/WordAdventure.jsx` (game state logic)
- Risk: Edge cases cause app to hang or show invalid screen. Save/load bugs lose user progress.
- Priority: High (affects all gameplay)

**Item Effects:**
- What's not tested: Item equip/unequip logic. Consumable usage and inventory removal. Booster application during gameplay. Effect stacking/conflicts.
- Files: `src/hooks/useItemEffects.js`, item system integration
- Risk: Item benefits not applied, or applied multiple times. Inventory becomes inconsistent.
- Priority: Medium (monetization feature, but currently all free)

**Voice Input Integration:**
- What's not tested: Voice recognition initialization. Transcript parsing and normalization. Error cases (permission denied, mic not available).
- Files: `src/utils/voice.js`, integration in `WordAdventure.jsx`
- Risk: Voice feature silently fails. User thinks they spoke but input not registered.
- Priority: Medium (accessibility feature)

**Story Progression:**
- What's not tested: Chapter unlock conditions. Pet evolution triggers. Dialogue selection based on player choices. NPC progression state.
- Files: `src/hooks/useStoryProgress.js`, `src/data/story.js`
- Risk: Players progress to wrong chapters. Pet evolution never triggers. Dialogue system breaks.
- Priority: High (affects narrative experience)

**localStorage Data Corruption Scenarios:**
- What's not tested: Recovery when JSON is corrupted. Data migration when format changes. Quota exceeded handling. Cross-tab sync.
- Files: `src/utils/storage.js`
- Risk: Corrupted data permanently breaks app. Migration breaks for old users. No sync between browser tabs.
- Priority: Medium (reliability concern)

---

*Concerns audit: 2026-02-14*
