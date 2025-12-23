import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Check } from 'lucide-react';

const items = [
    { id: 'wizard_hat', name: 'כובע קוסמים', icon: '🎩', price: 500, type: 'head' },
    { id: 'crown', name: 'כתר מלכותי', icon: '👑', price: 1000, type: 'head' },
    { id: 'glasses', name: 'משקפיים חכמים', icon: '👓', price: 300, type: 'head' },
    { id: 'cape', name: 'גלימת גיבורים', icon: '🧣', price: 800, type: 'body' },
    { id: 'dragon', name: 'דרקון מחמד', icon: '🐉', price: 5000, type: 'pet' },
    { id: 'unicorn', name: 'חד קקרן', icon: '🦄', price: 5000, type: 'pet' },
    { id: 'potion_health', name: 'שיקוי חיים', icon: '🧪', price: 200, type: 'consumable' },
];

export default function Store({ coins, inventory, onBuy, onClose }) {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-xl max-w-4xl mx-auto h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                    <ShoppingBag className="text-purple-600" /> חנות ההפתעות
                </h2>
                <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                    <Star fill="currentColor" /> {coins}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto flex-1 p-2">
                {items.map((item) => {
                    const isOwned = inventory.includes(item.id);
                    const canAfford = coins >= item.price;

                    return (
                        <motion.div
                            key={item.id}
                            whileHover={{ scale: 1.02 }}
                            className={`border-2 rounded-2xl p-4 flex flex-col items-center gap-2 ${isOwned ? 'bg-slate-50 border-slate-200' : 'bg-white border-purple-100'}`}
                        >
                            <div className="text-5xl mb-2">{item.icon}</div>
                            <h3 className="font-bold text-lg">{item.name}</h3>

                            {isOwned ? (
                                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold w-full text-center flex items-center justify-center gap-2">
                                    <Check size={18} /> יש לך את זה
                                </div>
                            ) : (
                                <button
                                    onClick={() => onBuy(item)}
                                    disabled={!canAfford}
                                    className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-colors ${canAfford
                                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Star size={16} fill="currentColor" /> {item.price}
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <button onClick={onClose} className="mt-4 w-full py-3 bg-slate-100 font-bold rounded-xl hover:bg-slate-200">
                יציאה מהחנות
            </button>
        </div>
    );
}
