# Phase 3: Word Bank and SRS Foundation - Research

**Researched:** 2026-02-15
**Domain:** Content authoring, Zod validation, SRS algorithms, Web Speech API, Hebrew gender linguistics
**Confidence:** HIGH

## Summary

Phase 3 is primarily a **content and algorithm** phase, not a technology introduction phase. The existing codebase already has every dependency installed (Zod v4, Zustand, nanoid) and every architectural pattern established (word schema validation, SRS module, grammar engine). The work decomposes into four distinct concerns: (1) authoring 200+ words with correct Hebrew metadata, (2) extending the Zod schema for gender-aware hints and bilingual example sentences, (3) fixing the SRS algorithm to distinguish learned/unseen words with jitter and session caps, and (4) wiring the grammar engine to consume the unified word bank instead of its hardcoded VOCAB.

The riskiest area is **content quality** -- authoring 200+ Hebrew words with correct grammatical gender, culturally appropriate hints, and natural example sentences requires care that automated validation cannot fully catch. The second risk is **SRS correctness at scale** -- the current `getDueWords()` treats all words without SRS state as "due immediately," which means unseen words would flood review sessions. Both risks are addressed by the specific requirements (PROG-01 through PROG-04).

**Primary recommendation:** Split work into content-first (word authoring + schema extension), then algorithm fixes (SRS + grammar sync), then integration (audio + gender audit). Content authoring is the long pole; start there.

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| zod | ^4.3.6 | Word schema validation at module load time | Already installed, WordSchema in `src/data/wordSchema.js` |
| zustand | ^5.0.11 | State management with persist middleware | Already installed, `src/store/gameStore.js` |
| nanoid | ^5.1.6 | Unique ID generation for grammar engine | Already installed, used in `grammarEngine.js` |

### Supporting (No New Dependencies Needed)

| API | Purpose | When Used |
|-----|---------|-----------|
| Web Speech API `SpeechSynthesis` | English word audio pronunciation (CONT-05) | Browser built-in, no npm package |
| `Math.random()` | Jitter calculation for SRS intervals (PROG-03) | Built-in, no dependency |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Web Speech API TTS | Pre-recorded audio files | Better quality but 200+ audio files = massive bundle, maintenance burden. Web Speech API is 94.5% browser coverage and zero-cost. |
| SM-2 manual jitter | FSRS algorithm (open-spaced-repetition) | FSRS is academically superior but massive complexity increase for a children's game. SM-2 + jitter is well-understood and sufficient. |
| Manual word authoring | AI-generated word lists | Out of scope per REQUIREMENTS.md ("AI-generated content" explicitly excluded due to Hebrew grammar errors) |

**Installation:** No new packages needed. Phase 3 uses only existing dependencies.

## Architecture Patterns

### Current Project Structure (Relevant Files)

```
src/
├── data/
│   ├── words.js           # Word bank (currently 13 words) -- EXPAND to 200+
│   ├── wordSchema.js      # Zod schema (10 required fields) -- EXTEND for hint_m/hint_f
│   ├── story.js           # NPC dialogues, ENCOURAGEMENT -- AUDIT for gender
│   └── storeItems.js      # Unchanged
├── utils/
│   ├── srs.js             # SRS algorithm -- FIX getDueWords, ADD jitter
│   └── grammarEngine.js   # Grammar engine with hardcoded VOCAB -- SYNC with word bank
├── hooks/
│   └── useGameLogic.js    # startLevel review mode -- FIX session caps
├── store/
│   └── gameStore.js       # userProgress tracks SRS per word -- unchanged
└── components/
    └── screens/
        └── PlayingScreen.jsx  # Add speaker icon for audio -- EXTEND
```

### Pattern 1: Zod Schema Extension with `.extend()`

**What:** Extend the existing `WordSchema` to add gender-variant hint fields and bilingual example sentences.
**When to use:** When adding fields to the validated word data model.

The existing schema:
```javascript
// Current: src/data/wordSchema.js
export const WordSchema = z.object({
  id: z.string().min(1),
  word: z.string().min(1),
  hebrew: z.string().min(1),
  hint: z.string().min(1),
  category: z.string().min(1),
  emoji: z.string().min(1),
  level: z.enum(['easy', 'medium', 'hard', 'expert']),
  type: z.enum(['word', 'sentence']),
  gender: z.enum(['m', 'f', 'n']),
  exampleSentence: z.string().min(1),
});
```

