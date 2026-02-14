import React from 'react';
import { motion } from 'framer-motion';
import PetWalkingGame from '../PetWalkingGame';

/**
 * PetWalkingScreen component - Pet walking adventure screen wrapper
 * Renders PetWalkingGame with userProfile for correct gender handling
 */
export default function PetWalkingScreen({ pet, avatar, userProfile, onExit, onComplete }) {
    return (
        <motion.div
            key="petWalking"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 z-50 bg-white"
        >
            <PetWalkingGame
                pet={pet}
                avatar={avatar}
                userProfile={userProfile}
                onExit={onExit}
                onComplete={onComplete}
            />
        </motion.div>
    );
}
