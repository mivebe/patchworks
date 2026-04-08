import { useGameStore } from '../../store/gameStore';
import { canPlace } from '../../engine/patchUtils';
import { QUILT_SIZE } from '../../engine/types';
import { QuiltCell } from './QuiltCell';
import { playerTheme } from '../../theme';

interface QuiltBoardProps {
  playerId: 0 | 1;
  readOnly?: boolean;
  gridRef?: React.RefObject<HTMLDivElement | null>;
}

export function QuiltBoard({ playerId, readOnly = false, gridRef }: QuiltBoardProps) {
  const gameState = useGameStore((s) => s.gameState);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const hoverCell = useGameStore((s) => s.hoverCell);
  const getTransformedShape = useGameStore((s) => s.getTransformedShape);
  const selectedPatchChoice = useGameStore((s) => s.selectedPatchChoice);
  const placeSpecialPatch = useGameStore((s) => s.placeSpecialPatch);
  const isMyTurn = useGameStore((s) => s.isMyTurn);

  if (!gameState) return null;

  const player = gameState.players[playerId];
  const canInteract = playerId === myPlayerId && isMyTurn() && !readOnly;
  const isPlacingSpecialPatch = gameState.phase === 'placingSpecialPatch' && canInteract;
  const isPlacingPatch = selectedPatchChoice !== null && canInteract && gameState.phase === 'playing';
  const shape = isPlacingPatch ? getTransformedShape() : null;

  // Preview from drag overlay — shows green/red cells where the patch would land
  const getPreviewState = (row: number, col: number): 'valid' | 'invalid' | null => {
    if (!shape || !hoverCell || !isPlacingPatch) return null;

    const shapeRow = row - hoverCell.row;
    const shapeCol = col - hoverCell.col;
    if (
      shapeRow < 0 || shapeRow >= shape.length ||
      shapeCol < 0 || shapeCol >= shape[0].length ||
      !shape[shapeRow][shapeCol]
    ) {
      return null;
    }

    const valid = canPlace(player.quilt, shape, hoverCell.row, hoverCell.col);
    return valid ? 'valid' : 'invalid';
  };

  const handleCellClick = (row: number, col: number) => {
    if (isPlacingSpecialPatch) {
      placeSpecialPatch(row, col);
    }
  };

  return (
    <div
      ref={gridRef}
      className="w-full"
    >
      <div
        className="grid gap-0"
        style={{ gridTemplateColumns: `repeat(${QUILT_SIZE}, 1fr)` }}
      >
        {Array.from({ length: QUILT_SIZE }, (_, row) =>
          Array.from({ length: QUILT_SIZE }, (_, col) => (
            <QuiltCell
              key={`${row}-${col}`}
              filled={player.quilt[row][col]}
              preview={getPreviewState(row, col)}
              isSpecialPatchTarget={isPlacingSpecialPatch && !player.quilt[row][col]}
              playerColor={playerTheme(playerId, myPlayerId ?? 0).cell}
              onClick={
                isPlacingSpecialPatch ? () => handleCellClick(row, col) : undefined
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
