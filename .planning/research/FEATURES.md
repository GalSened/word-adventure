# Feature Research

**Domain:** Hebrew-English vocabulary learning game with RPG/adventure elements
**Researched:** 2026-02-14
**Confidence:** MEDIUM (based on competitor analysis, educational research, and domain patterns; no direct user research data)

## Current State Assessment

The app currently has:
- **13 words** across 4 difficulty levels (easy/medium/hard/expert) + master (procedural grammar) + review (SRS)
- **1 primary challenge type:** spell-the-word via letter/word picker (LetterPicker component)
- **2 mini-games:** Memory match (card pairs), Pet walking (multiple-choice encounters)
- **Supporting systems:** SRS review, story chapters with 5 NPC characters, pet evolution (3 pets x 4 stages), shop/inventory (30+ items), daily quests (3 quests), avatar selection, voice input, leaderboard, cosmetics/themes/boosters/consumables
- **Content gap:** Massive feature scaffolding built around a tiny content base (13 words)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Expanded word bank (200+ words)** | 13 words exhausts content in one session. Users expect enough material for weeks of play. Every competitor (Drops, Duolingo, Gus on the Go) ships hundreds of words minimum. | HIGH | This is the single most critical gap. All other features amplify empty content without this. Must be organized by theme/category + difficulty. |
| **Themed word categories** | Drops organizes into 13+ categories (food, animals, travel, etc.). Kids learn better when words are grouped semantically. Users expect to browse/select topics that interest them. | MEDIUM | Standard categories: Animals, Food & Drink, Colors, Family, Body, Home, School, Nature, Clothes, Emotions, Numbers, Actions/Verbs. Category selection replaces or augments current flat difficulty levels. |
| **Multiple challenge types (3-5 minimum)** | Single mechanic (letter picking) becomes monotonous fast. Duolingo uses 8+ exercise types. Drops uses 5+ swipe-based games. Users expect variety after the first few sessions. | HIGH | Must support: (1) current letter arrange, (2) multiple choice Hebrew-to-English, (3) multiple choice English-to-Hebrew, (4) listening + select, (5) image matching. Each challenge type exercises different recall pathways. |
| **Progressive difficulty with 10+ levels** | Current 4 levels feel arbitrary with so few words. Users expect visible progression. Duolingo's skill tree and Drops' topic progression both provide 50+ discrete progression points. | MEDIUM | Restructure from difficulty-based (easy/medium/hard/expert) to category + tier system. Each category has 3-4 tiers. Unlocking is gated by mastery within category + overall word count. |
| **Audio pronunciation for all words** | Every serious language app (Duolingo, Drops, Gus on the Go) plays native audio for every word. Users expect to hear how words sound. Current app has no audio playback (only voice input recognition). | MEDIUM | Use Web Speech API (SpeechSynthesis) for English. Hebrew TTS quality varies -- may need pre-recorded audio files for Hebrew or accept synthetic quality. Critical for a language app. |
| **Visual word hints (images/illustrations)** | Drops pairs every word with illustrations. Research shows visual association improves retention by 30%+. Kids especially expect pictures alongside words. | MEDIUM | Can start with emoji-based illustrations (already partially used in hints) and upgrade to custom illustrations later. Each word entry needs an `image` or `emoji` field. |
| **Progress tracking per word** | Users expect to see which words they know vs. which need practice. SRS exists in code but has no UI for viewing word-level mastery. Anki, Quizlet, and Drops all show per-word progress. | LOW | SRS data already tracked in `userProgress` state. Need a "Word Book" or "Dictionary" UI showing all learned words with mastery indicators. |
| **Smooth onboarding/tutorial** | First-time experience is confusing -- story intro, path choice, then unclear what to do. Competitors guide users through first lesson immediately. | LOW | Replace multi-step story intro with a quick guided first lesson (3-5 words). Story elements can appear organically after initial engagement. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Hebrew gender-aware grammar challenges** | No competitor does this. The existing `grammarEngine.js` generates Hebrew sentences with proper masculine/feminine agreement. This is genuinely unique for a kids' game. | LOW (exists) | Already built for master level. Extend to medium/hard levels with simpler patterns. This is the app's most distinctive educational feature. |
| **Story-driven vocabulary discovery** | Words are found through narrative exploration, not just drilled. Adventure Academy and Language Adventure show this works. The existing story/NPC system is a strong foundation. | MEDIUM | Tie word categories to story chapters thematically (e.g., Forest chapter teaches Nature words, Kingdom teaches Family/Royalty words). Words feel discovered, not assigned. |
| **Pet companion that aids learning** | Pet evolution tied to words learned creates emotional investment. No Hebrew-specific competitor does this. Walking mini-game provides active learning break. | LOW (exists) | Already built. Enhancement: pets give contextual hints based on their evolution stage. Higher-evolved pets provide better help (already defined in story.js ability descriptions). |
| **Bilingual contextual sentences** | Show words used in short Hebrew and English sentences, not just isolated translations. Research shows contextual learning dramatically improves retention and Duolingo has moved heavily toward sentence-based learning. | MEDIUM | Extend grammarEngine.js patterns to generate example sentences for each word. Display as "example usage" on word detail/review screens. |
| **Adventure exploration mini-game** | Transform pet walking from random encounters into themed exploration zones tied to word categories. Pet discovers items/creatures whose names are the vocabulary. | HIGH | Current PetWalkingGame has the visual foundation. Redesign: each zone matches a word category (Ocean zone = sea animal words, Forest zone = nature words). Encounters become vocabulary-in-context discovery. |
| **Adaptive difficulty ("Goldilocks zone")** | Duolingo's biggest retention driver. Auto-adjust challenge difficulty based on per-word SRS data. Too easy = skip ahead. Too hard = simplify challenge type. | MEDIUM | SRS data already provides per-word difficulty signals. Use easeFactor and repetition count to select appropriate challenge type (low mastery = multiple choice, high mastery = free recall). |
| **Parent/teacher dashboard** | Mixed-age audience implies parental involvement. Simple progress report showing words learned, time spent, accuracy by category. No Hebrew kids' app does this well. | MEDIUM | LocalStorage-based. Export as JSON/PDF. Could also be a simple stats screen within the app showing learning analytics. |
| **RTL-aware challenge types** | Properly handling right-to-left Hebrew alongside left-to-right English in mixed-direction challenges. Most generic language apps struggle with this. Native RTL support is a differentiator for Hebrew-specific content. | LOW | App already uses `dir="rtl"`. Ensure all new challenge types handle bidirectional text correctly. This is table stakes for Hebrew but differentiating vs. non-Hebrew-native apps trying to add Hebrew. |
| **Cultural/holiday-themed content packs** | Themed vocabulary for Shabbat, holidays (Pesach, Hanukkah, Sukkot), Israeli culture. No generic language app provides this. Jigzi platform shows demand exists. | MEDIUM | Seasonal content keeps app fresh. Can be unlocked progressively or time-gated to holidays. Strong retention driver for the target audience. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real-time multiplayer** | "Kids love competing with friends" | Massive infrastructure complexity (WebSocket server, matchmaking, latency). Tiny user base makes matchmaking impossible. Maintenance burden dwarfs educational value. | Asynchronous leaderboards (already built). Weekly challenges with shared scores. Ghost replay of friend's run. |
| **AI-generated personalized content** | "Let AI create custom word lists and stories" | LLM API costs scale per-user. Generated Hebrew content has grammar errors. Quality control is impossible at scale. Adds backend dependency to what is currently a static client app. | Curated word bank with large variety (200+ words covers most needs). Procedural sentence generation (already built in grammarEngine.js) gives variety without LLM costs. |
| **User-created word lists/content** | "Let users add their own words" | Quality control nightmare. Hebrew vowelization is complex. Wrong translations teach wrong things. Mixed-age audience means moderation needed. | Pre-built themed packs that cover common needs. Import from teacher-curated lists with a simple JSON format (not user-facing editor). |
| **Timed challenges / speed pressure** | "Makes it exciting and game-like" | Research shows time pressure increases anxiety and reduces learning retention in children. Drops uses 5-min sessions but no per-word timers. Conflicts with mixed-age audience (younger kids are slower). | Optional "speed bonus" for extra points (reward speed without punishing slowness). Per-session time tracking for parent dashboard. Timer only in specific opt-in challenge modes. |
| **Social features / chat** | "Kids want to interact" | COPPA/child safety compliance is extremely complex. Moderation infrastructure. Legal liability. Way outside scope for a vocabulary game. | Shared family leaderboard. Show pet/avatar to family members. No direct communication features. |
| **Full sentence translation free-text** | "Real translation practice" | Free-text Hebrew input is extremely hard (keyboard issues, vowelization, spelling variants). Error detection for Hebrew sentences is an unsolved problem. Frustrating UX for kids. | Sentence construction from word banks (drag words into correct order). Multiple-choice sentence translation. Keep grammar engine for structured generation where answers are known. |
| **Achievements / badges overload** | "More badges = more engagement" | Current MYSTERIES.secrets already has 7 achievements. Adding dozens more creates notification fatigue and devalues each one. Duolingo research shows diminishing returns past 15-20 achievements. | Keep achievement count modest (10-15 total). Make each one meaningful and rare. Quality over quantity. |
| **Voice-based conversation practice** | "Speaking practice is important" | Speech recognition accuracy for children's voices is poor. Hebrew speech recognition is worse than English. Creates frustration when correct answers are rejected. | Keep current voice-to-text as optional input method. Focus on recognition (listening) over production (speaking) for now. |

