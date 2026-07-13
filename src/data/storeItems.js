/**
 * Store Items Data
 * Comprehensive item system with categories, effects, and rarities
 */

// Item rarities with colors
export const RARITIES = {
    common: { name: 'רגיל', color: 'from-slate-400 to-slate-500', textColor: 'text-slate-600' },
    rare: { name: 'נדיר', color: 'from-blue-400 to-blue-600', textColor: 'text-blue-600' },
    epic: { name: 'אפי', color: 'from-purple-400 to-purple-600', textColor: 'text-purple-600' },
    legendary: { name: 'אגדי', color: 'from-yellow-400 to-amber-500', textColor: 'text-amber-600' },
};

// Item categories
export const CATEGORIES = {
    pets: { id: 'pets', name: 'חיות מחמד', icon: '🐾', description: 'חברים להרפתקה' },
    petcare: { id: 'petcare', name: 'פינוקים לחיות', icon: '🦴', description: 'חטיפים וצעצועים לחבר שלך' },
    cosmetics: { id: 'cosmetics', name: 'קוסמטיקה', icon: '✨', description: 'שנה את המראה שלך' },
    boosters: { id: 'boosters', name: 'בוסטרים', icon: '⚡', description: 'כוחות מיוחדים למשחק' },
    themes: { id: 'themes', name: 'ערכות נושא', icon: '🎨', description: 'שנה את עיצוב המשחק' },
    consumables: { id: 'consumables', name: 'פריטים חד פעמיים', icon: '🧪', description: 'השתמש בהם בזמן המשחק' },
};

