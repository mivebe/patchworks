import type { Shape, Placement } from './types';
import { QUILT_SIZE } from './types';

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

/** Check if a shape can be placed at the given position on a 9x9 quilt. */
export function canPlace(
  quilt: boolean[][],
  shape: Shape,
  startRow: number,
  startCol: number
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (!shape[r][c]) continue;
      const qr = startRow + r;
      const qc = startCol + c;
      if (qr < 0 || qr >= QUILT_SIZE || qc < 0 || qc >= QUILT_SIZE) return false;
      if (quilt[qr][qc]) return false;
    }
  }
  return true;
}

/** Place a shape on the quilt, returning a new quilt. Does NOT validate — call canPlace first. */
export function placeOnQuilt(
  quilt: boolean[][],
  shape: Shape,
  startRow: number,
  startCol: number
): boolean[][] {
  const newQuilt = quilt.map(row => [...row]);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        newQuilt[startRow + r][startCol + c] = true;
      }
    }
  }
  return newQuilt;
}

/** Apply a full Placement (with rotation/flip) and return the new quilt, or null if invalid. */
export function applyPlacement(
  quilt: boolean[][],
  originalShape: Shape,
  placement: Placement
): boolean[][] | null {
  const shape = transformShape(originalShape, placement.rotation, placement.flipped);
  if (!canPlace(quilt, shape, placement.row, placement.col)) {
    return null;
  }
  return placeOnQuilt(quilt, shape, placement.row, placement.col);
}

/** Count the number of empty (false) cells on a quilt. */
export function countEmptySpaces(quilt: boolean[][]): number {
  let count = 0;
  for (const row of quilt) {
    for (const cell of row) {
      if (!cell) count++;
    }
  }
  return count;
}

/** Create an empty 9x9 quilt board. */
export function createEmptyQuilt(): boolean[][] {
  return Array.from({ length: QUILT_SIZE }, () =>
    Array.from({ length: QUILT_SIZE }, () => false)
  );
}
