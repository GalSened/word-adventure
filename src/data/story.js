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
// Thresholds recalibrated for 200-word scale (Phase 6)
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
                { trigger: 'correct', text: { boy: 'נפלא! אתה לומד מהר מאוד!', girl: 'נפלא! את לומדת מהר מאוד!' } },
                { trigger: 'wrong', text: { boy: 'לא נורא, נסה שוב. אני מאמינה בך!', girl: 'לא נורא, נסי שוב. אני מאמינה בך!' } },
                { trigger: 'streak_3', text: { boy: '3 ברצף! אתה כוכב!', girl: '3 ברצף! את כוכבת!' } },
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
        unlockRequirement: 15, // words learned

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
                { trigger: 'start', text: { boy: 'שלום {name}! בוא נעוף בין העצים!', girl: 'שלום {name}! בואי נעוף בין העצים!' } },
                { trigger: 'correct', text: 'הכנפיים שלי מנצנצות משמחה!' },
                { trigger: 'wrong', text: { boy: 'אופס! בוא ננסה שוב יחד.', girl: 'אופס! בואי ננסה שוב יחד.' } },
                { trigger: 'streak_5', text: { boy: '5 ברצף! אתה קוסם של מילים!', girl: '5 ברצף! את קוסמת של מילים!' } },
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
        unlockRequirement: 40,

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
                { trigger: 'correct', text: { boy: 'חוכמה רבה יש בך, צעיר!', girl: 'חוכמה רבה יש בך, צעירה!' } },
                { trigger: 'wrong', text: { boy: 'הקסם דורש סבלנות. נסה שוב.', girl: 'הקסם דורש סבלנות. נסי שוב.' } },
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
        unlockRequirement: 80,

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
                { trigger: 'wrong', text: { boy: 'גם בכוכב שלנו טועים. נסה שוב!', girl: 'גם בכוכב שלנו טועים. נסי שוב!' } },
                { trigger: 'streak_5', text: { boy: 'וואו! 5 נכונות! אתה גאון!', girl: 'וואו! 5 נכונות! את גאונית!' } },
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
        unlockRequirement: 130,

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
                { trigger: 'streak_5', text: { boy: 'אתה החכם הצעיר ביותר!', girl: 'את החכמה הצעירה ביותר!' } },
                { trigger: 'complete', text: 'הממלכה ניצלה! תודה לך לנצח!' }
            ]
        }
    }
};

// ============================================
// LEVEL-SPECIFIC CHAPTERS (12 levels)
// Maps to LEVELS[].storyChapter in src/data/levels.js
// ============================================

