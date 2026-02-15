import React, { useState, useMemo } from 'react';
import { Reorder, motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/mobile';

/**
 * SentenceBuildChallenge (CHAL-05)
 * Drag-and-drop sentence building challenge using framer-motion Reorder.
 * Shows shuffled word tiles that can be reordered, then checks if the
 * assembled sentence matches the correct answer.
 */
export default function SentenceBuildChallenge({ word, onAnswer, disabled, playerGender, t }) {
    // Create unique items for Reorder (handles duplicate words like "THE CAT SEES THE DOG")
    const initialItems = useMemo(() => {
        const words = word.word.split(' ');
        const items = words.map((w, i) => ({ id: `${w}_${i}`, text: w }));
        // Shuffle using Fisher-Yates
        const shuffled = [...items];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
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

            <h2 className="text-4xl font-black text-slate-800 my-6">
                {word.hebrew}
            </h2>

            <Reorder.Group
                axis="x"
                values={items}
                onReorder={setItems}
                className="flex flex-wrap gap-2 justify-center min-h-[60px] p-4 bg-white border-4 border-slate-100 rounded-2xl mb-4"
                as="div"
            >
                {items.map((item) => (
                    <Reorder.Item
                        key={item.id}
                        value={item}
                        className="px-4 py-3 bg-gradient-to-b from-yellow-300 to-yellow-400 text-yellow-800 rounded-xl font-bold text-xl cursor-grab shadow-md select-none"
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
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {t('בדיקה', 'בדיקה')}
            </motion.button>
        </div>
    );
}
