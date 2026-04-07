import { useGameStore } from '../../store/gameStore';
import { countEmptySpaces } from '../../engine/patchUtils';

interface PlayerInfoProps {
  playerId: 0 | 1;
  compact?: boolean;
}

export function PlayerInfo({ playerId, compact = false }: PlayerInfoProps) {
  const gameState = useGameStore((s) => s.gameState);

  if (!gameState) return null;

  const player = gameState.players[playerId];
  const isActive = gameState.activePlayerId === playerId;
  const empty = countEmptySpaces(player.quilt);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-sm ${isActive ? 'text-white' : 'text-gray-500'}`}>
        <span className={`w-2 h-2 rounded-full ${playerId === 0 ? 'bg-blue-500' : 'bg-rose-500'}`} />
        <span className="font-medium">{player.name}</span>
        <span>{player.buttons}$</span>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-2 md:p-3 ${isActive ? 'bg-gray-700/50 ring-1 ring-white/20' : 'bg-gray-800/50'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-3 h-3 rounded-full ${playerId === 0 ? 'bg-blue-500' : 'bg-rose-500'}`} />
        <span className={`font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
          {player.name}
        </span>
        {isActive && (
          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div className="text-gray-400">Buttons</div>
        <div className="text-white font-medium">{player.buttons}</div>
        <div className="text-gray-400">Income</div>
        <div className="text-green-400">+{player.totalButtonIncome}</div>
        <div className="text-gray-400">Position</div>
        <div className="text-white">{player.timePosition}/53</div>
        <div className="text-gray-400">Empty</div>
        <div className="text-red-400">{empty} cells</div>
        {player.hasSpecialTile && (
          <>
            <div className="text-gray-400">7x7 Bonus</div>
            <div className="text-yellow-400">+7</div>
          </>
        )}
      </div>
    </div>
  );
}
