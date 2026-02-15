import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Mic, MicOff, Volume2 } from 'lucide-react';
import LetterPicker from '../LetterPicker';
import { hapticFeedback } from '../../utils/mobile';
import { speakWord, isSpeechSupported } from '../../utils/speech';

/**
 * PlayingScreen component - Active gameplay screen
 * Shows the current word/sentence challenge with letter picker
 */
export default function PlayingScreen({
    currentWord,
    lives,
    itemEffects,
    scrambledContent,
    userInput,
    setUserInput,
    handleCheck,
    feedback,
    isSupported,
    isListening,
    startListening,
    stopListening,
    playerGender,
    t
}) {
    // CONT-04: Gender-aware hint selection
    const hint = playerGender === 'boy' && currentWord.hint_m
        ? currentWord.hint_m
        : playerGender === 'girl' && currentWord.hint_f
            ? currentWord.hint_f
            : currentWord.hint;
    return (
        <motion.div
            key="play"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-xl mx-auto"
        >
            {/* Lives Display */}
            <div className="flex justify-center gap-2 mb-6">
                {Array.from(
                    { length: itemEffects.getStartingLives(3) },
                    (_, i) => i + 1
                ).map(i => (
                    <Heart
                        key={i}
                        fill={i <= lives ? "#ef4444" : "none"}
                        className={i <= lives ? "text-red-500" : "text-slate-300"}
                        aria-label={i <= lives ? "חיה פעילה" : "חיה אבודה"}
                    />
                ))}
            </div>

            {/* Challenge Card */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center border-b-8 border-purple-100 relative overflow-hidden">
                <span className="text-slate-400 text-sm tracking-widest font-bold">
                    {t('תרגם', 'תרגמי')} את ה{currentWord.type === 'sentence' ? 'משפט' : 'מילה'}
                </span>
                <div className="flex items-center justify-center gap-3 my-6">
                    <h2 className="text-6xl font-black text-slate-800 leading-tight">
                        {currentWord.hebrew}
                    </h2>
                    {/* CONT-05: Speaker icon for English pronunciation */}
                    {isSpeechSupported() && (
                        <button
                            onClick={() => {
                                hapticFeedback('light');
                                speakWord(currentWord.word);
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
                    key={currentWord.id}
                    letters={scrambledContent}
                    currentInput={userInput}
                    setCurrentInput={setUserInput}
                    onCheck={handleCheck}
                    isWord={currentWord.type !== 'sentence'}
                    disabled={!!feedback}
                />

                {/* Voice input button */}
                {isSupported && (
                    <button
                        onClick={() => {
                            hapticFeedback('medium');
                            isListening ? stopListening() : startListening();
                        }}
                        className={`mt-4 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                            isListening
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        aria-label={isListening ? 'עצור הקלטה' : 'התחל הקלטה קולית'}
                    >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        {isListening ? 'עצור הקלטה' : 'דבר את התשובה'}
                    </button>
                )}

                {/* Feedback Overlay */}
                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-md z-20"
                            role="alert"
                            aria-live="assertive"
                        >
                            <div
                                className={`text-center font-bold text-3xl ${
                                    feedback.type === 'success'
                                        ? 'text-green-600'
                                        : feedback.type === 'warning'
                                        ? 'text-amber-500'
                                        : 'text-red-500'
                                }`}
                            >
                                {feedback.message}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
