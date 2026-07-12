import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

// Fisher-Yates (Array.sort with a random comparator is a biased shuffle)
function shuffle(array) {
    const out = [...array];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

function buildBoard(words) {
    // Select 6 random pairs, create English+Hebrew cards
    const selectedWords = shuffle(words).slice(0, 6);
    return shuffle([
        ...selectedWords.map(w => ({ id: w.word + '-en', content: w.word, type: 'en', pairId: w.word })),
        ...selectedWords.map(w => ({ id: w.word + '-he', content: w.hebrew, type: 'he', pairId: w.word }))
    ]);
}

export default function MemoryGame({ words, onComplete, onExit }) {
    // Board is built ONCE per mount (each entry to the memory screen remounts
    // this component). Deriving it from the `words` prop in an effect used to
    // reshuffle the board mid-game whenever the parent re-rendered.
    const [cards] = useState(() => buildBoard(words));
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

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

    // Completion must fire exactly once: onComplete awards score, and its
    // identity changes every parent render, so guard with a ref and keep the
    // timer cancellable on unmount.
    const completedRef = useRef(false);
    const completionTimerRef = useRef(null);
    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (completedRef.current) return;
        if (cards.length > 0 && matched.length === cards.length / 2) {
            completedRef.current = true;
            const score = Math.max(100, 1000 - (moves * 10)); // Calculate score based on moves
            completionTimerRef.current = setTimeout(() => onCompleteRef.current(score), 1000);
        }
    }, [matched, cards.length, moves]);

    useEffect(() => () => clearTimeout(completionTimerRef.current), []);

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
