# Phase 4: Challenge Types and Levels - Research

**Researched:** 2026-02-15
**Domain:** React game UI components, drag-and-drop, adaptive difficulty, level/theme system
**Confidence:** HIGH

## Summary

Phase 4 transforms the current single-challenge-type game (spelling via LetterPicker) into a multi-challenge system with five distinct mechanics, adaptive difficulty selection based on SRS mastery, and 10+ themed progressive levels. The codebase is well-positioned for this: the existing `PlayingScreen` and `useGameLogic` hook provide clear integration points, the SRS system (`srs.js`) already tracks per-word `repetition` counts usable for mastery-based challenge selection, and the grammar engine (`grammarEngine.js`) is ready for grammar challenge generation.

The most significant architectural decision is the **Challenge Interface Contract** -- each challenge type must be a standalone React component that receives the same props contract and calls the same `onAnswer(isCorrect)` callback. The existing `PlayingScreen` currently hardcodes LetterPicker; it needs to become a dispatcher that selects the right challenge component based on challenge type. For the sentence building drag-and-drop (CHAL-05), **framer-motion's built-in `Reorder` components** (already a project dependency at v12.23) should be used instead of adding @dnd-kit, since the sentence reordering use case is a simple single-axis list reorder that Reorder.Group handles natively.

**Primary recommendation:** Build five challenge components behind a unified interface, use framer-motion Reorder for sentence building, implement a `selectChallengeType(word, srsState)` pure function for adaptive difficulty, and expand the level system from difficulty-based (easy/medium/hard/expert/master) to numbered levels (1-12+) each mapped to a category+difficulty combination with themed visual config.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.0 | UI framework | Already in project |
| framer-motion | 12.23.26 | Animation + Reorder drag-and-drop | Already in project; Reorder.Group/Item provides drag-to-reorder without new dependency |
| zustand | 5.0.11 | State management | Already in project |
| zod | 4.3.6 | Schema validation for level/challenge configs | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Web Speech API (browser) | N/A | SpeechSynthesis for listening challenges (CHAL-04) | Already used via `src/utils/speech.js`; `speakWord()` and `isSpeechSupported()` exist |
| lucide-react | 0.562.0 | Icons for UI elements | Already in project |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| framer-motion Reorder | @dnd-kit/core + @dnd-kit/sortable | dnd-kit is more powerful (multi-axis, multiple containers, collision detection) but adds 3 new packages for a use case that framer-motion Reorder handles natively. The sentence building challenge is a single-axis horizontal reorder -- Reorder.Group with `axis="x"` is sufficient. |
| Custom adaptive difficulty | External SRS libraries | The existing SM-2 implementation in `srs.js` already provides `repetition` and `easeFactor` -- these are sufficient signals for challenge type selection without new libraries. |

**Installation:**
```bash
# No new packages needed -- all dependencies already exist in the project
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── challenges/              # NEW: Challenge type components
│   │   ├── SpellingChallenge.jsx      # CHAL-01: Existing LetterPicker, wrapped
│   │   ├── MultipleChoiceChallenge.jsx # CHAL-02: Hebrew -> English 4-option
│   │   ├── ReverseChoiceChallenge.jsx  # CHAL-03: English -> Hebrew 4-option
│   │   ├── ListeningChallenge.jsx      # CHAL-04: Hear word, select answer
│   │   ├── SentenceBuildChallenge.jsx  # CHAL-05: Drag-and-drop reorder
│   │   ├── GrammarChallenge.jsx        # CHAL-06: Gender/verb conjugation
│   │   └── ChallengeDispatcher.jsx     # Routes to correct challenge component
│   └── screens/
│       └── PlayingScreen.jsx    # MODIFIED: Uses ChallengeDispatcher
├── utils/
│   ├── challengeSelector.js     # NEW: selectChallengeType(word, srsState)
│   ├── distractorGenerator.js   # NEW: Generate plausible wrong answers
│   └── srs.js                   # EXISTING: SRS data used for mastery signals
├── data/
│   ├── words.js                 # EXISTING: 201 words across 10 categories
│   ├── levels.js                # NEW: Level definitions (10+ levels with themes)
│   └── story.js                 # MODIFIED: Expanded chapters for new levels
└── config/
    └── constants.js             # MODIFIED: Challenge type enum, level config
```

