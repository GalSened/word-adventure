import React from 'react';
import { motion } from 'framer-motion';
import Store from '../Store';

/**
 * StoreScreen component - Store screen wrapper for purchasing items
 * Displays the Store component within an animated container
 */
export default function StoreScreen({ coins, inventory, onBuy, onClose }) {
    return (
        <motion.div
            key="store"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
        >
            <Store coins={coins} inventory={inventory} onBuy={onBuy} onClose={onClose} />
        </motion.div>
    );
}
