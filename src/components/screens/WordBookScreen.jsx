import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initialWordData } from '../../data/words';
import { WORD_CATEGORIES } from '../../data/wordSchema';
import { useGameStore } from '../../store/gameStore';

/**
 * Category Hebrew names mapping
 */
const CATEGORY_LABELS = {
    animals: { emoji: '\uD83D\uDC3E', name: '\u05D7\u05D9\u05D5\u05EA' },
    food: { emoji: '\uD83C\uDF54', name: '\u05D0\u05D5\u05DB\u05DC' },
    family: { emoji: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67', name: '\u05DE\u05E9\u05E4\u05D7\u05D4' },
    colors: { emoji: '\uD83C\uDFA8', name: '\u05E6\u05D1\u05E2\u05D9\u05DD' },
    nature: { emoji: '\uD83C\uDF3F', name: '\u05D8\u05D1\u05E2' },
    body: { emoji: '\uD83E\uDDB6', name: '\u05D2\u05D5\u05E3' },
    actions: { emoji: '\uD83C\uDFC3', name: '\u05E4\u05E2\u05D5\u05DC\u05D5\u05EA' },
    home: { emoji: '\uD83C\uDFE0', name: '\u05D1\u05D9\u05EA' },
    emotions: { emoji: '\uD83D\uDE0A', name: '\u05E8\u05D2\u05E9\u05D5\u05EA' },
    professions: { emoji: '\uD83D\uDC69\u200D\u2695\uFE0F', name: '\u05DE\u05E7\u05E6\u05D5\u05E2\u05D5\u05EA' },
    school: { emoji: '\uD83C\uDFEB', name: '\u05D1\u05D9\u05EA \u05E1\u05E4\u05E8' },
    transport: { emoji: '\uD83D\uDE97', name: '\u05EA\u05D7\u05D1\u05D5\u05E8\u05D4' },
};

// A category added to the word data without a label here must never crash
// the screen \u2014 fall back to a generic book label with the raw key.
const labelFor = (cat) => CATEGORY_LABELS[cat] || { emoji: '\uD83D\uDCDA', name: cat };

/**
 * Mastery band colors and labels
 */
const MASTERY_BANDS = {
    unseen: { color: '#94a3b8', label: '\u05DC\u05D0 \u05E0\u05E8\u05D0\u05D4', bg: 'bg-slate-100', text: 'text-slate-400' },
    new: { color: '#3b82f6', label: '\u05D7\u05D3\u05E9', bg: 'bg-blue-100', text: 'text-blue-600' },
    learning: { color: '#eab308', label: '\u05DC\u05D5\u05DE\u05D3', bg: 'bg-yellow-100', text: 'text-yellow-600' },
    familiar: { color: '#f97316', label: '\u05DE\u05D5\u05DB\u05E8', bg: 'bg-orange-100', text: 'text-orange-600' },
    mastered: { color: '#22c55e', label: '\u05E0\u05E9\u05DC\u05D8!', bg: 'bg-green-100', text: 'text-green-600' },
};

/**
 * Determine mastery band from SRS repetition count.
 * Matches thresholds in challengeSelector.js getMasteryBand.
 */
function getMasteryBand(repetition) {
    if (repetition <= 1) return 'new';
    if (repetition <= 3) return 'learning';
    if (repetition <= 5) return 'familiar';
    return 'mastered';
}

/**
 * WordBookScreen - Browse all words organized by category with mastery indicators.
 * Lets players review learned words and discover unseen ones.
 */
export default function WordBookScreen({ onClose }) {
    const userProgress = useGameStore((s) => s.userProgress);

    // Group words by category and count learned per category
    const wordsByCategory = useMemo(() => {
        const grouped = {};
        for (const cat of WORD_CATEGORIES) {
            grouped[cat] = initialWordData.filter((w) => w.category === cat);
        }
        return grouped;
    }, []);

    const learnedCountByCategory = useMemo(() => {
        const counts = {};
        for (const cat of WORD_CATEGORIES) {
            counts[cat] = wordsByCategory[cat].filter(
                (w) => userProgress[w.id]
            ).length;
        }
        return counts;
    }, [userProgress, wordsByCategory]);

    // Default to first category with learned words, or first category overall
    const defaultCategory = useMemo(() => {
        const withLearned = WORD_CATEGORIES.find(
            (cat) => learnedCountByCategory[cat] > 0
        );
        return withLearned || WORD_CATEGORIES[0];
    }, [learnedCountByCategory]);

    const [activeCategory, setActiveCategory] = useState(defaultCategory);
    const [expandedWordId, setExpandedWordId] = useState(null);

    const categoryWords = wordsByCategory[activeCategory] || [];

    return (
        <motion.div
            key="wordBook"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen py-4 px-4"
        >
            {/* Header with exit button */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={onClose}
                    className="text-purple-600 font-bold text-lg hover:text-purple-700 transition-colors"
                >
                    {'\u2190'} {'\u05DE\u05D9\u05DC\u05D5\u05DF'}
                </button>
                <h1 className="text-2xl font-black text-purple-600">
                    {'\uD83D\uDCD6'} {'\u05DE\u05D9\u05DC\u05D5\u05DF \u05DE\u05D9\u05DC\u05D9\u05DD'}
                </h1>
                <div className="w-16" /> {/* Spacer for centering */}
            </div>

            {/* Category tabs - horizontal scrollable */}
            <div className="overflow-x-auto flex gap-2 pb-2 mb-4 scrollbar-hide">
                {WORD_CATEGORIES.map((cat) => {
                    const label = labelFor(cat);
                    const isActive = cat === activeCategory;
                    return (
                        <button
                            key={cat}
                            onClick={() => {
                                setActiveCategory(cat);
                                setExpandedWordId(null);
                            }}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                isActive
                                    ? 'bg-purple-600 text-white ring-2 ring-purple-300 shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm'
                            }`}
                        >
                            {label.emoji} {label.name} ({learnedCountByCategory[cat]})
                        </button>
                    );
                })}
            </div>

            {/* Word cards for active category */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3"
                >
                    {categoryWords.map((word) => {
                        const srs = userProgress[word.id];
                        const isSeen = !!srs;
                        const band = isSeen
                            ? getMasteryBand(srs.repetition)
                            : 'unseen';
                        const mastery = MASTERY_BANDS[band];
                        const isExpanded =
                            expandedWordId === word.id && isSeen;

                        return (
                            <div
                                key={word.id}
                                onClick={() => {
                                    if (isSeen) {
                                        setExpandedWordId(
                                            expandedWordId === word.id
                                                ? null
                                                : word.id
                                        );
                                    }
                                }}
                                className={`bg-white rounded-2xl shadow-sm p-4 transition-all ${
                                    isSeen
                                        ? 'cursor-pointer hover:shadow-md'
                                        : 'opacity-50'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">
                                            {word.emoji}
                                        </span>
                                        <div>
                                            <div
                                                className={`font-bold text-lg ${
                                                    isSeen
                                                        ? 'text-slate-800'
                                                        : 'text-slate-400'
                                                }`}
                                            >
                                                {word.word}
                                            </div>
                                            {isSeen && (
                                                <div className="text-slate-500 text-sm">
                                                    {word.hebrew}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${mastery.bg} ${mastery.text}`}
                                    >
                                        {mastery.label}
                                    </span>
                                </div>

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                                        <div className="text-sm text-slate-600">
                                            <span className="font-semibold">
                                                {'\uD83D\uDCA1'}{' '}
                                                {'\u05E8\u05DE\u05D6'}:{' '}
                                            </span>
                                            {word.hint_m ||
                                                word.hint_f ||
                                                word.hint}
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            <span className="font-semibold">
                                                {'\uD83D\uDCDD'} Example:{' '}
                                            </span>
                                            {word.exampleSentence}
                                        </div>
                                        <div className="text-sm text-slate-500 text-right" dir="rtl">
                                            {word.exampleSentence_he}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}
