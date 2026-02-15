# Phase 6: Polish and Integration - Research

**Researched:** 2026-02-15
**Domain:** React UI polish, SRS data integration, onboarding UX, threshold calibration
**Confidence:** HIGH

## Summary

Phase 6 brings together loose ends across the codebase: a word book for review, a visible progress tracker, recalibrated progression thresholds, a streamlined onboarding flow, and SRS-driven word selection for the memory game. All six requirements (CONT-07, PROG-05 through PROG-09) are UI-layer or data-layer changes that build on existing infrastructure -- no new libraries or architectural patterns are needed.

The word data already contains everything a word book needs (word, hebrew, hint, emoji, category, exampleSentence, exampleSentence_he). SRS mastery is derivable from `userProgress` in the Zustand store by checking `repetition` count. The memory game currently draws from `activeWords` (or falls back to `initialWordData.slice(0, 12)`) and needs to be rewired to query `userProgress` for recently-learned words. The pet evolution and story chapter thresholds in `src/data/story.js` use raw `wordsRequired` / `unlockRequirement` values that are currently calibrated for a much smaller corpus (10, 25, 50 for pets; 0, 5, 10, 15, 20 for chapters) and need rescaling to 200-word scope.

**Primary recommendation:** All changes are data transformations and new UI components using existing patterns (Zustand selectors, framer-motion, Tailwind, lucide-react icons). No new dependencies required.

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^19.2.0 | UI framework | Already in use |
| Zustand | ^5.0.11 | State management with persist | All state lives here |
| framer-motion | ^12.23.26 | Animations and transitions | Already used in every screen |
| lucide-react | ^0.562.0 | Icons | Already used for UI icons |
| Tailwind CSS | ^3.4.17 | Styling | Already used everywhere |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | ^4.3.6 | Schema validation | Word data validation (already in use) |
| canvas-confetti | ^1.9.4 | Celebration effects | Already used in MemoryGame, PetEvolution |

### No New Dependencies Needed
All Phase 6 work uses existing libraries. No `npm install` required.

## Architecture Patterns

### Existing Project Structure (relevant subset)
```
src/
├── components/
│   ├── screens/
│   │   ├── ScreenRouter.jsx    # Switch/case routing -- add new screens here
│   │   ├── StartScreen.jsx     # Add progress tracker here
│   │   └── MemoryScreen.jsx    # Thin wrapper around MemoryGame
│   ├── MemoryGame.jsx          # Needs SRS word pool integration
│   ├── PetEvolution.jsx        # Evolution notification (thresholds in story.js)
│   └── StoryIntro.jsx          # Current multi-step intro (to be replaced)
├── store/
│   └── gameStore.js            # Zustand store with userProgress, completedLevels
├── data/
│   ├── words.js                # 201 words with category, level, example sentences
│   ├── wordSchema.js           # WORD_CATEGORIES enum
│   ├── levels.js               # 12 levels with unlock thresholds
│   └── story.js                # CHAPTERS, PET_EVOLUTION, MYSTERIES thresholds
├── hooks/
│   └── useStoryProgress.js     # totalWordsLearned, chapter unlocks, pet evolution
├── utils/
│   ├── srs.js                  # calculateNextReview, buildReviewSession, getDueWords
│   └── challengeSelector.js    # getMasteryBand (new/learning/familiar/mastered)
└── config/
    └── constants.js            # GAME_CONFIG, CHALLENGE_TYPES
```

### Pattern 1: Zustand Selectors for Derived Data
**What:** Compute word book data and progress counts from existing store state
**When to use:** Word book needs to combine `initialWordData` with `userProgress`; progress tracker needs mastery count
**Example:**
```javascript
// Derive mastery count from userProgress
// A word is "mastered" when its SRS repetition >= 6 (per getMasteryBand in challengeSelector.js)
const MASTERY_THRESHOLD = 6;

function getMasteredCount(userProgress) {
    return Object.values(userProgress).filter(
        srs => srs.repetition >= MASTERY_THRESHOLD
    ).length;
}

// In component:
const userProgress = useGameStore(s => s.userProgress);
const masteredCount = getMasteredCount(userProgress);
// Display: "42/201 words mastered"
```

