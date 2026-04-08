import type {
  GameState,
  GameAction,
  PlayerState,
  Tile,
} from './types';
import { STARTING_GEMS, TIME_BOARD_SPACES, MOSAIC_SIZE } from './types';
import { ALL_TILES } from './tiles';
import { getTriggeredEvents, GEM_INCOME_SPACES } from './timeBoard';
import { applyPlacement, createEmptyMosaic } from './tileUtils';
import { has7x7Block } from './scoring';

/** Create a fresh player state. */
function createPlayer(id: 0 | 1, name: string): PlayerState {
  return {
    id,
    name,
    gems: STARTING_GEMS,
    mosaic: createEmptyMosaic(),
    timePosition: 0,
    hasSpecialTile: false,
    totalGemIncome: 0,
  };
}

/** Shuffle an array (Fisher-Yates). */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Initialize a new game. */
export function initGame(player1Name: string, player2Name: string): GameState {
  const tileCircle = shuffle([...ALL_TILES]);

  return {
    players: [createPlayer(0, player1Name), createPlayer(1, player2Name)],
    tileCircle,
    neutralTokenIndex: 0,
    claimedSpecialTileSpaces: [],
    specialTileAwarded: false,
    phase: 'playing',
    activePlayerId: (Math.random() < 0.5 ? 0 : 1) as 0 | 1,
    firstToFinish: null,
  };
}

/** Determine which player should act next (furthest behind on time board). */
export function resolveActivePlayer(state: GameState): 0 | 1 {
  const [p0, p1] = state.players;
  if (p0.timePosition < p1.timePosition) return 0;
  if (p1.timePosition < p0.timePosition) return 1;
  return state.activePlayerId;
}

/** Get the 3 available tiles (indices into tileCircle) starting after the neutral token. */
export function getAvailableTileIndices(state: GameState): number[] {
  const len = state.tileCircle.length;
  if (len === 0) return [];
  const indices: number[] = [];
  for (let i = 0; i < Math.min(3, len); i++) {
    indices.push((state.neutralTokenIndex + i) % len);
  }
  return indices;
}

/** Get the actual Tile objects for the 3 available tiles. */
export function getAvailableTiles(state: GameState): Tile[] {
  return getAvailableTileIndices(state).map(i => state.tileCircle[i]);
}

/** Check if the active player can afford a specific tile. */
export function canAfford(state: GameState, tileChoice: number): boolean {
  const tiles = getAvailableTiles(state);
  if (tileChoice < 0 || tileChoice >= tiles.length) return false;
  return state.players[state.activePlayerId].gems >= tiles[tileChoice].gemCost;
}

/** Deep-clone the game state for immutable updates. */
function cloneState(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map(p => ({
      ...p,
      mosaic: p.mosaic.map(row => [...row]),
    })) as [PlayerState, PlayerState],
    tileCircle: [...state.tileCircle],
    claimedSpecialTileSpaces: state.claimedSpecialTileSpaces.map(c => ({ ...c })),
  };
}

/**
 * Process time board events (gem income, special tiles) when a player
 * moves from oldPos to newPos. Mutates the state in place.
 * Returns true if the player needs to place a special tile.
 */
function processTimeBoardEvents(
  state: GameState,
  playerId: 0 | 1,
  oldPos: number,
  newPos: number
): boolean {
  const events = getTriggeredEvents(oldPos, newPos);
  let needsSpecialTilePlacement = false;

  for (const { position, event } of events) {
    if (event === 'gemIncome') {
      state.players[playerId].gems += state.players[playerId].totalGemIncome;
    }
    if (event === 'specialTile' && !state.claimedSpecialTileSpaces.some(c => c.position === position)) {
      state.claimedSpecialTileSpaces.push({ position, playerId });
      needsSpecialTilePlacement = true;
    }
  }

  return needsSpecialTilePlacement;
}

/** Check end-game condition and update state. */
function checkGameEnd(state: GameState): void {
  const [p0, p1] = state.players;
  if (p0.timePosition >= TIME_BOARD_SPACES - 1 && p1.timePosition >= TIME_BOARD_SPACES - 1) {
    state.phase = 'gameOver';
  }
}

/** Check and potentially award the 7x7 special tile. */
function checkSpecialTile(state: GameState, playerId: 0 | 1): void {
  if (state.specialTileAwarded) return;
  if (has7x7Block(state.players[playerId].mosaic)) {
    state.players[playerId].hasSpecialTile = true;
    state.specialTileAwarded = true;
  }
}

/**
 * Apply a game action to the state, returning the new state.
 * Returns null if the action is invalid.
 */
