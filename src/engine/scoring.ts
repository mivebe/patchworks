import type { PlayerState } from './types';
import { SPECIAL_TILE_SIZE, QUILT_SIZE } from './types';
import { countEmptySpaces } from './patchUtils';

/** Check if the quilt contains a fully filled 7x7 block. */
export function has7x7Block(quilt: boolean[][]): boolean {
  const maxStart = QUILT_SIZE - SPECIAL_TILE_SIZE; // 9 - 7 = 2
  for (let r = 0; r <= maxStart; r++) {
    for (let c = 0; c <= maxStart; c++) {
      let filled = true;
      for (let dr = 0; dr < SPECIAL_TILE_SIZE && filled; dr++) {
        for (let dc = 0; dc < SPECIAL_TILE_SIZE && filled; dc++) {
          if (!quilt[r + dr][c + dc]) filled = false;
        }
      }
      if (filled) return true;
    }
  }
  return false;
}

/** Calculate a player's final score. */
export function calculateScore(player: PlayerState): number {
  const emptySpaces = countEmptySpaces(player.quilt);
  let score = player.buttons;
  score -= 2 * emptySpaces;
  if (player.hasSpecialTile) score += 7;
  return score;
}
