import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { countEmptySpaces } from '../../engine/patchUtils';
import { playerTheme, theme } from '../../theme';

interface PlayerInfoProps {
  playerId: 0 | 1;
  onShowRules?: () => void;
}

const HINTS: Record<string, string> = {
  buttons: 'Your currency. Spend buttons to buy patches. Remaining buttons count toward your final score.',
  income: 'Button income from placed patches. You earn this many buttons each time you pass a button income space.',
  position: 'Your current position on the time board (0-53). The player furthest behind takes the next turn.',
  empty: 'Empty cells on your 9x9 quilt. Each empty cell costs you 2 points at the end of the game.',
  bonus: 'Awarded for being the first player to fill a complete 7x7 area on your quilt. Worth +7 points.',
};

const PLAYER_BG = [
  theme.player1.panelBg,
  theme.player2.panelBg,
] as const;

export function PlayerInfo({ playerId, onShowRules }: PlayerInfoProps) {
  const gameState = useGameStore((s) => s.gameState);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  if (!gameState || myPlayerId === null) return null;

  const player = gameState.players[playerId];
  const empty = countEmptySpaces(player.quilt);
  const isMyTurn = gameState.activePlayerId === myPlayerId;

  const toggleHint = (key: string) => {
    setActiveHint((prev) => (prev === key ? null : key));
  };

  return (
    <div className={`w-full rounded-lg p-2 md:p-3 ${PLAYER_BG[playerId]}`}>
      {/* Utility row: bonus tile, bonus hint, rules, turn indicator */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className={`flex items-center gap-1 text-sm ${player.hasSpecialTile ? 'text-yellow-400' : 'text-gray-500'}`}>
          <span className="text-base leading-none">⭐</span>
          <span className="font-medium">{player.hasSpecialTile ? '✓ +7' : '✗'}</span>
        </div>
        <button
          onClick={() => toggleHint('bonus')}
          className="w-4 h-4 rounded-full text-[10px] leading-none font-bold bg-gray-600 text-gray-400 hover:bg-gray-500 hover:text-white transition-colors"
        >
          ?
        </button>
        <div className="flex-1" />
        {onShowRules && (
          <button
            onClick={onShowRules}
            className="px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white rounded transition-colors"
          >
            Rules
          </button>
        )}
        {isMyTurn ? (
          <span className="text-[10px] md:text-xs bg-green-600 text-white px-1.5 py-0.5 rounded-full animate-pulse whitespace-nowrap">
            Your turn
          </span>
        ) : (
          <span className="text-[10px] md:text-xs bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded-full whitespace-nowrap">
            Waiting
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-sm">
        <StatCell icon="🟡" value={`${player.buttons}`} valueClass="text-white" hintKey="buttons" activeHint={activeHint} onToggle={toggleHint} />
        <StatCell icon="📈" value={`+${player.totalButtonIncome}`} valueClass="text-green-400" hintKey="income" activeHint={activeHint} onToggle={toggleHint} />
        <StatCell icon="⏳" value={`${player.timePosition}/53`} valueClass="text-white" hintKey="position" activeHint={activeHint} onToggle={toggleHint} />
        <StatCell icon="🔲" value={`${empty}`} valueClass="text-red-400" hintKey="empty" activeHint={activeHint} onToggle={toggleHint} />
      </div>

      {activeHint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setActiveHint(null)}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-xl mx-6 px-4 py-3 max-w-xs text-sm text-gray-300"
            onClick={(e) => e.stopPropagation()}
          >
            <p>{HINTS[activeHint]}</p>
            <button
              onClick={() => setActiveHint(null)}
              className="mt-2 w-full text-center text-xs text-gray-500 hover:text-white transition-colors"
            >
              Close
            </button>
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
  hintKey,
  activeHint,
  onToggle,
  span2 = false,
}: {
  icon: string;
  value: string;
  valueClass: string;
  hintKey: string;
  activeHint: string | null;
  onToggle: (key: string) => void;
  span2?: boolean;
}) {
  return (
    <div className={`flex items-center gap-1.5 bg-gray-800/60 rounded px-2 py-1${span2 ? ' col-span-2' : ''}`}>
      <span className="text-base leading-none">{icon}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
      <button
        onClick={() => onToggle(hintKey)}
        className={`ml-auto w-4 h-4 rounded-full text-[10px] leading-none font-bold transition-colors ${
          activeHint === hintKey
            ? theme.accent.hintActive
            : 'bg-gray-600 text-gray-400 hover:bg-gray-500 hover:text-white'
        }`}
      >
        ?
      </button>
    </div>
  );
}
