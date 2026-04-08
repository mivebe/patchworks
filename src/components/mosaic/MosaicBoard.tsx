import { useGameStore } from '../../store/gameStore';
import { canPlace } from '../../engine/tileUtils';
import { MOSAIC_SIZE } from '../../engine/types';
import { MosaicCell } from './MosaicCell';
import { playerTheme } from '../../theme';

interface MosaicBoardProps {
  playerId: 0 | 1;
  readOnly?: boolean;
  gridRef?: React.RefObject<HTMLDivElement | null>;
}

export function MosaicBoard({ playerId, readOnly = false, gridRef }: MosaicBoardProps) {
  const gameState = useGameStore((s) => s.gameState);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const hoverCell = useGameStore((s) => s.hoverCell);
  const getTransformedShape = useGameStore((s) => s.getTransformedShape);
  const selectedTileChoice = useGameStore((s) => s.selectedTileChoice);
  const placeSpecialTile = useGameStore((s) => s.placeSpecialTile);
  const isMyTurn = useGameStore((s) => s.isMyTurn);

  if (!gameState) return null;

  const player = gameState.players[playerId];
  const canInteract = playerId === myPlayerId && isMyTurn() && !readOnly;
  const isPlacingSpecialTile = gameState.phase === 'placingSpecialTile' && canInteract;
  const isPlacingTile = selectedTileChoice !== null && canInteract && gameState.phase === 'playing';
  const shape = isPlacingTile ? getTransformedShape() : null;

  const getPreviewState = (row: number, col: number): 'valid' | 'invalid' | null => {
    if (!shape || !hoverCell || !isPlacingTile) return null;

    const shapeRow = row - hoverCell.row;
    const shapeCol = col - hoverCell.col;
    if (
      shapeRow < 0 || shapeRow >= shape.length ||
      shapeCol < 0 || shapeCol >= shape[0].length ||
      !shape[shapeRow][shapeCol]
    ) {
      return null;
    }

    const valid = canPlace(player.mosaic, shape, hoverCell.row, hoverCell.col);
    return valid ? 'valid' : 'invalid';
  };

  const handleCellClick = (row: number, col: number) => {
    if (isPlacingSpecialTile) {
      placeSpecialTile(row, col);
    }
  };

  return (
    <div
      ref={gridRef}
      className="w-full"
    >
      <div
        className="grid gap-0"
        style={{ gridTemplateColumns: `repeat(${MOSAIC_SIZE}, 1fr)` }}
      >
        {Array.from({ length: MOSAIC_SIZE }, (_, row) =>
          Array.from({ length: MOSAIC_SIZE }, (_, col) => (
            <MosaicCell
              key={`${row}-${col}`}
              filled={player.mosaic[row][col]}
              preview={getPreviewState(row, col)}
              isSpecialTileTarget={isPlacingSpecialTile && !player.mosaic[row][col]}
              playerColor={playerTheme(playerId, myPlayerId ?? 0).cell}
              onClick={
                isPlacingSpecialTile ? () => handleCellClick(row, col) : undefined
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
