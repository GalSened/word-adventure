/**
 * Audio-based listening challenge UI (CHAL-04)
 * Speaks the English word via speakWord() and shows 4 English options.
 * Falls back to showing the word as text if speech is not supported.
 * Calls onAnswer(true/false) on selection.
 */

import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { speakWord, isSpeechSupported } from '../../utils/speech';
import { hapticFeedback } from '../../utils/mobile';
import { generateDistractors } from '../../utils/distractorGenerator';
import { seededShuffle } from '../../utils/seededRandom';

export default function ListeningChallenge({ word, onAnswer, disabled, t }) {
    const speechSupported = isSpeechSupported();

    // Speak the word on mount / when the word changes
    useEffect(() => {
        if (speechSupported) {
            speakWord(word.word);
        }
    }, [word.word, speechSupported]);

    // Generate 4 English options: correct + 3 distractors.
    // Order is seeded by word id so it is stable across re-renders (pure memo).
    const options = useMemo(() => {
        const distractors = generateDistractors(word, 3, 'word');
        const allOptions = [
            { text: word.word, isCorrect: true },
            ...distractors.map(d => ({ text: d.word, isCorrect: false })),
        ];
        return seededShuffle(allOptions, word.id);
    }, [word]);

    const handleReplay = () => {
        if (speechSupported) {
            speakWord(word.word);
        }
    };

    const handleSelect = (option) => {
        if (disabled) return;
        hapticFeedback(option.isCorrect ? 'success' : 'error');
        onAnswer(option.isCorrect);
    };

    return (
        <div className="w-full flex flex-col items-center gap-6">
            {/* Instruction text */}
            <p className="text-lg text-slate-600 font-medium" dir="rtl">
                {t('הקשב ובחר', 'הקשיבי ובחרי')} את המילה הנכונה
            </p>

            {/* Speaker button or text fallback */}
            {speechSupported ? (
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReplay}
                    className="p-6 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 active:shadow-md transition-all"
                    aria-label="Play word audio"
                >
                    <Volume2 size={48} />
                </motion.button>
            ) : (
                <div className="text-6xl font-bold text-slate-800" dir="ltr">
                    {word.word}
                </div>
            )}

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
