import React from 'react';
import { motion } from 'framer-motion';
import DailyQuests from '../DailyQuests';
import Leaderboard from '../Leaderboard';
import { useGameStore } from '../../store/gameStore';
import { initialWordData } from '../../data/words';
import { STORE_ITEMS } from '../../data/storeItems';
import { moodModifiers } from '../../utils/walkSession';

/**
 * StartScreen component - Main menu with game mode selection
 */
export default function StartScreen({
    userProfile,
    dailyStats,
    onStartLevel,
    onNavigate,
    onWalkPet,
    t
}) {
    const userProgress = useGameStore((s) => s.userProgress);
    const highScores = useGameStore((s) => s.highScores);
    const inventory = useGameStore((s) => s.inventory);
    const petCare = useGameStore((s) => s.petCare);

    const ownedPetId = inventory.find((id) => STORE_ITEMS[id]?.walkable);
    const walkPet = ownedPetId ? STORE_ITEMS[ownedPetId] : null;
    const petMood = petCare.happiness >= 75 ? '😍' : petCare.happiness >= 40 ? '🙂' : '🥺';
    const petHungry = Boolean(walkPet) && moodModifiers(petCare).hungry;

    // The big walk is the heart of the game: a fresh player adopts a free
    // starter dog on first tap and goes straight out the door
    const handleWalkClick = () => {
        if (walkPet) {
            onWalkPet(ownedPetId);
        } else {
            useGameStore.getState().addToInventory('dog');
            onWalkPet('dog');
        }
    };
    const masteredCount = Object.values(userProgress).filter(
        (srs) => srs.repetition >= 6
    ).length;
    const totalWords = initialWordData.length;
    const progressPercent = totalWords > 0 ? (masteredCount / totalWords) * 100 : 0;

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

            {/* Progress tracker */}
            <div className="bg-white/80 rounded-2xl p-4 text-center shadow-sm mb-4 max-w-4xl mx-auto">
                <div className="text-2xl font-bold text-purple-600">
                    {masteredCount}/{totalWords} {'\u05DE\u05D9\u05DC\u05D9\u05DD \u05E0\u05E9\u05DC\u05D8\u05D5'}
                </div>
                <div className="text-sm text-slate-500">
                    {Object.keys(userProgress).length} {'\u05DE\u05D9\u05DC\u05D9\u05DD \u05D1\u05EA\u05D4\u05DC\u05D9\u05DA'}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                    <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-10">
                <div className="md:col-span-2">
                    <DailyQuests progress={dailyStats} gender={userProfile.gender} />
                </div>

                {/* Hero mode: the big walk */}
                <button
                    onClick={handleWalkClick}
                    className="md:col-span-2 relative overflow-hidden bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all text-right"
                    aria-label={walkPet ? `הטיול הגדול עם ${walkPet.name}` : 'אמץ כלבלב וצא לטיול'}
                >
                    <div className="absolute -left-4 -bottom-6 text-[7rem] opacity-30 rotate-12" aria-hidden="true">🐾</div>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="text-3xl md:text-4xl font-black mb-1">
                                🐕 הטיול הגדול {walkPet && petMood}
                            </div>
                            <div className="text-lg opacity-95 font-bold">
                                {walkPet
                                    ? t(`צא לטיול עם ${walkPet.name} — מצאו מילים והרוויחו מטבעות!`,
                                        `צאי לטיול עם ${walkPet.name} — מצאו מילים והרוויחו מטבעות!`)
                                    : t('אמץ כלבלב חינם וצא להרפתקה הראשונה שלכם!',
                                        'אמצי כלבלב חינם וצאי להרפתקה הראשונה שלכן!')}
                            </div>
                            {walkPet && (
                                <div
                                    className="mt-3 flex items-center gap-3 text-base font-bold bg-white/20 rounded-2xl px-4 py-1.5 w-fit"
                                    aria-label={`מצב החיה: אושר ${petCare.happiness}, שובע ${petCare.satiety}`}
                                >
                                    <span>❤️ {petCare.happiness}%</span>
                                    <span>🦴 {petCare.satiety}%</span>
                                    {petCare.walksCompleted > 0 && (
                                        <span>🐾 {petCare.walksCompleted} טיולים</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="text-6xl md:text-7xl" aria-hidden="true">
                            {walkPet ? walkPet.icon : '🐕'}
                        </div>
                    </div>
                    {petHungry && (
                        <div className="absolute top-3 left-3 bg-amber-100 text-amber-800 border-2 border-amber-300 rounded-full px-4 py-1.5 text-sm font-black shadow-md">
                            🍖 {walkPet.name} רעב — יש חטיפים בחנות!
                        </div>
                    )}
                </button>

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
                    <div className="text-4xl mb-2">{'\uD83C\uDF0D'}</div>
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
                    onClick={() => onNavigate('adventure')}
                    className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all"
                >
                    <div className="text-4xl mb-2">{'\uD83D\uDDFA\uFE0F'}</div>
                    <div className="text-2xl font-bold">{'\u05D4\u05E8\u05E4\u05EA\u05E7\u05D4'}</div>
                    <div className="text-sm opacity-90">
                        {t('\u05E6\u05D0 \u05DC\u05D4\u05E8\u05E4\u05EA\u05E7\u05D4 \u05D1\u05E2\u05D5\u05DC\u05DE\u05D5\u05EA \u05E7\u05E1\u05D5\u05DE\u05D9\u05DD!', '\u05E6\u05D0\u05D9 \u05DC\u05D4\u05E8\u05E4\u05EA\u05E7\u05D4 \u05D1\u05E2\u05D5\u05DC\u05DE\u05D5\u05EA \u05E7\u05E1\u05D5\u05DE\u05D9\u05DD!')}
                    </div>
                </button>

                <button
                    onClick={() => onNavigate('wordBook')}
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all"
                >
                    <div className="text-4xl mb-2">{'\uD83D\uDCD6'}</div>
                    <div className="text-2xl font-bold">{'\u05DE\u05D9\u05DC\u05D5\u05DF'}</div>
                    <div className="text-sm opacity-90">{'\u05E2\u05D9\u05D9\u05DF \u05D1\u05DE\u05D9\u05DC\u05D9\u05DD \u05E9\u05DC\u05DE\u05D3\u05EA'}</div>
                </button>

                <button
                    onClick={() => onNavigate('store')}
                    className="bg-white text-slate-700 border-2 border-slate-100 p-6 rounded-3xl shadow-lg hover:bg-slate-50 transition-all"
                >
                    <div className="text-4xl mb-2">{'\uD83D\uDECD\uFE0F'}</div>
                    <div className="text-2xl font-bold">{'\u05D7\u05E0\u05D5\u05EA \u05D4\u05D4\u05E4\u05EA\u05E2\u05D5\u05EA'}</div>
                </button>
            </div>

            {/* Best level runs \u2014 hidden until the first level is scored */}
            {highScores.length > 0 && (
                <div className="max-w-4xl mx-auto mb-10">
                    <Leaderboard scores={highScores} />
                </div>
            )}
        </motion.div>
    );
}
