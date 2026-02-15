import React from 'react';
import { Volume2 } from 'lucide-react';
import LetterPicker from '../LetterPicker';
import { speakWord, isSpeechSupported } from '../../utils/speech';
import { hapticFeedback } from '../../utils/mobile';

/**
 * SpellingChallenge (CHAL-01)
 * Wraps the existing LetterPicker component with the standard challenge props interface.
 * Extracts the challenge card rendering from PlayingScreen into a standalone component.
 *
 * Receives extended props beyond the standard interface because LetterPicker requires
 * scrambledContent, userInput, setUserInput, and onCheck managed by useGameLogic.
 */
export default function SpellingChallenge({
    word,
    onAnswer,
    disabled,
    playerGender,
    t,
    scrambledContent,
    userInput,
    setUserInput,
    onCheck
}) {
    // CONT-04: Gender-aware hint selection (same fallback chain as PlayingScreen)
    const hint = playerGender === 'boy' && word.hint_m
        ? word.hint_m
        : playerGender === 'girl' && word.hint_f
            ? word.hint_f
            : word.hint;

    return (
        <div className="text-center">
            <span className="text-slate-400 text-sm tracking-widest font-bold">
                {t('תרגם', 'תרגמי')} את ה{word.type === 'sentence' ? 'משפט' : 'מילה'}
            </span>

            <div className="flex items-center justify-center gap-3 my-6">
                <h2 className="text-6xl font-black text-slate-800 leading-tight">
                    {word.hebrew}
                </h2>
                {/* CONT-05: Speaker icon for English pronunciation */}
                {isSpeechSupported() && (
                    <button
                        onClick={() => {
                            hapticFeedback('light');
                            speakWord(word.word);
                        }}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-full p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                        aria-label="Hear pronunciation"
                    >
                        <Volume2 size={24} />
                    </button>
                )}
            </div>

            {/* CONT-04: Gender-aware Hebrew hint */}
            <p className="text-slate-500 text-lg mt-2 mb-4 leading-relaxed" dir="rtl">
                {hint}
            </p>

            {/* Touch-friendly letter picker */}
            <LetterPicker
                key={word.id}
                letters={scrambledContent}
                currentInput={userInput}
                setCurrentInput={setUserInput}
                onCheck={onCheck}
                isWord={word.type !== 'sentence'}
                disabled={disabled}
            />
        </div>
    );
}
