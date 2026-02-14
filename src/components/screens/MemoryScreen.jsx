import React from 'react';
import MemoryGame from '../MemoryGame';

/**
 * MemoryScreen component - Memory matching game screen wrapper
 * Renders the MemoryGame component for vocabulary practice
 */
export default function MemoryScreen({ words, onComplete, onExit }) {
    return (
        <MemoryGame
            words={words}
            onComplete={onComplete}
            onExit={onExit}
        />
    );
}
