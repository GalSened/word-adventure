import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Backpack, Star, Check, Sparkles, X, ChevronRight,
    Zap, Heart, Shield, Palette, FlaskConical, PawPrint
} from 'lucide-react';
import {
    STORE_ITEMS,
    CATEGORIES,
    RARITIES
} from '../data/storeItems';

/**
 * Enhanced Inventory Component
 * Displays owned items with equip/use functionality
 */
export default function Inventory({
    inventory,
    equipped = {},
    onClose,
    onEquip,
    onUnequip,
    onUse,
    onWalkPet,
    gender = 'boy'
}) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const t = (male, female) => gender === 'boy' ? male : female;

    // Group inventory items by category with counts
    const groupedInventory = useMemo(() => {
        const groups = {};
        const counts = {};

        inventory.forEach(itemId => {
            counts[itemId] = (counts[itemId] || 0) + 1;
        });

        // Get unique items
        const uniqueItems = [...new Set(inventory)];

        uniqueItems.forEach(itemId => {
            const item = STORE_ITEMS[itemId];
            if (!item) return;

            if (!groups[item.category]) {
                groups[item.category] = [];
            }
            groups[item.category].push({
                ...item,
                count: counts[itemId]
            });
        });

        return groups;
    }, [inventory]);

    // Get equipped items for display
    const equippedItems = useMemo(() => {
        const items = [];
        Object.entries(equipped).forEach(([slot, itemId]) => {
            const item = STORE_ITEMS[itemId];
            if (item) {
                items.push({ ...item, slot });
            }
        });
        return items;
    }, [equipped]);

    // Check if item is equipped
    const isEquipped = (itemId) => {
        return Object.values(equipped).includes(itemId);
    };

    // Handle equip/unequip
    const handleEquipToggle = (item) => {
        if (isEquipped(item.id)) {
            onUnequip?.(item);
        } else {
            onEquip?.(item);
        }
    };

    // Handle use consumable
    const handleUse = (item) => {
        onUse?.(item);
        setSelectedItem(null);
    };

    // Handle pet walk
    const handleWalkPet = (item) => {
        onWalkPet?.(item.id);
    };

    // Render item card
    const renderItemCard = (item, showActions = true) => {
        const rarity = RARITIES[item.rarity];
        const equipped = isEquipped(item.id);

        return (
            <motion.div
                key={item.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedItem(item)}
                className={`relative cursor-pointer rounded-2xl p-4 flex flex-col items-center gap-2 border-2 transition-all ${
                    equipped
                        ? 'bg-gradient-to-b from-yellow-50 to-amber-50 border-yellow-300 ring-2 ring-yellow-400/50'
                        : 'bg-gradient-to-b from-white to-slate-50 border-slate-100 hover:border-blue-300'
                }`}
            >
                {/* Equipped badge */}
                {equipped && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Check size={12} /> מצויד
                    </div>
                )}

                {/* Rarity indicator */}
                <div className={`absolute top-2 left-2 w-2 h-2 rounded-full bg-gradient-to-r ${rarity.color}`} />

                {/* Count badge for stackables */}
                {item.count > 1 && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        {item.count}
                    </div>
                )}

                {/* Icon */}
                <div className="text-5xl mb-1">{item.icon}</div>

                {/* Name */}
                <h3 className="font-bold text-base text-center">{item.name}</h3>

                {/* Rarity */}
                <span className={`text-xs font-medium ${rarity.textColor}`}>
                    {rarity.name}
                </span>

                {/* Quick action buttons */}
                {showActions && (
                    <div className="flex gap-2 mt-1">
                        {item.walkable && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleWalkPet(item);
                                }}
                                className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center gap-1"
                            >
                                <PawPrint size={12} /> טיול
                            </button>
                        )}
                        {item.equipable && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEquipToggle(item);
                                }}
                                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1 ${
                                    equipped
                                        ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                            >
                                {equipped ? 'הסר' : 'לבש'}
                            </button>
                        )}
                        {item.consumable && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUse(item);
                                }}
                                className="bg-purple-500 text-white text-xs px-3 py-1.5 rounded-xl font-bold hover:bg-purple-600 transition-colors"
                            >
                                השתמש
                            </button>
                        )}
                    </div>
                )}
            </motion.div>
        );
    };

    // Render item detail modal
    const renderItemDetail = () => {
        if (!selectedItem) return null;
        const rarity = RARITIES[selectedItem.rarity];
        const equipped = isEquipped(selectedItem.id);

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={() => setSelectedItem(null)}
            >
                <motion.div
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 50 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
                >
                    {/* Close button */}
                    <button
                        onClick={() => setSelectedItem(null)}
                        className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200"
                    >
                        <X size={20} />
                    </button>

                    {/* Item display */}
                    <div className="text-center">
                        <div className="text-8xl mb-4">{selectedItem.icon}</div>
                        <h2 className="text-2xl font-bold mb-1">{selectedItem.name}</h2>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${rarity.color} text-white mb-4`}>
                            {rarity.name}
                        </span>

                        {/* Count for stackables */}
                        {selectedItem.count > 1 && (
                            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold mb-4 inline-block mr-2">
                                יש לך: {selectedItem.count}
                            </div>
                        )}

                        <p className="text-slate-600 mb-4">{selectedItem.description}</p>

                        {/* Effect description */}
                        {selectedItem.effect && (
                            <div className="bg-purple-50 rounded-xl p-3 mb-4">
                                <p className="text-purple-700 font-medium flex items-center justify-center gap-2">
                                    <Sparkles size={16} />
                                    {selectedItem.effect.bonus || getEffectDescription(selectedItem.effect)}
                                </p>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col gap-3">
                            {selectedItem.walkable && (
                                <button
                                    onClick={() => {
                                        handleWalkPet(selectedItem);
                                        setSelectedItem(null);
                                    }}
                                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                                >
                                    <PawPrint size={20} />
                                    לצאת לטיול!
                                </button>
                            )}

                            {selectedItem.equipable && (
                                <button
                                    onClick={() => {
                                        handleEquipToggle(selectedItem);
                                        setSelectedItem(null);
                                    }}
                                    className={`w-full py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                                        equipped
                                            ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg'
                                    }`}
                                >
                                    {equipped ? (
                                        <>
                                            <X size={20} />
                                            הסר פריט
                                        </>
                                    ) : (
                                        <>
                                            <Check size={20} />
                                            {t('לבש', 'לבשי')} פריט
                                        </>
                                    )}
                                </button>
                            )}

                            {selectedItem.consumable && (
                                <button
                                    onClick={() => handleUse(selectedItem)}
                                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                                >
                                    <Zap size={20} />
                                    השתמש עכשיו
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    // Get effect description
    const getEffectDescription = (effect) => {
        switch (effect.type) {
            case 'multiplier': return `נקודות x${effect.value}`;
            case 'extra_life': return `+${effect.value} לבבות`;
            case 'hint_boost': return 'רמזים מפורטים יותר';
            case 'streak_protection': return 'הגנה על רצף';
            case 'xp_multiplier': return `התקדמות x${effect.value}`;
            case 'theme': return 'ערכת צבעים חדשה';
            case 'heal': return `משחזר ${effect.value} לבבות`;
            case 'hint': return 'רמז נוסף';
            case 'skip': return 'דילוג על מילה';
            case 'freeze': return `${effect.duration} שניות חשיבה`;
            case 'luck': return 'סיכוי לבונוס';
            case 'mystery': return 'הפתעה אקראית!';
            default: return effect.type;
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl max-w-4xl mx-auto overflow-hidden" dir="rtl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white p-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Backpack size={32} />
                        <h2 className="text-3xl font-bold">התיק שלי</h2>
                    </div>
                    <button
                        onClick={() => onClose(null)}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Equipped items bar */}
                {equippedItems.length > 0 && (
                    <div className="mt-4 bg-white/10 rounded-2xl p-3">
                        <p className="text-sm text-blue-100 mb-2">פריטים מצוידים:</p>
                        <div className="flex flex-wrap gap-2">
                            {equippedItems.map(item => (
                                <div
                                    key={item.id}
                                    className="bg-white/20 rounded-xl px-3 py-1.5 flex items-center gap-2 text-sm font-medium"
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.name}</span>
                                    <button
                                        onClick={() => onUnequip?.(item)}
                                        aria-label={`הסר ${item.name}`}
                                        className="hover:bg-white/20 rounded-lg p-2 -my-1.5"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
                {inventory.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <div className="text-8xl mb-4">🎒</div>
                        <p className="text-xl">התיק ריק...</p>
                        <p>{t('בוא', 'בואי')} נקנה משהו בחנות!</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {selectedCategory ? (
                            // Category view
                            <motion.div
                                key="category"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                            >
                                {/* Back button */}
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="flex items-center gap-2 text-blue-600 font-bold mb-4 hover:text-blue-700"
                                >
                                    <ChevronRight size={20} />
                                    חזרה לתיק
                                </button>

                                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <span className="text-3xl">{CATEGORIES[selectedCategory].icon}</span>
                                    {CATEGORIES[selectedCategory].name}
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {groupedInventory[selectedCategory]?.map(item =>
                                        renderItemCard(item)
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            // Main inventory view
                            <motion.div
                                key="main"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                            >
                                {/* Categories */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.values(CATEGORIES).map(category => {
                                        const items = groupedInventory[category.id] || [];
                                        if (items.length === 0) return null;

                                        return (
                                            <motion.button
                                                key={category.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setSelectedCategory(category.id)}
                                                className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 text-center border-2 border-slate-100 hover:border-blue-300 transition-colors relative"
                                            >
                                                {/* Item count badge */}
                                                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                                    {items.reduce((sum, item) => sum + item.count, 0)}
                                                </div>

                                                <div className="text-5xl mb-2">{category.icon}</div>
                                                <h4 className="font-bold text-lg">{category.name}</h4>

                                                {/* Preview of items */}
                                                <div className="flex justify-center gap-1 mt-2">
                                                    {items.slice(0, 4).map(item => (
                                                        <span key={item.id} className="text-xl">
                                                            {item.icon}
                                                        </span>
                                                    ))}
                                                    {items.length > 4 && (
                                                        <span className="text-slate-400 text-sm">+{items.length - 4}</span>
                                                    )}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Quick access to all items */}
                                <div className="mt-8">
                                    <h3 className="text-xl font-bold mb-4">כל הפריטים</h3>
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                        {Object.values(groupedInventory)
                                            .flat()
                                            .slice(0, 8)
                                            .map(item => renderItemCard(item, false))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Item detail modal */}
            <AnimatePresence>
                {selectedItem && renderItemDetail()}
            </AnimatePresence>
        </div>
    );
}
