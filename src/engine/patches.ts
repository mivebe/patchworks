import type { Patch } from './types';

/**
 * All 33 patches from the Patchwork board game.
 * Each shape is a (0|1)[][] matrix where 1 = filled cell, 0 = empty.
 * Patches are ordered as they appear in the circle (clockwise from the 1x2 starting patch).
 *
 * Data: buttonCost / timeCost / buttonIncome
 */
export const ALL_PATCHES: Patch[] = [
  // Patch 0: 1x2 (the smallest patch — neutral token starts after this one)
  {
    id: 0,
    shape: [[1, 1]],
    buttonCost: 2,
    timeCost: 1,
    buttonIncome: 0,
  },
  // Patch 1: 2x1
  {
    id: 1,
    shape: [[1], [1]],
    buttonCost: 2,
    timeCost: 2,
    buttonIncome: 0,
  },
  // Patch 2: L-shape (3 cells)
  {
    id: 2,
    shape: [
      [1, 0],
      [1, 1],
    ],
    buttonCost: 3,
    timeCost: 2,
    buttonIncome: 0,
  },
  // Patch 3: straight-3
  {
    id: 3,
    shape: [[1, 1, 1]],
    buttonCost: 2,
    timeCost: 2,
    buttonIncome: 0,
  },
  // Patch 4: T-shape (4 cells)
  {
    id: 4,
    shape: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    buttonCost: 5,
    timeCost: 4,
    buttonIncome: 2,
  },
  // Patch 5: 2x2 square
  {
    id: 5,
    shape: [
      [1, 1],
      [1, 1],
    ],
    buttonCost: 6,
    timeCost: 5,
    buttonIncome: 2,
  },
  // Patch 6: S-shape (4 cells)
  {
    id: 6,
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    buttonCost: 4,
    timeCost: 2,
    buttonIncome: 1,
  },
  // Patch 7: Z-shape (4 cells)
  {
    id: 7,
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    buttonCost: 4,
    timeCost: 2,
    buttonIncome: 0,
  },
  // Patch 8: L-shape (4 cells)
  {
    id: 8,
    shape: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    buttonCost: 3,
    timeCost: 3,
    buttonIncome: 1,
  },
  // Patch 9: J-shape (4 cells)
  {
    id: 9,
    shape: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    buttonCost: 2,
    timeCost: 3,
    buttonIncome: 1,
  },
  // Patch 10: straight-4
  {
    id: 10,
    shape: [[1, 1, 1, 1]],
    buttonCost: 3,
    timeCost: 3,
    buttonIncome: 1,
  },
  // Patch 11: big-L (5 cells)
  {
    id: 11,
    shape: [
      [1, 0],
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    buttonCost: 1,
    timeCost: 2,
    buttonIncome: 0,
  },
  // Patch 12: T-shape variant (5 cells)
  {
    id: 12,
    shape: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    buttonCost: 2,
    timeCost: 2,
    buttonIncome: 0,
  },
  // Patch 13: plus/cross shape (5 cells)
  {
    id: 13,
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    buttonCost: 4,
    timeCost: 6,
    buttonIncome: 2,
  },
  // Patch 14: U-shape (5 cells)
  {
    id: 14,
    shape: [
      [1, 0, 1],
      [1, 1, 1],
    ],
    buttonCost: 7,
    timeCost: 2,
    buttonIncome: 2,
  },
  // Patch 15: straight-5
  {
    id: 15,
    shape: [[1, 1, 1, 1, 1]],
    buttonCost: 7,
    timeCost: 1,
    buttonIncome: 1,
  },
  // Patch 16: big-T (5 cells)
  {
    id: 16,
    shape: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    buttonCost: 5,
    timeCost: 5,
    buttonIncome: 2,
  },
  // Patch 17: S-pentomino (5 cells)
  {
    id: 17,
    shape: [
      [0, 1],
      [1, 1],
      [1, 0],
      [1, 0],
    ],
    buttonCost: 1,
    timeCost: 5,
    buttonIncome: 1,
  },
  // Patch 18: C/hook shape (5 cells)
  {
    id: 18,
    shape: [
      [1, 1],
      [1, 0],
      [1, 1],
    ],
    buttonCost: 3,
    timeCost: 6,
    buttonIncome: 2,
  },
  // Patch 19: L-pentomino (5 cells)
  {
    id: 19,
    shape: [
      [1, 0],
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    buttonCost: 2,
    timeCost: 3,
    buttonIncome: 1,
  },
  // Patch 20: W-pentomino (5 cells)
  {
    id: 20,
    shape: [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    buttonCost: 1,
    timeCost: 2,
    buttonIncome: 0,
  },
  // Patch 21: F-pentomino (5 cells)
  {
    id: 21,
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 1, 0],
    ],
    buttonCost: 3,
    timeCost: 4,
    buttonIncome: 1,
  },
  // Patch 22: P-pentomino (5 cells)
  {
    id: 22,
    shape: [
      [1, 1],
      [1, 1],
      [1, 0],
    ],
    buttonCost: 2,
    timeCost: 2,
    buttonIncome: 0,
  },
  // Patch 23: N-pentomino (5 cells)
  {
    id: 23,
    shape: [
      [0, 1],
      [1, 1],
      [1, 0],
      [1, 0],
    ],
    buttonCost: 4,
    timeCost: 2,
    buttonIncome: 1,
  },
  // Patch 24: long-L (6 cells)
  {
    id: 24,
    shape: [
      [1, 0],
      [1, 0],
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    buttonCost: 2,
    timeCost: 3,
    buttonIncome: 0,
  },
  // Patch 25: Y-shape (5 cells)
  {
    id: 25,
    shape: [
      [0, 1],
      [1, 1],
      [0, 1],
      [0, 1],
    ],
    buttonCost: 10,
    timeCost: 3,
    buttonIncome: 2,
  },
  // Patch 26: big-Z (5 cells)
  {
    id: 26,
    shape: [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    buttonCost: 3,
    timeCost: 4,
    buttonIncome: 1,
  },
  // Patch 27: H-shape (6 cells)
  {
    id: 27,
    shape: [
      [1, 0, 1],
      [1, 1, 1],
      [1, 0, 0],
    ],
    buttonCost: 10,
    timeCost: 5,
    buttonIncome: 3,
  },
  // Patch 28: stairs (6 cells)
  {
    id: 28,
    shape: [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    buttonCost: 0,
    timeCost: 3,
    buttonIncome: 1,
  },
  // Patch 29: big-plus (7 cells)
  {
    id: 29,
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
    buttonCost: 1,
    timeCost: 4,
    buttonIncome: 1,
  },
  // Patch 30: 2x3 rectangle (6 cells)
  {
    id: 30,
    shape: [
      [1, 1, 1],
      [1, 1, 1],
    ],
    buttonCost: 8,
    timeCost: 6,
    buttonIncome: 3,
  },
  // Patch 31: big-S (6 cells)
  {
    id: 31,
    shape: [
      [0, 1, 1],
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
    buttonCost: 5,
    timeCost: 3,
    buttonIncome: 1,
  },
  // Patch 32: corner (4 cells)
  {
    id: 32,
    shape: [
      [1, 1],
      [1, 0],
      [1, 0],
    ],
    buttonCost: 1,
    timeCost: 3,
    buttonIncome: 0,
  },
];
