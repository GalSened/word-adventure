import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MemoryGame({ words, onComplete, onExit }) {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        // Select 6 random pairs
        const selectedWords = [...words].sort(() => 0.5 - Math.random()).slice(0, 6);

        // Create card pairs (English + Hebrew)
        const gameCards = [
            ...selectedWords.map(w => ({ id: w.word + '-en', content: w.word, type: 'en', pairId: w.word })),
            ...selectedWords.map(w => ({ id: w.word + '-he', content: w.hebrew, type: 'he', pairId: w.word }))
        ];

        setCards(gameCards.sort(() => 0.5 - Math.random()));
        // Reset game state when words change
        setFlipped([]);
        setMatched([]);
        setMoves(0);
        setIsLocked(false);
    }, [words]);

    const handleCardClick = (index) => {
        if (isLocked || flipped.includes(index) || matched.includes(cards[index].pairId)) return;

        const newFlipped = [...flipped, index];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setIsLocked(true);
            setMoves(m => m + 1);

            const [first, second] = newFlipped;
            if (cards[first].pairId === cards[second].pairId) {
                // Match!
                setTimeout(() => {
                    setMatched(prev => [...prev, cards[first].pairId]);
                    setFlipped([]);
                    setIsLocked(false);
                    confetti({ particleCount: 30, spread: 30, origin: { y: 0.7 } });
                }, 500);
            } else {
                // No match
                setTimeout(() => {
                    setFlipped([]);
                    setIsLocked(false);
                }, 1000);
            }
        }
    };

    useEffect(() => {
        if (cards.length > 0 && matched.length === cards.length / 2) {
            setTimeout(() => {
                const score = Math.max(100, 1000 - (moves * 10)); // Calculate score based on moves
                onComplete(score);
            }, 1000);
        }
    }, [matched, cards.length, moves, onComplete]);

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onExit} className="text-purple-600 font-bold hover:bg-purple-50 px-4 py-2 rounded-xl transition-colors">
                    ← יציאה
                </button>
                <div className="text-xl font-bold text-slate-700 bg-white px-6 py-2 rounded-full shadow-sm">
                    מהלכים: {moves}
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                <AnimatePresence>
                    {cards.map((card, index) => {
                        const isFlipped = flipped.includes(index) || matched.includes(card.pairId);
                        const isMatched = matched.includes(card.pairId);

                        return (
                            <motion.div
                                key={card.id}
                                layout
                                onClick={() => handleCardClick(index)}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileHover={!isFlipped ? { scale: 1.05 } : {}}
                                className="aspect-[3/4] perspective-1000 cursor-pointer h-32 md:h-40"
                            >
                                <motion.div
                                    className={`relative w-full h-full text-center transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                                    style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                                >
                                    {/* Front (Hidden) */}
                                    <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center border-4 border-white">
                                        <span className="text-4xl">❓</span>
                                    </div>

                                    {/* Back (Revealed) */}
                                    <div
                                        className={`absolute w-full h-full backface-hidden bg-white rounded-xl shadow-xl flex items-center justify-center border-4 ${isMatched ? 'border-green-400 bg-green-50' : 'border-purple-200'}`}
                                        style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                                    >
                                        <span className={`font-bold ${card.type === 'en' ? 'text-2xl font-mono text-purple-600' : 'text-3xl text-slate-700'}`}>
                                            {card.content}
                                        </span>
                                        {isMatched && (
                                            <div className="absolute top-2 right-2 text-green-500">
                                                <Check size={20} />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
