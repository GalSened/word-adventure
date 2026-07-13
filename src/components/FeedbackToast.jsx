import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Global feedback toast for every screen EXCEPT playing (PlayingScreen has
 * its own in-card overlay). Before this existed, purchase and item-use
 * confirmations ("רכשת X!", "אין מספיק מטבעות") were set in the store but
 * rendered nowhere — the player got no response at all.
 */
export default function FeedbackToast({ feedback }) {
    return (
        <AnimatePresence>
            {feedback && (
                <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="fixed top-4 inset-x-4 z-[60] flex justify-center pointer-events-none"
                    role="status"
                    aria-live="polite"
                >
                    <div
                        className={`px-5 py-3 rounded-2xl shadow-xl font-bold text-base text-white text-center ${
                            feedback.type === 'success'
                                ? 'bg-green-500'
                                : feedback.type === 'warning'
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                        }`}
                    >
                        {feedback.message}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