### Pattern 1: Challenge Interface Contract
**What:** Every challenge component implements the same props interface so PlayingScreen can dispatch to any challenge type without knowing its internals.
**When to use:** For all five challenge types + grammar challenges.
**Example:**
```jsx
// Every challenge component receives these props:
// {
//   word: Object,          // The current word/challenge data
//   onAnswer: (isCorrect: boolean) => void,  // Report answer result
//   disabled: boolean,     // Whether input is disabled (during feedback)
//   playerGender: string,  // 'boy' | 'girl' for gendered hints
//   t: Function,           // Gender-aware text helper
// }

// ChallengeDispatcher.jsx
export default function ChallengeDispatcher({ challengeType, ...props }) {
    switch (challengeType) {
        case 'spelling':
            return <SpellingChallenge {...props} />;
        case 'multipleChoice':
            return <MultipleChoiceChallenge {...props} />;
        case 'reverseChoice':
            return <ReverseChoiceChallenge {...props} />;
        case 'listening':
            return <ListeningChallenge {...props} />;
        case 'sentenceBuild':
            return <SentenceBuildChallenge {...props} />;
        case 'grammar':
            return <GrammarChallenge {...props} />;
        default:
            return <SpellingChallenge {...props} />;
    }
}
```

### Pattern 2: Adaptive Challenge Selection (Pure Function)
**What:** A pure function that maps word mastery level to appropriate challenge types, with randomization within the appropriate difficulty band.
**When to use:** When starting a level or moving to the next word.
**Example:**
```javascript
// challengeSelector.js
const CHALLENGE_DIFFICULTY = {
    multipleChoice: 1,    // Easiest -- recognition
    reverseChoice: 2,     // Slightly harder -- reverse direction
    listening: 3,         // Medium -- audio recognition
    spelling: 4,          // Hard -- recall + construct
    sentenceBuild: 5,     // Hardest -- sentence-level production
};

export function selectChallengeType(word, srsState) {
    const repetition = srsState?.repetition ?? 0;

    // New words (rep 0-1): only easy types
    if (repetition <= 1) {
        return pickRandom(['multipleChoice', 'reverseChoice']);
    }
    // Learning (rep 2-3): add listening
    if (repetition <= 3) {
        return pickRandom(['multipleChoice', 'reverseChoice', 'listening']);
    }
    // Familiar (rep 4-5): add spelling
    if (repetition <= 5) {
        return pickRandom(['reverseChoice', 'listening', 'spelling']);
    }
    // Mastered (rep 6+): hardest types, occasional easier for variety
    return pickRandom(['spelling', 'sentenceBuild', 'listening']);
}
```

### Pattern 3: Distractor Generation (Wrong Answer Options)
**What:** Generate plausible-but-wrong answer options for multiple choice challenges from the word bank.
**When to use:** For CHAL-02, CHAL-03, CHAL-04, and CHAL-06.
**Example:**
```javascript
// distractorGenerator.js
import { initialWordData } from '../data/words';

export function generateDistractors(correctWord, count = 3) {
    const sameCategory = initialWordData.filter(
        w => w.category === correctWord.category && w.id !== correctWord.id
    );
    const otherWords = initialWordData.filter(
        w => w.category !== correctWord.category && w.id !== correctWord.id
    );

    // Prefer same-category distractors (more plausible), fill with others
    const pool = [...shuffleArray(sameCategory), ...shuffleArray(otherWords)];
    return pool.slice(0, count);
}
```

