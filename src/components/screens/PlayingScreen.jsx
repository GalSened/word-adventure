import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import ChallengeDispatcher from '../challenges/ChallengeDispatcher';

/**
 * PlayingScreen component - Active gameplay screen
 * Thin shell: lives display + ChallengeDispatcher + feedback overlay.
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
    t
}) {
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
