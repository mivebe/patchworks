import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export function CoinFlip() {
  const gameState = useGameStore((s) => s.gameState);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const finishCoinFlip = useGameStore((s) => s.finishCoinFlip);
  const [phase, setPhase] = useState<'intro' | 'flipping' | 'result'>('intro');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('flipping'), 500);
    const t2 = setTimeout(() => setPhase('result'), 3000);
    const t3 = setTimeout(() => finishCoinFlip(), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [finishCoinFlip]);

  if (!gameState || myPlayerId === null) return null;

  const firstPlayerId = gameState.activePlayerId;
  const firstName = gameState.players[firstPlayerId].name;
  const isMeFirst = firstPlayerId === myPlayerId;

  const extraHalf = firstPlayerId === 1 ? 180 : 0;
  const totalRotation = 1440 + extraHalf;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-8">
      <h2 className="text-2xl font-bold text-white">
        {phase === 'intro' && 'Flipping for first player...'}
        {phase === 'flipping' && 'Flipping...'}
        {phase === 'result' && (
          isMeFirst
            ? 'You go first!'
            : `${firstName} goes first`
        )}
      </h2>

      <div className="perspective-midrange">
        <div
          className="relative w-28 h-28 md:w-40 md:h-40 transition-transform"
          style={{
            transformStyle: 'preserve-3d',
            transform: phase === 'intro'
              ? 'rotateY(0deg)'
              : `rotateY(${totalRotation}deg)`,
            transition: phase === 'flipping' || phase === 'result'
              ? 'transform 2.5s cubic-bezier(0.17, 0.67, 0.29, 0.99)'
              : 'none',
          }}
        >
          <div
            className="absolute inset-0 rounded-full bg-blue-600 flex items-center justify-center border-4 border-blue-400 shadow-lg shadow-blue-500/30"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="text-white font-bold text-lg text-center px-4">
              {gameState.players[0].name}
            </span>
          </div>

          <div
            className="absolute inset-0 rounded-full bg-rose-600 flex items-center justify-center border-4 border-rose-400 shadow-lg shadow-rose-500/30"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <span className="text-white font-bold text-lg text-center px-4">
              {gameState.players[1].name}
            </span>
          </div>
        </div>
      </div>

      {phase === 'result' && (
        <p className="text-gray-400 text-sm animate-pulse">
          Starting game...
        </p>
      )}
    </div>
  );
}
