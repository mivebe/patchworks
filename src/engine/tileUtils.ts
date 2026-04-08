import type { Shape, Placement } from './types';
import { MOSAIC_SIZE } from './types';

/** Rotate a shape 90 degrees clockwise. */
export function rotateCW(shape: Shape): Shape {
  const rows = shape.length;
  const cols = shape[0].length;
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => shape[rows - 1 - r][c])
  );
}

/** Flip a shape horizontally (mirror left-right). */
export function flipH(shape: Shape): Shape {
  return shape.map(row => [...row].reverse());
}

/** Apply rotation and flip to get the final shape for placement. */
export function transformShape(shape: Shape, rotation: number, flipped: boolean): Shape {
  let result = shape;
  if (flipped) {
    result = flipH(result);
  }
  const rotations = ((rotation % 4) + 4) % 4;
  for (let i = 0; i < rotations; i++) {
    result = rotateCW(result);
  }
  return result;
}

/** Check if a shape can be placed at the given position on a 9x9 mosaic. */
export function canPlace(
  mosaic: boolean[][],
  shape: Shape,
  startRow: number,
  startCol: number
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (!shape[r][c]) continue;
      const mr = startRow + r;
      const mc = startCol + c;
      if (mr < 0 || mr >= MOSAIC_SIZE || mc < 0 || mc >= MOSAIC_SIZE) return false;
      if (mosaic[mr][mc]) return false;
    }
  }
  return true;
}

/** Place a shape on the mosaic, returning a new mosaic. Does NOT validate — call canPlace first. */
export function placeOnMosaic(
  mosaic: boolean[][],
  shape: Shape,
  startRow: number,
  startCol: number
): boolean[][] {
  const newMosaic = mosaic.map(row => [...row]);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        newMosaic[startRow + r][startCol + c] = true;
      }
    }
  }
  return newMosaic;
}

/** Apply a full Placement (with rotation/flip) and return the new mosaic, or null if invalid. */
export function applyPlacement(
  mosaic: boolean[][],
  originalShape: Shape,
  placement: Placement
): boolean[][] | null {
  const shape = transformShape(originalShape, placement.rotation, placement.flipped);
  if (!canPlace(mosaic, shape, placement.row, placement.col)) {
    return null;
  }
  return placeOnMosaic(mosaic, shape, placement.row, placement.col);
}

/** Count the number of empty (false) cells on a mosaic. */
export function countEmptySpaces(mosaic: boolean[][]): number {
  let count = 0;
  for (const row of mosaic) {
    for (const cell of row) {
      if (!cell) count++;
    }
  }
  return count;
}

/** Create an empty 9x9 mosaic board. */
export function createEmptyMosaic(): boolean[][] {
  return Array.from({ length: MOSAIC_SIZE }, () =>
    Array.from({ length: MOSAIC_SIZE }, () => false)
  );
}
