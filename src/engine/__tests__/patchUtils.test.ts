import { describe, it, expect } from 'vitest';
import {
  rotateCW,
  flipH,
  transformShape,
  canPlace,
  placeOnQuilt,
  applyPlacement,
  countEmptySpaces,
  createEmptyQuilt,
} from '../patchUtils';
import type { Shape } from '../types';

/** Helper to create typed shapes concisely. */
const s = (...rows: (0 | 1)[][]): Shape => rows;

describe('rotateCW', () => {
  it('rotates an L-shape 90 degrees clockwise', () => {
    const rotated = rotateCW(s([1, 0], [1, 1]));
    expect(rotated).toEqual([[1, 1], [1, 0]]);
  });

  it('rotates a horizontal bar to vertical', () => {
    const rotated = rotateCW(s([1, 1, 1]));
    expect(rotated).toEqual([[1], [1], [1]]);
  });

  it('4 rotations returns to original', () => {
    const shape = s([1, 0], [1, 1], [0, 1]);
    const result = rotateCW(rotateCW(rotateCW(rotateCW(shape))));
    expect(result).toEqual(shape);
  });
});

describe('flipH', () => {
  it('flips an L-shape horizontally', () => {
    expect(flipH(s([1, 0], [1, 1]))).toEqual([[0, 1], [1, 1]]);
  });
});

describe('transformShape', () => {
  it('applies flip then rotation', () => {
    const result = transformShape(s([1, 0], [1, 1]), 1, true);
    expect(result).toEqual([[1, 0], [1, 1]]);
  });
});

describe('canPlace', () => {
  it('allows placing on empty quilt', () => {
    expect(canPlace(createEmptyQuilt(), s([1, 1]), 0, 0)).toBe(true);
  });

  it('rejects out-of-bounds placement', () => {
    expect(canPlace(createEmptyQuilt(), s([1, 1, 1]), 0, 7)).toBe(false);
  });

  it('rejects overlapping placement', () => {
    const quilt = createEmptyQuilt();
    quilt[0][0] = true;
    expect(canPlace(quilt, s([1, 1]), 0, 0)).toBe(false);
  });

  it('allows adjacent non-overlapping placement', () => {
    const quilt = createEmptyQuilt();
    quilt[0][0] = true;
    expect(canPlace(quilt, s([1, 1]), 0, 1)).toBe(true);
  });
});

describe('placeOnQuilt', () => {
  it('places a shape and returns new quilt', () => {
    const quilt = createEmptyQuilt();
    const newQuilt = placeOnQuilt(quilt, s([1, 0], [1, 1]), 0, 0);
    expect(newQuilt[0][0]).toBe(true);
    expect(newQuilt[0][1]).toBe(false);
    expect(newQuilt[1][0]).toBe(true);
    expect(newQuilt[1][1]).toBe(true);
    expect(quilt[0][0]).toBe(false); // original unchanged
  });
});

describe('applyPlacement', () => {
  it('returns null for invalid placement', () => {
    const quilt = createEmptyQuilt();
    quilt[0][0] = true;
    const result = applyPlacement(quilt, s([1]), { row: 0, col: 0, rotation: 0, flipped: false });
    expect(result).toBeNull();
  });

  it('applies rotation during placement', () => {
    const result = applyPlacement(createEmptyQuilt(), s([1, 1, 1]), { row: 0, col: 0, rotation: 1, flipped: false });
    expect(result).not.toBeNull();
    expect(result![0][0]).toBe(true);
    expect(result![1][0]).toBe(true);
    expect(result![2][0]).toBe(true);
    expect(result![0][1]).toBe(false);
  });
});

describe('countEmptySpaces', () => {
  it('counts all cells on empty quilt', () => {
    expect(countEmptySpaces(createEmptyQuilt())).toBe(81);
  });

  it('counts correctly after placement', () => {
    const quilt = createEmptyQuilt();
    quilt[0][0] = true;
    quilt[0][1] = true;
    expect(countEmptySpaces(quilt)).toBe(79);
  });
});
