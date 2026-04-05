import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { TabBar } from './TabBar';
import { QuiltBoard } from '../quilt/QuiltBoard';
import { PatchStrip } from '../patches/PatchStrip';
import { ActionPanel } from '../actions/ActionPanel';
import { PlayerInfo } from '../player/PlayerInfo';
import { TimeBoard } from '../timeBoard/TimeBoard';
import { GameOver } from '../game/GameOver';

export function GameLayout() {
  const gameState = useGameStore((s) => s.gameState);
  const activeTab = useGameStore((s) => s.activeTab);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const rotate = useGameStore((s) => s.rotate);
  const flip = useGameStore((s) => s.flip);
  const isMyTurn = useGameStore((s) => s.isMyTurn);
  const error = useGameStore((s) => s.error);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'r' || e.key === 'R') rotate();
      if (e.key === 'f' || e.key === 'F') flip();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [rotate, flip]);

  if (!gameState || myPlayerId === null) return null;

  const opponentId = (myPlayerId === 0 ? 1 : 0) as 0 | 1;
  const myTurn = isMyTurn();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <PlayerInfo playerId={myPlayerId} compact />
        <div className="flex items-center gap-3">
          <TabBar />
          {myTurn ? (
            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full animate-pulse">
              Your turn
            </span>
          ) : (
            <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded-full">
              Opponent's turn
            </span>
          )}
        </div>
        <PlayerInfo playerId={opponentId} compact />
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-900/50 text-red-300 text-sm text-center py-1 px-4">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {activeTab === 'myBoard' && (
          <div className="flex gap-6 items-start">
            <PlayerInfo playerId={myPlayerId} />
            <div>
              <h3 className="text-white text-center font-medium mb-2">
                {gameState.players[myPlayerId].name}'s Quilt (You)
              </h3>
              <QuiltBoard playerId={myPlayerId} />
            </div>
          </div>
        )}

        {activeTab === 'opponent' && (
          <div className="flex gap-6 items-start">
            <PlayerInfo playerId={opponentId} />
            <div>
              <h3 className="text-white text-center font-medium mb-2">
                {gameState.players[opponentId].name}'s Quilt
              </h3>
              <QuiltBoard playerId={opponentId} readOnly />
            </div>
          </div>
        )}

        {activeTab === 'timeBoard' && <TimeBoard />}
      </div>

      {/* Bottom: actions + patch strip */}
      <div className="bg-gray-800 border-t border-gray-700">
        <ActionPanel />
        <div className="border-t border-gray-700 py-2">
          <PatchStrip />
        </div>
      </div>

      {/* Game over overlay */}
      <GameOver />
    </div>
  );
}
