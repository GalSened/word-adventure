import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock } from 'lucide-react';
import { CHAPTERS, isChapterUnlocked } from '../../data/story';

/**
 * MapScreen component - Chapter/world selection screen
 */
export default function MapScreen({ story, onStartLevel, t }) {
    const levels = ['easy', 'medium', 'hard', 'expert', 'master'];

    return (
        <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4"
        >
            <h2 className="text-3xl font-bold text-center mb-4">
                {t('בחר עולם', 'בחרי עולם')}
            </h2>
            <p className="text-center text-purple-600 mb-2">
                📚 {story.progress.totalWordsLearned} מילים נלמדו
            </p>

            {levels.map(lvl => {
                const chapter = CHAPTERS[lvl];
                const isUnlocked = isChapterUnlocked(lvl, story.progress.totalWordsLearned);
                const isCompleted = story.progress.completedChapters.includes(lvl);

                return (
                    <button
                        key={lvl}
                        onClick={() => isUnlocked && onStartLevel(lvl)}
                        disabled={!isUnlocked}
                        className={`relative bg-gradient-to-r ${chapter.color} text-white p-6 rounded-2xl text-right shadow-lg flex justify-between items-center transition-all ${
                            !isUnlocked
                                ? 'opacity-50 cursor-not-allowed grayscale'
                                : 'hover:scale-[1.02] hover:shadow-xl'
                        }`}
                        aria-label={`${chapter.title} - ${isCompleted ? 'הושלם' : isUnlocked ? 'זמין' : 'נעול'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="text-5xl" role="img" aria-hidden="true">
                                {isCompleted ? '✅' : chapter.character}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">{chapter.title}</h3>
                                <p className="text-sm opacity-80">
                                    {chapter.npc?.name && `עם ${chapter.npc.name}`}
                                </p>
                                {!isUnlocked && (
                                    <p className="text-xs mt-1 flex items-center gap-1">
                                        <Lock size={12} aria-hidden="true" />
                                        צריך {chapter.unlockRequirement} מילים
                                    </p>
                                )}
                            </div>
                        </div>
                        {isUnlocked ? (
                            <ArrowRight size={24} aria-hidden="true" />
                        ) : (
                            <Lock size={24} aria-label="נעול" />
                        )}
                    </button>
                );
            })}
        </motion.div>
    );
}
