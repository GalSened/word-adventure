import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Circle } from 'lucide-react';

const QUESTS = [
    { id: 'play_5', text: 'שחקי 5 מילים', target: 5, type: 'words' },
    { id: 'streak_3', text: 'הגיעי לרצף של 3', target: 3, type: 'streak' },
    { id: 'score_500', text: 'השיגי 500 נקודות', target: 500, type: 'score' },
];

export default function DailyQuests({ progress }) {
    // progress: { wordsPlayed: 0, maxStreak: 0, dailyScore: 0 }

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-orange-100">
            <div className="flex items-center gap-2 mb-4 text-orange-600 font-bold text-xl">
                <Calendar /> משימות יומיות
            </div>

            <div className="space-y-3">
                {QUESTS.map(quest => {
                    let current = 0;
                    if (quest.type === 'words') current = progress.wordsPlayed || 0;
                    if (quest.type === 'streak') current = progress.maxStreak || 0;
                    if (quest.type === 'score') current = progress.dailyScore || 0;

                    const isComplete = current >= quest.target;

                    return (
                        <div key={quest.id} className={`flex items-center justify-between p-3 rounded-xl border ${isComplete ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex items-center gap-3">
                                {isComplete ? <CheckCircle className="text-green-500" /> : <Circle className="text-slate-300" />}
                                <span className={isComplete ? 'text-green-800 line-through opacity-70' : 'text-slate-700 font-bold'}>
                                    {quest.text}
                                </span>
                            </div>
                            <div className="text-sm font-mono font-bold text-slate-400">
                                {Math.min(current, quest.target)}/{quest.target}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
