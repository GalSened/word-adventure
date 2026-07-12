/**
 * English-to-Hebrew reverse multiple choice challenge UI (CHAL-03)
 * Shows an English word and 4 Hebrew options to choose from.
 * Calls onAnswer(true/false) on selection.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/mobile';
import { generateDistractors } from '../../utils/distractorGenerator';
import { seededShuffle } from '../../utils/seededRandom';

export default function ReverseChoiceChallenge({ word, onAnswer, disabled, t }) {
    // Generate 4 options: correct Hebrew + 3 distractor Hebrew words.
    // Order is seeded by word id so it is stable across re-renders (pure memo).
    const options = useMemo(() => {
        const distractors = generateDistractors(word, 3, 'hebrew');
        const allOptions = [
            { text: word.hebrew, isCorrect: true },
            ...distractors.map(d => ({ text: d.hebrew, isCorrect: false })),
        ];
        return seededShuffle(allOptions, word.id);
    }, [word]);

    const handleSelect = (option) => {
        if (disabled) return;
        hapticFeedback(option.isCorrect ? 'success' : 'error');
        onAnswer(option.isCorrect);
    };

    return (
        <div className="w-full flex flex-col items-center gap-6">
            {/* Instruction text */}
            <p className="text-lg text-slate-600 font-medium" dir="rtl">
                {t('בחר', 'בחרי')} את התרגום הנכון
            </p>

            {/* English word display */}
            <div className="text-6xl font-bold text-slate-800" dir="ltr">
                {word.word}
            </div>

            {/* 2x2 option grid */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                {options.map((option, idx) => (
                    <motion.button
                        key={`${option.text}-${idx}`}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect(option)}
                        disabled={disabled}
                        className={`py-4 px-3 bg-gradient-to-b from-green-400 to-green-500 text-white rounded-2xl font-bold text-lg shadow-md transition-opacity ${
                            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-500 hover:to-green-600 active:shadow-sm'
                        }`}
                        dir="rtl"
                    >
                        {option.text}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
