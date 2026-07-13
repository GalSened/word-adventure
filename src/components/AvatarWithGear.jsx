import React from 'react';
import { STORE_ITEMS } from '../data/storeItems';

/**
 * The player's avatar with every equipped cosmetic rendered on it — the
 * whole point of buying cosmetics is seeing them, so this is used in the
 * global header (visible on every screen).
 *
 * Cosmetic slots come from each item's effect.slot: head sits on top,
 * face in front, back/trail beside, aura floats above the corner.
 */
const SLOT_CLASSES = {
    head: 'absolute -top-3 left-1/2 -translate-x-1/2 text-[0.72em]',
    face: 'absolute top-[0.45em] left-1/2 -translate-x-1/2 text-[0.55em]',
    back: 'absolute top-1/2 -translate-y-1/2 -right-3 text-[0.72em]',
    aura: 'absolute -top-2 -left-2 text-[0.6em] animate-pulse',
    trail: 'absolute -bottom-1 -left-3 text-[0.65em]',
};

export default function AvatarWithGear({ avatar, equipped = {}, className = 'text-2xl' }) {
    const gear = Object.entries(equipped)
        .map(([slot, itemId]) => ({ slot, item: STORE_ITEMS[itemId] }))
        .filter(({ slot, item }) => item?.effect?.type === 'visual' && SLOT_CLASSES[slot]);

    return (
        <span className={`relative inline-block ${className}`} data-testid="avatar-with-gear">
            <span>{avatar}</span>
            {gear.map(({ slot, item }) => (
                <span key={slot} className={SLOT_CLASSES[slot]} aria-label={item.name}>
                    {item.icon}
                </span>
            ))}
        </span>
    );
}
