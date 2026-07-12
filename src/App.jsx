import WordAdventure from './WordAdventure'
import ErrorBoundary from './components/ErrorBoundary'
import { useGameStore } from './store/gameStore'

function App() {
  return (
    <ErrorBoundary onGoHome={() => useGameStore.getState().resetGame()}>
      <WordAdventure />
    </ErrorBoundary>
  )
}

export default App