### Pattern 4: Level Configuration Data
**What:** Level definitions as static data objects, each specifying which categories, difficulty range, word count, theme, and unlock requirements apply.
**When to use:** For CHAL-08, CHAL-09, CHAL-10.
**Example:**
```javascript
// data/levels.js
export const LEVELS = [
    {
        id: 1,
        name: 'שער הממלכה',
        subtitle: 'The Kingdom Gate',
        categories: ['animals'],
        difficulty: 'easy',
        wordCount: 8,
        theme: {
            bgGradient: 'from-green-400 to-emerald-600',
            emoji: '🏰',
            npcIcon: '👸',
        },
        unlockRequirement: 0,      // Available from start
        storyChapter: 'easy',      // Links to existing CHAPTERS
    },
    {
        id: 2,
        name: 'גן החיות',
        subtitle: 'The Animal Garden',
        categories: ['animals'],
        difficulty: 'medium',
        wordCount: 10,
        theme: {
            bgGradient: 'from-lime-400 to-green-600',
            emoji: '🦁',
            npcIcon: '🧚',
        },
        unlockRequirement: 1,      // Complete level 1
    },
    // ... 10+ levels total
];
```

### Pattern 5: Sentence Building with framer-motion Reorder
**What:** Use `Reorder.Group` and `Reorder.Item` for drag-to-reorder sentence word tiles.
**When to use:** For CHAL-05 sentence building.
**Example:**
```jsx
import { Reorder } from 'framer-motion';

function SentenceBuildChallenge({ word, onAnswer, disabled }) {
    const [items, setItems] = useState(
        shuffleArray(word.word.split(' '))
    );

    const handleSubmit = () => {
        const isCorrect = items.join(' ').toUpperCase() === word.word.toUpperCase();
        onAnswer(isCorrect);
    };

    return (
        <div>
            <h3>{word.hebrew}</h3>
            <Reorder.Group
                axis="x"
                values={items}
                onReorder={setItems}
                className="flex flex-wrap gap-2 justify-center"
            >
                {items.map((item) => (
                    <Reorder.Item
                        key={item}
                        value={item}
                        className="px-4 py-2 bg-yellow-300 rounded-xl cursor-grab"
                        whileDrag={{ scale: 1.1, zIndex: 10 }}
                    >
                        {item}
                    </Reorder.Item>
                ))}
            </Reorder.Group>
            <button onClick={handleSubmit} disabled={disabled}>Check</button>
        </div>
    );
}
```

### Anti-Patterns to Avoid
- **Monolithic PlayingScreen:** Do not add switch/case logic for challenge rendering inside PlayingScreen itself. Extract a ChallengeDispatcher component that PlayingScreen delegates to. PlayingScreen should only handle lives, feedback overlay, and progress -- not challenge-specific rendering.
- **Coupling challenge type to word data:** Do not store `challengeType` in the word data schema. Challenge type is a runtime decision based on mastery level, not a property of the word itself. The `selectChallengeType` function makes this decision at play time.
- **Hard-coding level order in components:** Level definitions should be data-driven (a `LEVELS` array), not embedded in JSX. The MapScreen should iterate over the levels array, not have a hard-coded list of level buttons.
- **Duplicate word items in Reorder:** framer-motion Reorder requires unique `value` props. If a sentence has duplicate words (e.g., "THE CAT SEES THE DOG"), each word needs a unique identifier (e.g., append index: "THE_0", "CAT_1", etc.), with display text separated from the value key.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop reorder | Custom touch event handling for sentence tiles | `framer-motion` `Reorder.Group` + `Reorder.Item` | Touch/mouse/keyboard support built-in, handles reorder detection, animation, and z-index management automatically |
| Text-to-speech | Custom audio file management | Browser `SpeechSynthesis` API via existing `speakWord()` | Already implemented in `src/utils/speech.js` at 0.8x rate for children |
| Answer shuffling | Custom Fisher-Yates | Existing `shuffleArray` in `useGameLogic` | Already implemented, just extract to a shared utility |
| SRS mastery signals | New mastery tracking system | Existing `userProgress[wordId].repetition` from `srs.js` | SM-2 `repetition` count directly encodes how many successful reviews a word has had |

**Key insight:** The project already has most building blocks in place. The main work is creating new UI components (challenge types) and a selection/dispatch layer, not new infrastructure.

## Common Pitfalls

