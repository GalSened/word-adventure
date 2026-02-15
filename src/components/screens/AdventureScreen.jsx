import React from 'react';
import { motion } from 'framer-motion';
import AdventureGame from '../adventure/AdventureGame';

/**
 * AdventureScreen - Wrapper screen for the adventure game mode.
 * Renders AdventureGame full-screen with entry animation.
 *
 * @param {Object} props
 * @param {Object} props.pet - Pet object with name and icon
 * @param {Object} props.userProfile - User profile
 * @param {Function} props.onExit - Callback to leave adventure
 * @param {Function} props.onComplete - Callback with score when adventure finishes
 */
export default function AdventureScreen({ pet, userProfile, onExit, onComplete }) {
  return (
    <motion.div
      key="adventure"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="absolute inset-0 z-50 bg-white"
    >
      <AdventureGame
        pet={pet}
        userProfile={userProfile}
        onExit={onExit}
        onComplete={onComplete}
      />
    </motion.div>
  );
}
