import { useGameStore } from './store/gameStore';
import { GameSetup } from './components/game/GameSetup';
import { WaitingRoom } from './components/game/WaitingRoom';
import { CoinFlip } from './components/game/CoinFlip';
import { GameConnection } from './components/game/GameConnection';
import { GameLayout } from './components/layout/GameLayout';

function App() {
  const connectionPhase = useGameStore((s) => s.connectionPhase);
  const roomId = useGameStore((s) => s.roomId);

  return (
    <>
      {roomId && <GameConnection />}

      {connectionPhase === 'lobby' && <GameSetup />}
      {connectionPhase === 'waiting' && <WaitingRoom />}
      {connectionPhase === 'coinFlip' && <CoinFlip />}
      {(connectionPhase === 'playing' || connectionPhase === 'finished') && <GameLayout />}
    </>
  );
}

export default App;
