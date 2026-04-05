import { describe, it, expect } from 'vitest';
import { has7x7Block, calculateScore } from '../scoring';
import { createEmptyQuilt } from '../patchUtils';
import type { PlayerState } from '../types';
import { QUILT_SIZE } from '../types';

function createTestPlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    id: 0,
    name: 'Test',
    buttons: 10,
    quilt: createEmptyQuilt(),
    timePosition: 0,
    hasSpecialTile: false,
    totalButtonIncome: 0,
    ...overrides,
  };
}

describe('has7x7Block', () => {
  it('returns false for empty quilt', () => {
    expect(has7x7Block(createEmptyQuilt())).toBe(false);
  });

  it('returns true for fully filled quilt', () => {
    const quilt = Array.from({ length: QUILT_SIZE }, () =>
      Array.from({ length: QUILT_SIZE }, () => true)
    );
    expect(has7x7Block(quilt)).toBe(true);
  });

  it('returns true for 7x7 block in top-left corner', () => {
    const quilt = createEmptyQuilt();
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        quilt[r][c] = true;
      }
    }
    expect(has7x7Block(quilt)).toBe(true);
  });

  it('returns true for 7x7 block in bottom-right corner', () => {
    const quilt = createEmptyQuilt();
    for (let r = 2; r < 9; r++) {
      for (let c = 2; c < 9; c++) {
        quilt[r][c] = true;
      }
    }
    expect(has7x7Block(quilt)).toBe(true);
  });

  it('returns false for 6x7 block', () => {
    const quilt = createEmptyQuilt();
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        quilt[r][c] = true;
      }
    }
    expect(has7x7Block(quilt)).toBe(false);
  });
});

describe('calculateScore', () => {
  it('scores empty quilt: buttons - 2*81', () => {
    const player = createTestPlayer({ buttons: 10 });
    expect(calculateScore(player)).toBe(10 - 2 * 81);
  });

  it('includes special tile bonus', () => {
    const player = createTestPlayer({ buttons: 10, hasSpecialTile: true });
    expect(calculateScore(player)).toBe(10 - 2 * 81 + 7);
  });

  it('scores full quilt: just buttons', () => {
    const quilt = Array.from({ length: QUILT_SIZE }, () =>
      Array.from({ length: QUILT_SIZE }, () => true)
    );
    const player = createTestPlayer({ buttons: 20, quilt });
    expect(calculateScore(player)).toBe(20);
  });
});
