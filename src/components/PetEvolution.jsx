import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, ArrowRight, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

// Random particle trajectories computed once at module load — render must stay pure
const SPARKLE_PARTICLES = Array.from({ length: 20 }, () => ({
    x: `${Math.random() * 100}vw`,
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 2,
}));

/**
 * Pet Evolution Notification Component
 * Shows dramatic pet evolution animation
 */
export default function PetEvolution({ evolution, onDismiss }) {
    useEffect(() => {
        if (!evolution) return;

        // Celebration confetti — cancel the RAF chain on dismiss/unmount
        let active = true;
        let rafId;
        const end = Date.now() + 3000;

        const frame = () => {
            if (!active) return;
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
            });

            if (Date.now() < end) {
                rafId = requestAnimationFrame(frame);
            }
        };

        frame();
        return () => {
            active = false;
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [evolution]);

    if (!evolution) return null;

    const { oldStage, newStage } = evolution;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-900"
            >
                {/* Animated particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {SPARKLE_PARTICLES.map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: '100vh', x: p.x }}
                            animate={{ y: '-10vh' }}
                            transition={{
                                duration: p.duration,
                                repeat: Infinity,
                                delay: p.delay
                            }}
                            className="absolute"
                        >
                            <Sparkles className="text-yellow-400 w-6 h-6" />
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="relative max-w-xl w-full"
                >
                    {/* Title */}
                    <motion.div
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-center mb-8"
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Star className="text-yellow-400 fill-yellow-400 w-8 h-8" />
                            <Star className="text-yellow-400 fill-yellow-400 w-10 h-10" />
                            <Star className="text-yellow-400 fill-yellow-400 w-8 h-8" />
                        </div>
                        <h1 className="text-5xl font-black text-white drop-shadow-lg">
                            התפתחות!
                        </h1>
                    </motion.div>

                    {/* Evolution visual */}
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20">
                        <div className="flex items-center justify-center gap-6">
                            {/* Old Stage */}
                            <motion.div
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-center"
                            >
                                <motion.div
                                    animate={{ scale: [1, 0.9, 1] }}
                                    transition={{ duration: 0.5, repeat: 3 }}
                                    className="text-7xl mb-2 filter grayscale opacity-50"
                                >
                                    {oldStage.icon}
                                </motion.div>
                                <p className="text-purple-300 font-medium">
                                    {oldStage.name}
                                </p>
                            </motion.div>

                            {/* Arrow */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring' }}
                                className="flex flex-col items-center"
                            >
                                <Zap className="text-yellow-400 w-10 h-10 mb-1" />
                                <ArrowRight className="text-white w-12 h-12" />
                            </motion.div>

                            {/* New Stage */}
                            <motion.div
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.9 }}
                                className="text-center"
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, -5, 5, 0]
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: Infinity,
                                        repeatDelay: 1
                                    }}
                                    className="text-8xl mb-2 drop-shadow-2xl"
                                >
                                    {newStage.icon}
                                </motion.div>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2 }}
                                    className="text-white font-bold text-xl"
                                >
                                    {newStage.name}
                                </motion.p>
                            </motion.div>
                        </div>

                        {/* New Ability */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="mt-8 text-center"
                        >
                            <div className="bg-gradient-to-r from-yellow-400/20 to-amber-400/20 rounded-2xl p-4 border border-yellow-400/30">
                                <p className="text-yellow-300 text-sm font-medium mb-1">
                                    יכולת חדשה:
                                </p>
                                <p className="text-white text-xl font-bold">
                                    ✨ {newStage.ability}
                                </p>
                            </div>
                        </motion.div>

                        {/* Pet Dialogue */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.8 }}
                            className="mt-6 bg-white/5 rounded-2xl p-4"
                        >
                            <p className="text-purple-200 text-center text-lg italic">
                                "{newStage.dialogue}"
                            </p>
                        </motion.div>
                    </div>

                    {/* Continue Button */}
                    <motion.button
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 2.2 }}
                        onClick={onDismiss}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-shadow"
                    >
                        מדהים! 🎉
                    </motion.button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
