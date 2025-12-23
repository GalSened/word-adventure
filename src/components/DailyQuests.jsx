import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';

export default function DailyQuests({ progress, gender = 'boy' }) {
    const t = (male, female) => gender === 'boy' ? male : female;

    const quests = [
        {
            id: 'words_10',
            text: `${t('השלם', 'השלימי')} 10 מילים`,
            target: 10,
            current: progress.wordsPlayed,
            reward: 50
        },
        {
            id: 'score_1000',
            text: `${t('הגע', 'הגיעי')} ל-1000 נקודות`,
            target: 1000,
            current: progress.dailyScore,
            reward: 100
        },
        {
            id: 'streak_5',
            text: `${t('בצע', 'בצעי')} רצף של 5`,
            target: 5,
            current: progress.maxStreak,
            reward: 75
        }
    ];

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-orange-100">
            <h3 className="text-2xl font-bold mb-4 text-orange-600">📜 {t('משימות יומיות', 'משימות יומיות')}</h3>
            <div className="space-y-4">
                {quests.map(quest => {
                    const isCompleted = quest.current >= quest.target;
                    const percentage = Math.min(100, (quest.current / quest.target) * 100);

                    return (
                        <div key={quest.id} className="relative">
                            <div className="flex justify-between items-center mb-1">
                                <span className={`font-bold ${isCompleted ? 'text-green-600 line-through opacity-60' : 'text-slate-700'}`}>
                                    {quest.text}
                                </span>
                                <span className="text-sm font-mono bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">
                                    {quest.current}/{quest.target}
                                </span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-orange-400'}`}
                                />
                            </div>
                            {isCompleted && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -right-2 -top-2 bg-green-500 text-white rounded-full p-1 border-2 border-white shadow-sm"
                                >
                                    <CheckCircle size={14} />
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
