/**
 * Switch-based routing from challengeType to challenge component
 * Routes the challengeType string to the correct challenge UI component.
 * Spelling, sentenceBuild, and grammar return null pending Plan 02-03 completion.
 */

import React from 'react';
import MultipleChoiceChallenge from './MultipleChoiceChallenge';
import ReverseChoiceChallenge from './ReverseChoiceChallenge';
import ListeningChallenge from './ListeningChallenge';

export default function ChallengeDispatcher({ challengeType, ...challengeProps }) {
    switch (challengeType) {
        case 'multipleChoice':
            return <MultipleChoiceChallenge {...challengeProps} />;
        case 'reverseChoice':
            return <ReverseChoiceChallenge {...challengeProps} />;
        case 'listening':
            return <ListeningChallenge {...challengeProps} />;
        case 'spelling':
            // Will be wired in Plan 03 to existing LetterPicker
            return null;
        case 'sentenceBuild':
            // Will be created in Plan 02
            return null;
        case 'grammar':
            // Will be created in Plan 02
            return null;
        default:
            // Safe fallback to multiple choice
            return <MultipleChoiceChallenge {...challengeProps} />;
    }
}
