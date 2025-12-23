/**
 * Word Adventure - Comprehensive Storyline System
 *
 * Features:
 * 1. Quest-based storyline with chapters
 * 2. Character dialogue system with NPCs
 * 3. Mystery/discovery elements
 * 4. Pet evolution story
 */

// ============================================
// MAIN STORY: The Lost Kingdom of Words
// ============================================

export const STORY_INTRO = {
    title: 'ממלכת המילים האבודה',
    subtitle: 'The Lost Kingdom of Words',
    opening: {
        boy: `לפני שנים רבות, ממלכת המילים הייתה המקום הקסום ביותר בעולם.
        אנשים דיברו בכל השפות, והמילים היו חיות ומאירות.
        אבל הקוסם האפל גנב את המילים והחביא אותן בחמישה עולמות.
        רק גיבור אמיץ יכול להחזיר אותן...`,
        girl: `לפני שנים רבות, ממלכת המילים הייתה המקום הקסום ביותר בעולם.
        אנשים דיברו בכל השפות, והמילים היו חיות ומאירות.
        אבל הקוסם האפל גנב את המילים והחביא אותן בחמישה עולמות.
        רק גיבורה אמיצה יכולה להחזיר אותן...`
    }
};

// ============================================
// CHAPTER STORYLINES
// ============================================