### Pitfall 1: Duplicate Values in Reorder.Item
**What goes wrong:** framer-motion `Reorder.Item` requires unique `value` props. Sentences like "THE CAT SEES THE DOG" have duplicate words ("THE" appears twice), causing incorrect reorder behavior.
**Why it happens:** Developers pass the raw word string as the value without deduplication.
**How to avoid:** Create unique value keys by appending indices (e.g., `{id: 'THE_0', text: 'THE'}`), and use the `id` as the Reorder.Item value while displaying `text`.
**Warning signs:** Words snapping to wrong positions during drag, or console warnings about duplicate keys.

### Pitfall 2: SpeechSynthesis on iOS Safari
**What goes wrong:** `speechSynthesis.getVoices()` returns empty array on first call in Safari; speech may stop working if app goes to background.
**Why it happens:** Safari loads voices asynchronously and has aggressive background tab throttling.
**How to avoid:** The existing `speech.js` already handles this with `onvoiceschanged` listener. For CHAL-04, always provide a visual fallback (show the English text after a delay) when speech fails. Never make speech the sole means of conveying the challenge.
**Warning signs:** Listening challenge showing no audio feedback on iOS, test devices returning `isSpeechSupported() === true` but `speakWord()` silently failing.

### Pitfall 3: Level Count vs Word Count Mismatch
**What goes wrong:** Designing 10+ levels but not having enough words per category to fill them meaningfully.
**Why it happens:** The word bank has 201 words across 10 categories, but distribution is uneven (animals: 22, colors: 15, expert: only 19 total).
**How to avoid:** Each level should draw from 1-2 categories and mix difficulty levels. With 201 words and 10+ levels, budget 12-20 words per level. Levels can share words across different challenge types (seeing "CAT" as multiple choice in level 1 and as spelling in level 5 is fine -- different challenge types make it a different experience).
**Warning signs:** Levels with fewer than 8 challenges, or a level that can be completed in under 60 seconds.

### Pitfall 4: Challenge Type Selection Becomes Predictable
**What goes wrong:** Players notice a strict pattern (e.g., "new words are always multiple choice, old words are always spelling") and game feels mechanical.
**Why it happens:** Deterministic mapping from mastery to challenge type without randomization.
**How to avoid:** The `selectChallengeType` function should pick randomly from a pool of appropriate types, not deterministically. The pool narrows/widens based on mastery, but within the pool, selection is random. Also ensure variety within a single level session -- avoid 5 multiple-choice questions in a row.
**Warning signs:** Players can predict the next challenge type before seeing it.

### Pitfall 5: Breaking Existing Snapshot Tests
**What goes wrong:** Modifying PlayingScreen or useGameLogic breaks the existing snapshot test in `__tests__/WordAdventure.snapshot.test.jsx`.
**Why it happens:** The snapshot test renders PlayingScreen through the full WordAdventure component and asserts on the exact DOM output.
**How to avoid:** After modifying PlayingScreen to use ChallengeDispatcher, update the snapshot (`vitest run -u`). Ensure new challenge components use prop drilling (not useGame context) per prior decision [02-03]. Add dedicated unit tests for each challenge component.
**Warning signs:** `vitest run` failing on snapshot mismatch after PlayingScreen changes.

### Pitfall 6: Grammar Challenges at Wrong Difficulty
**What goes wrong:** Grammar challenges (CHAL-06) appearing too early or too frequently, frustrating new players.
**Why it happens:** Grammar challenges are harder than basic vocabulary -- they test gender agreement and verb conjugation, requiring prior word knowledge.
**How to avoid:** Only inject grammar challenges in levels where players have demonstrated mastery of the underlying nouns. The grammar engine uses `animals`, `family`, `professions` categories (decision [03-04]) -- grammar challenges should only appear in levels that use those categories AND where the player's SRS repetition for the involved words is >= 3.
**Warning signs:** Players encountering "THE DOG IS BIG" grammar challenge before ever learning "DOG" as vocabulary.

## Code Examples

