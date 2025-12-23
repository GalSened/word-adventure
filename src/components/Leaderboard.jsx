import React from 'react';
import { Trophy, Medal } from 'lucide-react';

export default function Leaderboard({ scores }) {
    // Sort scores by points descending
    const sortedScores = [...scores].sort((a, b) => b.points - a.points).slice(0, 5);

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-yellow-100 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 text-white flex items-center justify-center gap-2">
                <Trophy size={24} />
                <h3 className="text-xl font-bold">טבלת האלופים</h3>
            </div>

            <div className="p-4">
                {sortedScores.length === 0 ? (
                    <p className="text-center text-slate-400 py-4">עדיין אין אלופים... היי הראשונה!</p>
                ) : (
                    <div className="space-y-3">
                        {sortedScores.map((score, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                            index === 1 ? 'bg-slate-200 text-slate-600' :
                                                index === 2 ? 'bg-orange-100 text-orange-600' :
                                                    'bg-slate-100 text-slate-400'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <span className="text-2xl">{score.avatar}</span>
                                    <span className="font-bold text-slate-700">{score.date}</span>
                                </div>
                                <div className="font-mono font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">
                                    {score.points.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