export const LEVEL_CHAPTERS = {
    level_1: {
        title: 'שער הממלכה',
        subtitle: 'The Kingdom Gate',
        character: '🏰',
        color: 'from-green-400 to-emerald-600',
        unlockRequirement: 0,

        intro: {
            boy: `ברוך הבא לשער הממלכה, גיבור צעיר!
            החיות של הממלכה שכחו את שמותיהן באנגלית.
            עזור להן לזכור!`,
            girl: `ברוכה הבאה לשער הממלכה, גיבורה צעירה!
            החיות של הממלכה שכחו את שמותיהן באנגלית.
            עזרי להן לזכור!`
        },

        completion: {
            boy: `מדהים! החיות הראשונות זוכרות את שמותיהן!
            השער נפתח לפניך. ההרפתקה מתחילה!`,
            girl: `מדהים! החיות הראשונות זוכרות את שמותיהן!
            השער נפתח לפנייך. ההרפתקה מתחילה!`
        },

        npc: {
            name: 'שומר השער',
            icon: '🛡️',
            dialogues: [
                { trigger: 'start', text: 'שלום, {name}! הממלכה צריכה אותך.' },
                { trigger: 'correct', text: { boy: 'נפלא! אתה לומד מהר!', girl: 'נפלא! את לומדת מהר!' } },
                { trigger: 'wrong', text: { boy: 'לא נורא, נסה שוב!', girl: 'לא נורא, נסי שוב!' } },
                { trigger: 'streak_3', text: '3 ברצף! כוכב! ⭐' },
                { trigger: 'complete', text: 'השער נפתח! המשך הלאה!' }
            ]
        }
    },

    level_2: {
        title: 'גן החיות',
        subtitle: 'Animal Garden',
        character: '🦁',
        color: 'from-lime-400 to-green-600',
        unlockRequirement: 1,

        intro: {
            boy: `גן החיות הקסום מחכה לך!
            חיות חדשות ומרתקות צריכות את עזרתך.
            הפעם גם תלמד לבנות משפטים!`,
            girl: `גן החיות הקסום מחכה לך!
            חיות חדשות ומרתקות צריכות את עזרתך.
            הפעם גם תלמדי לבנות משפטים!`
        },

        completion: {
            boy: `כל החיות בגן שמחות! הן שרות את שמותיהן.
            המלכה שמעה על הצלחתך ומזמינה אותך למשתה!`,
            girl: `כל החיות בגן שמחות! הן שרות את שמותיהן.
            המלכה שמעה על הצלחתך ומזמינה אותך למשתה!`
        },

        npc: {
            name: 'שומר הגן',
            icon: '🧑‍🌾',
            dialogues: [
                { trigger: 'start', text: '{name}, החיות מחכות לך!' },
                { trigger: 'correct', text: 'החיות מרוצות!' },
                { trigger: 'wrong', text: { boy: 'החיות סבלניות. נסה שוב!', girl: 'החיות סבלניות. נסי שוב!' } },
                { trigger: 'streak_3', text: '3 ברצף! החיות רוקדות! 🐾' },
                { trigger: 'complete', text: 'כל החיות ניצלו! תודה!' }
            ]
        }
    },

    level_3: {
        title: 'המשתה',
        subtitle: 'The Feast',
        character: '🍕',
        color: 'from-orange-400 to-red-500',
        unlockRequirement: 2,

        intro: {
            boy: `המלכה מכינה משתה גדול!
            אבל השפים שכחו את שמות המאכלים באנגלית.
            עזור להם להכין את הארוחה!`,
            girl: `המלכה מכינה משתה גדול!
            אבל השפים שכחו את שמות המאכלים באנגלית.
            עזרי להם להכין את הארוחה!`
        },

        completion: {
            boy: `המשתה מוכן! השולחן מלא במאכלים נפלאים.
            המלכה מודה לך. עכשיו אפשר לבקר את המשפחה!`,
            girl: `המשתה מוכן! השולחן מלא במאכלים נפלאים.
            המלכה מודה לך. עכשיו אפשר לבקר את המשפחה!`
        },

        npc: {
            name: 'השף הראשי',
            icon: '👨‍🍳',
            dialogues: [
                { trigger: 'start', text: 'שלום {name}! המטבח צריך אותך!' },
                { trigger: 'correct', text: 'טעים! עוד מנה מוכנה!' },
                { trigger: 'wrong', text: 'אופס! בוא ננסה מתכון אחר.' },
                { trigger: 'streak_5', text: '5 ברצף! שף מקצועי! 👨‍🍳' },
                { trigger: 'complete', text: 'המשתה מושלם! בתיאבון!' }
            ]
        }
    },

    level_4: {
        title: 'בית המשפחה',
        subtitle: 'Family Home',
        character: '👨‍👩‍👧‍👦',
        color: 'from-pink-400 to-rose-500',
        unlockRequirement: 3,

        intro: {
            boy: `הגעת לבית המשפחה המלכותי!
            בני המשפחה צריכים שתלמד את שמותיהם באנגלית.
            גם תלמד לספר עליהם במשפטים!`,
            girl: `הגעת לבית המשפחה המלכותי!
            בני המשפחה צריכים שתלמדי את שמותיהם באנגלית.
            גם תלמדי לספר עליהם במשפטים!`
        },

        completion: {
            boy: `המשפחה שלמה! כולם שמחים.
            עכשיו הם רוצים להראות לך את גשר הקשת!`,
            girl: `המשפחה שלמה! כולם שמחים.
            עכשיו הם רוצים להראות לך את גשר הקשת!`
        },

        npc: {
            name: 'סבתא חכמה',
            icon: '👵',
            dialogues: [
                { trigger: 'start', text: '{name}, בוא נכיר את המשפחה!' },
                { trigger: 'correct', text: { boy: 'חכם כמו סבא!', girl: 'חכמה כמו סבתא!' } },
                { trigger: 'wrong', text: { boy: 'לא נורא, חביבי. נסה שוב!', girl: 'לא נורא, חביבתי. נסי שוב!' } },
                { trigger: 'streak_3', text: '3 ברצף! גאה בך! ❤️' },
                { trigger: 'complete', text: 'כל המשפחה אוהבת אותך!' }
            ]
        }
    },

    level_5: {
        title: 'גשר הקשת',
        subtitle: 'Rainbow Bridge',
        character: '🌈',
        color: 'from-violet-400 to-purple-600',
        unlockRequirement: 4,

        intro: {
            boy: `גשר הקשת מחבר בין העולמות!
            כל צבע בקשת הוא מילה שצריך ללמוד.
            עבור את הגשר וגלה עולם חדש!`,
            girl: `גשר הקשת מחבר בין העולמות!
            כל צבע בקשת הוא מילה שצריך ללמוד.
            עברי את הגשר וגלי עולם חדש!`
        },

        completion: {
            boy: `הקשת זורחת בכל צבעיה!
            עברת את הגשר בהצלחה. שביל הטבע מחכה!`,
            girl: `הקשת זורחת בכל צבעיה!
            עברת את הגשר בהצלחה. שביל הטבע מחכה!`
        },

        npc: {
            name: 'הצייר',
            icon: '🎨',
            dialogues: [
                { trigger: 'start', text: '{name}! בוא נצבע את הקשת!' },
                { trigger: 'correct', text: 'עוד צבע בקשת! יפה!' },
                { trigger: 'wrong', text: 'הצבע הזה לא מתאים. עוד ניסיון!' },
                { trigger: 'streak_5', text: '5 ברצף! אמן אמיתי! 🎨' },
                { trigger: 'complete', text: 'הקשת שלמה ומושלמת!' }
            ]
        }
    },

    level_6: {
        title: 'שביל הטבע',
        subtitle: 'Nature Trail',
        character: '🌳',
        color: 'from-teal-400 to-cyan-600',
        unlockRequirement: 5,

        intro: {
            boy: `שביל הטבע מוביל דרך יערות ונהרות.
            הטבע מלא בפלאים שצריך לגלות באנגלית.
            צא למסע!`,
            girl: `שביל הטבע מוביל דרך יערות ונהרות.
            הטבע מלא בפלאים שצריך לגלות באנגלית.
            צאי למסע!`
        },

        completion: {
            boy: `גילית את כל פלאי הטבע!
            עכשיו אתה מוכן לסדנה של האומנים.`,
            girl: `גילית את כל פלאי הטבע!
            עכשיו את מוכנה לסדנה של האומנים.`
        },

        npc: {
            name: 'מדריך הטבע',
            icon: '🧭',
            dialogues: [
                { trigger: 'start', text: '{name}! הטבע מחכה לך!' },
                { trigger: 'correct', text: 'מצוין! גילית עוד פלא!' },
                { trigger: 'wrong', text: { boy: 'התבונן טוב יותר. נסה שוב!', girl: 'התבונני טוב יותר. נסי שוב!' } },
                { trigger: 'streak_5', text: '5 ברצף! חוקר טבע מומחה! 🌿' },
                { trigger: 'complete', text: 'הטבע מודה לך!' }
            ]
        }
    },

    level_7: {
        title: 'הסדנה',
        subtitle: 'The Workshop',
        character: '🔨',
        color: 'from-amber-400 to-yellow-600',
        unlockRequirement: 6,

        intro: {
            boy: `הסדנה המלכותית מלאה בכלים וחפצים.
            האומנים ובעלי המקצועות צריכים את עזרתך.
            למד את השמות ובנה משפטים!`,
            girl: `הסדנה המלכותית מלאה בכלים וחפצים.
            האומנים ובעלי המקצועות צריכים את עזרתך.
            למדי את השמות ובני משפטים!`
        },

        completion: {
            boy: `הסדנה פועלת שוב! כל האומנים חוזרים לעבודה.
            עכשיו הגיע הזמן ללמוד על גוף ונפש.`,
            girl: `הסדנה פועלת שוב! כל האומנים חוזרים לעבודה.
            עכשיו הגיע הזמן ללמוד על גוף ונפש.`
        },

        npc: {
            name: 'האומן הראשי',
            icon: '🔧',
            dialogues: [
                { trigger: 'start', text: '{name}! יש לנו הרבה עבודה!' },
                { trigger: 'correct', text: 'מקצוען! עוד כלי מוכן!' },
                { trigger: 'wrong', text: 'כלי לא נכון. עוד ניסיון!' },
                { trigger: 'streak_5', text: '5 ברצף! אומן אמיתי! 🔨' },
                { trigger: 'complete', text: 'הסדנה שלמה! יצירה נפלאה!' }
            ]
        }
    },

    level_8: {
        title: 'גוף ונפש',
        subtitle: 'Body and Soul',
        character: '💪',
        color: 'from-rose-400 to-pink-600',
        unlockRequirement: 7,

        intro: {
            boy: `הקוסם החכם מלמד על הגוף והרגשות.
            למד את חלקי הגוף והרגשות באנגלית.
            הידע הזה יעזור לך בקרבות שמחכים!`,
            girl: `הקוסם החכם מלמד על הגוף והרגשות.
            למדי את חלקי הגוף והרגשות באנגלית.
            הידע הזה יעזור לך בקרבות שמחכים!`
        },

        completion: {
            boy: `מכיר את הגוף והנפש! אתה חזק יותר עכשיו.
            זירת הפעולה מחכה לך!`,
            girl: `מכירה את הגוף והנפש! את חזקה יותר עכשיו.
            זירת הפעולה מחכה לך!`
        },

        npc: {
            name: 'הרופא החכם',
            icon: '🧑‍⚕️',
            dialogues: [
                { trigger: 'start', text: '{name}! בוא נלמד על הגוף!' },
                { trigger: 'correct', text: 'מושלם! עוד חלק נלמד!' },
                { trigger: 'wrong', text: { boy: 'בדוק שוב, חבר!', girl: 'בדקי שוב, חברה!' } },
                { trigger: 'streak_5', text: '5 ברצף! רופא מומחה! 🩺' },
                { trigger: 'complete', text: 'בריאות מושלמת! גוף חזק!' }
            ]
        }
    },

    level_9: {
        title: 'זירת הפעולה',
        subtitle: 'Action Arena',
        character: '⚡',
        color: 'from-red-500 to-orange-600',
        unlockRequirement: 8,

        intro: {
            boy: `הזירה רועדת! הגיע הזמן לפעולה!
            למד את הפעלים - מילות הפעולה באנגלית.
            הכוח שלך גדל!`,
            girl: `הזירה רועדת! הגיע הזמן לפעולה!
            למדי את הפעלים - מילות הפעולה באנגלית.
            הכוח שלך גדל!`
        },

        completion: {
            boy: `שלטת בכל הפעולות! אתה לוחם מילים אמיתי.
            היער העמוק מחכה לאמיצים בלבד...`,
            girl: `שלטת בכל הפעולות! את לוחמת מילים אמיתית.
            היער העמוק מחכה לאמיצים בלבד...`
        },

        npc: {
            name: 'אלוף הזירה',
            icon: '🤺',
            dialogues: [
                { trigger: 'start', text: '{name}! הזירה מחכה!' },
                { trigger: 'correct', text: 'מהלך מדהים!' },
                { trigger: 'wrong', text: { boy: 'התאמן עוד! נסה שוב!', girl: 'התאמני עוד! נסי שוב!' } },
                { trigger: 'streak_5', text: '5 ברצף! אלוף הזירה! ⚔️' },
                { trigger: 'complete', text: 'ניצחון! אתה אלוף!' }
            ]
        }
    },

    level_10: {
        title: 'היער העמוק',
        subtitle: 'The Deep Forest',
        character: '🌲',
        color: 'from-emerald-600 to-teal-800',
        unlockRequirement: 9,

        intro: {
            boy: `היער העמוק מלא בסודות ובחיות נדירות.
            המילים כאן קשות יותר, אבל אתה מוכן.
            גם תבנה משפטים מורכבים!`,
            girl: `היער העמוק מלא בסודות ובחיות נדירות.
            המילים כאן קשות יותר, אבל את מוכנה.
            גם תבני משפטים מורכבים!`
        },

        completion: {
            boy: `חצית את היער העמוק! מעטים הצליחו בכך.
            כפר המומחים מחכה בצד השני.`,
            girl: `חצית את היער העמוק! מעטים הצליחו בכך.
            כפר המומחים מחכה בצד השני.`
        },

        npc: {
            name: 'הדרואיד',
            icon: '🧙',
            dialogues: [
                { trigger: 'start', text: '{name}... היער בוחן אותך.' },
                { trigger: 'correct', text: 'היער מנצנץ! מילה חזרה!' },
                { trigger: 'wrong', text: 'היער אפל... אבל אל תוותר!' },
                { trigger: 'streak_5', text: '5 ברצף! כוח היער איתך! 🌲' },
                { trigger: 'complete', text: 'היער חי שוב! תודה!' }
            ]
        }
    },

    level_11: {
        title: 'כפר המומחים',
        subtitle: 'Expert Village',
        character: '🏘️',
        color: 'from-indigo-500 to-blue-700',
        unlockRequirement: 10,

        intro: {
            boy: `כפר המומחים מלא בחכמים ובעלי מקצוע.
            כאן תלמד מילים מתקדמות ותבנה משפטים.
            רק צעד אחד מהפסגה!`,
            girl: `כפר המומחים מלא בחכמים ובעלי מקצוע.
            כאן תלמדי מילים מתקדמות ותבני משפטים.
            רק צעד אחד מהפסגה!`
        },

        completion: {
            boy: `כל המומחים מתפעלים ממך!
            הפסגה מחכה. הקוסם האפל שם!`,
            girl: `כל המומחים מתפעלים ממך!
            הפסגה מחכה. הקוסם האפל שם!`
        },

        npc: {
            name: 'החכם הזקן',
            icon: '🧓',
            dialogues: [
                { trigger: 'start', text: '{name}, שמעתי הרבה עליך.' },
                { trigger: 'correct', text: 'חוכמה רבה!' },
                { trigger: 'wrong', text: 'גם חכמים טועים. המשך!' },
                { trigger: 'streak_5', text: { boy: '5 ברצף! אתה חכם כמו מורה!', girl: '5 ברצף! את חכמה כמו מורה!' } },
                { trigger: 'complete', text: 'מוכן לפסגה!' }
            ]
        }
    },

    level_12: {
        title: 'פסגת האלופים',
        subtitle: 'Master Summit',
        character: '🏔️',
        color: 'from-amber-500 to-red-700',
        unlockRequirement: 11,

        intro: {
            boy: `הגעת לפסגה! הקוסם האפל מחכה כאן.
            רק מי ששולט בכל המילים יכול לנצח.
            אתה מוכן? הקרב האחרון!`,
            girl: `הגעת לפסגה! הקוסם האפל מחכה כאן.
            רק מי ששולטת בכל המילים יכולה לנצח.
            את מוכנה? הקרב האחרון!`
        },

        completion: {
            boy: `ניצחת את הקוסם האפל!
            כל המילים חזרו לממלכה! אתה גיבור אמיתי! 👑`,
            girl: `ניצחת את הקוסם האפל!
            כל המילים חזרו לממלכה! את גיבורה אמיתית! 👑`
        },

        npc: {
            name: 'הקוסם האפל',
            icon: '🧙‍♂️',
            dialogues: [
                { trigger: 'start', text: 'אה, {name}! חשבת שתנצח אותי?' },
                { trigger: 'correct', text: 'לא! איך ידעת?!' },
                { trigger: 'wrong', text: 'הא! ידעתי שלא תצליח!' },
                { trigger: 'streak_5', text: 'בלתי אפשרי! 5 ברצף?!' },
                { trigger: 'complete', text: 'נוצחתי... המילים חופשיות!' }
            ]
        }
    },

    // --- Epilogue arc: the kingdom rebuilds after the wizard's defeat ---

    level_13: {
        title: 'בית הספר הקסום',
        subtitle: 'The Magic School',
        character: '🏫',
        color: 'from-sky-400 to-blue-600',
        unlockRequirement: 12,

        intro: {
            boy: `הקוסם האפל נוצח, והממלכה חוגגת!
            בית הספר הקסום נפתח מחדש אחרי שנים.
            עזור לתלמידים לזכור את מילות בית הספר!`,
            girl: `הקוסם האפל נוצח, והממלכה חוגגת!
            בית הספר הקסום נפתח מחדש אחרי שנים.
            עזרי לתלמידים לזכור את מילות בית הספר!`
        },

        completion: {
            boy: `הפעמון מצלצל! בית הספר חזר לחיים,
            והכול בזכותך! המורה גאה בך! 🏫`,
            girl: `הפעמון מצלצל! בית הספר חזר לחיים,
            והכול בזכותך! המורה גאה בך! 🏫`
        },

        npc: {
            name: 'המורה הקסומה',
            icon: '🧑‍🏫',
            dialogues: [
                { trigger: 'start', text: 'ברוך הבא לכיתה, {name}! השיעור מתחיל.' },
                { trigger: 'correct', text: { boy: 'תשובה מצוינת! אתה תלמיד מבריק!', girl: 'תשובה מצוינת! את תלמידה מבריקה!' } },
                { trigger: 'wrong', text: { boy: 'זה בסדר לטעות — ככה לומדים! נסה שוב.', girl: 'זה בסדר לטעות — ככה לומדים! נסי שוב.' } },
                { trigger: 'streak_3', text: '3 ברצף! הכיתה מוחאת כפיים! 👏' },
                { trigger: 'complete', text: 'השיעור הסתיים בהצטיינות! 🎓' }
            ]
        }
    },

    level_14: {
        title: 'מסע הדרכים',
        subtitle: 'The Great Journey',
        character: '🚂',
        color: 'from-slate-400 to-zinc-600',
        unlockRequirement: 13,

        intro: {
            boy: `הדרכים בין ערי הממלכה נפתחות מחדש!
            רכבות, מטוסים וספינות מחכים לצאת.
            למד את מילות התחבורה כדי להניע אותם!`,
            girl: `הדרכים בין ערי הממלכה נפתחות מחדש!
            רכבות, מטוסים וספינות מחכים לצאת.
            למדי את מילות התחבורה כדי להניע אותם!`
        },

        completion: {
            boy: `כל הדרכים פתוחות! הרכבת שורקת לכבודך,
            והממלכה כולה מחוברת שוב! 🚂`,
            girl: `כל הדרכים פתוחות! הרכבת שורקת לכבודך,
            והממלכה כולה מחוברת שוב! 🚂`
        },

        npc: {
            name: 'מנהל התחנה',
            icon: '👨‍✈️',
            dialogues: [
                { trigger: 'start', text: 'כל העולים! {name}, המסע יוצא לדרך!' },
                { trigger: 'correct', text: 'קדימה! עוד תחנה נפתחה!' },
                { trigger: 'wrong', text: { boy: 'עצירה קטנה — בדוק את המפה ונסה שוב!', girl: 'עצירה קטנה — בדקי את המפה ונסי שוב!' } },
                { trigger: 'streak_3', text: 'קיטור מלא! 3 ברצף! 🚂' },
                { trigger: 'complete', text: 'הגענו ליעד! מסע מושלם!' }
            ]
        }
    },

    level_15: {
        title: 'אתגר האלופים',
        subtitle: 'Champions Challenge',
        character: '🎯',
        color: 'from-fuchsia-500 to-purple-700',
        unlockRequirement: 14,

        intro: {
            boy: `הממלכה עורכת טורניר גדול לכבוד הניצחון!
            אלופים מכל הערים באו להתחרות.
            הראה להם מה זה אלוף אמיתי!`,
            girl: `הממלכה עורכת טורניר גדול לכבוד הניצחון!
            אלופים מכל הערים באו להתחרות.
            הראי להם מה זו אלופה אמיתית!`
        },

        completion: {
            boy: `הקהל צועק את שמך! ניצחת בטורניר!
            מקום ראשון על הפודיום! 🏅`,
            girl: `הקהל צועק את שמך! ניצחת בטורניר!
            מקום ראשון על הפודיום! 🏅`
        },

        npc: {
            name: 'שופט הטורניר',
            icon: '🏅',
            dialogues: [
                { trigger: 'start', text: 'המתחרה {name} נכנס לזירה! שיהיה בהצלחה!' },
                { trigger: 'correct', text: 'פגיעה במרכז! נקודה מלאה! 🎯' },
                { trigger: 'wrong', text: { boy: 'החטאה קטנה — אלוף לא מוותר!', girl: 'החטאה קטנה — אלופה לא מוותרת!' } },
                { trigger: 'streak_5', text: '5 פגיעות ברצף! הקהל משתגע! 🔥' },
                { trigger: 'complete', text: 'יש לנו אלוף חדש בממלכה!' }
            ]
        }
    },

    level_16: {
        title: 'כתר האגדות',
        subtitle: 'The Legendary Crown',
        character: '👑',
        color: 'from-yellow-400 to-amber-700',
        unlockRequirement: 15,

        intro: {
            boy: `היום הגדול הגיע: טקס כתר האגדות!
            רק מי ששולט בכל מילות הממלכה
            ראוי לשבת על כס האגדה. זה אתה?`,
            girl: `היום הגדול הגיע: טקס כתר האגדות!
            רק מי ששולטת בכל מילות הממלכה
            ראויה לשבת על כס האגדה. זו את?`
        },

        completion: {
            boy: `הכתר מונח על ראשך!
            מהיום יספרו עליך אגדות בכל הממלכה.
            {name} — אגדת המילים! 👑`,
            girl: `הכתר מונח על ראשך!
            מהיום יספרו עלייך אגדות בכל הממלכה.
            {name} — אגדת המילים! 👑`
        },

        npc: {
            name: 'המלכה הזקנה',
            icon: '👵',
            dialogues: [
                { trigger: 'start', text: '{name}, הממלכה כולה צופה בך. הראה לנו אגדה!' },
                { trigger: 'correct', text: 'מילה של אגדה! הכתר מתקרב!' },
                { trigger: 'wrong', text: { boy: 'גם אגדות טועות לפעמים. המשך!', girl: 'גם אגדות טועות לפעמים. המשיכי!' } },
                { trigger: 'streak_5', text: 'הכס זוהר! 5 ברצף! ✨' },
                { trigger: 'complete', text: 'קומו לכבוד אגדת המילים החדשה! 👑' }
            ]
        }
    },
};