### Multiple Choice Challenge Component (CHAL-02)
```jsx
// Source: Project architecture pattern, verified against existing codebase patterns
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { generateDistractors } from '../../utils/distractorGenerator';
import { hapticFeedback } from '../../utils/mobile';

export default function MultipleChoiceChallenge({ word, onAnswer, disabled, t }) {
    const options = useMemo(() => {
        const distractors = generateDistractors(word, 3);
        const all = [
            { text: word.word, isCorrect: true },
            ...distractors.map(d => ({ text: d.word, isCorrect: false })),
        ];
        // Shuffle options
        return all.sort(() => Math.random() - 0.5);
    }, [word.id]);

    const handleSelect = (option) => {
        if (disabled) return;
        hapticFeedback(option.isCorrect ? 'success' : 'error');
        onAnswer(option.isCorrect);
    };

    return (
        <div className="text-center">
            <span className="text-slate-400 text-sm tracking-widest font-bold">
                {t('בחר', 'בחרי')} את התרגום הנכון
            </span>
            <h2 className="text-6xl font-black text-slate-800 my-6">{word.hebrew}</h2>
            <div className="grid grid-cols-2 gap-3">
                {options.map((opt, idx) => (
                    <motion.button
                        key={idx}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect(opt)}
                        disabled={disabled}
                        className="p-4 bg-gradient-to-b from-blue-100 to-blue-200
                                   text-blue-800 rounded-2xl font-bold text-lg
                                   shadow-md hover:from-blue-200 hover:to-blue-300
                                   disabled:opacity-50 transition-all"
                    >
                        {opt.text}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
```

### Listening Challenge Component (CHAL-04)
```jsx
// Source: Built on existing speech.js utility
import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { speakWord, isSpeechSupported } from '../../utils/speech';
import { generateDistractors } from '../../utils/distractorGenerator';
import { hapticFeedback } from '../../utils/mobile';

export default function ListeningChallenge({ word, onAnswer, disabled, t }) {
    const options = useMemo(() => {
        const distractors = generateDistractors(word, 3);
        const all = [
            { text: word.word, hebrew: word.hebrew, isCorrect: true },
            ...distractors.map(d => ({ text: d.word, hebrew: d.hebrew, isCorrect: false })),
        ];
        return all.sort(() => Math.random() - 0.5);
    }, [word.id]);

    // Auto-speak on mount
    useEffect(() => {
        if (isSpeechSupported()) {
            speakWord(word.word);
        }
    }, [word.id]);

    const handleSelect = (option) => {
        if (disabled) return;
        hapticFeedback(option.isCorrect ? 'success' : 'error');
        onAnswer(option.isCorrect);
    };

    return (
        <div className="text-center">
            <span className="text-slate-400 text-sm tracking-widest font-bold">
                {t('הקשב ובחר', 'הקשיבי ובחרי')} את המילה הנכונה
            </span>
            <button
                onClick={() => speakWord(word.word)}
                className="mx-auto my-6 bg-blue-500 text-white rounded-full p-6 shadow-lg"
            >
                <Volume2 size={48} />
            </button>
            <div className="grid grid-cols-2 gap-3">
                {options.map((opt, idx) => (
                    <motion.button
                        key={idx}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect(opt)}
                        disabled={disabled}
                        className="p-4 bg-gradient-to-b from-purple-100 to-purple-200
                                   text-purple-800 rounded-2xl font-bold text-lg shadow-md"
                    >
                        {opt.text}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
```