Extended schema approach -- use `.extend()` to add new fields:
```javascript
// Zod v4: use .extend() (not .merge() which is deprecated)
// Source: https://zod.dev/v4/changelog -- .merge() deprecated in favor of .extend()
export const WordSchema = z.object({
  id: z.string().min(1),
  word: z.string().min(1),
  hebrew: z.string().min(1),
  hint: z.string().min(1),          // Gender-neutral hint (required)
  hint_m: z.string().optional(),     // Masculine hint variant (when Hebrew grammar requires)
  hint_f: z.string().optional(),     // Feminine hint variant (when Hebrew grammar requires)
  category: z.enum([
    'animals', 'food', 'family', 'colors', 'nature',
    'body', 'actions', 'home', 'emotions', 'professions'
  ]),
  emoji: z.string().min(1),
  level: z.enum(['easy', 'medium', 'hard', 'expert']),
  type: z.enum(['word', 'sentence']),
  gender: z.enum(['m', 'f', 'n']),
  exampleSentence: z.string().min(1),
  exampleSentence_he: z.string().min(1),  // Hebrew translation of example
});
```

**Key decisions from Phase 2:**
- All 10 existing fields remain required (prior decision [02-04])
- Validation runs at module import time (prior decision [02-04])
- Gender uses 'm', 'f', 'n' enum values (prior decision [02-04])

### Pattern 2: SpeechSynthesis for Audio Pronunciation

**What:** Use the browser's built-in `SpeechSynthesis` API to speak English words aloud.
**When to use:** When user taps a speaker icon next to the word during gameplay.

```javascript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
export function speakWord(word, options = {}) {
  if (!window.speechSynthesis) return false;

  // Cancel any in-progress speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = options.rate || 0.8;   // Slightly slow for children
  utterance.pitch = options.pitch || 1.0;

  // Try to select an English voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en'));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}
```

**Critical gotcha:** `getVoices()` returns empty array on first call in some browsers. Must listen for the `voiceschanged` event:
```javascript
// Voices may not be available immediately
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => {
    // Voices now available
  };
}
```

### Pattern 3: SRS Jitter Implementation

**What:** Add random offset to `nextReviewDate` to prevent cards learned together from clustering.
**When to use:** Every time `calculateNextReview()` computes a new interval.

Anki's approach (verified from source): `min_ivl = max(2, round(ivl * 0.95 - 1))`, `max_ivl = round(ivl * 1.05 + 1)`. This is approximately +/-5% with a +/-1 day buffer.

The requirement specifies +/-10% which is simpler and more aggressive. For a children's game with shorter intervals, 10% is appropriate:

```javascript
// PROG-03: Add jitter to prevent review clustering
function addJitter(intervalDays) {
  const jitterRange = intervalDays * 0.1; // +/- 10%
  const jitter = (Math.random() * 2 - 1) * jitterRange; // Random between -10% and +10%
  return Math.max(1, Math.round(intervalDays + jitter));
}
```

### Pattern 4: Session Capping (New + Review Words)

**What:** Limit review sessions to max 3 new words + 7 review words.
**When to use:** When building the word list for a review session in `startLevel('review')`.

```javascript
// PROG-01 + PROG-02: Distinguish learned from unseen, cap sessions
function buildReviewSession(allWords, userProgress) {
  const now = Date.now();

  // Separate learned (has SRS state) from unseen (never played)
  const learned = [];
  const unseen = [];

  for (const word of allWords) {
    const srs = userProgress[word.id];
    if (srs) {
      learned.push({ ...word, srs });
    }
    // unseen words are NOT added to review -- PROG-01
  }

  // PROG-04: Sort by priority -- overdue first
  const due = learned.filter(w => w.srs.nextReviewDate <= now);
  due.sort((a, b) => a.srs.nextReviewDate - b.srs.nextReviewDate); // Most overdue first

  // PROG-02: Cap at 7 review + 3 new
  const reviewWords = due.slice(0, 7);

  // "New" in session context = learned words not yet due (optional fill)
  // But per PROG-01, unseen words NEVER appear in review
  // If fewer than 10 words, that's fine -- don't pad with unseen

  return reviewWords; // Max 10 words per session
}
```

