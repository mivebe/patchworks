import { describe, it, expect } from 'vitest';
import {
  rotateCW,
  flipH,
  transformShape,
  canPlace,
  placeOnMosaic,
  applyPlacement,
  countEmptySpaces,
  createEmptyMosaic,
} from '../tileUtils';
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
  it('allows placing on empty mosaic', () => {
    expect(canPlace(createEmptyMosaic(), s([1, 1]), 0, 0)).toBe(true);
  });

  it('rejects out-of-bounds placement', () => {
    expect(canPlace(createEmptyMosaic(), s([1, 1, 1]), 0, 7)).toBe(false);
  });

  it('rejects overlapping placement', () => {
    const mosaic = createEmptyMosaic();
    mosaic[0][0] = true;
    expect(canPlace(mosaic, s([1, 1]), 0, 0)).toBe(false);
  });

  it('allows adjacent non-overlapping placement', () => {
    const mosaic = createEmptyMosaic();
    mosaic[0][0] = true;
    expect(canPlace(mosaic, s([1, 1]), 0, 1)).toBe(true);
  });
});

describe('placeOnMosaic', () => {
  it('places a shape and returns new mosaic', () => {
    const mosaic = createEmptyMosaic();
    const newMosaic = placeOnMosaic(mosaic, s([1, 0], [1, 1]), 0, 0);
    expect(newMosaic[0][0]).toBe(true);
    expect(newMosaic[0][1]).toBe(false);
    expect(newMosaic[1][0]).toBe(true);
    expect(newMosaic[1][1]).toBe(true);
    expect(mosaic[0][0]).toBe(false); // original unchanged
  });
});

describe('applyPlacement', () => {
  it('returns null for invalid placement', () => {
    const mosaic = createEmptyMosaic();
    mosaic[0][0] = true;
    const result = applyPlacement(mosaic, s([1]), { row: 0, col: 0, rotation: 0, flipped: false });
    expect(result).toBeNull();
  });

  it('applies rotation during placement', () => {
    const result = applyPlacement(createEmptyMosaic(), s([1, 1, 1]), { row: 0, col: 0, rotation: 1, flipped: false });
    expect(result).not.toBeNull();
    expect(result![0][0]).toBe(true);
    expect(result![1][0]).toBe(true);
    expect(result![2][0]).toBe(true);
    expect(result![0][1]).toBe(false);
  });
});

describe('countEmptySpaces', () => {
  it('counts all cells on empty mosaic', () => {
    expect(countEmptySpaces(createEmptyMosaic())).toBe(81);
  });

  it('counts correctly after placement', () => {
    const mosaic = createEmptyMosaic();
    mosaic[0][0] = true;
    mosaic[0][1] = true;
    expect(countEmptySpaces(mosaic)).toBe(79);
  });
});
