import React from 'react';
import { motion } from 'framer-motion';

const avatars = [
    { id: 'princess', icon: '👸', name: 'נסיכה' },
    { id: 'prince', icon: '🤴', name: 'נסיך' },
    { id: 'wizard', icon: '🧙‍♂️', name: 'קוסם' },
    { id: 'fairy', icon: '🧚', name: 'פיה' },
    { id: 'knight', icon: '🦸', name: 'אביר' },
    { id: 'alien', icon: '👽', name: 'חייזר' },
    { id: 'robot', icon: '🤖', name: 'רובוט' },
    { id: 'cat', icon: '🐱', name: 'חתול' },
];

export default function AvatarSelect({ currentAvatar, onSelect }) {
    return (
        <div className="grid grid-cols-4 gap-4 p-4">
            {avatars.map((avatar) => (
                <motion.button
                    key={avatar.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSelect(avatar.icon)}
                    className={`p-4 rounded-xl text-4xl flex flex-col items-center gap-2 transition-all ${currentAvatar === avatar.icon
                            ? 'bg-purple-100 ring-4 ring-purple-400 shadow-lg'
                            : 'bg-white hover:bg-slate-50 shadow-sm border border-slate-100'
                        }`}
                >
                    <span>{avatar.icon}</span>
                    <span className="text-xs font-bold text-slate-600">{avatar.name}</span>
                </motion.button>
            ))}
        </div>
    );
}
