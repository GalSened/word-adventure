/**
 * Hebrew-to-English multiple choice challenge UI (CHAL-02)
 * Shows a Hebrew word and 4 English options to choose from.
 * Calls onAnswer(true/false) on selection.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/mobile';
import { generateDistractors, shuffleArray } from '../../utils/distractorGenerator';

export default function MultipleChoiceChallenge({ word, onAnswer, disabled, playerGender, t }) {
    // Generate 4 options: correct word + 3 distractors, shuffled
    const options = useMemo(() => {
        const distractors = generateDistractors(word, 3, 'word');
        const allOptions = [
            { text: word.word, isCorrect: true },
            ...distractors.map(d => ({ text: d.word, isCorrect: false })),
        ];
        return shuffleArray(allOptions);
    }, [word.id]);

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

            {/* Hebrew word display */}
            <div className="text-6xl font-bold text-slate-800" dir="rtl">
                {word.hebrew}
            </div>

            {/* 2x2 option grid */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                {options.map((option, idx) => (
                    <motion.button
                        key={`${option.text}-${idx}`}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect(option)}
                        disabled={disabled}
                        className={`py-4 px-3 bg-gradient-to-b from-blue-400 to-blue-500 text-white rounded-2xl font-bold text-lg shadow-md transition-opacity ${
                            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-500 hover:to-blue-600 active:shadow-sm'
                        }`}
                        dir="ltr"
                    >
                        {option.text}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
