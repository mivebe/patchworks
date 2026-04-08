import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { QuiltBoard } from '../quilt/QuiltBoard';
import { PatchStrip } from '../patches/PatchStrip';
import { PatchOverlay } from '../patches/PatchOverlay';
import { ActionPanel } from '../actions/ActionPanel';
import { PlayerInfo } from '../player/PlayerInfo';
import { TimeBoard } from '../timeBoard/TimeBoard';
import { GameOver } from '../game/GameOver';
import { RulesModal } from '../rules/RulesModal';
import { theme } from '../../theme';

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
  const [showRules, setShowRules] = useState(false);

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

  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const opponentId = (myPlayerId === 0 ? 1 : 0) as 0 | 1;
  const myTurn = isMyTurn();
  const viewingPlayerId = activeTab === 'myBoard' ? myPlayerId : opponentId;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top bar — player tabs */}
      <div className="flex bg-gray-800 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('myBoard')}
          className={`flex-1 py-2 px-3 text-sm font-medium text-left transition-colors ${
            activeTab === 'myBoard'
              ? `${theme.player1.tabActive} text-white`
              : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          {gameState.players[myPlayerId].name} (You)
        </button>
        <button
          onClick={() => setActiveTab('opponent')}
          className={`flex-1 py-2 px-3 text-sm font-medium text-right transition-colors ${
            activeTab === 'opponent'
              ? `${theme.player2.tabActive} text-white`
              : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          {gameState.players[opponentId].name}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-900/50 text-red-300 text-sm text-center py-1 px-2">
          {error}
        </div>
      )}

      {/* Main content — scrollable area with TimeBoard */}
      <div className="flex-1 flex flex-col p-2 gap-2 md:p-4 md:gap-4 overflow-y-auto">
        <TimeBoard />
      </div>

      {/* Bottom: board + player info + actions + patch strip */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="flex flex-col w-full gap-2 p-2">
          <div className="relative w-full">
            <QuiltBoard
              playerId={viewingPlayerId}
              readOnly={activeTab === 'opponent'}
              gridRef={activeTab === 'myBoard' ? boardGridRef : undefined}
            />
            {activeTab === 'myBoard' && <PatchOverlay boardWidth={boardWidth} />}
          </div>
          <PlayerInfo playerId={viewingPlayerId} onShowRules={() => setShowRules(true)} />
        </div>

        <ActionPanel />
        <div className="border-t border-gray-700 py-1.5 md:py-2">
          <PatchStrip />
        </div>
      </div>

      <GameOver />
      <RulesModal open={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