### Pattern 2: ScreenRouter Extension
**What:** Adding new game states to ScreenRouter's switch/case
**When to use:** Word book needs its own screen
**Example:**
```javascript
// In ScreenRouter.jsx, add a new case:
case 'wordBook':
    return (
        <WordBookScreen
            key="wordBook"
            userProgress={props.userProgress}
            onClose={() => props.setGameState('start')}
        />
    );
```

### Pattern 3: SRS-Driven Word Selection for Memory Game
**What:** Replace random/static word pool with SRS-aware selection
**When to use:** Memory game should draw from recently learned words
**Example:**
```javascript
// Select words for memory game based on SRS data
function getMemoryGameWords(allWords, userProgress, count = 6) {
    const learned = allWords.filter(w => userProgress[w.id]);

    // Sort by most recently learned (lowest repetition first = newest)
    // Then by most recently reviewed (nextReviewDate descending)
    const sorted = learned
        .map(w => ({ ...w, srs: userProgress[w.id] }))
        .sort((a, b) => {
            // Prefer recently learned (low repetition)
            if (a.srs.repetition !== b.srs.repetition) {
                return a.srs.repetition - b.srs.repetition;
            }
            // Then by most recent review date
            return b.srs.nextReviewDate - a.srs.nextReviewDate;
        });

    return sorted.slice(0, count);
}
```

### Pattern 4: Guided First Lesson (Onboarding Replacement)
**What:** Replace multi-step StoryIntro with a guided first lesson
**When to use:** New players should learn mechanics through play, not reading
**Example approach:**
```javascript
// Instead of showing StoryIntro overlay, jump straight to level 1
// with inline tutorial hints during gameplay
// The hasSeenStoryIntro flag becomes "hasCompletedOnboarding"
// First level plays with tooltip overlays explaining mechanics
```

### Anti-Patterns to Avoid
- **Duplicating mastery logic:** The `getMasteryBand` function in `challengeSelector.js` already defines mastery bands. Word book mastery display should use the same thresholds, not invent new ones.
- **Hardcoding word counts:** The total word count (201) should be derived from `initialWordData.length`, not hardcoded, since the word list may grow.
- **Breaking the onboarding flow:** `hasSeenStoryIntro` is persisted in the Zustand store. Any changes to onboarding must maintain backward compatibility -- existing users who already have `hasSeenStoryIntro: true` should not see onboarding again.
- **Modifying SRS core logic:** The SRS algorithm (`calculateNextReview`, `buildReviewSession`) is tested and stable. Memory game integration should READ from SRS data, not modify the algorithm.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Word grouping by category | Manual object building | `WORD_CATEGORIES` from `wordSchema.js` + `Array.reduce` | Categories are already an enum; use it as source of truth |
| Mastery level display | New mastery calculation | `getMasteryBand()` from `challengeSelector.js` | Reuses existing 4-band system (new/learning/familiar/mastered) |
| Progress percentage | Manual division | `Object.keys(userProgress).length / initialWordData.length` | userProgress keys = learned words; initialWordData.length = total |
| Threshold constants | Inline numbers | Named constants in `constants.js` or `story.js` | Already established pattern for configuration |

**Key insight:** All the data infrastructure exists. Phase 6 is about PRESENTING existing data in new UI, not building new data systems.

## Common Pitfalls

### Pitfall 1: Two Sources of Truth for "Words Learned"
**What goes wrong:** `useStoryProgress` tracks `totalWordsLearned` (incremented per correct answer), while `userProgress` in gameStore tracks per-word SRS state. These can diverge -- `totalWordsLearned` counts every correct answer (including re-reviews), while `Object.keys(userProgress).length` counts unique words encountered.
**Why it happens:** The story system and SRS system were built independently.
**How to avoid:** For the progress tracker ("42/201 words mastered"), use `userProgress` from the Zustand store as the single source of truth. Count unique word IDs with `repetition >= MASTERY_THRESHOLD` for "mastered" count. Use `Object.keys(userProgress).length` for "encountered" count. Do NOT use `totalWordsLearned` from story progress.
**Warning signs:** Progress count exceeds 201, or mastered count exceeds learned count.