// All store items
export const STORE_ITEMS = {
    // ==================== PETS ====================
    dog: {
        id: 'dog',
        name: 'כלבלב חמוד',
        icon: '🐕',
        price: 200,
        category: 'pets',
        rarity: 'common',
        description: 'החבר הכי נאמן! מלווה אותך בהרפתקאות.',
        usage: 'בתיק: לוחצים "טיול" — האף שלו מוצא עצם נוספת בכל טיול! 🦴',
        effect: { type: 'companion', bonus: 'אף לעצמות — עצם נוספת בכל טיול' },
        walkable: true,
    },
    cat: {
        id: 'cat',
        name: 'חתלתול',
        icon: '🐱',
        price: 250,
        category: 'pets',
        rarity: 'common',
        description: 'חתול חמוד שאוהב לשחק.',
        usage: 'בתיק: לוחצים "טיול" — עיני החתול מוצאות עוד 2 מטבעות על השביל, תמיד! 🪙',
        effect: { type: 'companion', bonus: 'עיני חתול — עוד 2 מטבעות בכל טיול' },
        walkable: true,
    },
    unicorn: {
        id: 'unicorn',
        name: 'חד קרן קסום',
        icon: '🦄',
        price: 5000,
        category: 'pets',
        rarity: 'legendary',
        description: 'יצור קסום עם כוחות מיוחדים!',
        usage: 'בתיק: לוחצים "טיול" — הקסם מוסיף 25% מטבעות בסוף כל טיול! ✨',
        effect: { type: 'companion', bonus: 'קסם חד-קרן — 25% יותר מטבעות בכל טיול' },
        walkable: true,
    },
    dragon: {
        id: 'dragon',
        name: 'דרקון אש',
        icon: '🐉',
        price: 5000,
        category: 'pets',
        rarity: 'legendary',
        description: 'דרקון עוצמתי שמגן עליך!',
        usage: 'בתיק: לוחצים "טיול" — עוצמת הדרקון מכפילה את מטבעות משחק הכדור! 🔥',
        effect: { type: 'companion', bonus: 'עוצמת דרקון — מטבעות המשחק כפולים' },
        walkable: true,
    },
    owl: {
        id: 'owl',
        name: 'ינשוף חכם',
        icon: '🦉',
        price: 1500,
        category: 'pets',
        rarity: 'epic',
        description: 'ינשוף חכם שעוזר בלמידה.',
        usage: 'בתיק: לוחצים "טיול" — חכמת הינשוף הופכת כל מילה נכונה ל-50 מטבעות במקום 40! 📚',
        effect: { type: 'companion', bonus: 'חכמת הינשוף — כל מילה שווה 50' },
        walkable: true,
    },
    phoenix: {
        id: 'phoenix',
        name: 'עוף החול',
        icon: '🔥',
        price: 8000,
        category: 'pets',
        rarity: 'legendary',
        description: 'עוף אגדי שקם מהאפר!',
        usage: 'בתיק: לוחצים "טיול" — ברכת עוף החול מבטיחה את בונוס הטיול המושלם, תמיד! 🌟',
        effect: { type: 'companion', bonus: 'ברכת עוף החול — הבונוס המושלם מובטח' },
        walkable: true,
    },

    // ==================== PET CARE ====================
    treat_bone: {
        id: 'treat_bone',
        name: 'עצם טעימה',
        icon: '🦴',
        price: 50,
        category: 'petcare',
        rarity: 'common',
        description: 'חטיף קטן שמשמח כל כלב בטיול!',
        usage: 'בטיול: כשמגיעים לתחנת האוכל — החטיף מאכיל את החיה ומחזיר לה כוח!',
        effect: { type: 'treat', satiety: 25 },
        treat: true,
        stackable: true,
    },
    treat_cookie: {
        id: 'treat_cookie',
        name: 'עוגיית חיות',
        icon: '🍪',
        price: 120,
        category: 'petcare',
        rarity: 'rare',
        description: 'עוגייה גדולה ומפנקת — ארוחה שלמה!',
        usage: 'בטיול: כשמגיעים לתחנת האוכל — העוגייה משביעה הרבה יותר מעצם רגילה!',
        effect: { type: 'treat', satiety: 50 },
        treat: true,
        stackable: true,
    },
    toy_ball: {
        id: 'toy_ball',
        name: 'כדור משחק',
        icon: '🎾',
        price: 300,
        category: 'petcare',
        rarity: 'common',
        description: 'לזרוק ולהחזיר! משחק באחו בזמן הטיול.',
        usage: 'בטיול: בתחנת המשחק — זורקים את הכדור ומשחקים! החיה שמחה ומרוויחים מטבעות.',
        effect: { type: 'toy', happiness: 15 },
        toy: true,
    },
    toy_frisbee: {
        id: 'toy_frisbee',
        name: 'צלחת מעופפת',
        icon: '🥏',
        price: 500,
        category: 'petcare',
        rarity: 'rare',
        description: 'עפה רחוק — לכלבים ספורטיביים במיוחד!',
        usage: 'בטיול: בתחנת המשחק — צעצוע טוב יותר = החיה שמחה יותר בכל משחק!',
        effect: { type: 'toy', happiness: 20 },
        toy: true,
    },
    toy_teddy: {
        id: 'toy_teddy',
        name: 'דובי חיבוקים',
        icon: '🧸',
        price: 800,
        category: 'petcare',
        rarity: 'epic',
        description: 'החבר הרך שכל חיה אוהבת לסחוב בפה.',
        usage: 'בטיול: בתחנת המשחק — הצעצוע הכי משמח שיש! שווה הרבה שמחה בכל משחק.',
        effect: { type: 'toy', happiness: 25 },
        toy: true,
    },

    // ==================== COSMETICS ====================
    wizard_hat: {
        id: 'wizard_hat',
        name: 'כובע קוסמים',
        icon: '🎩',
        price: 500,
        category: 'cosmetics',
        rarity: 'rare',
        description: 'כובע קסום של קוסם אמיתי!',
        usage: 'בתיק: לוחצים "לבש" — והכובע מופיע על הדמות שלכם בכל המסכים!',
        effect: { type: 'visual', slot: 'head' },
        equipable: true,
    },
    crown: {
        id: 'crown',
        name: 'כתר מלכותי',
        icon: '👑',
        price: 1000,
        category: 'cosmetics',
        rarity: 'epic',
        description: 'כתר של מלך או מלכה אמיתיים!',
        usage: 'בתיק: לוחצים "לבש" — והכתר מופיע על הדמות שלכם בכל המסכים!',
        effect: { type: 'visual', slot: 'head' },
        equipable: true,
    },
    glasses: {
        id: 'glasses',
        name: 'משקפיים חכמים',
        icon: '👓',
        price: 300,
        category: 'cosmetics',
        rarity: 'common',
        description: 'משקפיים שגורמים לך להיראות חכם!',
        usage: 'בתיק: לוחצים "לבש" — והמשקפיים מופיעים על הדמות שלכם בכל המסכים!',
        effect: { type: 'visual', slot: 'face' },
        equipable: true,
    },
    sunglasses: {
        id: 'sunglasses',
        name: 'משקפי שמש',
        icon: '🕶️',
        price: 400,
        category: 'cosmetics',
        rarity: 'rare',
        description: 'להיראות מגניב תמיד!',
        usage: 'בתיק: לוחצים "לבש" — והמשקפיים מופיעים על הדמות שלכם בכל המסכים!',
        effect: { type: 'visual', slot: 'face' },
        equipable: true,
    },
    cape: {
        id: 'cape',
        name: 'גלימת גיבורים',
        icon: '🧣',
        price: 800,
        category: 'cosmetics',
        rarity: 'rare',
        description: 'גלימה שמתנופפת ברוח!',
        usage: 'בתיק: לוחצים "לבש" — והגלימה מופיעה ליד הדמות שלכם בכל המסכים!',
        effect: { type: 'visual', slot: 'back' },
        equipable: true,
    },
    wings: {
        id: 'wings',
        name: 'כנפי מלאך',
        icon: '🪽',
        price: 3000,
        category: 'cosmetics',
        rarity: 'epic',
        description: 'כנפיים זוהרות!',
        usage: 'בתיק: לוחצים "לבש" — והכנפיים מופיעות ליד הדמות שלכם בכל המסכים!',
        effect: { type: 'visual', slot: 'back' },
        equipable: true,
    },
    sparkles: {
        id: 'sparkles',
        name: 'נצנוצים קסומים',
        icon: '✨',
        price: 600,
        category: 'cosmetics',
        rarity: 'rare',
        description: 'נצנוצים שמלווים אותך!',
        usage: 'בתיק: לוחצים "לבש" — ונצנוצים קסומים מופיעים סביב הדמות שלכם!',
        effect: { type: 'visual', slot: 'aura' },
        equipable: true,
    },
    rainbow_trail: {
        id: 'rainbow_trail',
        name: 'שובל קשת',
        icon: '🌈',
        price: 2000,
        category: 'cosmetics',
        rarity: 'epic',
        description: 'שובל קשת בענן אחריך!',
        usage: 'בתיק: לוחצים "לבש" — והקשת מופיעה ליד הדמות שלכם בכל המסכים!',
        effect: { type: 'visual', slot: 'trail' },
        equipable: true,
    },

    // ==================== BOOSTERS ====================
    double_points: {
        id: 'double_points',
        name: 'נקודות כפולות',
        icon: '💎',
        price: 1500,
        category: 'boosters',
        rarity: 'epic',
        description: 'כל הנקודות שלך כפולות!',
        usage: 'בתיק: לוחצים "לבש" — וכל תשובה נכונה במשחק שווה כפול מטבעות!',
        effect: { type: 'multiplier', value: 2, duration: 'permanent' },
        equipable: true,
        maxOwned: 1,
    },
    extra_life: {
        id: 'extra_life',
        name: 'לב נוסף',
        icon: '💖',
        price: 2000,
        category: 'boosters',
        rarity: 'epic',
        description: 'התחל כל שלב עם 4 לבבות!',
        usage: 'בתיק: לוחצים "לבש" — ומעכשיו כל שלב מתחיל עם 4 לבבות במקום 3!',
        effect: { type: 'extra_life', value: 1 },
        equipable: true,
        maxOwned: 1,
    },
    hint_master: {
        id: 'hint_master',
        name: 'מאסטר רמזים',
        icon: '💡',
        price: 1200,
        category: 'boosters',
        rarity: 'rare',
        description: 'כל רמז חושף שתי אותיות במקום אחת!',
        usage: 'בתיק: לוחצים "לבש" — וכל רמז 💡 במשחק חושף שתי אותיות במקום אחת!',
        effect: { type: 'hint_boost', value: 'detailed' },
        equipable: true,
        maxOwned: 1,
    },
    streak_shield: {
        id: 'streak_shield',
        name: 'מגן רצף',
        icon: '🛡️',
        price: 1800,
        category: 'boosters',
        rarity: 'epic',
        description: 'הרצף שלך לא נשבר בטעות הראשונה!',
        usage: 'בתיק: לוחצים "לבש" — וכשטועים, המגן שומר על רצף התשובות הנכונות!',
        effect: { type: 'streak_protection', uses: 1 },
        equipable: true,
        maxOwned: 1,
    },
    xp_boost: {
        id: 'xp_boost',
        name: 'בוסט התקדמות',
        icon: '🚀',
        price: 2500,
        category: 'boosters',
        rarity: 'legendary',
        description: 'כל טיול עם החיה שווה כפול מטבעות!',
        usage: 'בתיק: לוחצים "לבש" — ובסוף כל טיול עם החיה מקבלים כפול מטבעות! 🚀',
        effect: { type: 'xp_multiplier', value: 2 },
        equipable: true,
        maxOwned: 1,
    },

    // ==================== THEMES ====================
    theme_ocean: {
        id: 'theme_ocean',
        name: 'ערכת אוקיינוס',
        icon: '🌊',
        price: 800,
        category: 'themes',
        rarity: 'rare',
        description: 'צבעי הים העמוק!',
        usage: 'בתיק: לוחצים "לבש" — וכל המשחק מתחלף לצבעי הים!',
        effect: { type: 'theme', colors: { primary: 'blue', secondary: 'cyan' } },
        equipable: true,
    },
    theme_forest: {
        id: 'theme_forest',
        name: 'ערכת יער',
        icon: '🌲',
        price: 800,
        category: 'themes',
        rarity: 'rare',
        description: 'ירוק של הטבע!',
        usage: 'בתיק: לוחצים "לבש" — וכל המשחק מתחלף לצבעי היער!',
        effect: { type: 'theme', colors: { primary: 'green', secondary: 'emerald' } },
        equipable: true,
    },
    theme_sunset: {
        id: 'theme_sunset',
        name: 'ערכת שקיעה',
        icon: '🌅',
        price: 1000,
        category: 'themes',
        rarity: 'epic',
        description: 'צבעי השקיעה היפים!',
        usage: 'בתיק: לוחצים "לבש" — וכל המשחק מתחלף לצבעי שקיעה!',
        effect: { type: 'theme', colors: { primary: 'orange', secondary: 'pink' } },
        equipable: true,
    },
    theme_galaxy: {
        id: 'theme_galaxy',
        name: 'ערכת גלקסיה',
        icon: '🌌',
        price: 2000,
        category: 'themes',
        rarity: 'legendary',
        description: 'צבעי החלל!',
        usage: 'בתיק: לוחצים "לבש" — וכל המשחק מתחלף לצבעי גלקסיה!',
        effect: { type: 'theme', colors: { primary: 'purple', secondary: 'indigo' } },
        equipable: true,
    },
    theme_candy: {
        id: 'theme_candy',
        name: 'ערכת ממתקים',
        icon: '🍭',
        price: 1200,
        category: 'themes',
        rarity: 'epic',
        description: 'צבעים מתוקים!',
        usage: 'בתיק: לוחצים "לבש" — וכל המשחק מתחלף לצבעי ממתקים!',
        effect: { type: 'theme', colors: { primary: 'pink', secondary: 'purple' } },
        equipable: true,
    },

    // ==================== CONSUMABLES ====================
    potion_health: {
        id: 'potion_health',
        name: 'שיקוי חיים',
        icon: '❤️‍🩹',
        price: 200,
        category: 'consumables',
        rarity: 'common',
        description: 'משחזר לב אחד במשחק!',
        usage: 'בתיק: לוחצים "השתמש" — ולב אחד חוזר מיד!',
        effect: { type: 'heal', value: 1 },
        consumable: true,
        stackable: true,
    },
    potion_hint: {
        id: 'potion_hint',
        name: 'שיקוי רמז',
        icon: '🔮',
        price: 150,
        category: 'consumables',
        rarity: 'common',
        description: 'מקבל רמז נוסף!',
        usage: 'בתיק: לוחצים "השתמש" — ובמשחק מופיע כפתור 💡 שחושף אות בתשובה!',
        effect: { type: 'hint', value: 1 },
        consumable: true,
        stackable: true,
    },
    skip_word: {
        id: 'skip_word',
        name: 'דלג על מילה',
        icon: '⏭️',
        price: 300,
        category: 'consumables',
        rarity: 'rare',
        description: 'מדלג על מילה קשה!',
        usage: 'בתיק: לוחצים "השתמש" — ובמשחק מופיע כפתור ⏭️ שמדלג על מילה קשה!',
        effect: { type: 'skip', value: 1 },
        consumable: true,
        stackable: true,
    },
    // Retired: the game has no timer, so "freeze time" can never do anything.
    // Kept in the catalog so legacy owners still see it in their inventory;
    // using it refunds the purchase price. Not sold in the store (retired: true).
    freeze_time: {
        id: 'freeze_time',
        name: 'הקפאת זמן',
        icon: '⏸️',
        price: 250,
        category: 'consumables',
        rarity: 'rare',
        description: 'הפריט יצא משימוש — שימוש בו מחזיר את המטבעות!',
        usage: 'בתיק: לוחצים "השתמש" — ומקבלים את המטבעות בחזרה.',
        effect: { type: 'freeze', duration: 30 },
        consumable: true,
        stackable: true,
        retired: true,
    },
    lucky_coin: {
        id: 'lucky_coin',
        name: 'מטבע מזל',
        icon: '🍀',
        price: 100,
        category: 'consumables',
        rarity: 'common',
        description: 'סיכוי לנקודות בונוס!',
        usage: 'בתיק: לוחצים "השתמש" — ואם יש מזל, זוכים במטבעות בונוס!',
        effect: { type: 'luck', bonus_chance: 0.5 },
        consumable: true,
        stackable: true,
    },
    mystery_box: {
        id: 'mystery_box',
        name: 'קופסת הפתעה',
        icon: '🎁',
        price: 500,
        category: 'consumables',
        rarity: 'epic',
        description: 'מה יש בפנים? הפתעה!',
        usage: 'בתיק: לוחצים "השתמש" — ומגלים מה ההפתעה: מטבעות או פריט מתנה!',
        effect: { type: 'mystery', possible_rewards: ['coins', 'item'] },
        consumable: true,
        stackable: true,
    },
};

// Get items by category (retired items stay usable but are no longer sold)
export const getItemsByCategory = (category) => {
    return Object.values(STORE_ITEMS).filter(item => item.category === category && !item.retired);
};

// Get item by ID
export const getItemById = (id) => {
    return STORE_ITEMS[id] || null;
};

// Get all pets that can walk
export const getWalkablePets = () => {
    return Object.values(STORE_ITEMS).filter(item => item.walkable);
};

// Get all equipable items
export const getEquipableItems = () => {
    return Object.values(STORE_ITEMS).filter(item => item.equipable);
};

// Get all consumables
export const getConsumables = () => {
    return Object.values(STORE_ITEMS).filter(item => item.consumable);
};

// Featured items (for store front page)
export const FEATURED_ITEMS = ['unicorn', 'double_points', 'theme_galaxy', 'mystery_box'];

// Daily deals (random selection)
export const getDailyDeals = () => {
    const allItems = Object.values(STORE_ITEMS).filter(item => !item.retired);
    // Fisher-Yates: Array.sort with a random comparator produces a biased shuffle
    const shuffled = [...allItems];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 3).map(item => ({
        ...item,
        originalPrice: item.price,
        price: Math.floor(item.price * 0.7), // 30% off
    }));
};
