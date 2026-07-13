import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Star, Gift } from 'lucide-react';

/**
 * Story Dialogue Component
 * Shows NPC dialogues, chapter intros/completions, and achievements
 */
export default function StoryDialogue({ dialogue, onDismiss }) {
    if (!dialogue) return null;

    const renderContent = () => {
        switch (dialogue.type) {
            case 'chapter_intro':
            case 'chapter_complete':
                return (
                    <div className="text-center">
                        {/* NPC Avatar */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
                            // Springs support only two keyframes — the 4-frame
                            // rotate wiggle needs its own tween or motion throws
                            transition={{
                                type: 'spring',
                                bounce: 0.5,
                                rotate: { type: 'tween', duration: 0.6, ease: 'easeInOut' },
                            }}
                            className="text-8xl mb-4"
                        >
                            {dialogue.npc?.icon}
                        </motion.div>

                        {/* NPC Name */}
                        <h3 className="text-2xl font-bold text-purple-700 mb-2">
                            {dialogue.npc?.name}
                        </h3>

                        {/* Dialogue Text */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl text-slate-700 leading-relaxed whitespace-pre-line mb-6"
                        >
                            {dialogue.text}
                        </motion.p>

                        {/* Mystery Reward (for chapter complete) */}
                        {dialogue.mystery && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 }}
                                className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl p-4 border-2 border-yellow-300"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <Gift className="text-yellow-600" size={24} />
                                    <span className="text-lg font-bold text-yellow-800">
                                        קיבלת: {dialogue.mystery.clue}
                                    </span>
                                </div>
                                <p className="text-sm text-yellow-700 mt-1">
                                    {dialogue.mystery.hint}
                                </p>
                            </motion.div>
                        )}
                    </div>
                );

            case 'achievement':
                return (
                    <div className="text-center">
                        {/* Achievement Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', bounce: 0.6 }}
                            className="text-8xl mb-4"
                        >
                            {dialogue.achievement?.icon}
                        </motion.div>

                        {/* Achievement Unlocked */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center justify-center gap-2 text-yellow-600 mb-2">
                                <Star className="fill-yellow-400" size={20} />
                                <span className="text-lg font-bold">הישג חדש!</span>
                                <Star className="fill-yellow-400" size={20} />
                            </div>

                            <h3 className="text-3xl font-black text-purple-700 mb-2">
                                {dialogue.achievement?.name}
                            </h3>

                            <div className="bg-green-100 rounded-xl px-4 py-2 inline-block">
                                <span className="text-green-700 font-bold">
                                    +{dialogue.achievement?.reward} נקודות! 🎉
                                </span>
                            </div>
                        </motion.div>
                    </div>
                );

            default:
                return (
                    <p className="text-xl text-slate-700 text-center">
                        {dialogue.text}
                    </p>
                );
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                onClick={onDismiss}
            >
                <motion.div
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 50 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border-4 border-purple-100 relative overflow-hidden"
                >
                    {/* Decorative top bar */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400" />

                    {/* Close button */}
                    <button
                        onClick={onDismiss}
                        className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>

                    {/* Content */}
                    <div className="mt-4">
                        {renderContent()}
                    </div>

                    {/* Continue button */}
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        onClick={onDismiss}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                    >
                        המשך
                        <ChevronRight size={24} />
                    </motion.button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
