import React from 'react';
import { motion } from 'framer-motion';
import Inventory from '../Inventory';

/**
 * InventoryScreen component - Inventory management screen wrapper
 * Displays equipped items, consumables, and pet walking access
 */
export default function InventoryScreen({
    inventory,
    equipped,
    onClose,
    onEquip,
    onUnequip,
    onUse,
    onWalkPet,
    gender
}) {
    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
        >
            <Inventory
                inventory={inventory}
                equipped={equipped}
                onClose={onClose}
                onEquip={onEquip}
                onUnequip={onUnequip}
                onUse={onUse}
                onWalkPet={onWalkPet}
                gender={gender}
            />
        </motion.div>
    );
}