export function applyAction(state: GameState, action: GameAction): GameState | null {
  if (state.phase === 'gameOver') return null;

  const newState = cloneState(state);
  const playerId = newState.activePlayerId;
  const player = newState.players[playerId];

  switch (action.type) {
    case 'ADVANCE': {
      if (newState.phase !== 'playing') return null;

      // Move one space forward
      const newPos = Math.min(player.timePosition + 1, TIME_BOARD_SPACES - 1);
      if (newPos <= player.timePosition) return null; // Already at end

      const oldPos = player.timePosition;
      player.gems += 1;
      player.timePosition = newPos;

      // Track first to finish for tiebreaker
      if (newPos >= TIME_BOARD_SPACES - 1 && newState.firstToFinish === null) {
        newState.firstToFinish = playerId;
      }

      const needsSpecialTile = processTimeBoardEvents(newState, playerId, oldPos, newPos);

      if (needsSpecialTile && hasEmptySpace(player.mosaic)) {
        newState.phase = 'placingSpecialTile';
      } else {
        newState.activePlayerId = resolveActivePlayer(newState);
        checkGameEnd(newState);
      }

      return newState;
    }

    case 'TAKE_TILE': {
      if (newState.phase !== 'playing') return null;

      const availableIndices = getAvailableTileIndices(newState);
      if (action.tileChoice < 0 || action.tileChoice >= availableIndices.length) return null;

      const circleIndex = availableIndices[action.tileChoice];
      const tile = newState.tileCircle[circleIndex];

      // Check affordability
      if (player.gems < tile.gemCost) return null;

      // Apply placement
      const newMosaic = applyPlacement(player.mosaic, tile.shape, action.placement);
      if (!newMosaic) return null;

      // Pay for tile
      player.gems -= tile.gemCost;
      player.mosaic = newMosaic;
      player.totalGemIncome += tile.gemIncome;

      // Move neutral token to where the tile was
      newState.neutralTokenIndex = circleIndex % newState.tileCircle.length;

      // Remove tile from circle
      newState.tileCircle.splice(circleIndex, 1);

      // Adjust neutral token index after removal
      if (newState.tileCircle.length > 0) {
        newState.neutralTokenIndex = newState.neutralTokenIndex % newState.tileCircle.length;
      }

      // Move time token
      const oldPos = player.timePosition;
      player.timePosition = Math.min(
        player.timePosition + tile.timeCost,
        TIME_BOARD_SPACES - 1
      );

      if (player.timePosition >= TIME_BOARD_SPACES - 1 && newState.firstToFinish === null) {
        newState.firstToFinish = playerId;
      }

      // Check special tile
      checkSpecialTile(newState, playerId);

      // Process time board events
      const needsSpecialTile = processTimeBoardEvents(newState, playerId, oldPos, player.timePosition);

      if (needsSpecialTile && hasEmptySpace(player.mosaic)) {
        newState.phase = 'placingSpecialTile';
      } else {
        newState.activePlayerId = resolveActivePlayer(newState);
        checkGameEnd(newState);
      }

      return newState;
    }

    case 'PLACE_SPECIAL_TILE': {
      if (newState.phase !== 'placingSpecialTile') return null;

      const { row, col } = action;
      if (
        row < 0 || row >= MOSAIC_SIZE ||
        col < 0 || col >= MOSAIC_SIZE ||
        player.mosaic[row][col]
      ) {
        return null;
      }

      player.mosaic[row][col] = true;

      // Check special tile after placing
      checkSpecialTile(newState, playerId);

      newState.phase = 'playing';
      newState.activePlayerId = resolveActivePlayer(newState);
      checkGameEnd(newState);

      return newState;
    }

    default:
      return null;
  }
}

function hasEmptySpace(mosaic: boolean[][]): boolean {
  for (const row of mosaic) {
    for (const cell of row) {
      if (!cell) return true;
    }
  }
  return false;
}

/** Check if the advance action is available (player hasn't reached the end). */
export function canAdvance(state: GameState): boolean {
  const player = state.players[state.activePlayerId];
  return player.timePosition < TIME_BOARD_SPACES - 1;
}

/** Calculate total gems earned from advancing 1 space (1 base + potential gem income). */
export function advanceReward(state: GameState): number {
  const player = state.players[state.activePlayerId];
  const newPos = Math.min(player.timePosition + 1, TIME_BOARD_SPACES - 1);
  let reward = 1;
  if (GEM_INCOME_SPACES.includes(newPos)) {
    reward += player.totalGemIncome;
  }
  return reward;
}
