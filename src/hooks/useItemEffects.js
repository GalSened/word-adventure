import { useCallback, useMemo } from 'react';
import { STORE_ITEMS } from '../data/storeItems';
import { useGameStore } from '../store/gameStore';

/**
 * Hook for managing item effects in gameplay
 * Thin wrapper around useGameStore for equipped state — keeps all computation logic
 */
export function useItemEffects(inventory = []) {
    // Equipped items state from Zustand store
    const equipped = useGameStore((s) => s.equipped);

    // Track consumable counts from inventory
    const consumableCounts = useMemo(() => {
        const counts = {};
        inventory.forEach(itemId => {
            const item = STORE_ITEMS[itemId];
            if (item?.consumable) {
                counts[itemId] = (counts[itemId] || 0) + 1;
            }
        });
        return counts;
    }, [inventory]);

    // Save equipped items to store
    const saveEquipped = useCallback((newEquipped) => {
        useGameStore.getState().setEquipped(newEquipped);
    }, []);

    // Get slot for an item (defined before use to avoid hoisting issues)
    const getItemSlot = useCallback((item) => {
        if (item.category === 'boosters') return `booster_${item.id}`;
        if (item.category === 'themes') return 'theme';
        if (item.effect?.slot) return item.effect.slot;
        return item.category;
    }, []);

    // Equip an item
    const equipItem = useCallback((item) => {
        if (!item.equipable) return false;

        const slot = getItemSlot(item);
        const currentEquipped = useGameStore.getState().equipped;
        const newEquipped = {
            ...currentEquipped,
            [slot]: item.id
        };
        saveEquipped(newEquipped);
        return true;
    }, [saveEquipped, getItemSlot]);

    // Unequip an item
    const unequipItem = useCallback((item) => {
        const slot = getItemSlot(item);
        const currentEquipped = useGameStore.getState().equipped;
        const newEquipped = { ...currentEquipped };
        delete newEquipped[slot];
        saveEquipped(newEquipped);
        return true;
    }, [saveEquipped, getItemSlot]);

    // Use a consumable item (returns effect to apply)
    const useConsumable = useCallback((item, removeFromInventory) => {
        if (!item.consumable) return null;
        if (!consumableCounts[item.id] || consumableCounts[item.id] <= 0) {
            return null;
        }

        // Remove one from inventory
        removeFromInventory?.(item.id);

        // Return the effect to be applied
        return item.effect;
    }, [consumableCounts]);

    // Calculate active bonuses from equipped items
    const activeBonuses = useMemo(() => {
        const bonuses = {
            pointsMultiplier: 1,
            extraLives: 0,
            hintBoost: false,
            streakProtection: false,
            xpMultiplier: 1,
            theme: null,
            companion: null,
            visualEffects: []
        };

        Object.values(equipped).forEach(itemId => {
            const item = STORE_ITEMS[itemId];
            if (!item?.effect) return;

            switch (item.effect.type) {
                case 'multiplier':
                    bonuses.pointsMultiplier *= item.effect.value;
                    break;
                case 'extra_life':
                    bonuses.extraLives += item.effect.value;
                    break;
                case 'hint_boost':
                    bonuses.hintBoost = true;
                    break;
                case 'streak_protection':
                    bonuses.streakProtection = true;
                    break;
                case 'xp_multiplier':
                    bonuses.xpMultiplier *= item.effect.value;
                    break;
                case 'theme':
                    bonuses.theme = item.effect.colors;
                    break;
                case 'companion':
                    bonuses.companion = {
                        id: item.id,
                        icon: item.icon,
                        name: item.name,
                        bonus: item.effect.bonus
                    };
                    break;
                case 'visual':
                    bonuses.visualEffects.push({
                        slot: item.effect.slot,
                        icon: item.icon
                    });
                    break;
                default:
                    break;
            }
        });

        return bonuses;
    }, [equipped]);

    // Apply consumable effect (returns modified game state)
    const applyConsumableEffect = useCallback((effect, currentState) => {
        if (!effect) return currentState;

        const newState = { ...currentState };

        switch (effect.type) {
            case 'heal':
                newState.lives = Math.min(
                    (currentState.lives || 3) + effect.value,
                    currentState.maxLives || 4
                );
                break;
            case 'hint':
                newState.hintsAvailable = (currentState.hintsAvailable || 0) + effect.value;
                break;
            case 'skip':
                newState.skipsAvailable = (currentState.skipsAvailable || 0) + effect.value;
                break;
            case 'freeze':
                newState.timeFreeze = effect.duration;
                break;
            case 'luck':
                newState.luckBonus = effect.bonus_chance;
                break;
            case 'mystery': {
                // Random reward
                const rewards = effect.possible_rewards;
                const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
                switch (randomReward) {
                    case 'coins':
                        newState.bonusCoins = Math.floor(Math.random() * 100) + 50;
                        break;
                    case 'boost':
                        newState.temporaryBoost = { multiplier: 2, duration: 60 };
                        break;
                    case 'item':
                        // Would need to integrate with store for random item
                        newState.mysteryReward = 'item';
                        break;
                    default:
                        break;
                }
                break;
            }
            default:
                break;
        }

        return newState;
    }, []);

    // Calculate points with bonuses
    const calculatePoints = useCallback((basePoints, streak = 0) => {
        let points = basePoints;

        // Apply equipped multiplier
        points *= activeBonuses.pointsMultiplier;

        // Streak bonus
        if (streak > 0) {
            points *= (1 + streak * 0.1); // 10% per streak
        }

        // Random luck bonus if active
        if (activeBonuses.luckBonus && Math.random() < activeBonuses.luckBonus) {
            points *= 1.5;
        }

        return Math.floor(points);
    }, [activeBonuses]);

    // Check if streak should be protected
    const shouldProtectStreak = useCallback(() => {
        return activeBonuses.streakProtection;
    }, [activeBonuses]);

    // Get starting lives (base + bonuses)
    const getStartingLives = useCallback((baseLives = 3) => {
        return baseLives + activeBonuses.extraLives;
    }, [activeBonuses]);

    // Get hint quality
    const getHintQuality = useCallback(() => {
        return activeBonuses.hintBoost ? 'detailed' : 'basic';
    }, [activeBonuses]);

    // Get current theme colors
    const getThemeColors = useCallback(() => {
        return activeBonuses.theme || { primary: 'purple', secondary: 'pink' };
    }, [activeBonuses]);

    // Get equipped visual items for avatar display
    const getAvatarVisuals = useCallback(() => {
        return activeBonuses.visualEffects;
    }, [activeBonuses]);

    // Get companion info
    const getCompanion = useCallback(() => {
        return activeBonuses.companion;
    }, [activeBonuses]);

    return {
        // State
        equipped,
        consumableCounts,
        activeBonuses,

        // Actions
        equipItem,
        unequipItem,
        useConsumable,
        applyConsumableEffect,

        // Gameplay helpers
        calculatePoints,
        shouldProtectStreak,
        getStartingLives,
        getHintQuality,
        getThemeColors,
        getAvatarVisuals,
        getCompanion
    };
}

export default useItemEffects;
