import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Check, Sparkles, Tag, X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    STORE_ITEMS,
    CATEGORIES,
    RARITIES,
    FEATURED_ITEMS,
    getItemsByCategory,
    getDailyDeals
} from '../data/storeItems';

export default function Store({ coins, inventory, onBuy, onClose, gender = 'boy' }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const t = (male, female) => gender === 'boy' ? male : female;

    // Get daily deals (memoized so they don't change during session)
    const dailyDeals = useMemo(() => getDailyDeals(), []);

    // Get featured items
    const featuredItems = FEATURED_ITEMS.map(id => STORE_ITEMS[id]).filter(Boolean);

    // Count owned items
    const getOwnedCount = (itemId) => {
        return inventory.filter(id => id === itemId).length;
    };

    const isOwned = (itemId) => {
        const item = STORE_ITEMS[itemId];
        if (!item) return false;
        if (item.stackable) return false; // Stackable items can be bought multiple times
        return inventory.includes(itemId);
    };

    const canAfford = (price) => coins >= price;

    const handleBuy = (item, discountedPrice = null) => {
        const price = discountedPrice || item.price;
        if (canAfford(price) && !isOwned(item.id)) {
            onBuy({ ...item, price });
        }
    };

    const renderItemCard = (item, discountedPrice = null, size = 'normal') => {
        const owned = isOwned(item.id);
        const ownedCount = getOwnedCount(item.id);
        const price = discountedPrice || item.price;
        const affordable = canAfford(price);
        const rarity = RARITIES[item.rarity];

        return (
            <motion.div
                key={item.id}
                layoutId={item.id}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedItem(item)}
                className={`relative cursor-pointer rounded-2xl p-4 flex flex-col items-center gap-2 border-2 transition-all ${
                    owned
                        ? 'bg-green-50 border-green-200'
                        : `bg-gradient-to-b from-white to-slate-50 border-slate-100 hover:border-purple-300`
                } ${size === 'large' ? 'p-6' : ''}`}
            >
                {/* Rarity indicator */}
                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-r ${rarity.color}`} />

                {/* Discount badge */}
                {discountedPrice && (
                    <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -30%
                    </div>
                )}

                {/* Owned count for stackables */}
                {item.stackable && ownedCount > 0 && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        {ownedCount}
                    </div>
                )}

                {/* Icon */}
                <div className={`${size === 'large' ? 'text-7xl' : 'text-5xl'} mb-1`}>
                    {item.icon}
                </div>

                {/* Name */}
                <h3 className={`font-bold ${size === 'large' ? 'text-xl' : 'text-base'} text-center`}>
                    {item.name}
                </h3>

                {/* Rarity label */}
                <span className={`text-xs font-medium ${rarity.textColor}`}>
                    {rarity.name}
                </span>

                {/* Price or owned */}
                {owned && !item.stackable ? (
                    <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-xl font-bold text-sm flex items-center gap-1 mt-1">
                        <Check size={14} /> יש לך
                    </div>
                ) : (
                    <div className="flex items-center gap-2 mt-1">
                        {discountedPrice && (
                            <span className="text-slate-400 line-through text-sm">
                                {item.price}
                            </span>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleBuy(item, discountedPrice);
                            }}
                            disabled={!affordable}
                            className={`px-3 py-1.5 rounded-xl font-bold text-sm flex items-center gap-1 transition-colors ${
                                affordable
                                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            <Star size={14} fill="currentColor" />
                            {price}
                        </button>
                    </div>
                )}
            </motion.div>
        );
    };

    const renderItemDetail = () => {
        if (!selectedItem) return null;
        const rarity = RARITIES[selectedItem.rarity];
        const owned = isOwned(selectedItem.id);
        const affordable = canAfford(selectedItem.price);

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
                    className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
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

                        <p className="text-slate-600 mb-4">{selectedItem.description}</p>

                        {/* Effect description */}
                        {selectedItem.effect && (
                            <div className="bg-purple-50 rounded-xl p-3 mb-4">
                                <p className="text-purple-700 font-medium flex items-center justify-center gap-2">
                                    <Sparkles size={16} />
                                    {selectedItem.effect.bonus || selectedItem.effect.type}
                                </p>
                            </div>
                        )}

                        {/* Buy button */}
                        {owned && !selectedItem.stackable ? (
                            <div className="bg-green-100 text-green-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                                <Check size={20} />
                                כבר יש לך את הפריט הזה!
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    handleBuy(selectedItem);
                                    setSelectedItem(null);
                                }}
                                disabled={!affordable}
                                className={`w-full py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors ${
                                    affordable
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                <Star size={20} fill="currentColor" />
                                {t('קנה', 'קני')} ב-{selectedItem.price}
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl max-w-4xl mx-auto overflow-hidden" dir="rtl">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <ShoppingBag size={32} />
                        <h2 className="text-3xl font-bold">חנות ההפתעות</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full font-bold flex items-center gap-2">
                            <Star fill="currentColor" size={20} />
                            <span className="text-xl">{coins}</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
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
                                className="flex items-center gap-2 text-purple-600 font-bold mb-4 hover:text-purple-700"
                            >
                                <ChevronRight size={20} />
                                חזרה לחנות
                            </button>

                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-3xl">{CATEGORIES[selectedCategory].icon}</span>
                                {CATEGORIES[selectedCategory].name}
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {getItemsByCategory(selectedCategory).map(item =>
                                    renderItemCard(item)
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        // Main store view
                        <motion.div
                            key="main"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                        >
                            {/* Daily Deals */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Tag className="text-red-500" size={24} />
                                    <h3 className="text-xl font-bold">מבצעי היום!</h3>
                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                        30% הנחה
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {dailyDeals.map(item =>
                                        renderItemCard(item, item.price)
                                    )}
                                </div>
                            </div>

                            {/* Featured Items */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="text-yellow-500" size={24} />
                                    <h3 className="text-xl font-bold">פריטים מומלצים</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {featuredItems.map(item =>
                                        renderItemCard(item)
                                    )}
                                </div>
                            </div>

                            {/* Categories */}
                            <div>
                                <h3 className="text-xl font-bold mb-4">קטגוריות</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.values(CATEGORIES).map(category => (
                                        <motion.button
                                            key={category.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedCategory(category.id)}
                                            className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 text-center border-2 border-slate-100 hover:border-purple-300 transition-colors"
                                        >
                                            <div className="text-5xl mb-2">{category.icon}</div>
                                            <h4 className="font-bold text-lg">{category.name}</h4>
                                            <p className="text-sm text-slate-500">{category.description}</p>
                                            <div className="mt-2 text-purple-600 text-sm font-medium">
                                                {getItemsByCategory(category.id).length} פריטים
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Item detail modal */}
            <AnimatePresence>
                {selectedItem && renderItemDetail()}
            </AnimatePresence>
        </div>
    );
}