/**
 * Unified chapter lookup: legacy difficulty chapters + per-level chapters.
 * Every runtime lookup MUST go through this map — LEVEL_CHAPTERS sat
 * unreferenced for months because lookups only consulted CHAPTERS, so no
 * per-level story was ever shown.
 */
export const ALL_CHAPTERS = { ...CHAPTERS, ...LEVEL_CHAPTERS };

// ============================================
// PET EVOLUTION SYSTEM
// Thresholds recalibrated for 200-word scale (Phase 6)
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
                wordsRequired: 30,
                ability: 'עוזר למצוא רמזים',
                dialogue: 'למדתי טריקים חדשים בזכותך!'
            },
            {
                level: 3,
                name: 'כלב קסום',
                icon: '🐕‍🦺',
                wordsRequired: 80,
                ability: 'יכול לדבר!',
                dialogue: 'וואו! עכשיו אני יכול לדבר איתך!'
            },
            {
                level: 4,
                name: 'כלב אגדי',
                icon: '🦊',
                wordsRequired: 150,
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
                wordsRequired: 30,
                ability: 'יכול לעוף קצת',
                dialogue: 'הכנפיים שלי גדלות!'
            },
            {
                level: 3,
                name: 'חד קרן מופלא',
                icon: '🦄',
                wordsRequired: 80,
                ability: 'קסם ריפוי',
                dialogue: 'אני יכול לרפא אותך עכשיו!'
            },
            {
                level: 4,
                name: 'חד קרן שמימי',
                icon: '🦄',
                wordsRequired: 150,
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
                wordsRequired: 30,
                ability: 'יורק אש קטנה',
                dialogue: 'תראה! אני יכול לירוק אש!'
            },
            {
                level: 3,
                name: 'דרקון אדיר',
                icon: '🐉',
                wordsRequired: 80,
                ability: 'כנפיים גדולות',
                dialogue: 'הכנפיים שלי חזקות מספיק לשנינו!'
            },
            {
                level: 4,
                name: 'דרקון אגדי',
                icon: '🐉',
                wordsRequired: 150,
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
    // Thresholds recalibrated for 200-word scale (Phase 6)
    lore: [
        { id: 'lore_1', text: 'פעם, המילים היו יצורים חיים שרקדו בשמיים...', unlockAt: 15 },
        { id: 'lore_2', text: 'הקוסם האפל היה פעם ילד שלא ידע לקרוא...', unlockAt: 40 },
        { id: 'lore_3', text: 'מלכת המילים הראשונה למדה 1000 שפות!', unlockAt: 80 },
        { id: 'lore_4', text: 'יש שער סודי שנפתח רק למי שיודע את כל המילים...', unlockAt: 120 },
        { id: 'lore_5', text: 'האגדה אומרת שמי שמחזיר את כל המילים יהפוך לקוסם...', unlockAt: 175 },
    ]
};