### Pitfall 2: Pet Evolution Thresholds Not Matching Story Thresholds
**What goes wrong:** `PET_EVOLUTION` in `story.js` has `wordsRequired` at 0/10/25/50, while `CHAPTERS` has `unlockRequirement` at 0/5/10/15/20. These use `totalWordsLearned` (story system counter), not actual unique mastered words. After recalibration, they could use different scales or the same field differently.
**Why it happens:** Both systems reference `totalWordsLearned` from story progress, which is a running counter not a unique-word count.
**How to avoid:** Decide on ONE metric for progression thresholds. The most meaningful for a 200-word game is `Object.keys(userProgress).length` (unique words seen) or mastered count (repetition >= 6). Recalibrate ALL thresholds to use the same metric.
**Warning signs:** Player unlocks everything after repeating the same 20 words.

### Pitfall 3: Memory Game Word Pool Empty for New Players
**What goes wrong:** If a new player opens the memory game before learning any words, the SRS-based word pool is empty.
**Why it happens:** `userProgress` is `{}` for brand new players.
**How to avoid:** Always provide a fallback. If `userProgress` has fewer than 6 entries, fall back to the first N words from `initialWordData` (same as current behavior). Only switch to SRS-based selection when enough words have been learned.
**Warning signs:** Memory game shows blank cards or crashes for new users.

### Pitfall 4: Onboarding Regression for Existing Users
**What goes wrong:** Changing the onboarding flow causes existing users (who have `hasSeenStoryIntro: true`) to see a new onboarding sequence, or conversely, new behavior is skipped for them.
**Why it happens:** The `hasSeenStoryIntro` flag controls whether `StoryIntro` overlay renders. Changing this flag's semantics breaks backward compatibility.
**How to avoid:** Introduce a NEW flag (e.g., `hasCompletedOnboarding`) rather than repurposing `hasSeenStoryIntro`. For existing users with `hasSeenStoryIntro: true`, auto-set `hasCompletedOnboarding: true` so they skip new onboarding. Only new users (no profile) see the guided first lesson.
**Warning signs:** Existing users see onboarding again, or new users see the old multi-step story intro.

### Pitfall 5: Word Book Performance with 201 Words
**What goes wrong:** Rendering all 201 words with animations causes jank on mobile.
**Why it happens:** Each word card with framer-motion animations + Tailwind classes = expensive DOM.
**How to avoid:** Group by category (10 groups of ~20 words). Show one category at a time with tab/accordion navigation. Use `motion.div` only for the active category, not all 201 cards simultaneously.
**Warning signs:** Scrolling lag, especially on lower-end mobile devices.

## Code Examples

### Word Book Data Derivation
```javascript
// Derive word book entries from existing data
import { initialWordData } from '../data/words';
import { WORD_CATEGORIES } from '../data/wordSchema';
import { useGameStore } from '../store/gameStore';

function useWordBook() {
    const userProgress = useGameStore(s => s.userProgress);

    // Group words by category
    const wordsByCategory = WORD_CATEGORIES.reduce((acc, cat) => {
        acc[cat] = initialWordData
            .filter(w => w.category === cat)
            .map(w => ({
                ...w,
                srs: userProgress[w.id] || null,
                masteryBand: userProgress[w.id]
                    ? getMasteryBand(userProgress[w.id].repetition)
                    : 'unseen',
            }));
        return acc;
    }, {});

    return wordsByCategory;
}
```

### Progress Tracker Component
```javascript
// Progress display for StartScreen
// Uses userProgress from Zustand store, NOT totalWordsLearned
function ProgressTracker() {
    const userProgress = useGameStore(s => s.userProgress);
    const totalWords = initialWordData.length; // 201

    const masteredCount = Object.values(userProgress).filter(
        srs => srs.repetition >= 6  // mastered band threshold
    ).length;

    return (
        <div className="bg-white/80 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
                {masteredCount}/{totalWords} מילים נשלטו
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                    style={{ width: `${(masteredCount / totalWords) * 100}%` }}
                />
            </div>
        </div>
    );
}
```

