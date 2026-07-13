/**
 * Cloze (sentence-completion) challenge UI.
 * Shows the word's English example sentence with the word blanked out,
 * the Hebrew sentence as a comprehension anchor, and 4 word options.
 * Calls onAnswer(true/false) on selection.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/mobile';
import { generateDistractors } from '../../utils/distractorGenerator';
import { seededShuffle } from '../../utils/seededRandom';
import { buildClozeSentence } from '../../utils/cloze';

export default function ClozeChallenge({ word, onAnswer, disabled, t }) {
    const parts = useMemo(() => buildClozeSentence(word), [word]);

    const options = useMemo(() => {
        const distractors = generateDistractors(word, 3, 'word');
        const allOptions = [
            { text: word.word, isCorrect: true },
            ...distractors.map((d) => ({ text: d.word, isCorrect: false })),
        ];
        return seededShuffle(allOptions, word.id);
    }, [word]);

    const handleSelect = (option) => {
        if (disabled) return;
        hapticFeedback(option.isCorrect ? 'success' : 'error');
        onAnswer(option.isCorrect);
    };

    // The selector only offers cloze for supported words, but render safely
    // for any caller: without a blankable sentence there is no challenge.
    if (!parts) return null;

    return (
        <div className="w-full flex flex-col items-center gap-6">
            <p className="text-lg text-slate-600 font-medium" dir="rtl">
                {t('השלם את המשפט', 'השלימי את המשפט')}
            </p>

            {/* English sentence with the blank */}
            <p
                data-testid="cloze-sentence"
                className="text-2xl font-bold text-slate-800 leading-relaxed text-center"
                dir="ltr"
            >
                {parts.before}
                <span className="inline-block min-w-16 px-2 mx-1 border-b-4 border-purple-400 text-purple-400">
                    ___
                </span>
                {parts.after}
            </p>

            {/* Hebrew sentence as a comprehension anchor */}
            <p className="text-lg text-slate-500" dir="rtl">
                {word.exampleSentence_he}
            </p>

            {/* 2x2 option grid */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                {options.map((option, idx) => (
                    <motion.button
                        key={`${option.text}-${idx}`}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect(option)}
                        disabled={disabled}
                        className={`py-4 px-3 bg-gradient-to-b from-purple-400 to-purple-500 text-white rounded-2xl font-bold text-lg shadow-md transition-opacity ${
                            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-500 hover:to-purple-600 active:shadow-sm'
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
