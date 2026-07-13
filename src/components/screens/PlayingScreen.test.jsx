import { vi, describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import PlayingScreen from './PlayingScreen';

vi.mock('framer-motion', async () => {
    const React = await import('react');
    const MOTION_ONLY_PROPS = new Set([
        'animate', 'initial', 'exit', 'variants', 'transition',
        'whileHover', 'whileTap', 'whileFocus', 'whileInView',
        'layout', 'layoutId', 'onAnimationComplete', 'drag', 'dragConstraints',
    ]);
    const motion = new Proxy({}, {
        get: (_, tag) => React.forwardRef(({ children, ...props }, ref) => {
            const htmlProps = Object.fromEntries(
                Object.entries(props).filter(([key]) => !MOTION_ONLY_PROPS.has(key))
            );
            return React.createElement(tag, { ...htmlProps, ref }, children);
        }),
    });
    return {
        __esModule: true,
        motion,
        AnimatePresence: ({ children }) => children,
    };
});

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
