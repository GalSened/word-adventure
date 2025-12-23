import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import { STORY_INTRO } from '../data/story';

/**
 * Story Introduction Screen
 * Shows the main story opening with typewriter effect
 */
export default function StoryIntro({ gender, onComplete }) {
    const [currentPage, setCurrentPage] = useState(0);
    const [showText, setShowText] = useState(true);

    const storyText = gender === 'girl'
        ? STORY_INTRO.opening.girl
        : STORY_INTRO.opening.boy;

    const pages = storyText.split('\n').filter(line => line.trim());

    const handleNext = () => {
        if (currentPage < pages.length - 1) {
            setShowText(false);
            setTimeout(() => {
                setCurrentPage(prev => prev + 1);
                setShowText(true);
            }, 300);
        } else {
            onComplete();
        }
    };

    const isLastPage = currentPage === pages.length - 1;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-slate-900 via-purple-900 to-indigo-900"
        >
            {/* Magical particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{
                            opacity: [0, 1, 0],
                            y: ['100%', '-10%'],
                            x: Math.sin(i) * 100
                        }}
                        transition={{
                            duration: 4 + Math.random() * 4,
                            repeat: Infinity,
                            delay: Math.random() * 4
                        }}
                        className="absolute w-2 h-2"
                        style={{ left: `${Math.random() * 100}%` }}
                    >
                        <Sparkles className="text-yellow-400/50 w-full h-full" />
                    </motion.div>
                ))}
            </div>

            <div className="relative max-w-2xl w-full">
                {/* Book Icon */}
                <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        animate={{ rotateY: [0, 10, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="inline-block"
                    >
                        <BookOpen className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">
                        {STORY_INTRO.title}
                    </h1>
                    <p className="text-xl text-purple-300 mt-2">
                        {STORY_INTRO.subtitle}
                    </p>
                </motion.div>

                {/* Story Content */}
                <motion.div
                    className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 min-h-[200px] flex items-center justify-center"
                >
                    <AnimatePresence mode="wait">
                        {showText && (
                            <motion.p
                                key={currentPage}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-2xl text-white text-center leading-relaxed"
                            >
                                {pages[currentPage]}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 mt-6">
                    {pages.map((_, index) => (
                        <motion.div
                            key={index}
                            className={`w-3 h-3 rounded-full transition-colors ${
                                index === currentPage
                                    ? 'bg-yellow-400'
                                    : index < currentPage
                                        ? 'bg-purple-400'
                                        : 'bg-white/30'
                            }`}
                        />
                    ))}
                </div>

                {/* Continue Button */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={handleNext}
                    className={`w-full mt-8 py-4 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 transition-all ${
                        isLastPage
                            ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 hover:shadow-xl'
                            : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                >
                    {isLastPage ? (
                        <>
                            להתחיל בהרפתקה!
                            <Sparkles size={24} />
                        </>
                    ) : (
                        <>
                            המשך
                            <ChevronRight size={24} />
                        </>
                    )}
                </motion.button>
            </div>
        </motion.div>
    );
}