// ============================================
// RANDOM DIALOGUES & ENCOURAGEMENT
// ============================================

export const ENCOURAGEMENT = {
    correct: [
        'מעולה! 🌟',
        'נכון מאוד! ✨',
        'כוכב! ⭐',
        'מושלם! 💫',
        'וואו! 🎉',
        'גאוני! 🧠',
        'מדהים! 🚀',
        'פנטסטי! 🎯',
    ],

    wrong: [
        { boy: 'כמעט! נסה שוב 💪', girl: 'כמעט! נסי שוב 💪' },
        'לא נורא, בפעם הבאה! 🌈',
        'טעויות זה חלק מהלמידה 📚',
        'אל תוותרו! 🔥',
        'אפשר! 💫',
    ],

    streak: {
        3: ['3 ברצף! אש! 🔥', 'מתחמם פה! 🌡️'],
        5: ['5 ברצף! סופר! 🦸', 'בלתי ניתן לעצירה! 🚀'],
        10: ['10 ברצף! אגדי! 👑', 'מכונה! 🤖'],
        15: ['15 ברצף! על-אנושי! 🌟', 'מאסטר! 🎓'],
        20: ['20 ברצף! אלוהי! ✨', 'אין כמוך! 🏆'],
    },

    lowLives: [
        { boy: 'נשאר לך לב אחד! התרכז! ❤️', girl: 'נשאר לך לב אחד! התרכזי! ❤️' },
        'זהירות! החיים יקרים! 💔',
    ],

    dailyReturn: [
        'שמחים שחזרת! 🌈',
        { boy: 'בוקר טוב, גיבור! ☀️', girl: 'בוקר טוב, גיבורה! ☀️' },
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
 * Resolve a text value that may be a plain string or a { boy, girl } object.
 * @param {string|{boy: string, girl: string}} text - Text or gendered text object
 * @param {string} gender - 'boy' or 'girl', defaults to 'boy'
 * @returns {string} The resolved string
 */
export const resolveGenderedText = (text, gender = 'boy') => {
    if (typeof text === 'string') return text;
    return text[gender] || text.boy;
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
    return ALL_CHAPTERS[level] || null;
};

/**
 * Check if a chapter is unlocked
 */
export const isChapterUnlocked = (level, wordsLearned) => {
    const chapter = ALL_CHAPTERS[level];
    if (!chapter) return false;
    return wordsLearned >= chapter.unlockRequirement;
};

/**
 * Get NPC dialogue for a trigger.
 * Supports both plain string text and { boy, girl } gendered objects.
 * @param {string} level - Chapter level key (easy/medium/hard/expert/master)
 * @param {string} trigger - Dialogue trigger (start/correct/wrong/streak_N/complete)
 * @param {string} playerName - Player's name for {name} substitution
 * @param {string} gender - Player gender ('boy' or 'girl'), defaults to 'boy'
 */
export const getNPCDialogue = (level, trigger, playerName, gender = 'boy') => {
    const chapter = ALL_CHAPTERS[level];
    if (!chapter || !chapter.npc) return null;

    const dialogue = chapter.npc.dialogues.find(d => d.trigger === trigger);
    if (!dialogue) return null;

    // Support both plain text and { boy, girl } objects
    const text = typeof dialogue.text === 'string'
        ? dialogue.text
        : dialogue.text[gender] || dialogue.text.boy;

    return text.replace('{name}', playerName);
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
