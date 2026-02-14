import React from 'react';
import AvatarSelect from '../AvatarSelect';

/**
 * AvatarScreen component - Avatar selection screen wrapper
 * Allows the player to choose their character avatar
 */
export default function AvatarScreen({ currentAvatar, onSelect, onClose, t }) {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-center mb-6">
                {t('בחר דמות', 'בחרי דמות')}
            </h2>
            <AvatarSelect currentAvatar={currentAvatar} onSelect={onSelect} />
            <button
                onClick={onClose}
                className="w-full mt-4 py-3 bg-slate-100 rounded-xl font-bold"
            >
                חזרה
            </button>
        </div>
    );
}