### Pattern 5: Grammar Engine Synchronization

**What:** Replace the hardcoded `VOCAB` object in `grammarEngine.js` with data derived from the unified word bank.
**When to use:** CONT-08 requires grammar engine to use words from the unified data source.

Current grammar engine has a separate hardcoded VOCAB with 10 nouns, 8 adjectives, etc. The word bank will have 200+ words. The grammar engine should derive its vocabulary from the word bank:

```javascript
// Instead of hardcoded VOCAB, derive from word bank
import { initialWordData } from '../data/words';

// Extract nouns that have proper gender for grammar engine
const buildVocabFromWordBank = () => {
  const nouns = initialWordData
    .filter(w => w.type === 'word' && w.category === 'animals') // etc.
    .map(w => ({ en: w.word, he: w.hebrew, gender: w.gender, emoji: w.emoji }));
  // ... build adjectives, verbs from word bank or keep them separate
  return { nouns, adjectives: ADJECTIVES, verbs_transitive: VERBS_T, ... };
};
```

**Note:** Adjectives and verbs have grammatical agreement forms (he_m/he_f) that are different from noun data. The grammar engine's adjective and verb lists may need to remain separate or be stored in a different schema. Only nouns need to sync from the word bank.

### Anti-Patterns to Avoid

- **Authoring words without validation:** Never add words directly to the array without running `npm test` or loading the app. The fail-fast Zod validation will catch schema violations at import time.
- **Splitting word data across multiple files:** All 200+ words must live in a single `words.js` file (or be imported and merged there) to maintain the single source of truth established in Phase 2.
- **Adding `master` level to word schema:** The `master` level uses procedurally generated sentences from the grammar engine, not static word entries. The enum stays `['easy', 'medium', 'hard', 'expert']`.
- **Storing audio files:** Use Web Speech API only. No audio file storage.
- **Making SRS changes without tests:** The existing `srs.test.js` has 18 tests. Every SRS change must have corresponding test updates.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Text-to-speech | Custom audio recording pipeline | `window.speechSynthesis` | 94.5% browser coverage, zero bundle cost, no maintenance |
| Spaced repetition | Novel algorithm | SM-2 with jitter (already implemented, just needs fixes) | Well-studied, existing tests, children's game doesn't need FSRS complexity |
| Schema validation | Manual field checking | Zod v4 (already in place) | Fail-fast at import time, clear error messages, type inference |
| Word data format | CSV/JSON/YAML files | JavaScript module with Zod validation | Existing pattern, validated at import, tree-shakeable |

**Key insight:** Phase 3 introduces zero new libraries. All complexity is in content authoring and algorithm refinement, not technology adoption.

## Common Pitfalls

### Pitfall 1: SpeechSynthesis Voices Not Available on First Call

**What goes wrong:** `speechSynthesis.getVoices()` returns an empty array the first time it's called in Chrome and some other browsers. Code that selects a voice immediately on page load will fail silently.
**Why it happens:** Voices are loaded asynchronously in Chrome. The spec says they may not be available until the `voiceschanged` event fires.
**How to avoid:** Initialize voices lazily on first user interaction (tap speaker icon), not at component mount. Use `voiceschanged` event listener as fallback. If no voices available, degrade gracefully (speak with default voice, or show tooltip "audio not available").
**Warning signs:** Audio works in Safari but not in Chrome on first tap.

### Pitfall 2: SpeechSynthesis 15-Second Chrome Cutoff

**What goes wrong:** Chrome on Windows/Linux stops speech playback after approximately 15 seconds.
**Why it happens:** Known Chrome bug (since version 55, documented on Can I Use).
**How to avoid:** For single English vocabulary words (1-3 seconds of speech), this is a non-issue. Only affects long sentences. If implementing sentence pronunciation, consider breaking into chunks.
**Warning signs:** Long sentences get cut off mid-playback on Chrome desktop.

### Pitfall 3: Review Mode Surfacing Unseen Words

