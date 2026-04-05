import { useGameStore } from './store/gameStore';
import { GameSetup } from './components/game/GameSetup';
import { WaitingRoom } from './components/game/WaitingRoom';
import { GameConnection } from './components/game/GameConnection';
import { GameLayout } from './components/layout/GameLayout';

function App() {
  const connectionPhase = useGameStore((s) => s.connectionPhase);
  const roomId = useGameStore((s) => s.roomId);

  return (
    <>
      {/* WebSocket connection — active whenever we have a roomId */}
      {roomId && <GameConnection />}

      {connectionPhase === 'lobby' && <GameSetup />}
      {connectionPhase === 'waiting' && <WaitingRoom />}
      {(connectionPhase === 'playing' || connectionPhase === 'finished') && <GameLayout />}
    </>
  );
}

export default App;
