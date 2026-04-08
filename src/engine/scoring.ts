import type { PlayerState } from './types';
import { SPECIAL_TILE_SIZE, MOSAIC_SIZE } from './types';
import { countEmptySpaces } from './tileUtils';

/** Check if the mosaic contains a fully filled 7x7 block. */
export function has7x7Block(mosaic: boolean[][]): boolean {
  const maxStart = MOSAIC_SIZE - SPECIAL_TILE_SIZE; // 9 - 7 = 2
  for (let r = 0; r <= maxStart; r++) {
    for (let c = 0; c <= maxStart; c++) {
      let filled = true;
      for (let dr = 0; dr < SPECIAL_TILE_SIZE && filled; dr++) {
        for (let dc = 0; dc < SPECIAL_TILE_SIZE && filled; dc++) {
          if (!mosaic[r + dr][c + dc]) filled = false;
        }
      }
      if (filled) return true;
    }
  }
  return false;
}

/** Calculate a player's final score. */
export function calculateScore(player: PlayerState): number {
  const emptySpaces = countEmptySpaces(player.mosaic);
  let score = player.gems;
  score -= 2 * emptySpaces;
  if (player.hasSpecialTile) score += 7;
  return score;
}