export const CHAPTERS = {
    easy: {
        id: 'enchanted_kingdom',
        title: 'הממלכה הקסומה',
        subtitle: 'The Enchanted Kingdom',
        character: '👸',
        color: 'from-green-400 to-emerald-600',
        unlockRequirement: 0,

        intro: {
            boy: `ברוך הבא לממלכה הקסומה, גיבור צעיר!
            המלכה אליזבת מחכה לך. המילים הפשוטות נעלמו מהארמון.
            עזור לנו למצוא אותן!`,
            girl: `ברוכה הבאה לממלכה הקסומה, גיבורה צעירה!
            המלכה אליזבת מחכה לך. המילים הפשוטות נעלמו מהארמון.
            עזרי לנו למצוא אותן!`
        },

        completion: {
            boy: `מדהים! הצלחת להחזיר את המילים הראשונות!
            המלכה גאה בך מאוד. קיבלת את מפתח היער הקסום!`,
            girl: `מדהים! הצלחת להחזיר את המילים הראשונות!
            המלכה גאה בך מאוד. קיבלת את מפתח היער הקסום!`
        },

        mystery: {
            clue: '🗝️ מפתח עתיק',
            hint: 'המפתח הזה פותח שער חשאי ביער...',
            reward: 'ancient_key'
        },

        npc: {
            name: 'המלכה אליזבת',
            icon: '👑',
            dialogues: [
                { trigger: 'start', text: 'שלום, {name}! הממלכה שלנו צריכה אותך.' },
                { trigger: 'correct', text: 'נפלא! אתה לומד מהר מאוד!' },
                { trigger: 'wrong', text: 'לא נורא, נסה שוב. אני מאמינה בך!' },
                { trigger: 'streak_3', text: '3 ברצף! אתה כוכב!' },
                { trigger: 'complete', text: 'הצלחת! עכשיו היער הקסום מחכה לך.' }
            ]
        }
    },

    medium: {
        id: 'magical_forest',
        title: 'היער הקסום',
        subtitle: 'The Magical Forest',
        character: '🧚',
        color: 'from-blue-400 to-indigo-600',
        unlockRequirement: 5, // words learned

        intro: {
            boy: `היער הקסום מלא בפיות ויצורים מופלאים.
            הפיה לונה תעזור לך למצוא את המילים החבויות בין העצים.
            אבל היזהר - יש כאן גם חידות מסתוריות!`,
            girl: `היער הקסום מלא בפיות ויצורים מופלאים.
            הפיה לונה תעזור לך למצוא את המילים החבויות בין העצים.
            אבל היזהרי - יש כאן גם חידות מסתוריות!`
        },

        completion: {
            boy: `היער חוזר לחיים! הפיות שרות משמחה.
            גילית סוד עתיק - מפה למגדל הקוסם!`,
            girl: `היער חוזר לחיים! הפיות שרות משמחה.
            גילית סוד עתיק - מפה למגדל הקוסם!`
        },

        mystery: {
            clue: '🗺️ מפה עתיקה',
            hint: 'המפה מראה דרך סודית למגדל...',
            reward: 'ancient_map'
        },

        npc: {
            name: 'הפיה לונה',
            icon: '🧚',
            dialogues: [
                { trigger: 'start', text: 'שלום {name}! בוא נעוף בין העצים!' },
                { trigger: 'correct', text: 'הכנפיים שלי מנצנצות משמחה!' },
                { trigger: 'wrong', text: 'אופס! בוא ננסה שוב יחד.' },
                { trigger: 'streak_5', text: '5 ברצף! אתה קוסם של מילים!' },
                { trigger: 'complete', text: 'היער שלנו ניצל! תודה לך!' }
            ]
        }
    },

    hard: {
        id: 'wizard_tower',
        title: 'מגדל הקוסם',
        subtitle: "The Wizard's Tower",
        character: '🧙',
        color: 'from-purple-500 to-fuchsia-600',
        unlockRequirement: 10,

        intro: {
            boy: `מגדל הקוסם מתנשא מעל העננים.
            הקוסם מרלין יודע איפה הקוסם האפל מתחבא.
            אבל קודם עליך להוכיח את עצמך!`,
            girl: `מגדל הקוסם מתנשא מעל העננים.
            הקוסם מרלין יודע איפה הקוסם האפל מתחבא.
            אבל קודם עלייך להוכיח את עצמך!`
        },

        completion: {
            boy: `מרלין מרשם! הוא נותן לך שרביט קסמים!
            עכשיו אתה מוכן להתמודד עם אתגרים גדולים יותר.`,
            girl: `מרלין מרשם! הוא נותן לך שרביט קסמים!
            עכשיו את מוכנה להתמודד עם אתגרים גדולים יותר.`
        },

        mystery: {
            clue: '🔮 כדור בדולח',
            hint: 'הכדור מראה חזיונות מהיקום האינסופי...',
            reward: 'crystal_ball'
        },

        npc: {
            name: 'הקוסם מרלין',
            icon: '🧙',
            dialogues: [
                { trigger: 'start', text: 'אהה, {name}! שמעתי עליך הרבה.' },
                { trigger: 'correct', text: 'חוכמה רבה יש בך, צעיר!' },
                { trigger: 'wrong', text: 'הקסם דורש סבלנות. נסה שוב.' },
                { trigger: 'streak_5', text: 'מרשים! הכוח איתך!' },
                { trigger: 'complete', text: 'קח את השרביט. תזדקק לו.' }
            ]
        }
    },

    expert: {
        id: 'infinite_universe',
        title: 'היקום האינסופי',
        subtitle: 'The Infinite Universe',
        character: '👽',
        color: 'from-rose-500 to-pink-600',
        unlockRequirement: 15,

        intro: {
            boy: `ברוך הבא ליקום האינסופי!
            החייזר זורק מחפש גיבורים שילמדו את שפת הכוכבים.
            כאן המילים מורכבות יותר, אבל הכוח שלך גדל!`,
            girl: `ברוכה הבאה ליקום האינסופי!
            החייזר זורק מחפש גיבורות שילמדו את שפת הכוכבים.
            כאן המילים מורכבות יותר, אבל הכוח שלך גדל!`
        },

        completion: {
            boy: `זורק נותן לך כוח על-טבעי!
            עכשיו אתה יכול לראות את היכל החכמים.`,
            girl: `זורק נותן לך כוח על-טבעי!
            עכשיו את יכולה לראות את היכל החכמים.`
        },

        mystery: {
            clue: '⭐ אבן כוכב',
            hint: 'האבן זוהרת כשהקוסם האפל קרוב...',
            reward: 'star_stone'
        },

        npc: {
            name: 'החייזר זורק',
            icon: '👽',
            dialogues: [
                { trigger: 'start', text: 'שלום, יצור מכדור הארץ! אני זורק.' },
                { trigger: 'correct', text: 'מוחך חד כמו לייזר!' },
                { trigger: 'wrong', text: 'גם בכוכב שלנו טועים. נסה שוב!' },
                { trigger: 'streak_5', text: 'וואו! 5 נכונות! אתה גאון!' },
                { trigger: 'complete', text: 'קיבלת את ברכת הכוכבים!' }
            ]
        }
    },

    master: {
        id: 'hall_of_sages',
        title: 'היכל החכמים',
        subtitle: 'The Hall of Sages',
        character: '🏛️',
        color: 'from-amber-500 to-red-600',
        unlockRequirement: 20,

        intro: {
            boy: `הגעת להיכל החכמים - המקום הכי קדוש בממלכה!
            כאן תתמודד עם הקוסם האפל ותחזיר את כל המילים.
            אתה מוכן?`,
            girl: `הגעת להיכל החכמים - המקום הכי קדוש בממלכה!
            כאן תתמודדי עם הקוסם האפל ותחזירי את כל המילים.
            את מוכנה?`
        },

        completion: {
            boy: `ניצחת את הקוסם האפל!
            כל המילים חזרו לממלכה! אתה הגיבור של ממלכת המילים!`,
            girl: `ניצחת את הקוסם האפל!
            כל המילים חזרו לממלכה! את הגיבורה של ממלכת המילים!`
        },

        mystery: {
            clue: '👑 כתר המילים',
            hint: 'הכתר נותן לבעליו את כוח כל המילים!',
            reward: 'word_crown'
        },

        npc: {
            name: 'החכם הגדול',
            icon: '🧓',
            dialogues: [
                { trigger: 'start', text: '{name}, חיכינו לך אלף שנה!' },
                { trigger: 'correct', text: 'החוכמה זורמת בך!' },
                { trigger: 'wrong', text: 'גם החכמים טועים. המשך!' },
                { trigger: 'streak_5', text: 'אתה החכם הצעיר ביותר!' },
                { trigger: 'complete', text: 'הממלכה ניצלה! תודה לך לנצח!' }
            ]
        }
    }
};

