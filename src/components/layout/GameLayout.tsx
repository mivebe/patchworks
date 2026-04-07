import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { TabBar } from './TabBar';
import { QuiltBoard } from '../quilt/QuiltBoard';
import { PatchStrip } from '../patches/PatchStrip';
import { PatchOverlay } from '../patches/PatchOverlay';
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
  const boardGridRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(0);

  // Measure board width via ResizeObserver
  useEffect(() => {
    const el = boardGridRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setBoardWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeTab]);

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
      <div className="flex items-center justify-between px-2 py-1.5 md:px-4 md:py-2 bg-gray-800 border-b border-gray-700 gap-1 md:gap-3">
        <PlayerInfo playerId={myPlayerId} compact />
        <div className="flex items-center gap-1.5 md:gap-3">
          <TabBar />
          {myTurn ? (
            <span className="text-[10px] md:text-xs bg-green-600 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-full animate-pulse whitespace-nowrap">
              Your turn
            </span>
          ) : (
            <span className="text-[10px] md:text-xs bg-gray-600 text-gray-300 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full whitespace-nowrap">
              Waiting
            </span>
          )}
        </div>
        <PlayerInfo playerId={opponentId} compact />
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-900/50 text-red-300 text-sm text-center py-1 px-2">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 gap-2 md:p-4 md:gap-4">
        {activeTab === 'myBoard' && (
          <div className="flex flex-col items-center md:flex-row md:gap-6 md:items-start w-full">
            <div className="hidden md:block">
              <PlayerInfo playerId={myPlayerId} />
            </div>
            <div className="w-full max-w-xs md:max-w-none md:w-auto">
              <h3 className="text-white text-center font-medium mb-2 text-sm md:text-base">
                {gameState.players[myPlayerId].name}'s Quilt (You)
              </h3>
              {/* Board container — relative so PatchOverlay can position absolutely */}
              <div className="relative mx-auto w-full max-w-[288px]">
                <QuiltBoard playerId={myPlayerId} gridRef={boardGridRef} />
                <PatchOverlay boardWidth={boardWidth} />
              </div>
            </div>
            <div className="md:hidden mt-2 w-full max-w-xs">
              <PlayerInfo playerId={myPlayerId} />
            </div>
          </div>
        )}

        {activeTab === 'opponent' && (
          <div className="flex flex-col items-center md:flex-row md:gap-6 md:items-start w-full">
            <div className="hidden md:block">
              <PlayerInfo playerId={opponentId} />
            </div>
            <div className="w-full max-w-xs md:max-w-none md:w-auto">
              <h3 className="text-white text-center font-medium mb-2 text-sm md:text-base">
                {gameState.players[opponentId].name}'s Quilt
              </h3>
              <QuiltBoard playerId={opponentId} readOnly />
            </div>
            <div className="md:hidden mt-2 w-full max-w-xs">
              <PlayerInfo playerId={opponentId} />
            </div>
          </div>
        )}

        {activeTab === 'timeBoard' && <TimeBoard />}
      </div>

      {/* Bottom: actions + patch strip */}
      <div className="bg-gray-800 border-t border-gray-700">
        <ActionPanel />
        <div className="border-t border-gray-700 py-1.5 md:py-2">
          <PatchStrip />
        </div>
      </div>

      <GameOver />
    </div>
  );
}
