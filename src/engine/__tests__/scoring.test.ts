import { describe, it, expect } from 'vitest';
import { has7x7Block, calculateScore } from '../scoring';
import { createEmptyMosaic } from '../tileUtils';
import type { PlayerState } from '../types';
import { MOSAIC_SIZE } from '../types';

function createTestPlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    id: 0,
    name: 'Test',
    gems: 10,
    mosaic: createEmptyMosaic(),
    timePosition: 0,
    hasSpecialTile: false,
    totalGemIncome: 0,
    ...overrides,
  };
}

describe('has7x7Block', () => {
  it('returns false for empty mosaic', () => {
    expect(has7x7Block(createEmptyMosaic())).toBe(false);
  });

  it('returns true for fully filled mosaic', () => {
    const mosaic = Array.from({ length: MOSAIC_SIZE }, () =>
      Array.from({ length: MOSAIC_SIZE }, () => true)
    );
    expect(has7x7Block(mosaic)).toBe(true);
  });

  it('returns true for 7x7 block in top-left corner', () => {
    const mosaic = createEmptyMosaic();
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        mosaic[r][c] = true;
      }
    }
    expect(has7x7Block(mosaic)).toBe(true);
  });

  it('returns true for 7x7 block in bottom-right corner', () => {
    const mosaic = createEmptyMosaic();
    for (let r = 2; r < 9; r++) {
      for (let c = 2; c < 9; c++) {
        mosaic[r][c] = true;
      }
    }
    expect(has7x7Block(mosaic)).toBe(true);
  });

  it('returns false for 6x7 block', () => {
    const mosaic = createEmptyMosaic();
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        mosaic[r][c] = true;
      }
    }
    expect(has7x7Block(mosaic)).toBe(false);
  });
});

describe('calculateScore', () => {
  it('scores empty mosaic: gems - 2*81', () => {
    const player = createTestPlayer({ gems: 10 });
    expect(calculateScore(player)).toBe(10 - 2 * 81);
  });

  it('includes special tile bonus', () => {
    const player = createTestPlayer({ gems: 10, hasSpecialTile: true });
    expect(calculateScore(player)).toBe(10 - 2 * 81 + 7);
  });

  it('scores full mosaic: just gems', () => {
    const mosaic = Array.from({ length: MOSAIC_SIZE }, () =>
      Array.from({ length: MOSAIC_SIZE }, () => true)
    );
    const player = createTestPlayer({ gems: 20, mosaic });
    expect(calculateScore(player)).toBe(20);
  });
});
