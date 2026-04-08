import { useRef, useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { canPlace } from '../../engine/patchUtils';
import { QUILT_SIZE } from '../../engine/types';

interface PatchOverlayInnerProps {
  boardWidth: number;
}

/**
 * Inner component that resets state when the key changes
 * (key is set by the wrapper based on patch selection/rotation/flip).
 */
function PatchOverlayInner({ boardWidth }: PatchOverlayInnerProps) {
  const gameState = useGameStore((s) => s.gameState);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const getTransformedShape = useGameStore((s) => s.getTransformedShape);
  const setHoverCell = useGameStore((s) => s.setHoverCell);
  const setPendingPlacement = useGameStore((s) => s.setPendingPlacement);
  const pendingPlacement = useGameStore((s) => s.pendingPlacement);

  const shape = getTransformedShape();
  const overlayRef = useRef<HTMLDivElement>(null);

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, offsetX: 0, offsetY: 0 });

  const cellSize = boardWidth > 0 ? boardWidth / QUILT_SIZE : 0;
  const shapeRows = shape?.length ?? 0;
  const shapeCols = shape?.[0]?.length ?? 0;

  // Center position
  const centerX = (boardWidth - shapeCols * cellSize) / 2;
  const centerY = (boardWidth - shapeRows * cellSize) / 2;
  const posX = centerX + dragOffset.x;
  const posY = centerY + dragOffset.y;

  // Snapped grid cell
  const col = cellSize > 0 ? Math.round(posX / cellSize) : 0;
  const row = cellSize > 0 ? Math.round(posY / cellSize) : 0;
  const clampedRow = shape ? Math.max(-(shapeRows - 1), Math.min(QUILT_SIZE - 1, row)) : 0;
  const clampedCol = shape ? Math.max(-(shapeCols - 1), Math.min(QUILT_SIZE - 1, col)) : 0;

  const valid = shape && gameState && myPlayerId !== null
    ? canPlace(gameState.players[myPlayerId].quilt, shape, clampedRow, clampedCol)
    : false;

  // Sync snapped cell to store for board preview
  useEffect(() => {
    setHoverCell({ row: clampedRow, col: clampedCol });
    return () => setHoverCell(null);
  }, [clampedRow, clampedCol, setHoverCell]);

  if (!shape || cellSize === 0) return null;

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    overlayRef.current?.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: dragOffset.x,
      offsetY: dragOffset.y,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    setDragOffset({
      x: dragStartRef.current.offsetX + dx,
      y: dragStartRef.current.offsetY + dy,
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setIsDragging(false);
    overlayRef.current?.releasePointerCapture(e.pointerId);
    if (valid) {
      setPendingPlacement({ row: clampedRow, col: clampedCol });
    }
  };

  let cellColor = 'bg-yellow-400/70';
  if (pendingPlacement) {
    cellColor = 'bg-green-400/70';
  } else if (isDragging) {
    cellColor = valid ? 'bg-green-400/70' : 'bg-red-400/70';
  }

  return (
    <div
      ref={overlayRef}
      className="absolute z-20 touch-none"
      style={{
        left: posX,
        top: posY,
        width: shapeCols * cellSize,
        height: shapeRows * cellSize,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="grid gap-0"
        style={{ gridTemplateColumns: `repeat(${shapeCols}, 1fr)` }}
      >
        {shape.flatMap((shapeRow, r) =>
          shapeRow.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`aspect-square ${cell ? cellColor + ' border border-white/30' : ''}`}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface PatchOverlayProps {
  boardWidth: number;
}

/**
 * Wrapper that uses a key to reset all drag state when the patch/rotation/flip changes.
 */
export function PatchOverlay({ boardWidth }: PatchOverlayProps) {
  const selectedPatchChoice = useGameStore((s) => s.selectedPatchChoice);
  const currentRotation = useGameStore((s) => s.currentRotation);
  const isFlipped = useGameStore((s) => s.isFlipped);
  const isMyTurn = useGameStore((s) => s.isMyTurn);
  const gameState = useGameStore((s) => s.gameState);

  if (selectedPatchChoice === null || !isMyTurn() || !gameState || gameState.phase !== 'playing') {
    return null;
  }

  const key = `${selectedPatchChoice}-${currentRotation}-${isFlipped}`;

  return <PatchOverlayInner key={key} boardWidth={boardWidth} />;
}
