import { TIME_BOARD_SPACES } from './types';

/**
 * Spaces on the time board (0-indexed) where button income is triggered.
 * When a player moves onto or past one of these spaces, they receive
 * button income equal to their total button icons on placed patches.
 *
 * Based on the official Patchwork time board (approximately every 6-8 spaces).
 */
export const BUTTON_INCOME_SPACES: number[] = [5, 11, 17, 23, 29, 35, 41, 47, 53];

/**
 * Spaces on the time board where a special 1x1 patch is available.
 * When a player moves onto or past one of these spaces, they receive
 * a 1x1 patch to place on their quilt board immediately.
 *
 * There are 5 special patches total on the board.
 */
export const SPECIAL_PATCH_SPACES: number[] = [20, 26, 32, 44, 50];

export type TimeBoardSpaceType = 'normal' | 'buttonIncome' | 'specialPatch' | 'both';

export interface TimeBoardSpace {
  index: number;
  type: TimeBoardSpaceType;
}

/** Generate the full time board layout. */
export function createTimeBoard(): TimeBoardSpace[] {
  const board: TimeBoardSpace[] = [];
  for (let i = 0; i < TIME_BOARD_SPACES; i++) {
    const isButton = BUTTON_INCOME_SPACES.includes(i);
    const isSpecial = SPECIAL_PATCH_SPACES.includes(i);
    let type: TimeBoardSpaceType = 'normal';
    if (isButton && isSpecial) type = 'both';
    else if (isButton) type = 'buttonIncome';
    else if (isSpecial) type = 'specialPatch';
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
): { position: number; event: 'buttonIncome' | 'specialPatch' }[] {
  const events: { position: number; event: 'buttonIncome' | 'specialPatch' }[] = [];

  for (let pos = oldPosition + 1; pos <= newPosition; pos++) {
    if (BUTTON_INCOME_SPACES.includes(pos)) {
      events.push({ position: pos, event: 'buttonIncome' });
    }
    if (SPECIAL_PATCH_SPACES.includes(pos)) {
      events.push({ position: pos, event: 'specialPatch' });
    }
  }

  return events;
}
