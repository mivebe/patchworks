/** A 2D matrix representing a patch shape. 1 = filled cell, 0 = empty. */
export type Shape = (0 | 1)[][];

/** A patch piece that can be purchased from the market. */
export interface Patch {
  id: number;
  shape: Shape;
  buttonCost: number;
  timeCost: number;
  buttonIncome: number;
}

/** One player's complete state. */
export interface PlayerState {
  id: 0 | 1;
  name: string;
  buttons: number;
  /** 9x9 quilt board. true = filled, false = empty. */
  quilt: boolean[][];
  /** Position on the time board (0 = start, 53 = end). */
  timePosition: number;
  hasSpecialTile: boolean;
  /** Button income from all placed patches. */
  totalButtonIncome: number;
}

/** Where a patch is placed on the quilt. */
export interface Placement {
  row: number;
  col: number;
  /** Number of 90-degree clockwise rotations (0-3). */
  rotation: number;
  flipped: boolean;
}

/** Player advances to just in front of opponent, earning buttons. */
export interface AdvanceAction {
  type: 'ADVANCE';
}

/** Player takes a patch from the market and places it. */
export interface TakePatchAction {
  type: 'TAKE_PATCH';
  /** Index within the 3 available patches (0, 1, or 2). */
  patchChoice: number;
  placement: Placement;
}

/** Player places a special 1x1 patch received from the time board. */
export interface PlaceSpecialPatchAction {
  type: 'PLACE_SPECIAL_PATCH';
  row: number;
  col: number;
}

export type GameAction = AdvanceAction | TakePatchAction | PlaceSpecialPatchAction;

export type GamePhase = 'setup' | 'playing' | 'placingSpecialPatch' | 'gameOver';

/** The complete game state. */
export interface GameState {
  players: [PlayerState, PlayerState];
  /** Remaining patches in circular order. */
  patchCircle: Patch[];
  /** Index into patchCircle where the neutral token sits (patches available are the next 3 clockwise). */
  neutralTokenIndex: number;
  /** Positions on the time board where the special 1x1 patch has been claimed, and by whom. */
  claimedSpecialPatchSpaces: { position: number; playerId: 0 | 1 }[];
  specialTileAwarded: boolean;
  phase: GamePhase;
  /** Which player's turn it is. */
  activePlayerId: 0 | 1;
  /** When both reach end, who arrived first (for tiebreaker). */
  firstToFinish: 0 | 1 | null;
}

export const QUILT_SIZE = 9;
export const TIME_BOARD_SPACES = 54;
export const SPECIAL_TILE_SIZE = 7;
export const STARTING_BUTTONS = 5;