### Recalibrated Thresholds
```javascript
// Current vs recommended thresholds for 200-word scale

// PET_EVOLUTION wordsRequired (current -> recommended)
// Stage 1: 0  -> 0   (start)
// Stage 2: 10 -> 30  (15% of 200)
// Stage 3: 25 -> 80  (40% of 200)
// Stage 4: 50 -> 150 (75% of 200)

// CHAPTERS unlockRequirement (current -> recommended)
// These use totalWordsLearned which is per-correct-answer, not unique words.
// Should switch to unique learned count (Object.keys(userProgress).length)
// or completed-level-based unlocking (which is what LEVELS[] already does).
// NOTE: CHAPTERS unlock is SEPARATE from LEVELS unlock.
// LEVELS use completedLevels array (level N requires level N-1 completed).
// CHAPTERS are the old legacy system (easy/medium/hard/expert/master).
// Recommendation: Leave LEVELS as-is (sequential unlock works fine).
// For CHAPTERS, the unlock thresholds are only used by useStoryProgress.
// They should be recalibrated or deprecated in favor of LEVEL_CHAPTERS.

// Memory game minimum word pool
const MIN_MEMORY_WORDS = 6;
// Fallback: if fewer than MIN_MEMORY_WORDS learned, use initialWordData
```

### Guided First Lesson Pattern
```javascript
// Instead of StoryIntro overlay, integrate tutorials into first gameplay
// Add tooltip hints that appear during the first level

const ONBOARDING_HINTS = [
    { trigger: 'firstWord', message: 'תרגם את המילה! הקלד באנגלית ולחץ על בדיקה', position: 'below-input' },
    { trigger: 'firstCorrect', message: 'מעולה! ככה לומדים מילים חדשות!', position: 'center' },
    { trigger: 'firstWrong', message: 'לא נורא! יש לך עוד ניסיונות. שים לב לרמז!', position: 'above-hint' },
];

// Track in Zustand store (persisted):
// onboardingStep: number (0 = not started, 3 = completed)
// hasCompletedOnboarding: boolean
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Multi-step StoryIntro overlay | Guided first lesson through play | Phase 6 (planned) | Better retention; players learn by doing |
| Random/static memory words | SRS-driven word pool selection | Phase 6 (planned) | Reinforces recently learned vocabulary |
| No word book | Category-organized word browser | Phase 6 (planned) | Gives players review capability |
| No progress on start screen | Mastered count + progress bar | Phase 6 (planned) | Motivates continued play |
| Pet evolves at 10/25/50 words | Recalibrated for 200-word scale | Phase 6 (planned) | Feels appropriately spaced |

## Existing Data Available for Phase 6

### Word Data Fields (per word in initialWordData)
| Field | Type | Available | Used in Word Book |
|-------|------|-----------|-------------------|
| `id` | string | Yes | Key for SRS lookup |
| `word` | string | Yes | English word display |
| `hebrew` | string | Yes | Hebrew translation |
| `hint` | string | Yes | Learning hint |
| `category` | string | Yes | Category grouping |
| `emoji` | string | Yes | Visual identifier |
| `level` | string | Yes | Difficulty indicator |
| `exampleSentence` | string | Yes | Example in English |
| `exampleSentence_he` | string | Yes | Example in Hebrew |
| `gender` | string | Yes | Grammatical gender |

### SRS State Fields (per word in userProgress)
| Field | Type | Purpose |
|-------|------|---------|
| `interval` | number | Days until next review |
| `repetition` | number | Times correctly reviewed (mastery indicator) |
| `easeFactor` | number | SM-2 ease factor |
| `nextReviewDate` | number | Unix timestamp of next review |

### Mastery Bands (from challengeSelector.js)
| Band | Repetition | Meaning |
|------|-----------|---------|
| `new` | 0-1 | Just encountered |
| `learning` | 2-3 | Actively learning |
| `familiar` | 4-5 | Getting comfortable |
| `mastered` | 6+ | Well known |

## Key Implementation Decisions

### 1. Progress Metric: "mastered" vs "learned"
**Recommendation:** Show BOTH on start screen:
- Primary: "{mastered}/201 words mastered" (repetition >= 6)
- Secondary: "{learned} words in progress" (has userProgress entry but rep < 6)
This gives accurate SRS-based mastery while acknowledging in-progress words.

### 2. Chapter Unlock Metric After Recalibration
**Recommendation:** The old CHAPTERS system (easy/medium/hard/expert/master) uses `totalWordsLearned` from story progress. The new LEVELS system uses `completedLevels` array. For PROG-05, recalibrate the CHAPTERS system to use unique learned words OR deprecate CHAPTERS unlock in favor of LEVELS (which already works correctly with sequential completion). The LEVEL_CHAPTERS already exist in story.js and map 1:1 with LEVELS[].storyChapter.

### 3. Onboarding Strategy
**Recommendation:** Do NOT remove WelcomeScreen (name + gender selection). Instead:
1. Keep WelcomeScreen as-is (first-time profile creation)
2. Replace StoryIntro + StoryPathChoice overlays with a guided first lesson
3. Auto-start level 1 after profile creation
4. Show tutorial tooltips during first level gameplay
5. After first level completion, show abbreviated story hook (1 screen, not 4)

### 4. Memory Game Word Selection
**Recommendation:** Create `getMemoryGameWords(allWords, userProgress)` utility:
1. If `Object.keys(userProgress).length >= 6`: Select recently-learned words (low repetition, recent nextReviewDate)
2. If fewer than 6 learned: Mix learned words with unlearned words from easy category
3. Always ensure exactly 6 word pairs (12 cards)

## Open Questions

1. **Should the word book show unseen words?**
   - What we know: The word book requirement says "browse all learned words". This implies only words with SRS entries.
   - What's unclear: Should players see what words they haven't learned yet (grayed out) as motivation?
   - Recommendation: Show learned words normally, show unseen words as locked/blurred to create discovery motivation. This is a UI choice the planner can decide.

2. **What exactly constitutes "mastered" for the progress tracker?**
   - What we know: SRS `repetition >= 6` maps to the "mastered" band in challengeSelector.js. This is a well-defined threshold.
   - What's unclear: The requirement says "42/200 words mastered" but there are 201 words. Use 200 as display approximation or show exact count?
   - Recommendation: Use exact count (`initialWordData.length`) for accuracy. "42/201 words mastered" is fine.

3. **StoryPathChoice: keep or remove?**
   - What we know: After story intro, players choose hero/explorer/scholar path. The onboarding revision (PROG-08) says "guided first lesson instead of multi-step story intro".
   - What's unclear: Does this mean remove the story path choice entirely, or just move it to after the first lesson?
   - Recommendation: Defer story path choice to after completing level 1. This preserves the feature while not blocking initial gameplay.

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection of all source files listed above
- `src/data/words.js` - 201 words, all with category, exampleSentence, exampleSentence_he
- `src/data/wordSchema.js` - WORD_CATEGORIES enum (10 categories)
- `src/utils/srs.js` - SM-2 algorithm with buildReviewSession
- `src/utils/challengeSelector.js` - mastery bands (new/learning/familiar/mastered)
- `src/store/gameStore.js` - userProgress map, completedLevels array, Zustand persist
- `src/data/story.js` - PET_EVOLUTION thresholds, CHAPTERS unlock thresholds, LEVEL_CHAPTERS
- `src/components/MemoryGame.jsx` - current word pool logic (random from passed `words` prop)
- `src/components/screens/ScreenRouter.jsx` - current routing pattern
- `src/components/StoryIntro.jsx` - current multi-step onboarding overlay
- `src/hooks/useStoryProgress.js` - totalWordsLearned counter, pet evolution checks

### Secondary (MEDIUM confidence)
- Prior phase decisions from PLAN summaries (03-01 through 05-02)
- IMPLEMENTATION_PLAN.md Phase 6 items (original plan, now superseded by GSD phases)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, all existing libraries verified in package.json
- Architecture: HIGH - all patterns observed directly in codebase, no speculation
- Data model: HIGH - all word fields, SRS fields, and store shape verified by reading source
- Threshold calibration: MEDIUM - recommended thresholds (30/80/150 for pets) are calculated proportions, actual feel requires playtesting
- Onboarding redesign: MEDIUM - the approach is sound but the specific tooltip UX will need iteration
- Pitfalls: HIGH - all pitfalls derived from actual code inspection (two sources of truth, empty word pool, etc.)

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (stable codebase, no external dependencies changing)
