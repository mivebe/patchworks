import { useGameStore } from '../../store/gameStore';
import { getAvailablePatchIndices } from '../../engine/gameEngine';
import { PatchThumbnail } from './PatchThumbnail';
import { useDragScroll } from '../../hooks/useDragScroll';

export function PatchStrip() {
  const gameState = useGameStore((s) => s.gameState);
  const selectedPatchChoice = useGameStore((s) => s.selectedPatchChoice);
  const selectPatch = useGameStore((s) => s.selectPatch);
  const isMyTurn = useGameStore((s) => s.isMyTurn);
  const scrollRef = useDragScroll<HTMLDivElement>();

  if (!gameState || gameState.phase === 'gameOver') return null;

  const myTurn = isMyTurn();
  const availableIndices = getAvailablePatchIndices(gameState);
  const activePlayer = gameState.players[gameState.activePlayerId];

  // Build the display list starting from neutral token position
  const circle = gameState.patchCircle;
  const len = circle.length;
  if (len === 0) return <div className="text-gray-400 text-center py-4">No patches remaining</div>;

  // Order: start from neutral token, go clockwise
  const orderedIndices: number[] = [];
  for (let i = 0; i < len; i++) {
    orderedIndices.push((gameState.neutralTokenIndex + i) % len);
  }

  return (
    <div className="w-full">
      <div ref={scrollRef} className="flex items-center gap-1 overflow-x-auto pb-2 px-2 custom-scrollbar touch-pan-y select-none">
        {orderedIndices.map((circleIdx) => {
          const patch = circle[circleIdx];
          // Which "choice" index is this (0, 1, 2) if available?
          const choiceIndex = availableIndices.indexOf(circleIdx);
          const isAvailable = choiceIndex !== -1;
          const canAfford = activePlayer.buttons >= patch.buttonCost;
          const isSelected = isAvailable && choiceIndex === selectedPatchChoice;

          return (
            <div key={patch.id} className="shrink-0">
              <PatchThumbnail
                patch={patch}
                isAvailable={isAvailable && canAfford && gameState.phase === 'playing' && myTurn}
                isSelected={isSelected}
                onClick={
                  isAvailable && canAfford && gameState.phase === 'playing' && myTurn
                    ? () => selectPatch(isSelected ? null : choiceIndex)
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
