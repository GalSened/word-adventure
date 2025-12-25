import React from 'react';
import { motion } from 'framer-motion';

/**
 * ResultScreen component - Shows level complete or game over
 */
export default function ResultScreen({
    isSuccess,
    onGoHome,
    onPlayAgain,
    t
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 bg-white rounded-3xl shadow-xl"
        >
            <div className="text-8xl mb-4" role="img" aria-label={isSuccess ? 'Success' : 'Game Over'}>
                {isSuccess ? '🏆' : '😢'}
            </div>
            <h2 className="text-4xl font-bold mb-6">
                {isSuccess ? 'Woohoo!' : 'אוי לא!'}
            </h2>
            <div className="flex justify-center gap-4">
                <button
                    onClick={onGoHome}
                    className="px-6 py-3 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                    aria-label="Go to main menu"
                >
                    לתפריט
                </button>
                <button
                    onClick={onPlayAgain}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                    aria-label="Play again"
                >
                    {t('שחק שוב', 'שחקי שוב')}
                </button>
            </div>
        </motion.div>
    );
}
