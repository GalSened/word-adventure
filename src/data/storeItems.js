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
        effect: { type: 'companion', bonus: 'מוצא רמזים לפעמים' },
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
        effect: { type: 'companion', bonus: 'נותן מוטיבציה' },
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
        effect: { type: 'companion', bonus: '+10% נקודות' },
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
        effect: { type: 'companion', bonus: 'הגנה מטעות אחת ביום' },
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
        effect: { type: 'companion', bonus: 'רמזים טובים יותר' },
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
        effect: { type: 'companion', bonus: 'חיים נוספים' },
        walkable: true,
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
        description: 'רמזים מפורטים יותר!',
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
        description: 'מילים נספרות כפול להתפתחות חיות!',
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
        effect: { type: 'skip', value: 1 },
        consumable: true,
        stackable: true,
    },
    freeze_time: {
        id: 'freeze_time',
        name: 'הקפאת זמן',
        icon: '⏸️',
        price: 250,
        category: 'consumables',
        rarity: 'rare',
        description: 'עוצר את הזמן לחשיבה!',
        effect: { type: 'freeze', duration: 30 },
        consumable: true,
        stackable: true,
    },
    lucky_coin: {
        id: 'lucky_coin',
        name: 'מטבע מזל',
        icon: '🍀',
        price: 100,
        category: 'consumables',
        rarity: 'common',
        description: 'סיכוי לנקודות בונוס!',
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
        effect: { type: 'mystery', possible_rewards: ['coins', 'item', 'boost'] },
        consumable: true,
        stackable: true,
    },
};

// Get items by category
export const getItemsByCategory = (category) => {
    return Object.values(STORE_ITEMS).filter(item => item.category === category);
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
    const allItems = Object.values(STORE_ITEMS);
    const shuffled = allItems.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map(item => ({
        ...item,
        originalPrice: item.price,
        price: Math.floor(item.price * 0.7), // 30% off
    }));
};
