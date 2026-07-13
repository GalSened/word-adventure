import { vi, describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import PlayingScreen from './PlayingScreen';

// Deliberately NO framer-motion mock here: the bug this file guards against
// was an AnimatePresence exit animation keeping the overlay mounted after
// the feedback state cleared. A pass-through mock would make the unmount
// test pass even against the buggy code — only the real library can prove
// the overlay leaves the DOM synchronously.

vi.mock('../../utils/mobile', () => ({ hapticFeedback: vi.fn() }));
vi.mock('../../utils/speech', () => ({
    speakWord: vi.fn(),
    isSpeechSupported: () => false,
}));

const WORD = {
    id: 'duck', word: 'DUCK', hebrew: 'ברווז', hint: '🦆', category: 'animals',
    emoji: '🦆', level: 'easy', type: 'word', gender: 'm',
    exampleSentence: 'The duck swims.', exampleSentence_he: 'הברווז שוחה.',
};

const baseProps = {
    currentWord: WORD,
    lives: 1,
    itemEffects: { getStartingLives: (n) => n },
    challengeType: 'multipleChoice',
    scrambledContent: [],
    userInput: '',
    setUserInput: () => {},
    handleCheck: () => {},
    onAnswer: () => {},
    playerGender: 'boy',
    t: (m) => m,
};

describe('PlayingScreen feedback overlay — can never trap taps', () => {
    it('the feedback overlay never intercepts pointer events', () => {
        render(
            <PlayingScreen
                {...baseProps}
                feedback={{ type: 'error', message: 'נשאר לך לב אחד! התרכז! ❤️' }}
            />
        );
        const overlay = screen.getByRole('alert');
        // The overlay covers the whole challenge card (inset-0). Input is
        // already disabled through the challenge components' disabled prop,
        // so the overlay must be tap-transparent: if its removal ever lags
        // (rAF-throttled backgrounded tab / phone PWA resume), a visible
        // leftover must not swallow the player's taps.
        expect(overlay.className).toContain('pointer-events-none');
    });

    it('the overlay unmounts as soon as feedback clears', () => {
        const { rerender } = render(
            <PlayingScreen
                {...baseProps}
                feedback={{ type: 'error', message: 'נשאר לך לב אחד! התרכז! ❤️' }}
            />
        );
        expect(screen.getByRole('alert')).toBeTruthy();
        rerender(<PlayingScreen {...baseProps} feedback={null} />);
        expect(screen.queryByRole('alert')).toBeNull();
    });
});
