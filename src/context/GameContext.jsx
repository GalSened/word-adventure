import { createContext, useContext } from 'react';
import { useGameStore } from '../store/gameStore';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const store = useGameStore();
  return (
    <GameContext.Provider value={store}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
