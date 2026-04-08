import type { Tile } from './types';

/**
 * All 33 glass tiles for the Tessera game.
 * Each shape is a (0|1)[][] matrix where 1 = filled cell, 0 = empty.
 * Tiles are ordered as they appear in the circle (clockwise from the 1x2 starting tile).
 *
 * Data: gemCost / timeCost / gemIncome
 */
export const ALL_TILES: Tile[] = [
  { id: 0, shape: [[1, 1]], gemCost: 2, timeCost: 1, gemIncome: 0 },
  { id: 1, shape: [[1], [1]], gemCost: 2, timeCost: 2, gemIncome: 0 },
  { id: 2, shape: [[1, 0], [1, 1]], gemCost: 3, timeCost: 2, gemIncome: 0 },
  { id: 3, shape: [[1, 1, 1]], gemCost: 2, timeCost: 2, gemIncome: 0 },
  { id: 4, shape: [[1, 1, 1], [0, 1, 0]], gemCost: 5, timeCost: 4, gemIncome: 2 },
  { id: 5, shape: [[1, 1], [1, 1]], gemCost: 6, timeCost: 5, gemIncome: 2 },
  { id: 6, shape: [[0, 1, 1], [1, 1, 0]], gemCost: 4, timeCost: 2, gemIncome: 1 },
  { id: 7, shape: [[1, 1, 0], [0, 1, 1]], gemCost: 4, timeCost: 2, gemIncome: 0 },
  { id: 8, shape: [[1, 0], [1, 0], [1, 1]], gemCost: 3, timeCost: 3, gemIncome: 1 },
  { id: 9, shape: [[0, 1], [0, 1], [1, 1]], gemCost: 2, timeCost: 3, gemIncome: 1 },
  { id: 10, shape: [[1, 1, 1, 1]], gemCost: 3, timeCost: 3, gemIncome: 1 },
  { id: 11, shape: [[1, 0], [1, 0], [1, 0], [1, 1]], gemCost: 1, timeCost: 2, gemIncome: 0 },
  { id: 12, shape: [[1, 1, 1], [0, 1, 0], [0, 1, 0]], gemCost: 2, timeCost: 2, gemIncome: 0 },
  { id: 13, shape: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], gemCost: 4, timeCost: 6, gemIncome: 2 },
  { id: 14, shape: [[1, 0, 1], [1, 1, 1]], gemCost: 7, timeCost: 2, gemIncome: 2 },
  { id: 15, shape: [[1, 1, 1, 1, 1]], gemCost: 7, timeCost: 1, gemIncome: 1 },
  { id: 16, shape: [[1, 1, 1], [0, 1, 0], [0, 1, 0]], gemCost: 5, timeCost: 5, gemIncome: 2 },
  { id: 17, shape: [[0, 1], [1, 1], [1, 0], [1, 0]], gemCost: 1, timeCost: 5, gemIncome: 1 },
  { id: 18, shape: [[1, 1], [1, 0], [1, 1]], gemCost: 3, timeCost: 6, gemIncome: 2 },
  { id: 19, shape: [[1, 0], [1, 0], [1, 0], [1, 1]], gemCost: 2, timeCost: 3, gemIncome: 1 },
  { id: 20, shape: [[1, 0, 0], [1, 1, 0], [0, 1, 1]], gemCost: 1, timeCost: 2, gemIncome: 0 },
  { id: 21, shape: [[0, 1, 1], [1, 1, 0], [0, 1, 0]], gemCost: 3, timeCost: 4, gemIncome: 1 },
  { id: 22, shape: [[1, 1], [1, 1], [1, 0]], gemCost: 2, timeCost: 2, gemIncome: 0 },
  { id: 23, shape: [[0, 1], [1, 1], [1, 0], [1, 0]], gemCost: 4, timeCost: 2, gemIncome: 1 },
  { id: 24, shape: [[1, 0], [1, 0], [1, 0], [1, 0], [1, 1]], gemCost: 2, timeCost: 3, gemIncome: 0 },
  { id: 25, shape: [[0, 1], [1, 1], [0, 1], [0, 1]], gemCost: 10, timeCost: 3, gemIncome: 2 },
  { id: 26, shape: [[1, 1, 0], [0, 1, 0], [0, 1, 1]], gemCost: 3, timeCost: 4, gemIncome: 1 },
  { id: 27, shape: [[1, 0, 1], [1, 1, 1], [1, 0, 0]], gemCost: 10, timeCost: 5, gemIncome: 3 },
  { id: 28, shape: [[1, 0, 0], [1, 1, 0], [0, 1, 1], [0, 0, 1]], gemCost: 0, timeCost: 3, gemIncome: 1 },
  { id: 29, shape: [[0, 1, 0], [1, 1, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0]], gemCost: 1, timeCost: 4, gemIncome: 1 },
  { id: 30, shape: [[1, 1, 1], [1, 1, 1]], gemCost: 8, timeCost: 6, gemIncome: 3 },
  { id: 31, shape: [[0, 1, 1], [0, 1, 0], [1, 1, 0], [1, 0, 0]], gemCost: 5, timeCost: 3, gemIncome: 1 },
  { id: 32, shape: [[1, 1], [1, 0], [1, 0]], gemCost: 1, timeCost: 3, gemIncome: 0 },
];
