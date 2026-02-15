/**
 * Procedural Grammar Engine for Word Adventure
 * Generates infinite sentence variations with proper Hebrew gender agreement.
 * Nouns are derived from the unified word bank; adjectives/verbs kept separate
 * because they require he_m/he_f gender-agreement forms not in the word schema.
 */

import { nanoid } from 'nanoid';
import { initialWordData } from '../data/words';

/** Categories whose words make sense as sentence subjects ("The X is big") */
const NOUN_CATEGORIES = ['animals', 'family', 'professions'];

/**
 * Build the noun list from the unified word bank.
 * Filters for categories that work as sentence subjects and maps to
 * the grammar engine's { en, he, gender, emoji } format.
 * Only includes masculine ('m') and feminine ('f') nouns -- neutral ('n')
 * would break gender agreement and none currently exist.
 */
export const buildNounsFromWordBank = () =>
    initialWordData
        .filter(w => NOUN_CATEGORIES.includes(w.category) && (w.gender === 'm' || w.gender === 'f'))
        .map(w => ({ en: w.word, he: w.hebrew, gender: w.gender, emoji: w.emoji }));

const VOCAB = {
    nouns: buildNounsFromWordBank(),
    adjectives: [
        { en: 'BIG', he_m: 'גדול', he_f: 'גדולה' },
        { en: 'SMALL', he_m: 'קטן', he_f: 'קטנה' },
        { en: 'HAPPY', he_m: 'שמח', he_f: 'שמחה' },
        { en: 'SAD', he_m: 'עצוב', he_f: 'עצובה' },
        { en: 'FAST', he_m: 'מהיר', he_f: 'מהירה' },
        { en: 'GOOD', he_m: 'טוב', he_f: 'טובה' },
        { en: 'CUTE', he_m: 'חמוד', he_f: 'חמודה' },
        { en: 'FUNNY', he_m: 'מצחיק', he_f: 'מצחיקה' },
    ],
    verbs_transitive: [ // Verbs that take an object ("The cat [eats] the fish")
        { en: 'LOVES', he_m: 'אוהב', he_f: 'אוהבת' },
        { en: 'SEES', he_m: 'רואה', he_f: 'רואה' },
        { en: 'WANTS', he_m: 'רוצה', he_f: 'רוצה' },
        { en: 'HUGS', he_m: 'מחבק', he_f: 'מחבקת' },
        { en: 'FINDS', he_m: 'מוצא', he_f: 'מוצאת' },
    ],
    verbs_intransitive: [ // Verbs that stand alone or with location ("The cat [sleeps]")
        { en: 'SLEEPS', he_m: 'ישן', he_f: 'ישנה' },
        { en: 'EATS', he_m: 'אוכל', he_f: 'אוכלת' },
        { en: 'RUNS', he_m: 'רץ', he_f: 'רצה' },
        { en: 'JUMPS', he_m: 'קופץ', he_f: 'קופצת' },
        { en: 'SINGS', he_m: 'שר', he_f: 'שרה' },
        { en: 'DANCES', he_m: 'רוקד', he_f: 'רוקדת' },
    ],
    objects: [ // Simple objects for transitive verbs (usually treated as masculine or simple for now)
        { en: 'THE BALL', he: 'את הכדור' },
        { en: 'PIZZA', he: 'פיצה' },
        { en: 'ICE CREAM', he: 'גלידה' },
        { en: 'THE SUN', he: 'את השמש' },
        { en: 'THE BOOK', he: 'את הספר' },
        { en: 'WATER', he: 'מים' },
    ]
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Templates define how sentences are constructed
const TEMPLATES = [
    // 1. Subject + Adjective ("The cat is cute")
    // Note: In Hebrew "The cat [is] cute" -> "החתול חמוד" (No 'is')
    {
        generate: () => {
            const noun = getRandom(VOCAB.nouns);
            const adj = getRandom(VOCAB.adjectives);

            const hebrewAdj = noun.gender === 'm' ? adj.he_m : adj.he_f;

            return {
                word: `THE ${noun.en} IS ${adj.en}`,
                hebrew: `ה${noun.he} ${hebrewAdj}`,
                hint: `${noun.emoji} ה${noun.he} ${hebrewAdj}`
            };
        }
    },
    // 2. Subject + Intransitive Verb ("The dog sleeps")
    {
        generate: () => {
            const noun = getRandom(VOCAB.nouns);
            const verb = getRandom(VOCAB.verbs_intransitive);

            const hebrewVerb = noun.gender === 'm' ? verb.he_m : verb.he_f;

            return {
                word: `THE ${noun.en} ${verb.en}`,
                hebrew: `ה${noun.he} ${hebrewVerb}`,
                hint: `${noun.emoji} ה${noun.he} ${hebrewVerb}`
            };
        }
    },
    // 3. Subject + Transitive Verb + Object ("The boy wants pizza")
    {
        generate: () => {
            const noun = getRandom(VOCAB.nouns);
            const verb = getRandom(VOCAB.verbs_transitive);
            const obj = getRandom(VOCAB.objects);

            const hebrewVerb = noun.gender === 'm' ? verb.he_m : verb.he_f;

            return {
                word: `THE ${noun.en} ${verb.en} ${obj.en}`,
                hebrew: `ה${noun.he} ${hebrewVerb} ${obj.he}`,
                hint: `${noun.emoji} ה${noun.he} ${hebrewVerb} ${obj.he}`
            };
        }
    }
];

export const generateChallenge = () => {
    const template = getRandom(TEMPLATES);
    const content = template.generate();

    return {
        id: `gen_${nanoid()}`,
        word: content.word,
        hebrew: content.hebrew,
        hint: content.hint,
        level: 'master',
        type: 'sentence'
    };
};
