import React from 'react';
import { Backpack } from 'lucide-react';

const itemDetails = {
    'wizard_hat': { name: 'כובע קוסמים', icon: '🎩' },
    'crown': { name: 'כתר מלכותי', icon: '👑' },
    'glasses': { name: 'משקפיים חכמים', icon: '👓' },
    'cape': { name: 'גלימת גיבורים', icon: '🧣' },
    'dragon': { name: 'דרקון מחמד', icon: '🐉' },
    'unicorn': { name: 'חד קרן', icon: '🦄' },
    'dog': { name: 'כלבלב', icon: '🐕' },
    'potion_health': { name: 'שיקוי חיים', icon: '🧪' },
};

export default function Inventory({ inventory, onClose, gender = 'boy' }) {
    const t = (male, female) => gender === 'boy' ? male : female;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-xl max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                    <Backpack className="text-blue-600" /> התיק שלי
                </h2>
            </div>

            {inventory.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                    <div className="text-6xl mb-4">🎒</div>
                    <p>התיק ריק... {t('בוא', 'בואי')} נקנה משהו בחנות!</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {inventory.map(itemId => {
                        const item = itemDetails[itemId];
                        const isPet = itemId === 'dog' || itemId === 'dragon' || itemId === 'unicorn'; // distinctive check

                        if (!item) return null;
                        return (
                            <div key={itemId} className="bg-slate-50 p-4 rounded-xl flex flex-col items-center gap-2 border border-slate-100 relative group">
                                <div className="text-4xl">{item.icon}</div>
                                <span className="font-bold text-sm text-slate-600">{item.name}</span>

                                {isPet && (
                                    <button
                                        onClick={() => onClose(itemId)} // Pass item ID to indicate pet selection
                                        className="mt-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold hover:bg-green-600 transition-colors"
                                    >
                                        לצאת לטיול 🐾
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <button onClick={() => onClose(null)} className="mt-6 w-full py-3 bg-slate-100 font-bold rounded-xl hover:bg-slate-200">
                סגירה
            </button>
        </div>
    );
}
