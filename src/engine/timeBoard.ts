import { TIME_BOARD_SPACES } from './types';

/**
 * Spaces on the time board (0-indexed) where gem income is triggered.
 * When a player moves onto or past one of these spaces, they receive
 * gem income equal to their total gem icons on placed tiles.
 */
export const GEM_INCOME_SPACES: number[] = [5, 11, 17, 23, 29, 35, 41, 47, 53];

/**
 * Spaces on the time board where a special 1x1 tile is available.
 * When a player moves onto or past one of these spaces, they receive
 * a 1x1 tile to place on their mosaic immediately.
 *
 * There are 5 special tiles total on the board.
 */
export const SPECIAL_TILE_SPACES: number[] = [20, 26, 32, 44, 50];

export type TimeBoardSpaceType = 'normal' | 'gemIncome' | 'specialTile' | 'both';

export interface TimeBoardSpace {
  index: number;
  type: TimeBoardSpaceType;
}

/** Generate the full time board layout. */
export function createTimeBoard(): TimeBoardSpace[] {
  const board: TimeBoardSpace[] = [];
  for (let i = 0; i < TIME_BOARD_SPACES; i++) {
    const isGem = GEM_INCOME_SPACES.includes(i);
    const isSpecial = SPECIAL_TILE_SPACES.includes(i);
    let type: TimeBoardSpaceType = 'normal';
    if (isGem && isSpecial) type = 'both';
    else if (isGem) type = 'gemIncome';
    else if (isSpecial) type = 'specialTile';
    board.push({ index: i, type });
  }
  return board;
}

/**
 * Given a player's old and new position, return all special events
 * that should trigger, in order of position.
 */
export function getTriggeredEvents(
  oldPosition: number,
  newPosition: number
): { position: number; event: 'gemIncome' | 'specialTile' }[] {
  const events: { position: number; event: 'gemIncome' | 'specialTile' }[] = [];

  for (let pos = oldPosition + 1; pos <= newPosition; pos++) {
    if (GEM_INCOME_SPACES.includes(pos)) {
      events.push({ position: pos, event: 'gemIncome' });
    }
    if (SPECIAL_TILE_SPACES.includes(pos)) {
      events.push({ position: pos, event: 'specialTile' });
    }
  }

  return events;
}
