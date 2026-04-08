import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { countEmptySpaces } from '../../engine/tileUtils';

interface PlayerInfoProps {
  playerId: 0 | 1;
  onShowRules?: () => void;
}

export function PlayerInfo({ playerId, onShowRules }: PlayerInfoProps) {
  const gameState = useGameStore((s) => s.gameState);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const returnToLobby = useGameStore((s) => s.returnToLobby);

  if (!gameState || myPlayerId === null) return null;

  const player = gameState.players[playerId];
  const empty = countEmptySpaces(player.mosaic);
  const isMyTurn = gameState.activePlayerId === myPlayerId;

  return (
    <div className="w-full rounded-lg p-2 md:p-3 bg-gray-800/50">
      {/* Row 1: turn indicator (left), rules + leave (right) */}
      <div className="flex items-center gap-1.5 mb-1.5">
        {isMyTurn ? (
          <span className="text-xs md:text-sm bg-green-600 text-white px-2.5 py-1 rounded-full animate-pulse whitespace-nowrap">
            Your turn
          </span>
        ) : (
          <span className="text-xs md:text-sm bg-gray-600 text-gray-300 px-2.5 py-1 rounded-full whitespace-nowrap">
            Waiting
          </span>
        )}
        <div className="flex-1" />
        {onShowRules && (
          <button
            onClick={onShowRules}
            className="px-3 py-1 text-xs md:text-sm bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white rounded transition-colors"
          >
            Rules
          </button>
        )}
        <button
          onClick={() => setConfirmLeave(true)}
          className="px-3 py-1 text-xs md:text-sm bg-gray-700 hover:bg-red-700 text-gray-400 hover:text-white rounded transition-colors"
        >
          Leave
        </button>
      </div>

      {/* Row 2: all stats */}
      <div className="grid grid-cols-5 gap-1.5 text-sm">
        <StatCell icon="💎" value={`${player.gems}`} valueClass="text-white" />
        <StatCell icon="📈" value={`+${player.totalGemIncome}`} valueClass="text-green-400" />
        <StatCell icon="⏳" value={`${player.timePosition}/53`} valueClass="text-white" />
        <StatCell icon="🔲" value={`${empty}`} valueClass="text-red-400" />
        <StatCell icon="⭐" value={player.hasSpecialTile ? '✓ +7' : '✗'} valueClass={player.hasSpecialTile ? 'text-yellow-400' : 'text-gray-500'} />
      </div>

      {confirmLeave && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setConfirmLeave(false)}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-xl mx-6 px-5 py-4 max-w-xs text-sm text-gray-300"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white font-medium mb-1">Leave game?</p>
            <p className="mb-4">You will forfeit the current game and return to the lobby.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmLeave(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={returnToLobby}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-medium transition-colors text-sm"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCell({
  icon,
  value,
  valueClass,
}: {
  icon: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-gray-800/60 rounded px-2 py-1">
      <span className="text-base leading-none">{icon}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
