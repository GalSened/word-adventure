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
import ClozeChallenge from './ClozeChallenge';

export default function ChallengeDispatcher({ challengeType, ...challengeProps }) {
    // Key by word id: challenge components hold per-word state (reorder tiles,
    // spoken audio); remounting on word change guarantees a clean slate
    const key = challengeProps.word?.id;

    switch (challengeType) {
        case 'multipleChoice':
            return <MultipleChoiceChallenge key={key} {...challengeProps} />;
        case 'reverseChoice':
            return <ReverseChoiceChallenge key={key} {...challengeProps} />;
        case 'listening':
            return <ListeningChallenge key={key} {...challengeProps} />;
        case 'spelling':
            return <SpellingChallenge key={key} {...challengeProps} />;
        case 'sentenceBuild':
            return <SentenceBuildChallenge key={key} {...challengeProps} />;
        case 'grammar':
            return <GrammarChallenge key={key} {...challengeProps} />;
        case 'cloze':
            return <ClozeChallenge key={key} {...challengeProps} />;
        default:
            // Safe fallback to spelling -- preserves existing behavior
            return <SpellingChallenge key={key} {...challengeProps} />;
    }
}
