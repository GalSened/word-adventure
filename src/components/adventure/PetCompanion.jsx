import React from 'react';
import { motion } from 'framer-motion';

/**
 * Pet animation configurations keyed by behavior state.
 * Each entry defines framer-motion animate props and transition settings.
 */
const PET_ANIMATIONS = {
  walk: {
    animate: { y: [0, -5, 0] },
    transition: { repeat: Infinity, duration: 0.6, ease: 'easeInOut' },
  },
  sniff: {
    animate: { rotate: [0, -10, 10, -5, 0] },
    transition: { repeat: Infinity, duration: 1.0, ease: 'easeInOut' },
  },
  idle: {
    animate: { scale: [1, 1.05, 1] },
    transition: { repeat: Infinity, duration: 2.0, ease: 'easeInOut' },
  },
  celebrate: {
    animate: { y: [0, -20, 0], rotate: [0, 15, -15, 0] },
    transition: { repeat: Infinity, duration: 0.8, ease: 'easeOut' },
  },
};

/**
 * PetCompanion - Displays the pet with behavior-based animation states.
 *
 * @param {Object} props
 * @param {Object} props.pet - Pet object with name and icon properties
 * @param {string} props.behavior - Current behavior: 'walk', 'sniff', 'idle', 'celebrate'
 * @param {string} [props.className] - Additional CSS classes
 */
export default function PetCompanion({ pet, behavior = 'walk', className = '' }) {
  const anim = PET_ANIMATIONS[behavior] || PET_ANIMATIONS.walk;

  return (
    <div className={`absolute bottom-[22vh] left-[30%] ${className}`}>
      <motion.div
        className="text-5xl"
        animate={anim.animate}
        transition={anim.transition}
      >
        {pet.icon}
      </motion.div>

      {/* Thought bubble when sniffing -- indicates alertness */}
      {behavior === 'sniff' && (
        <motion.div
          className="absolute -top-10 -right-2 text-2xl bg-yellow-100 rounded-full p-1 shadow"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {'\uD83D\uDD0D'}
        </motion.div>
      )}
    </div>
  );
}