// ============================================
// PET EVOLUTION SYSTEM
// ============================================

export const PET_EVOLUTION = {
    dog: {
        name: 'כלבלב',
        icon: '🐕',
        stages: [
            {
                level: 1,
                name: 'גור קטן',
                icon: '🐕',
                wordsRequired: 0,
                ability: 'מלווה אותך בהרפתקה',
                dialogue: 'הב הב! בוא נלמד יחד!'
            },
            {
                level: 2,
                name: 'כלב חכם',
                icon: '🦮',
                wordsRequired: 10,
                ability: 'עוזר למצוא רמזים',
                dialogue: 'למדתי טריקים חדשים בזכותך!'
            },
            {
                level: 3,
                name: 'כלב קסום',
                icon: '🐕‍🦺',
                wordsRequired: 25,
                ability: 'יכול לדבר!',
                dialogue: 'וואו! עכשיו אני יכול לדבר איתך!'
            },
            {
                level: 4,
                name: 'כלב אגדי',
                icon: '🦊',
                wordsRequired: 50,
                ability: 'כוחות על-טבעיים',
                dialogue: 'יחד נוכל לעשות הכל!'
            }
        ]
    },

    unicorn: {
        name: 'חד קרן',
        icon: '🦄',
        stages: [
            {
                level: 1,
                name: 'סייח קטן',
                icon: '🐴',
                wordsRequired: 0,
                ability: 'מנצנץ בחושך',
                dialogue: 'הקרן שלי מתחילה לזהור!'
            },
            {
                level: 2,
                name: 'חד קרן צעיר',
                icon: '🦄',
                wordsRequired: 10,
                ability: 'יכול לעוף קצת',
                dialogue: 'הכנפיים שלי גדלות!'
            },
            {
                level: 3,
                name: 'חד קרן מופלא',
                icon: '🦄',
                wordsRequired: 25,
                ability: 'קסם ריפוי',
                dialogue: 'אני יכול לרפא אותך עכשיו!'
            },
            {
                level: 4,
                name: 'חד קרן שמימי',
                icon: '🦄',
                wordsRequired: 50,
                ability: 'טלפורטציה',
                dialogue: 'בוא נעוף לכוכבים!'
            }
        ]
    },

    dragon: {
        name: 'דרקון',
        icon: '🐉',
        stages: [
            {
                level: 1,
                name: 'דרקון תינוק',
                icon: '🐲',
                wordsRequired: 0,
                ability: 'יורק עשן',
                dialogue: 'אני עדיין קטן, אבל אמיץ!'
            },
            {
                level: 2,
                name: 'דרקון צעיר',
                icon: '🐉',
                wordsRequired: 10,
                ability: 'יורק אש קטנה',
                dialogue: 'תראה! אני יכול לירוק אש!'
            },
            {
                level: 3,
                name: 'דרקון אדיר',
                icon: '🐉',
                wordsRequired: 25,
                ability: 'כנפיים גדולות',
                dialogue: 'הכנפיים שלי חזקות מספיק לשנינו!'
            },
            {
                level: 4,
                name: 'דרקון אגדי',
                icon: '🐉',
                wordsRequired: 50,
                ability: 'שולט באש וקרח',
                dialogue: 'אני הדרקון הכי חזק בממלכה!'
            }
        ]
    }
};