**What goes wrong:** The current `getDueWords()` returns words with no SRS state (treating them as "new and due"), which means unseen words flood review sessions.
**Why it happens:** Line 44 of `srs.js`: `if (!word.srs) return true;` -- this treats unseen words as due.
**How to avoid:** PROG-01 requires distinguishing "learned" (has SRS state from at least one play) from "unseen" (never played). `getDueWords()` must ONLY return words that have an existing SRS state AND are past their `nextReviewDate`.
**Warning signs:** Review mode shows words the player has never seen before.

### Pitfall 4: Hebrew Gender Hints Where Gender Is Irrelevant

**What goes wrong:** Adding `hint_m`/`hint_f` variants to every word, even when the hint doesn't use gendered Hebrew grammar. This wastes authoring effort and creates maintenance burden.
**Why it happens:** Over-applying the gender variant pattern.
**How to avoid:** Most word hints describe the object/concept, not the player. "חיה שאוהבת חלב" (an animal that loves milk) is gender-neutral -- it describes the cat, not the player. Only add `hint_m`/`hint_f` when the hint addresses the player directly (e.g., "האם אתה/את רוצה...") or uses a gendered verb/adjective referring to the player.
**Warning signs:** 90%+ of words have hint_m/hint_f when most should just have a single gender-neutral `hint`.

### Pitfall 5: Word Count Inflation Without Quality

**What goes wrong:** Rushing to 200 words leads to poor hints, wrong grammatical gender, or culturally inappropriate content for Hebrew-speaking children.
**Why it happens:** Prioritizing quantity over quality.
**How to avoid:** Author words in batches by category. Validate each batch: correct Hebrew gender, appropriate difficulty level, age-appropriate hints, natural example sentences. Run Zod validation after each batch.
**Warning signs:** Validation passes but hints don't make sense, or gender assignments are wrong for Hebrew grammar.

### Pitfall 6: Grammar Engine Becomes Coupled to Word Bank Shape

**What goes wrong:** Tightly coupling the grammar engine to the word bank makes future changes to either system require changes to both.
**Why it happens:** Directly importing and filtering word bank data inside grammar engine templates.
**How to avoid:** Build a thin adapter that extracts grammar-compatible data from the word bank at import time. The grammar engine continues to consume its own VOCAB-shaped data, but the data originates from the word bank. Adjectives and verbs (which have gender-agreement forms not in the word schema) can remain grammar-engine-specific.
**Warning signs:** Changing a word's category breaks grammar engine sentence generation.

### Pitfall 7: Jitter Making Tests Non-Deterministic

**What goes wrong:** Adding `Math.random()` jitter to SRS intervals makes test assertions fail unpredictably.
**Why it happens:** Tests expect exact interval values but get random offsets.
**How to avoid:** Extract jitter as a separate function that can be mocked in tests. OR: accept interval ranges in assertions (e.g., `expect(result.interval).toBeGreaterThanOrEqual(9)` and `toBeLessThanOrEqual(11)` for a 10-day interval with +/-10%). The existing test suite uses `vi.useFakeTimers()` which controls Date.now but not Math.random -- mock Math.random separately for deterministic jitter tests.
**Warning signs:** SRS tests become flaky (pass sometimes, fail others).

## Code Examples

### Example 1: Word Entry with Gender-Aware Hints (Content Pattern)

```javascript
// Word where hint IS gender-neutral (majority case)
{
  id: 'elephant',
  word: 'ELEPHANT',
  hebrew: 'פיל',
  hint: '🐘 החיה הכי גדולה ביבשה',  // Describes the animal, not the player
  // No hint_m/hint_f needed -- the hint is about the elephant
  category: 'animals',
  emoji: '🐘',
  level: 'medium',
  type: 'word',
  gender: 'm',
  exampleSentence: 'The elephant has big ears.',
  exampleSentence_he: 'לפיל יש אוזניים גדולות.',
},

// Word where hint REQUIRES gender variants (rare case)
{
  id: 'brave',
  word: 'BRAVE',
  hebrew: 'אמיץ',
  hint: '💪 מישהו שלא מפחד',  // Gender-neutral version
  hint_m: '💪 אתה אמיץ כשאתה לא מפחד',  // Addresses boy player
  hint_f: '💪 את אמיצה כשאת לא מפחדת',  // Addresses girl player
  category: 'emotions',
  emoji: '💪',
  level: 'medium',
  type: 'word',
  gender: 'm',  // Base Hebrew form is masculine
  exampleSentence: 'The brave knight saved the kingdom.',
  exampleSentence_he: 'האביר האמיץ הציל את הממלכה.',
},
```

