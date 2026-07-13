import React from 'react';
import { AnimatePresence } from 'framer-motion';
import StartScreen from './StartScreen';
import MapScreen from './MapScreen';
import PlayingScreen from './PlayingScreen';
import ResultScreen from './ResultScreen';
import StoreScreen from './StoreScreen';
import InventoryScreen from './InventoryScreen';
import MemoryScreen from './MemoryScreen';
import PetWalkingScreen from './PetWalkingScreen';
import AvatarScreen from './AvatarScreen';
import WordBookScreen from './WordBookScreen';

/**
 * ScreenRouter component - Maps gameState to the correct screen component
 * Wraps screen transitions in AnimatePresence for smooth animations
 */
export default function ScreenRouter({ gameState, ...props }) {
    const renderScreen = () => {
        switch (gameState) {
            case 'start':
                return (
                    <StartScreen
                        key="start"
                        userProfile={props.userProfile}
                        dailyStats={props.dailyStats}
                        onStartLevel={props.startLevel}
                        onNavigate={props.setGameState}
                        onWalkPet={props.handleWalkPet}
                        t={props.t}
                    />
                );

            case 'map':
                return (
                    <MapScreen
                        key="map"
                        story={props.story}
                        onStartLevel={props.startLevel}
                        t={props.t}
                        completedLevels={props.completedLevels}
                    />
                );

            case 'playing':
                if (!props.currentWord) return null;
                return (
                    <PlayingScreen
                        key="play"
                        currentWord={props.currentWord}
                        lives={props.lives}
                        itemEffects={props.itemEffects}
                        challengeType={props.challengeType}
                        scrambledContent={props.scrambledContent}
                        userInput={props.userInput}
                        setUserInput={props.setUserInput}
                        handleCheck={props.handleCheck}
                        onAnswer={props.onAnswer}
                        feedback={props.feedback}
                        playerGender={props.userProfile?.gender || 'boy'}
                        t={props.t}
                        hintsAvailable={props.hintsAvailable}
                        skipsAvailable={props.skipsAvailable}
                        onUseHint={props.useHint}
                        onSkipWord={props.skipWord}
                    />
                );

            case 'levelComplete':
                return (
                    <ResultScreen
                        key="levelComplete"
                        isSuccess={true}
                        onGoHome={() => props.setGameState('start')}
                        onPlayAgain={() => props.startLevel('review')}
                        t={props.t}
                    />
                );

            case 'gameOver':
                return (
                    <ResultScreen
                        key="gameOver"
                        isSuccess={false}
                        onGoHome={() => props.setGameState('start')}
                        onPlayAgain={() => props.startLevel('review')}
                        t={props.t}
                    />
                );

            case 'store':
                return (
                    <StoreScreen
                        key="store"
                        coins={props.score}
                        inventory={props.inventory}
                        onBuy={props.handleBuy}
                        onClose={() => props.closeOverlay('start')}
                    />
                );

            case 'inventory':
                return (
                    <InventoryScreen
                        key="inventory"
                        inventory={props.inventory}
                        equipped={props.equipped}
                        onClose={props.handleInventoryClose}
                        onEquip={props.equipItem}
                        onUnequip={props.unequipItem}
                        onUse={props.handleUse}
                        onWalkPet={props.handleWalkPet}
                        gender={props.gender}
                    />
                );

            case 'memory':
                return (
                    <MemoryScreen
                        key="memory"
                        words={props.memoryWords}
                        onComplete={props.handleMemoryComplete}
                        onExit={() => props.setGameState('start')}
                    />
                );

            case 'petWalking':
                return (
                    <PetWalkingScreen
                        key="petWalking"
                        pet={props.activePet}
                        avatar={props.avatar}
                        userProfile={props.userProfile}
                        onExit={() => props.setGameState('start')}
                        onComplete={props.handlePetWalkComplete}
                    />
                );

            case 'avatar':
                return (
                    <AvatarScreen
                        key="avatar"
                        currentAvatar={props.avatar}
                        onSelect={props.handleAvatarSelect}
                        onClose={() => props.setGameState('start')}
                        t={props.t}
                    />
                );

            case 'wordBook':
                return (
                    <WordBookScreen
                        key="wordBook"
                        onClose={() => props.setGameState('start')}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <AnimatePresence mode="wait">
            {renderScreen()}
        </AnimatePresence>
    );
}