## Feature Dependencies

```
[Expanded Word Bank (200+ words)]
    |
    +--requires--> [Themed Word Categories]
    |                  |
    |                  +--enables--> [Story-Driven Vocabulary Discovery]
    |                  |
    |                  +--enables--> [Adventure Exploration Mini-Game]
    |                  |
    |                  +--enables--> [Cultural/Holiday Content Packs]
    |
    +--enables--> [Multiple Challenge Types]
    |                 |
    |                 +--enhances--> [Adaptive Difficulty]
    |
    +--enables--> [Progressive Difficulty (10+ levels)]
    |
    +--enables--> [Progress Tracking Per Word]
    |
    +--enables--> [Audio Pronunciation]

[Multiple Challenge Types]
    +--requires--> [Word Data with Audio/Image fields]

[Adaptive Difficulty]
    +--requires--> [SRS Data] (already exists)
    +--requires--> [Multiple Challenge Types]

[Adventure Exploration Mini-Game]
    +--requires--> [Themed Word Categories]
    +--enhances--> [Pet Companion System] (already exists)
    +--requires--> [PetWalkingGame Redesign]

[Hebrew Gender-Aware Challenges]
    +--requires--> [grammarEngine.js] (already exists)
    +--enhances--> [Multiple Challenge Types]

[Parent Dashboard]
    +--requires--> [Progress Tracking Per Word]

[Bilingual Contextual Sentences]
    +--requires--> [Expanded Word Bank]
    +--enhances--> [Grammar Engine] (already exists)
```

