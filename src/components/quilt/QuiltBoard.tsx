import { useGameStore } from '../../store/gameStore';
import { canPlace } from '../../engine/patchUtils';
import { QUILT_SIZE } from '../../engine/types';
import { QuiltCell } from './QuiltCell';

const PLAYER_COLORS = ['bg-blue-500', 'bg-rose-500'] as const;

interface QuiltBoardProps {
  playerId: 0 | 1;
  readOnly?: boolean;
}

export function QuiltBoard({ playerId, readOnly = false }: QuiltBoardProps) {
  const gameState = useGameStore((s) => s.gameState);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const hoverCell = useGameStore((s) => s.hoverCell);
  const setHoverCell = useGameStore((s) => s.setHoverCell);
  const getTransformedShape = useGameStore((s) => s.getTransformedShape);
  const selectedPatchChoice = useGameStore((s) => s.selectedPatchChoice);
  const placePatch = useGameStore((s) => s.placePatch);
  const placeSpecialPatch = useGameStore((s) => s.placeSpecialPatch);
  const isMyTurn = useGameStore((s) => s.isMyTurn);

  if (!gameState) return null;

  const player = gameState.players[playerId];
  // Can interact only if: it's my board, it's my turn, and not read-only
  const canInteract = playerId === myPlayerId && isMyTurn() && !readOnly;
  const isPlacingSpecialPatch = gameState.phase === 'placingSpecialPatch' && canInteract;
  const isPlacingPatch = selectedPatchChoice !== null && canInteract && gameState.phase === 'playing';
  const shape = isPlacingPatch ? getTransformedShape() : null;

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
    } else if (isPlacingPatch && hoverCell) {
      placePatch(hoverCell.row, hoverCell.col);
    }
  };

  const handleCellHover = (row: number, col: number) => {
    if (isPlacingPatch || isPlacingSpecialPatch) {
      setHoverCell({ row, col });
    }
  };

  return (
    <div
      className="inline-block"
      onMouseLeave={() => setHoverCell(null)}
    >
      <div
        className="grid gap-0"
        style={{ gridTemplateColumns: `repeat(${QUILT_SIZE}, 2rem)` }}
      >
        {Array.from({ length: QUILT_SIZE }, (_, row) =>
          Array.from({ length: QUILT_SIZE }, (_, col) => (
            <QuiltCell
              key={`${row}-${col}`}
              filled={player.quilt[row][col]}
              preview={getPreviewState(row, col)}
              isSpecialPatchTarget={isPlacingSpecialPatch && !player.quilt[row][col]}
              playerColor={PLAYER_COLORS[playerId]}
              onClick={
                canInteract ? () => handleCellClick(row, col) : undefined
              }
              onMouseEnter={
                canInteract ? () => handleCellHover(row, col) : undefined
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