// ============================================
// MYSTERY/DISCOVERY ELEMENTS
// ============================================

export const MYSTERIES = {
    // Hidden items to discover
    collectibles: [
        { id: 'ancient_key', name: 'מפתח עתיק', icon: '🗝️', chapter: 'easy', description: 'פותח דלתות סודיות' },
        { id: 'ancient_map', name: 'מפה עתיקה', icon: '🗺️', chapter: 'medium', description: 'מראה מקומות נסתרים' },
        { id: 'crystal_ball', name: 'כדור בדולח', icon: '🔮', chapter: 'hard', description: 'מראה את העתיד' },
        { id: 'star_stone', name: 'אבן כוכב', icon: '⭐', chapter: 'expert', description: 'זוהרת בחושך' },
        { id: 'word_crown', name: 'כתר המילים', icon: '👑', chapter: 'master', description: 'נותן כוח אינסופי' },
    ],

    // Secret achievements
    secrets: [
        { id: 'early_bird', name: 'ציפור השכמה', icon: '🌅', condition: 'play_before_7am', reward: 100 },
        { id: 'night_owl', name: 'ינשוף לילה', icon: '🦉', condition: 'play_after_10pm', reward: 100 },
        { id: 'perfect_level', name: 'מושלם!', icon: '💎', condition: 'complete_level_no_mistakes', reward: 200 },
        { id: 'speed_demon', name: 'מהיר כברק', icon: '⚡', condition: 'answer_under_3_seconds', reward: 50 },
        { id: 'comeback_kid', name: 'חזרה מנצחת', icon: '🔥', condition: 'win_with_1_life', reward: 150 },
        { id: 'word_master', name: 'אדון המילים', icon: '📚', condition: 'learn_50_words', reward: 500 },
        { id: 'streak_champion', name: 'אלוף הרצפים', icon: '🏆', condition: 'streak_of_20', reward: 300 },
    ],

    // Hidden story fragments
    lore: [
        { id: 'lore_1', text: 'פעם, המילים היו יצורים חיים שרקדו בשמיים...', unlockAt: 5 },
        { id: 'lore_2', text: 'הקוסם האפל היה פעם ילד שלא ידע לקרוא...', unlockAt: 10 },
        { id: 'lore_3', text: 'מלכת המילים הראשונה למדה 1000 שפות!', unlockAt: 15 },
        { id: 'lore_4', text: 'יש שער סודי שנפתח רק למי שיודע את כל המילים...', unlockAt: 20 },
        { id: 'lore_5', text: 'האגדה אומרת שמי שמחזיר את כל המילים יהפוך לקוסם...', unlockAt: 30 },
    ]
};