### Dependency Notes

- **Expanded Word Bank requires Themed Categories:** Adding 200+ words as a flat list is unusable. Categories provide the organizational structure that makes a large word bank navigable and learnable.
- **Multiple Challenge Types require Word Data enrichment:** Current word objects have {id, word, hint, hebrew, level, type}. New challenge types need additional fields: audio URL/flag, image/emoji, category, example sentence, difficulty tier within category.
- **Adventure Mini-Game requires Themed Categories:** The exploration zones are themed around word categories. Without categories, there is nothing to explore.
- **Adaptive Difficulty requires Multiple Challenge Types:** Adaptation means selecting easier or harder challenge formats. With only one format, there is nothing to adapt.
- **Story-Driven Discovery enhances but does not require Categories:** Story chapters can exist without categories (as they do now), but tying chapters to word themes makes the narrative feel purposeful rather than decorative.

## MVP Definition

### Launch With (Next Milestone v1)

Minimum viable improvement -- what is needed to validate the expanded content concept.

- [ ] **Expanded word bank (100+ words across 8 categories)** -- without this, everything else is decorating an empty room
- [ ] **Themed word categories with category selection UI** -- replaces flat difficulty picker on map screen
- [ ] **3 challenge types: letter arrange (exists), multiple choice, and listening/select** -- variety prevents monotony
- [ ] **Audio pronunciation (English via SpeechSynthesis, Hebrew via SpeechSynthesis or pre-recorded)** -- expected in any language app
- [ ] **Word data schema enrichment (category, emoji, audio flag, tier)** -- foundation for all future features
- [ ] **Progressive levels within categories (3 tiers per category)** -- replaces 4 flat difficulty levels with 24+ progression points

### Add After Validation (v1.x)

Features to add once expanded content is working and retained users exist.

