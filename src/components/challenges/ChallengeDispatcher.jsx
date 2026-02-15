/**
 * Switch-based routing from challengeType to challenge component
 * Routes the challengeType string to the correct challenge UI component.
 * All 6 challenge types are now fully wired.
 */

import React from 'react';
import MultipleChoiceChallenge from './MultipleChoiceChallenge';
import ReverseChoiceChallenge from './ReverseChoiceChallenge';
import ListeningChallenge from './ListeningChallenge';
import SpellingChallenge from './SpellingChallenge';
import SentenceBuildChallenge from './SentenceBuildChallenge';
import GrammarChallenge from './GrammarChallenge';

export default function ChallengeDispatcher({ challengeType, ...challengeProps }) {
    switch (challengeType) {
        case 'multipleChoice':
            return <MultipleChoiceChallenge {...challengeProps} />;
        case 'reverseChoice':
            return <ReverseChoiceChallenge {...challengeProps} />;
        case 'listening':
            return <ListeningChallenge {...challengeProps} />;
        case 'spelling':
            return <SpellingChallenge {...challengeProps} />;
        case 'sentenceBuild':
            return <SentenceBuildChallenge {...challengeProps} />;
        case 'grammar':
            return <GrammarChallenge {...challengeProps} />;
        default:
            // Safe fallback to spelling -- preserves existing behavior
            return <SpellingChallenge {...challengeProps} />;
    }
}
