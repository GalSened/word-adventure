import React from 'react';
import { motion } from 'framer-motion';
import DailyQuests from '../DailyQuests';

/**
 * StartScreen component - Main menu with game mode selection
 */
export default function StartScreen({
    userProfile,
    dailyStats,
    onStartLevel,
    onNavigate,
    t
}) {
    return (
        <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-6"
        >
            <h1 className="text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                Word Adventure
            </h1>
            <h2 className="text-xl font-bold text-purple-400 mb-8">
                {t('שלום', 'שלום')} {userProfile.name}! {t('מוכן להרפתקה?', 'מוכנה להרפתקה?')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-10">
                <div className="md:col-span-2">
                    <DailyQuests progress={dailyStats} gender={userProfile.gender} />
                </div>

                <button
                    onClick={() => onStartLevel('review')}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all"
                >
                    <div className="text-4xl mb-2">🧠</div>
                    <div className="text-2xl font-bold">חזרה חכמה</div>
                    <div className="text-sm opacity-90">הדרך הכי טובה לזכור!</div>
                </button>

                <button
                    onClick={() => onNavigate('map')}
                    className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all"
                >
                    <div className="text-4xl mb-2">🗺️</div>
                    <div className="text-2xl font-bold">מפת עולמות</div>
                    <div className="text-sm opacity-90">
                        {t('שחק שלבים חדשים', 'שחקי שלבים חדשים')}
                    </div>
                </button>

                <button
                    onClick={() => onNavigate('memory')}
                    className="bg-gradient-to-r from-purple-400 to-pink-500 text-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all"
                >
                    <div className="text-4xl mb-2">🃏</div>
                    <div className="text-2xl font-bold">משחק הזיכרון</div>
                    <div className="text-sm opacity-90">אימון למוח</div>
                </button>

                <button
                    onClick={() => onNavigate('store')}
                    className="bg-white text-slate-700 border-2 border-slate-100 p-6 rounded-3xl shadow-lg hover:bg-slate-50 transition-all"
                >
                    <div className="text-4xl mb-2">🛍️</div>
                    <div className="text-2xl font-bold">חנות ההפתעות</div>
                </button>
            </div>
        </motion.div>
    );
}
