import { useGameStore } from '../../store/gameStore';
import { getAvailableTileIndices } from '../../engine/gameEngine';
import { TileThumbnail } from './TileThumbnail';
import { useDragScroll } from '../../hooks/useDragScroll';

export function TileStrip() {
  const gameState = useGameStore((s) => s.gameState);
  const selectedTileChoice = useGameStore((s) => s.selectedTileChoice);
  const selectTile = useGameStore((s) => s.selectTile);
  const isMyTurn = useGameStore((s) => s.isMyTurn);
  const scrollRef = useDragScroll<HTMLDivElement>();

  if (!gameState || gameState.phase === 'gameOver') return null;

  const myTurn = isMyTurn();
  const availableIndices = getAvailableTileIndices(gameState);
  const activePlayer = gameState.players[gameState.activePlayerId];

  const circle = gameState.tileCircle;
  const len = circle.length;
  if (len === 0) return <div className="text-gray-400 text-center py-4">No tiles remaining</div>;

  const orderedIndices: number[] = [];
  for (let i = 0; i < len; i++) {
    orderedIndices.push((gameState.neutralTokenIndex + i) % len);
  }

  return (
    <div className="w-full">
      <div ref={scrollRef} className="flex items-center gap-1 overflow-x-auto pb-2 px-2 custom-scrollbar touch-pan-y select-none">
        {orderedIndices.map((circleIdx) => {
          const tile = circle[circleIdx];
          const choiceIndex = availableIndices.indexOf(circleIdx);
          const isAvailable = choiceIndex !== -1;
          const canAfford = activePlayer.gems >= tile.gemCost;
          const isSelected = isAvailable && choiceIndex === selectedTileChoice;

          return (
            <div key={tile.id} className="shrink-0">
              <TileThumbnail
                tile={tile}
                isAvailable={isAvailable && canAfford && gameState.phase === 'playing' && myTurn}
                isSelected={isSelected}
                onClick={
                  isAvailable && canAfford && gameState.phase === 'playing' && myTurn
                    ? () => selectTile(isSelected ? null : choiceIndex)
                    : undefined
                }
                size={isAvailable ? 'md' : 'sm'}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