// ============================================
// RANDOM DIALOGUES & ENCOURAGEMENT
// ============================================

export const ENCOURAGEMENT = {
    correct: [
        'מעולה! 🌟',
        'נכון מאוד! ✨',
        'אתה כוכב! ⭐',
        'מושלם! 💫',
        'וואו! 🎉',
        'גאוני! 🧠',
        'מדהים! 🚀',
        'פנטסטי! 🎯',
    ],

    wrong: [
        'כמעט! נסה שוב 💪',
        'לא נורא, בפעם הבאה! 🌈',
        'טעויות זה חלק מהלמידה 📚',
        'אל תוותר! 🔥',
        'אתה יכול! 💫',
    ],

    streak: {
        3: ['3 ברצף! אש! 🔥', 'מתחמם פה! 🌡️'],
        5: ['5 ברצף! סופר! 🦸', 'בלתי ניתן לעצירה! 🚀'],
        10: ['10 ברצף! אגדי! 👑', 'אתה מכונה! 🤖'],
        15: ['15 ברצף! על-אנושי! 🌟', 'מאסטר! 🎓'],
        20: ['20 ברצף! אלוהי! ✨', 'אין כמוך! 🏆'],
    },

    lowLives: [
        'נשאר לך לב אחד! התרכז! ❤️',
        'זהירות! החיים יקרים! 💔',
    ],

    dailyReturn: [
        'שמחים שחזרת! 🌈',
        'בוקר טוב, גיבור! ☀️',
        'מתגעגעים אליך! 💕',
        'הממלכה צריכה אותך! 👑',
    ]
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a random item from an array
 */
export const getRandomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

/**
 * Get the current pet evolution stage
 */
export const getPetEvolutionStage = (petId, wordsLearned) => {
    const pet = PET_EVOLUTION[petId];
    if (!pet) return null;

    // Find the highest stage the player has reached
    let currentStage = pet.stages[0];
    for (const stage of pet.stages) {
        if (wordsLearned >= stage.wordsRequired) {
            currentStage = stage;
        }
    }
    return currentStage;
};

/**
 * Check if pet can evolve
 */
export const canPetEvolve = (petId, wordsLearned) => {
    const pet = PET_EVOLUTION[petId];
    if (!pet) return false;

    const currentStage = getPetEvolutionStage(petId, wordsLearned);
    const nextStage = pet.stages.find(s => s.level === currentStage.level + 1);

    return nextStage && wordsLearned >= nextStage.wordsRequired;
};

/**
 * Get chapter by level
 */
export const getChapter = (level) => {
    return CHAPTERS[level] || null;
};

/**
 * Check if a chapter is unlocked
 */
export const isChapterUnlocked = (level, wordsLearned) => {
    const chapter = CHAPTERS[level];
    if (!chapter) return false;
    return wordsLearned >= chapter.unlockRequirement;
};

/**
 * Get NPC dialogue for a trigger
 */
export const getNPCDialogue = (level, trigger, playerName) => {
    const chapter = CHAPTERS[level];
    if (!chapter || !chapter.npc) return null;

    const dialogue = chapter.npc.dialogues.find(d => d.trigger === trigger);
    if (!dialogue) return null;

    return dialogue.text.replace('{name}', playerName);
};

/**
 * Get unlocked lore fragments
 */
export const getUnlockedLore = (wordsLearned) => {
    return MYSTERIES.lore.filter(l => wordsLearned >= l.unlockAt);
};

/**
 * Get discovered collectibles
 */
export const getCollectibles = (completedChapters) => {
    return MYSTERIES.collectibles.filter(c => completedChapters.includes(c.chapter));
};
