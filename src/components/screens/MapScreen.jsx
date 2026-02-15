import React from 'react';
import { motion } from 'framer-motion';
import { LEVELS } from '../../data/levels';

/**
 * MapScreen component - Numbered level selection screen with themed visuals
 * Displays 12 progressive levels with locked/unlocked/completed states,
 * plus a review mode button at the bottom.
 */
export default function MapScreen({ story, onStartLevel, t, completedLevels = [] }) {
    return (
        <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
        >
            <h2 className="text-3xl font-bold text-center mb-4">
                {t('בחר שלב', 'בחרי שלב')}
            </h2>
            <p className="text-center text-purple-600 mb-2">
                📚 {story.progress.totalWordsLearned} מילים נלמדו
            </p>

            <div className="space-y-3">
                {LEVELS.map(level => {
                    const isUnlocked = level.unlockRequirement === 0
                        || completedLevels.includes(level.unlockRequirement);
                    const isCompleted = completedLevels.includes(level.id);

                    return (
                        <button
                            key={level.id}
                            onClick={() => isUnlocked && onStartLevel(level.id)}
                            disabled={!isUnlocked}
                            className={`relative w-full bg-gradient-to-r ${level.theme.bgGradient} text-white p-5 rounded-2xl text-right shadow-lg flex justify-between items-center transition-all ${
                                !isUnlocked ? 'opacity-40 cursor-not-allowed grayscale' : 'hover:scale-[1.02] hover:shadow-xl'
                            }`}
                            aria-label={`${level.name} - ${isCompleted ? 'הושלם' : isUnlocked ? 'זמין' : 'נעול'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl font-black">
                                    {isCompleted ? '✅' : level.id}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{level.name}</h3>
                                    <p className="text-sm opacity-80">{level.subtitle}</p>
                                </div>
                            </div>
                            <div className="text-4xl">{level.theme.emoji}</div>
                        </button>
                    );
                })}

                {/* Review mode button at bottom */}
                <button
                    onClick={() => onStartLevel('review')}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-5 rounded-2xl text-right shadow-lg flex justify-between items-center hover:scale-[1.02] hover:shadow-xl transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">🧠</div>
                        <div>
                            <h3 className="text-xl font-bold">חזרות חכמות</h3>
                            <p className="text-sm opacity-80">Smart Review</p>
                        </div>
                    </div>
                </button>
            </div>
        </motion.div>
    );
}
