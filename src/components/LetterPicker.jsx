import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, RotateCcw } from 'lucide-react';
import { hapticFeedback } from '../utils/mobile';

/**
 * Touch-friendly letter picker component
 * Users tap letters to build the word
 */
export default function LetterPicker({
    letters, // Array of letters/words to pick from
    onComplete, // Called when answer is ready
    onCheck, // Called to check the answer
    currentInput,
    setCurrentInput,
    isWord = true, // true for letters, false for sentence words
    disabled = false
}) {
    // Track which letter indices have been used
    const [usedIndices, setUsedIndices] = useState(new Set());

    // Sync with parent input
    useEffect(() => {
        if (currentInput === '') {
            setUsedIndices(new Set());
        }
    }, [currentInput]);

    // Handle letter/word tap
    const handleSelect = (item, index) => {
        if (disabled || usedIndices.has(index)) return;

        hapticFeedback('tap');

        const newUsed = new Set(usedIndices);
        newUsed.add(index);
        setUsedIndices(newUsed);

        if (isWord) {
            // Add letter
            setCurrentInput(prev => prev + item);
        } else {
            // Add word with space
            setCurrentInput(prev => prev ? `${prev} ${item}` : item);
        }
    };

    // Handle removing last selection
    const handleBackspace = () => {
        if (disabled || currentInput.length === 0) return;

        hapticFeedback('light');

        if (isWord) {
            // Remove last letter
            const removedLetter = currentInput.slice(-1);
            setCurrentInput(prev => prev.slice(0, -1));

            // Find and unmark the last used index for this letter
            const indices = Array.from(usedIndices);
            for (let i = indices.length - 1; i >= 0; i--) {
                if (letters[indices[i]] === removedLetter) {
                    const newUsed = new Set(usedIndices);
                    newUsed.delete(indices[i]);
                    setUsedIndices(newUsed);
                    break;
                }
            }
        } else {
            // Remove last word
            const words = currentInput.split(' ');
            const removedWord = words.pop();
            setCurrentInput(words.join(' '));

            // Find and unmark the index
            const indices = Array.from(usedIndices);
            for (let i = indices.length - 1; i >= 0; i--) {
                if (letters[indices[i]] === removedWord) {
                    const newUsed = new Set(usedIndices);
                    newUsed.delete(indices[i]);
                    setUsedIndices(newUsed);
                    break;
                }
            }
        }
    };

    // Handle reset
    const handleReset = () => {
        hapticFeedback('medium');
        setCurrentInput('');
        setUsedIndices(new Set());
    };

    // Handle submit
    const handleSubmit = () => {
        if (currentInput.length === 0) return;
        hapticFeedback('medium');
        onCheck?.();
    };

    return (
        <div className="w-full">
            {/* Answer display area */}
            <div className="relative mb-4">
                <div
                    className="min-h-[60px] bg-white border-4 border-slate-100 rounded-2xl p-4 flex flex-wrap items-center justify-center gap-1"
                    dir="ltr"
                >
                    <AnimatePresence mode="popLayout">
                        {currentInput.length === 0 ? (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.4 }}
                                className="text-slate-400 text-lg"
                            >
                                {isWord ? 'לחץ על האותיות...' : 'לחץ על המילים...'}
                            </motion.span>
                        ) : (
                            (isWord ? currentInput.split('') : currentInput.split(' ')).map((item, idx) => (
                                <motion.span
                                    key={`${item}-${idx}`}
                                    initial={{ scale: 0, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0, y: -20 }}
                                    className={`inline-flex items-center justify-center font-bold font-mono ${
                                        isWord
                                            ? 'w-10 h-12 text-2xl bg-purple-100 text-purple-700 rounded-lg'
                                            : 'px-3 py-2 text-lg bg-purple-100 text-purple-700 rounded-xl'
                                    }`}
                                >
                                    {item}
                                </motion.span>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Action buttons */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex gap-2">
                    <button
                        onClick={handleBackspace}
                        disabled={currentInput.length === 0 || disabled}
                        className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-30 active:scale-90 transition-transform"
                    >
                        <Delete size={20} />
                    </button>
                    <button
                        onClick={handleReset}
                        disabled={currentInput.length === 0 || disabled}
                        className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-30 active:scale-90 transition-transform"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            </div>

            {/* Letter/Word picker grid */}
            <div className="flex flex-wrap justify-center gap-2 mb-6" dir="ltr">
                {letters.map((item, idx) => {
                    const isUsed = usedIndices.has(idx);
                    return (
                        <motion.button
                            key={`${item}-${idx}`}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSelect(item, idx)}
                            disabled={isUsed || disabled}
                            className={`font-bold font-mono shadow-md transition-all active:shadow-sm ${
                                isWord
                                    ? 'w-14 h-16 text-3xl rounded-xl'
                                    : 'px-4 py-3 text-xl rounded-xl'
                            } ${
                                isUsed
                                    ? 'bg-slate-200 text-slate-400 opacity-40 scale-90'
                                    : 'bg-gradient-to-b from-yellow-300 to-yellow-400 text-yellow-800 hover:from-yellow-400 hover:to-yellow-500'
                            }`}
                        >
                            {item}
                        </motion.button>
                    );
                })}
            </div>

            {/* Submit button */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={currentInput.length === 0 || disabled}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:shadow-md transition-shadow"
            >
                בדיקה ✓
            </motion.button>
        </div>
    );
}