### Sentence Build with Reorder (CHAL-05)
```jsx
// Source: framer-motion Reorder API (https://motion.dev/docs/react-reorder)
import React, { useState, useMemo } from 'react';
import { Reorder, motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/mobile';

export default function SentenceBuildChallenge({ word, onAnswer, disabled, t }) {
    // Create unique items for Reorder (handles duplicate words)
    const initialItems = useMemo(() => {
        const words = word.word.split(' ');
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        return shuffled.map((w, i) => ({ id: `${w}_${i}`, text: w }));
    }, [word.id]);

    const [items, setItems] = useState(initialItems);

    const handleSubmit = () => {
        if (disabled) return;
        const assembled = items.map(i => i.text).join(' ');
        const isCorrect = assembled.toUpperCase() === word.word.toUpperCase();
        hapticFeedback(isCorrect ? 'success' : 'error');
        onAnswer(isCorrect);
    };

    return (
        <div className="text-center">
            <span className="text-slate-400 text-sm tracking-widest font-bold">
                {t('סדר', 'סדרי')} את המשפט
            </span>
            <h2 className="text-4xl font-black text-slate-800 my-6">{word.hebrew}</h2>
            <Reorder.Group
                axis="x"
                values={items}
                onReorder={setItems}
                className="flex flex-wrap gap-2 justify-center min-h-[60px] p-4
                           bg-white border-4 border-slate-100 rounded-2xl mb-4"
                as="div"
            >
                {items.map((item) => (
                    <Reorder.Item
                        key={item.id}
                        value={item}
                        className="px-4 py-3 bg-gradient-to-b from-yellow-300 to-yellow-400
                                   text-yellow-800 rounded-xl font-bold text-xl cursor-grab
                                   shadow-md select-none"
                        whileDrag={{ scale: 1.1, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                        style={{ position: 'relative' }}
                    >
                        {item.text}
                    </Reorder.Item>
                ))}
            </Reorder.Group>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={disabled}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600
                           text-white rounded-2xl font-bold text-xl shadow-lg
                           disabled:opacity-50"
            >
                {t('בדיקה', 'בדיקה')}
            </motion.button>
        </div>
    );
}
```

### Adaptive Challenge Selection
```javascript
// Source: Designed based on SRS mastery model in src/utils/srs.js
const CHALLENGE_POOLS = {
    new:       ['multipleChoice', 'reverseChoice'],           // rep 0-1
    learning:  ['multipleChoice', 'reverseChoice', 'listening'], // rep 2-3
    familiar:  ['reverseChoice', 'listening', 'spelling'],    // rep 4-5
    mastered:  ['spelling', 'sentenceBuild', 'listening'],    // rep 6+
};

export function selectChallengeType(word, srsState, recentTypes = []) {
    const rep = srsState?.repetition ?? 0;

    let pool;
    if (rep <= 1) pool = CHALLENGE_POOLS.new;
    else if (rep <= 3) pool = CHALLENGE_POOLS.learning;
    else if (rep <= 5) pool = CHALLENGE_POOLS.familiar;
    else pool = CHALLENGE_POOLS.mastered;

    // Sentence build only for sentence-type words
    if (word.type !== 'sentence') {
        pool = pool.filter(t => t !== 'sentenceBuild');
    }

    // Avoid repeating the same challenge type twice in a row
    if (recentTypes.length > 0) {
        const lastType = recentTypes[recentTypes.length - 1];
        const filtered = pool.filter(t => t !== lastType);
        if (filtered.length > 0) pool = filtered;
    }

    return pool[Math.floor(Math.random() * pool.length)];
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd for drag-and-drop | framer-motion Reorder or @dnd-kit | react-beautiful-dnd deprecated 2024 | No impact -- project never used it |
| @dnd-kit/core v6 (legacy API) | @dnd-kit/react v0.2 (new API) | 2025 | @dnd-kit/react is still pre-1.0; legacy @dnd-kit/core is stable. But for this project, framer-motion Reorder avoids the dependency entirely |
| Static difficulty levels | Adaptive challenge selection | Current best practice in language learning apps (Duolingo, Memrise) | Challenge type should vary based on mastery, not just word difficulty |

**Deprecated/outdated:**
- `react-beautiful-dnd`: Deprecated, unmaintained. Do not use.
- `react-sortable-hoc`: Predecessor to dnd-kit by same author. Superseded.

## Open Questions

1. **Reorder.Group with wrapped/multiline content**
   - What we know: `Reorder.Group` with `axis="x"` works for horizontal single-line reorder. Sentences with many words may wrap to multiple lines.
   - What's unclear: How Reorder handles flex-wrap scenarios. The axis is locked to "x" but items may visually be on different rows.
   - Recommendation: For long sentences, use a vertical axis (`axis="y"`) with word tiles as horizontal-flowing items within each "slot", or limit sentence building challenges to short sentences (4-6 words). Test with the longest sentences in the grammar engine (subject + verb + object = 5-7 words). If wrapping causes issues, fall back to the existing tap-to-select LetterPicker pattern but with word tiles instead of letters (this is what the current sentence mode already does).

2. **Level unlocking -- linear vs branching**
   - What we know: Current system uses word-count-based unlocking (5, 10, 15, 20 words). Phase 4 needs 10+ levels.
   - What's unclear: Should levels unlock linearly (complete level N to unlock N+1) or based on total words learned?
   - Recommendation: Use linear unlocking (complete previous level) for the main progression path. This is simpler, ensures players experience levels in order, and matches the "journey with story continuity" requirement (CHAL-10). Total words learned can still gate major story milestones.

3. **Grammar challenge integration with adaptive system**
   - What we know: Grammar challenges (CHAL-06) use `grammarEngine.js` which generates sentences with gender agreement. Decision [03-04] limits noun sources to animals, family, professions.
   - What's unclear: How grammar challenges fit into the `selectChallengeType` flow since grammar challenges aren't word-specific -- they're procedurally generated.
   - Recommendation: Inject grammar challenges as bonus rounds within levels that use the grammar-eligible categories (animals, family, professions). E.g., after every 3-4 vocabulary challenges in such a level, insert one grammar challenge. This keeps them at lower frequency while ensuring they appear in contextually appropriate levels.

4. **Theme implementation depth**
   - What we know: CHAL-09 requires "unique background colors, atmospheric styling, themed decorations."
   - What's unclear: How elaborate the theming needs to be -- just color changes, or full background illustrations/particles?
   - Recommendation: Start with gradient backgrounds (like existing CHAPTERS), themed emoji decorations, and distinct color schemes per level. This is achievable with Tailwind CSS classes alone. Full illustrations/particles can be deferred.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/components/LetterPicker.jsx`, `src/components/screens/PlayingScreen.jsx`, `src/hooks/useGameLogic.js`, `src/utils/srs.js`, `src/utils/grammarEngine.js`, `src/data/words.js` (201 words), `src/data/story.js`, `src/store/gameStore.js`, `src/data/wordSchema.js`