- [ ] **Adventure exploration mini-game (redesigned PetWalkingGame)** -- trigger: users are engaged with categories and want more variety
- [ ] **Hebrew gender-aware challenges at lower levels** -- trigger: users completing medium/hard levels want more challenge
- [ ] **Adaptive difficulty selection** -- trigger: SRS data shows users are bored (too easy) or frustrated (too hard)
- [ ] **Visual hints/images beyond emoji** -- trigger: user feedback or retention data suggests visual aids help
- [ ] **Word book / dictionary UI** -- trigger: users want to review learned words outside of gameplay
- [ ] **Bilingual contextual sentences** -- trigger: advanced users want to see words in context

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Cultural/holiday content packs** -- defer: seasonal content only makes sense with established user base
- [ ] **Parent/teacher dashboard** -- defer: requires understanding actual usage patterns first
- [ ] **Additional mini-games (word search, crossword, hangman)** -- defer: validate core challenge types work first
- [ ] **Competitive weekly challenges** -- defer: needs enough users for meaningful competition

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Expanded word bank (200+ words) | HIGH | HIGH | P1 |
| Themed word categories | HIGH | MEDIUM | P1 |
| Multiple challenge types (3+) | HIGH | HIGH | P1 |
| Audio pronunciation | HIGH | MEDIUM | P1 |
| Progressive difficulty (10+ levels) | HIGH | MEDIUM | P1 |
| Word data schema enrichment | HIGH (enables everything) | MEDIUM | P1 |
| Smooth onboarding revision | MEDIUM | LOW | P1 |
| Progress tracking per word (UI) | MEDIUM | LOW | P2 |
| Adventure exploration mini-game | HIGH | HIGH | P2 |
| Hebrew grammar challenges (lower levels) | MEDIUM | LOW | P2 |
| Adaptive difficulty | MEDIUM | MEDIUM | P2 |
| Bilingual contextual sentences | MEDIUM | MEDIUM | P2 |
| Visual word hints (images) | MEDIUM | MEDIUM | P2 |
| Word book / dictionary UI | MEDIUM | LOW | P2 |
| Cultural/holiday content packs | MEDIUM | MEDIUM | P3 |
| Parent dashboard | LOW | MEDIUM | P3 |
| Additional mini-games | LOW | HIGH | P3 |
| Competitive weekly challenges | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for next milestone launch
- P2: Should have, add when core content is solid
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Duolingo | Drops | Gus on the Go (Hebrew) | Word Adventure (Current) | Our Approach |
|---------|----------|-------|------------------------|--------------------------|--------------|
| Word count | 2000+ per language | 1700+ per language | ~90 words | 13 words | Target 200+ (8 categories x 25+ words) |
| Categories/themes | Skill tree (40+ skills) | 13 categories with subtopics | 10 themed scenes | 4 flat difficulty levels | 8-10 themed categories with 3 tiers each |
| Challenge types | 8+ (translate, listen, speak, match, fill blank, tap pairs, stories, arrange) | 5+ (swipe, match, word search, fill, listen) | 6 (match, trace, listen, bubble pop, memory, quiz) | 1 (letter arrange) + memory match + pet walk MCQ | 5 types: letter arrange, MCQ (both directions), listen+select, sentence build |
| Audio | Native speaker for all | Native speaker for all | Native speaker for all | Voice input only (no playback) | SpeechSynthesis + pre-recorded for key Hebrew words |
| Visual aids | Illustrations for key lessons | Beautiful custom illustrations for every word | Colorful scene illustrations | Emoji hints | Emoji-first, upgrade to illustrations later |
| SRS/spaced repetition | Built-in (shallow) | Built-in | None | SM-2 algorithm (exists but underused) | SM-2 with per-word tracking (strengthen existing) |
| Gamification | XP, streaks, leaderboards, hearts, gems, leagues | Streaks, daily limit | Stars, progress | Score, stars, streaks, daily quests, shop, pets, story, achievements | Keep existing gamification (already rich). Focus on content. |
| Story/narrative | Story lessons (newer feature) | None | Character-guided | Full story system with NPCs, mystery items, lore | Differentiate by tying story chapters to word categories |
| Hebrew-specific | Generic Hebrew course | Generic Hebrew course | Hebrew-specific for kids | Hebrew-English with gender-aware grammar | Only app combining Hebrew grammar awareness + RPG + kids focus |
| RTL support | Generic | Generic | Good | Native RTL | Native RTL (already strong) |

