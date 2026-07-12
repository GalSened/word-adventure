import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import ChallengeDispatcher from '../challenges/ChallengeDispatcher';
import { selectChallengeType } from '../../utils/challengeSelector';
import { seededShuffle } from '../../utils/seededRandom';
import { useGameStore } from '../../store/gameStore';

/**
 * EncounterOverlay - Wraps ChallengeDispatcher for adventure encounters.
 * Manages its own userInput/scrambled state for SpellingChallenge compatibility.
 * Shows pet hint bubble after delay. Reports answer via onAnswer callback.
 *
 * @param {Object} props
 * @param {Object} props.word - Word object from the word bank
 * @param {Object} props.zone - Zone config with theme
 * @param {Object} props.pet - Pet object with name and icon
 * @param {string} props.playerGender - 'boy' or 'girl'
 * @param {Function} props.t - Gender helper function (male, female) => string
 * @param {Function} props.onAnswer - Callback: (isCorrect: boolean) => void
 * @param {boolean} props.showHint - Whether pet hint bubble is visible
 */
export default function EncounterOverlay({ word, zone, pet, playerGender, t, onAnswer, showHint }) {
  const [userInput, setUserInput] = useState('');
  const [isResolved, setIsResolved] = useState(false);

  // Adaptive challenge type selection based on SRS mastery
  const challengeType = useMemo(() => {
    if (word.id?.startsWith('gen_')) return 'grammar';
    const srsState = useGameStore.getState().userProgress[word.id];
    return selectChallengeType(word, srsState, []);
  }, [word]);

  // Scrambled content for spelling/sentence challenges — seeded by word id
  // so the tiles don't reshuffle on re-render (pure memo)
  const scrambledContent = useMemo(() => {
    if (word.type === 'sentence') return seededShuffle(word.word.split(' '), word.id);
    return seededShuffle(word.word.split(''), word.id);
  }, [word]);

  const handleAnswer = (isCorrect) => {
    setIsResolved(true);
    onAnswer(isCorrect);
  };

  const handleCheck = () => {
    const normalize = (str) => str.trim().toUpperCase().replace(/[.,?!]/g, '');
    const isCorrect = normalize(userInput) === normalize(word.word);
    handleAnswer(isCorrect);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 max-w-lg w-full shadow-2xl relative"
      >
        {/* Zone accent header */}
        <div className={`absolute top-0 left-0 right-0 h-2 rounded-t-3xl bg-gradient-to-r ${zone.theme.accent}`} />

        {/* Pet hint bubble (ADVN-07) */}
        {showHint && !isResolved && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-14 right-4 bg-yellow-100 rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2"
          >
            <span className="text-2xl">{pet.icon}</span>
            <span className="text-2xl">{word.emoji}</span>
          </motion.div>
        )}

        {/* Encounter word info */}
        <div className="text-center mb-4 mt-2">
          <span className="text-3xl">{word.emoji}</span>
        </div>

        {/* ChallengeDispatcher with all required props */}
        <ChallengeDispatcher
          challengeType={challengeType}
          word={word}
          onAnswer={handleAnswer}
          disabled={isResolved}
          playerGender={playerGender}
          t={t}
          scrambledContent={scrambledContent}
          userInput={userInput}
          setUserInput={setUserInput}
          onCheck={handleCheck}
        />
      </motion.div>
    </motion.div>
  );
}