### Example 2: SRS with Jitter and Learned/Unseen Distinction

```javascript
// Source: project requirement PROG-01 + PROG-03
export const calculateNextReview = (previousState, quality) => {
  let { interval, repetition, easeFactor } = previousState || {
    interval: 0,
    repetition: 0,
    easeFactor: 2.5,
  };

  if (quality >= 3) {
    if (repetition === 0) interval = 1;
    else if (repetition === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  // PROG-03: Add jitter (+/- 10%) to prevent review clustering
  const jitteredInterval = addJitter(interval);

  return {
    interval,            // Base interval (for algorithm, not scheduling)
    repetition,
    easeFactor,
    nextReviewDate: Date.now() + jitteredInterval * 24 * 60 * 60 * 1000,
  };
};

function addJitter(intervalDays) {
  if (intervalDays <= 1) return intervalDays; // No jitter for 1-day intervals
  const jitterRange = intervalDays * 0.1;
  const jitter = (Math.random() * 2 - 1) * jitterRange;
  return Math.max(1, Math.round(intervalDays + jitter));
}

// PROG-01: Only return LEARNED words that are due
export const getDueWords = (allWords) => {
  const now = Date.now();
  return allWords.filter(word => {
    if (!word.srs) return false; // CHANGED: unseen words are NOT due
    return word.srs.nextReviewDate <= now;
  });
};
```

### Example 3: Review Session Builder with Caps

```javascript
// Source: project requirements PROG-01, PROG-02, PROG-04
export function buildReviewSession(allWords, userProgress, maxNew = 3, maxReview = 7) {
  const now = Date.now();

  // PROG-01: Separate learned from unseen
  const withSRS = allWords
    .filter(w => userProgress[w.id])
    .map(w => ({ ...w, srs: userProgress[w.id] }));

  // PROG-04: Sort due words by priority (most overdue first)
  const dueWords = withSRS
    .filter(w => w.srs.nextReviewDate <= now)
    .sort((a, b) => a.srs.nextReviewDate - b.srs.nextReviewDate);

  // PROG-02: Cap at maxReview (7) review words
  const reviewSlice = dueWords.slice(0, maxReview);

  // Remaining slots can be filled with learned-but-not-yet-due words
  // But NEVER unseen words (PROG-01)
  // Total session: max 10 words (3 new-ish + 7 review)

  return reviewSlice;
}
```

### Example 4: SpeechSynthesis Utility

```javascript
// CONT-05: Audio pronunciation via Web Speech API
let voicesLoaded = false;
let voices = [];

export function initVoices() {
  if (voicesLoaded) return;
  voices = window.speechSynthesis?.getVoices() || [];
  if (voices.length > 0) {
    voicesLoaded = true;
  } else if (window.speechSynthesis?.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      voicesLoaded = true;
    };
  }
}

export function speakWord(text) {
  const synth = window.speechSynthesis;
  if (!synth) return false;

  synth.cancel(); // Stop any in-progress speech
  initVoices();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.8; // Slightly slower for children

  // Prefer a clear English voice
  const englishVoice = voices.find(v =>
    v.lang.startsWith('en') && v.localService
  );
  if (englishVoice) utterance.voice = englishVoice;

  synth.speak(utterance);
  return true;
}

export function isSpeechSupported() {
  return 'speechSynthesis' in window;
}
```

### Example 5: Category Enum for Word Bank Organization

