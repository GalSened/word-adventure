import React, { useState } from 'react';

import { motion } from 'framer-motion';

export default function WelcomeScreen({ onComplete }) {
    const [name, setName] = useState('');
    const [gender, setGender] = useState(null); // 'boy' or 'girl'

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && gender) {
            onComplete({ name, gender });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center"
                dir="rtl"
            >
                <h1 className="text-4xl font-black mb-6 text-purple-600">ברוכים הבאים!</h1>
                <p className="text-xl mb-8 text-slate-600">מי משחק איתנו היום?</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center gap-4">
                        <button
                            type="button"
                            onClick={() => setGender('boy')}
                            className={`p-4 rounded-xl border-4 transition-all ${gender === 'boy' ? 'border-blue-500 bg-blue-50 scale-110' : 'border-transparent bg-slate-50 hover:bg-blue-50'}`}
                        >
                            <span className="text-5xl block mb-2">👦</span>
                            <span className="font-bold text-blue-600 block">ילד</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setGender('girl')}
                            className={`p-4 rounded-xl border-4 transition-all ${gender === 'girl' ? 'border-pink-500 bg-pink-50 scale-110' : 'border-transparent bg-slate-50 hover:bg-pink-50'}`}
                        >
                            <span className="text-5xl block mb-2">👧</span>
                            <span className="font-bold text-pink-600 block">ילדה</span>
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="איך קוראים לך?"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full text-center text-2xl p-4 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none"
                        dir="rtl"
                    />

                    <button
                        type="submit"
                        disabled={!name || !gender}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-transform active:scale-95"
                    >
                        מתחילים! 🚀
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
