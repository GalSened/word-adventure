import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { generateChallenge } from '../../utils/grammarEngine';
import { hapticFeedback } from '../../utils/mobile';
import { seededShuffle } from '../../utils/seededRandom';

/**
 * GrammarChallenge (CHAL-06)
 * Grammar challenge testing Hebrew gender agreement and verb conjugation.
 * Generates a grammar exercise using generateChallenge() from grammarEngine.js
 * and presents it as a multiple-choice question with 4 Hebrew translation options.
 */
export default function GrammarChallenge({ word, onAnswer, disabled, t }) {
    // Generate 4 options: correct Hebrew + 3 distractors from grammar engine.
    // Order is seeded by word id so it is stable across re-renders.
    const options = useMemo(() => {
        const correct = { text: word.hebrew, isCorrect: true };
        const distractors = [];

        // Generate distractors, ensuring no duplicates with correct answer
        let attempts = 0;
        while (distractors.length < 3 && attempts < 10) {
            const gen = generateChallenge();
            if (gen.hebrew !== word.hebrew && !distractors.some(d => d.text === gen.hebrew)) {
                distractors.push({ text: gen.hebrew, isCorrect: false });
            }
            attempts++;
        }

        return seededShuffle([correct, ...distractors], word.id);
    }, [word]);

    const handleSelect = (option) => {
        if (disabled) return;
        hapticFeedback(option.isCorrect ? 'success' : 'error');
        onAnswer(option.isCorrect);
    };

    return (
        <div className="text-center">
            <span className="text-slate-400 text-sm tracking-widest font-bold">
                {t('בחר', 'בחרי')} את התרגום הנכון
            </span>

            <h2 className="text-3xl font-black text-slate-800 my-6" dir="ltr">
                {word.word}
            </h2>

            <div className="grid grid-cols-2 gap-3">
                {options.map((opt, idx) => (
                    <motion.button
                        key={idx}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect(opt)}
                        disabled={disabled}
                        className="p-4 bg-gradient-to-b from-emerald-100 to-teal-200 text-emerald-800 rounded-2xl font-bold text-lg shadow-md hover:from-emerald-200 hover:to-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        dir="rtl"
                    >
                        {opt.text}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