## Word Category Recommendation

Based on competitor analysis and educational research, recommended initial categories:

| Category | Hebrew Name | Example Words | Word Count Target | Story Chapter Tie-In |
|----------|-------------|---------------|-------------------|---------------------|
| Animals | חיות | cat, dog, fish, bird, lion, elephant, butterfly, horse | 25 | Enchanted Kingdom (existing easy chapter) |
| Food & Drink | אוכל ושתייה | water, bread, apple, milk, pizza, ice cream, cake, juice | 25 | none (new zone or cross-cutting) |
| Family & People | משפחה ואנשים | mother, father, sister, brother, baby, friend, king, queen | 20 | Enchanted Kingdom (royalty words overlap) |
| Colors & Numbers | צבעים ומספרים | red, blue, green, one, two, three, big, small | 25 | Magical Forest (existing medium chapter) |
| Home & School | בית וספר | book, table, chair, door, window, pencil, teacher, classroom | 25 | none (new zone or cross-cutting) |
| Nature & Weather | טבע ומזג אוויר | sun, flower, tree, rain, cloud, mountain, ocean, star | 25 | Magical Forest (existing medium chapter) |
| Body & Clothes | גוף ובגדים | hand, head, eye, shoe, hat, dress, pants, shirt | 20 | Wizard's Tower (existing hard chapter) |
| Actions & Emotions | פעולות ורגשות | happy, sad, run, jump, eat, sleep, love, play | 25 | Infinite Universe (existing expert chapter) |

**Total: ~190 words** (expandable to 250+ with sub-themes)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Table stakes features | HIGH | Every competitor has these. Clear market expectation. |
| Differentiator value | MEDIUM | Hebrew grammar awareness is genuinely unique, but untested with users. Story-driven discovery is promising but unproven for this audience. |
| Anti-features list | MEDIUM | Based on industry patterns and common pitfalls. Some items (like timed challenges) could work if carefully implemented for older audience segment. |
| Word count/category targets | MEDIUM | 200+ is based on competitor baselines. Actual right number depends on user engagement data. Start with 100+, validate, expand. |
| Challenge type variety | HIGH | Well-established in educational research that multi-modal practice improves retention. 3-5 types is the sweet spot before complexity overwhelms. |

## Sources

- [Duolingo Case Study 2025: How Gamification Made Learning Addictive](https://www.youngurbanproject.com/duolingo-case-study/)
- [Duolingo: How the $15B App uses Gaming Principles (Deconstructor of Fun)](https://www.deconstructoroffun.com/blog/2025/4/14/duolingo-how-the-15b-app-uses-gaming-principles-to-supercharge-dau-growth)
- [Duolingo's Gamification Explained (StriveCloud)](https://www.strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo)
- [Drops Review: Best for Language Learning in 2026](https://www.fahimai.com/drops)
- [Drops vs Duolingo: Complete App Comparison 2025](https://duolingoguides.com/drops-vs-duolingo/)
- [Gus on the Go: Hebrew for Kids](https://www.gusonthego.com/gus-on-the-go-languages/gus-on-the-go-hebrew/)
- [Best Vocabulary Learning Apps 2026 (Brighterly)](https://brighterly.com/blog/best-vocabulary-learning-apps/)
- [Why Most Spaced Repetition Apps Don't Work](https://universeofmemory.com/spaced-repetition-apps-dont-work/)
- [Vocabulary Treatment in Adventure and RPG Games (Springer)](https://link.springer.com/chapter/10.1007/978-3-642-20074-8_11)
- [Adventure Academy - Age of Learning](https://www.ageoflearning.com/adventure-academy/)
- [Gamification and ESL Proficiency (IJRISS)](https://rsisinternational.org/journals/ijriss/articles/gamification-and-esl-proficiency-leveraging-game-design-elements-in-language-learning/)
- [A Trainable Spaced Repetition Model for Language Learning (Duolingo Research)](https://research.duolingo.com/papers/settles.acl16.pdf)
- [Jigzi - Hebrew Educational Game Platform](https://jigzi.org/)
- [Best Preschool Vocabulary Words (ABCmouse)](https://www.abcmouse.com/learn/advice/preschool-vocabulary-words/3789)

---
*Feature research for: Hebrew-English vocabulary learning game with RPG elements*
*Researched: 2026-02-14*
