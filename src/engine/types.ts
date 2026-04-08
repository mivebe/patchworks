/** A 2D matrix representing a tile shape. 1 = filled cell, 0 = empty. */
export type Shape = (0 | 1)[][];

/** A glass tile that can be purchased from the market. */
export interface Tile {
  id: number;
  shape: Shape;
  gemCost: number;
  timeCost: number;
  gemIncome: number;
}

/** One player's complete state. */
export interface PlayerState {
  id: 0 | 1;
  name: string;
  gems: number;
  /** 9x9 mosaic board. true = filled, false = empty. */
  mosaic: boolean[][];
  /** Position on the time board (0 = start, 53 = end). */
  timePosition: number;
  hasSpecialTile: boolean;
  /** Gem income from all placed tiles. */
  totalGemIncome: number;
}

/** Where a tile is placed on the mosaic. */
export interface Placement {
  row: number;
  col: number;
  /** Number of 90-degree clockwise rotations (0-3). */
  rotation: number;
  flipped: boolean;
}

/** Player advances one space, earning gems. */
export interface AdvanceAction {
  type: 'ADVANCE';
}

/** Player takes a tile from the market and places it. */
export interface TakeTileAction {
  type: 'TAKE_TILE';
  /** Index within the 3 available tiles (0, 1, or 2). */
  tileChoice: number;
  placement: Placement;
}

/** Player places a special 1x1 tile received from the time board. */
export interface PlaceSpecialTileAction {
  type: 'PLACE_SPECIAL_TILE';
  row: number;
  col: number;
}

export type GameAction = AdvanceAction | TakeTileAction | PlaceSpecialTileAction;

export type GamePhase = 'setup' | 'playing' | 'placingSpecialTile' | 'gameOver';

/** The complete game state. */
export interface GameState {
  players: [PlayerState, PlayerState];
  /** Remaining tiles in circular order. */
  tileCircle: Tile[];
  /** Index into tileCircle where the neutral token sits (tiles available are the next 3 clockwise). */
  neutralTokenIndex: number;
  /** Positions on the time board where the special 1x1 tile has been claimed, and by whom. */
  claimedSpecialTileSpaces: { position: number; playerId: 0 | 1 }[];
  specialTileAwarded: boolean;
  phase: GamePhase;
  /** Which player's turn it is. */
  activePlayerId: 0 | 1;
  /** When both reach end, who arrived first (for tiebreaker). */
  firstToFinish: 0 | 1 | null;
}

export const MOSAIC_SIZE = 9;
export const TIME_BOARD_SPACES = 54;
export const SPECIAL_TILE_SIZE = 7;
export const STARTING_GEMS = 5;
