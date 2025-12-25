import React from 'react';
import { Home, ShoppingBag, Backpack, Trophy } from 'lucide-react';

/**
 * GameHeader component - Top navigation bar
 * Shows navigation buttons and current score/avatar
 */
export default function GameHeader({ score, avatar, onNavigate }) {
    return (
        <div className="flex justify-between items-center mb-6 bg-white/80 backdrop-blur rounded-2xl p-3 shadow-md">
            <div className="flex gap-2">
                <button
                    onClick={() => onNavigate('start')}
                    aria-label="Go to home"
                >
                    <Home className="text-purple-600" />
                </button>
                <button
                    onClick={() => onNavigate('store')}
                    className="text-yellow-600"
                    aria-label="Open store"
                >
                    <ShoppingBag />
                </button>
                <button
                    onClick={() => onNavigate('inventory')}
                    className="text-blue-600"
                    aria-label="Open inventory"
                >
                    <Backpack />
                </button>
            </div>
            <div className="flex gap-4 font-bold text-lg">
                <span className="flex items-center gap-1 text-yellow-600">
                    <Trophy size={18} aria-hidden="true" />
                    <span aria-label={`Score: ${score}`}>{score}</span>
                </span>
                <span className="flex items-center gap-1 text-purple-600 text-2xl" role="img" aria-label="Avatar">
                    {avatar}
                </span>
            </div>
        </div>
    );
}