- Context7: `/websites/next_dndkit` -- sortable list patterns, touch/mouse sensor configuration
- Context7: `/websites/motion_dev` -- layout animations, drag gestures, Reorder API
- framer-motion Reorder docs: https://motion.dev/docs/react-reorder -- Reorder.Group/Item props (axis, values, onReorder)

### Secondary (MEDIUM confidence)
- Web Speech API MDN docs: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API -- SpeechSynthesis browser support, iOS Safari limitations
- dnd-kit GitHub discussion #1842: https://github.com/clauderic/dnd-kit/discussions/1842 -- @dnd-kit/react vs @dnd-kit/core roadmap
- npm package pages: @dnd-kit/core 6.3.1, @dnd-kit/sortable 10.0.0, @dnd-kit/react 0.2.4

### Tertiary (LOW confidence)
- Duolingo adaptive difficulty patterns: https://geiger-wolf.com/archives/24 -- general approach description, no code-level details
- Can I Use SpeechSynthesis: https://caniuse.com/speech-synthesis -- browser support tables

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- No new dependencies needed; framer-motion Reorder is already available, Web Speech API already implemented
- Architecture: HIGH -- Challenge Interface Contract pattern is straightforward; existing codebase has clear integration points (PlayingScreen, useGameLogic, ScreenRouter)
- Pitfalls: HIGH -- Verified through codebase analysis (snapshot tests, iOS speech issues, word count distribution, Reorder duplicate value handling)
- Level system: MEDIUM -- Level count (10+) and word distribution need validation during planning; 201 words across 10 categories should support 12-15 levels of 12-20 words each, but exact mapping requires careful budgeting
- Reorder multiline behavior: LOW -- Needs hands-on testing with framer-motion Reorder in flex-wrap scenarios

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days -- stable domain, no fast-moving dependencies)
