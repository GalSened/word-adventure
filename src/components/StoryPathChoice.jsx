import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Map, BookOpen, Sparkles } from 'lucide-react';

/**
 * Story Path Choice Component
 * Allows players to choose their adventure path
 */
export default function StoryPathChoice({ options, onChoose, playerName, gender }) {
    const t = (male, female) => gender === 'boy' ? male : female;

    const getIcon = (id) => {
        switch (id) {
            case 'hero': return <Sword className="w-12 h-12" />;
            case 'explorer': return <Map className="w-12 h-12" />;
            case 'scholar': return <BookOpen className="w-12 h-12" />;
            default: return <Sparkles className="w-12 h-12" />;
        }
    };

    const getGradient = (id) => {
        switch (id) {
            case 'hero': return 'from-red-400 to-orange-500';
            case 'explorer': return 'from-green-400 to-emerald-500';
            case 'scholar': return 'from-blue-400 to-indigo-500';
            default: return 'from-purple-400 to-pink-500';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900"
        >
            {/* Stars background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(50)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </div>

            <div className="relative max-w-4xl w-full">
                {/* Title */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-5xl font-black text-white mb-3 drop-shadow-lg">
                        {t('בחר את דרכך', 'בחרי את דרכך')}, {playerName}!
                    </h1>
                    <p className="text-xl text-purple-200">
                        כל דרך מובילה להרפתקה שונה...
                    </p>
                </motion.div>

                {/* Path Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {options.map((option, index) => (
                        <motion.button
                            key={option.id}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 + index * 0.15 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onChoose(option.id)}
                            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/20 hover:border-white/50 transition-all group"
                        >
                            {/* Icon */}
                            <motion.div
                                whileHover={{ rotate: [0, -10, 10, 0] }}
                                className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${getGradient(option.id)} flex items-center justify-center text-white shadow-lg`}
                            >
                                {option.icon && (
                                    <span className="text-5xl">{option.icon}</span>
                                )}
                            </motion.div>

                            {/* Title */}
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {option.title}
                            </h3>

                            {/* Description */}
                            <p className="text-purple-200 mb-4 text-sm leading-relaxed">
                                {option.description}
                            </p>

                            {/* Bonus */}
                            <div className="bg-yellow-400/20 rounded-xl px-3 py-2 inline-block">
                                <span className="text-yellow-300 text-sm font-bold">
                                    ✨ {option.bonus}
                                </span>
                            </div>

                            {/* Hover glow */}
                            <motion.div
                                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${getGradient(option.id)} opacity-0 group-hover:opacity-20 transition-opacity -z-10`}
                            />
                        </motion.button>
                    ))}
                </div>

                {/* Footer hint */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center text-purple-300 mt-8 text-sm"
                >
                    💡 {t('אל תדאג', 'אל תדאגי')} - {t('תוכל', 'תוכלי')} לשנות את הדרך בהמשך!
                </motion.p>
            </div>
        </motion.div>
    );
}