```javascript
// CONT-02: 8-10 themed categories
// Source: project requirements
const WORD_CATEGORIES = [
  'animals',     // Animals: cat, dog, elephant, bird, fish, etc.
  'food',        // Food: apple, bread, milk, pizza, etc.
  'family',      // Family: mother, father, sister, brother, etc.
  'colors',      // Colors: red, blue, green, yellow, etc.
  'nature',      // Nature: sun, moon, tree, flower, water, etc.
  'body',        // Body: head, hand, eye, heart, etc.
  'actions',     // Actions: run, jump, eat, sleep, read, etc.
  'home',        // Home/School: table, chair, door, pencil, etc.
  'emotions',    // Emotions: happy, sad, brave, scared, etc.
  'professions', // Professions: teacher, doctor, firefighter, etc.
];
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SM-2 raw intervals | SM-2 + fuzz/jitter | Standard since Anki adopted it | Prevents review clustering; our PROG-03 |
| Fixed session sizes | Configurable new/review caps | Standard practice | Prevents overwhelm; our PROG-02 |
| Zod v3 `.merge()` | Zod v4 `.extend()` or spread | Zod v4 (2024-2025) | `.merge()` deprecated; use `.extend()` |
| Pre-recorded audio per word | Web Speech API SpeechSynthesis | Baseline since 2018 | 94.5% browser support, zero-cost |

**Deprecated/outdated:**
- Zod v3's `.merge()`: Deprecated in Zod v4. Use `.extend()` instead. Source: [Zod v4 changelog](https://zod.dev/v4/changelog)

## Codebase-Specific Findings

### Current State Summary

| Area | Current State | Phase 3 Target | Gap |
|------|---------------|----------------|-----|
| Word count | 13 words | 200+ words | Need ~190 more words |
| Categories | Implicit (animals, nature, emotions, objects) | 8-10 explicit enum values | Need category enum in schema |
| Hint format | Single `hint` string | `hint` + optional `hint_m`/`hint_f` | Need schema extension |
| Example sentences | English only | English + Hebrew bilingual | Need `exampleSentence_he` field |
| Audio | None (voice recognition exists) | SpeechSynthesis TTS | Need new utility + UI speaker icon |
| SRS learned/unseen | `getDueWords` treats no-SRS as due | Only learned words in review | Need to flip `!word.srs` logic |
| Session caps | `.slice(0, 10)` hardcoded | 3 new + 7 review | Need new session builder |
| Jitter | None | +/-10% on nextReviewDate | Need `addJitter()` function |
| Priority sorting | None (natural array order) | Overdue first | Need sort by nextReviewDate |
| Grammar engine VOCAB | Hardcoded 10 nouns, 8 adj, etc. | Derived from word bank | Need sync adapter |
| NPC dialogues gender | Masculine-only ("אתה", "נסה") | Gender-neutral or boy/girl variants | Need gender audit |
| Encouragement messages | Masculine-only | Gender-neutral or boy/girl variants | Need gender audit |

### Files That Need Changes

| File | Change Type | Scope |
|------|-------------|-------|
| `src/data/wordSchema.js` | Extend | Add `hint_m`, `hint_f`, `exampleSentence_he`, category enum |
| `src/data/words.js` | Major rewrite | Expand from 13 to 200+ words |
| `src/utils/srs.js` | Modify | Add jitter, fix getDueWords for learned-only |
| `src/hooks/useGameLogic.js` | Modify | New session builder with caps and priority |
| `src/utils/grammarEngine.js` | Modify | Derive nouns from word bank |
| `src/data/story.js` | Audit/modify | Gender variants for ENCOURAGEMENT + NPC dialogues |
| `src/components/screens/PlayingScreen.jsx` | Extend | Add speaker icon, display hint |
| NEW: `src/utils/speech.js` | Create | SpeechSynthesis utility |

### Existing Test Coverage to Maintain

| Test File | Tests | Touches |
|-----------|-------|---------|
| `src/utils/srs.test.js` | 18 | Must update for jitter + getDueWords changes |
| `src/utils/grammarEngine.test.js` | 10 | Must update for VOCAB sync changes |
| `src/utils/storage.test.js` | 15 | No changes expected |
| `src/__tests__/WordAdventure.snapshot.test.jsx` | 6 | May need snapshot updates |
| **Total** | **51** | |

## Open Questions

1. **Category field: enum or free string?**
   - What we know: Requirements list 10 categories. Current schema uses `z.string().min(1)` for category.
   - What's unclear: Should we lock the category to an enum (prevents typos but requires schema change for new categories) or keep it as a free string (flexible but no typo protection)?
   - Recommendation: Use `z.enum([...])` for the 10 categories. Phase 3 defines the categories; future phases can extend the enum. Typo protection is worth the schema rigidity at 200+ words.

2. **How many words actually need hint_m/hint_f?**
   - What we know: Most Hebrew hints describe objects/concepts (gender-neutral). Only hints that address the player directly need gender variants.
   - What's unclear: Exact count. Could be 10% or 30% of words.
   - Recommendation: Author all words with gender-neutral `hint` first. Only add `hint_m`/`hint_f` for the subset where Hebrew grammar truly requires it. Make these fields optional in the schema.

3. **Grammar engine: sync nouns only, or also adjectives/verbs?**
   - What we know: The word bank schema has `gender` but no adjective/verb forms (he_m/he_f). The grammar engine needs these agreement forms.
   - What's unclear: Whether adjectives and verbs should be added to the word bank or remain grammar-engine-specific.
   - Recommendation: Sync nouns from word bank. Keep adjectives and verbs as grammar-engine-specific data (they have a fundamentally different shape with he_m/he_f forms that don't fit the word schema). This satisfies CONT-08 (nouns come from unified source) without over-engineering the word schema.

4. **Word level distribution across categories**
   - What we know: Need 200+ words across 4 levels (easy/medium/hard/expert) and 10 categories.
   - What's unclear: Exact distribution. Equal distribution = ~5 words per level per category. Some categories may have more easy words (animals, colors) and fewer expert words.
   - Recommendation: Aim for 20+ words per category minimum. Distribute levels based on English word complexity (letter count, frequency). Easy: 3-4 letters. Medium: 5-6 letters. Hard: 7-8 letters. Expert: 9+ letters.

5. **Review session "3 new words" definition**
   - What we know: PROG-02 says "3 new + 7 review." Per PROG-01, unseen words never appear in review.
   - What's unclear: What counts as "new" in this context? Possibly "recently learned words not yet due for review" (learned but interval hasn't elapsed yet).
   - Recommendation: Interpret "3 new" as words the player has played only 1-2 times (low repetition count). "7 review" as words with higher repetition that are overdue. This gives review sessions a mix of fresh and established material without surfacing completely unseen words.

## Sources

### Primary (HIGH confidence)

- **Zod v4 docs** (`/websites/zod_dev_v4` via Context7) - Schema extension with `.extend()`, deprecated `.merge()`, optional fields, discriminated unions
- **MDN SpeechSynthesis** ([developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)) - Full API documentation, browser compatibility, voiceschanged event pattern
- **Codebase analysis** - Direct reading of all 40+ source files in `src/`

### Secondary (MEDIUM confidence)

- **Can I Use: Speech Synthesis** ([caniuse.com/speech-synthesis](https://caniuse.com/speech-synthesis)) - 94.52% global browser support, Chrome 15-second cutoff bug noted
- **Anki SM-2 FAQ** ([faqs.ankiweb.net](https://faqs.ankiweb.net/what-spaced-repetition-algorithm)) - Five key divergences from SM-2: learning flexibility, response choices, late reviews, failure handling, ease factor protection
- **Anki fuzz factor** (GitHub issues, Anki forums, source analysis) - Fuzz formula: `min_ivl = max(2, round(ivl * 0.95 - 1))`, `max_ivl = round(ivl * 1.05 + 1)`, approximately +/-5% with buffer

### Tertiary (LOW confidence)

- **Hebrew gender patterns** (WebSearch aggregation) - Hebrew has no neuter gender for nouns; all nouns are m/f. Most feminine nouns end in ה or ת. Gender-neutral phrasing is possible in limited contexts. LOW confidence because this is linguistic knowledge not verified against authoritative grammar reference.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, all tools already in codebase and verified
- Architecture: HIGH - Patterns extend existing proven patterns from Phase 2
- Content authoring: MEDIUM - Hebrew linguistic quality requires domain expertise beyond what automated tools can verify
- SRS algorithm: HIGH - Well-documented SM-2 modifications with clear implementation patterns
- Pitfalls: HIGH - Derived from direct codebase analysis and documented browser behavior

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (stable domain, no fast-moving dependencies)
