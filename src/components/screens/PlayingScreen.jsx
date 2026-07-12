import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lightbulb, SkipForward } from 'lucide-react';
import ChallengeDispatcher from '../challenges/ChallengeDispatcher';

/**
 * PlayingScreen component - Active gameplay screen
 * Thin shell: lives display + purchased-consumable quick-use bar +
 * ChallengeDispatcher + feedback overlay.
 * Challenge rendering is fully delegated to ChallengeDispatcher.
 */
export default function PlayingScreen({
    currentWord,
    lives,
    itemEffects,
    challengeType,
    scrambledContent,
    userInput,
    setUserInput,
    handleCheck,
    onAnswer,
    feedback,
    playerGender,
    t,
    hintsAvailable = 0,
    skipsAvailable = 0,
    onUseHint,
    onSkipWord,
}) {
    // Hints reveal letters, so they only make sense in the spelling challenge
    const canHint = hintsAvailable > 0 && challengeType === 'spelling';
    const canSkip = skipsAvailable > 0;

    return (
        <motion.div
            key="play"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-xl mx-auto"
        >
            {/* Lives Display + purchased quick-use items */}
            <div className="relative flex justify-center gap-2 mb-6">
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

                {(canHint || canSkip) && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 flex gap-2">
                        {canHint && (
                            <button
                                onClick={onUseHint}
                                disabled={!!feedback}
                                className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-xl font-bold text-sm shadow-sm hover:bg-amber-200 disabled:opacity-40 transition-colors"
                                aria-label="השתמש ברמז"
                            >
                                <Lightbulb size={16} /> {hintsAvailable}
                            </button>
                        )}
                        {canSkip && (
                            <button
                                onClick={onSkipWord}
                                disabled={!!feedback}
                                className="flex items-center gap-1 px-3 py-1.5 bg-sky-100 text-sky-700 rounded-xl font-bold text-sm shadow-sm hover:bg-sky-200 disabled:opacity-40 transition-colors"
                                aria-label="דלג על המילה"
                            >
                                <SkipForward size={16} /> {skipsAvailable}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Challenge Card */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center border-b-8 border-purple-100 relative overflow-hidden">
                <ChallengeDispatcher
                    challengeType={challengeType}
                    word={currentWord}
                    onAnswer={onAnswer}
                    disabled={!!feedback}
                    playerGender={playerGender}
                    t={t}
                    scrambledContent={scrambledContent}
                    userInput={userInput}
                    setUserInput={setUserInput}
                    onCheck={handleCheck}
                />

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
