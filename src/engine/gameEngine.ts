import type {
  GameState,
  GameAction,
  PlayerState,
  Patch,
} from './types';
import { STARTING_BUTTONS, TIME_BOARD_SPACES, QUILT_SIZE } from './types';
import { ALL_PATCHES } from './patches';
import { getTriggeredEvents, BUTTON_INCOME_SPACES } from './timeBoard';
import { applyPlacement, createEmptyQuilt } from './patchUtils';
import { has7x7Block } from './scoring';

/** Create a fresh player state. */
function createPlayer(id: 0 | 1, name: string): PlayerState {
  return {
    id,
    name,
    buttons: STARTING_BUTTONS,
    quilt: createEmptyQuilt(),
    timePosition: 0,
    hasSpecialTile: false,
    totalButtonIncome: 0,
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
  const patchCircle = shuffle([...ALL_PATCHES]);

  return {
    players: [createPlayer(0, player1Name), createPlayer(1, player2Name)],
    patchCircle,
    neutralTokenIndex: 0,
    claimedSpecialPatchSpaces: [],
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
  // Tied: the player who arrived at this space most recently goes first.
  // In our model, the active player just moved, so the OTHER player goes next.
  // But at game start both are at 0 — player 0 goes first by convention.
  return state.activePlayerId;
}

/** Get the 3 available patches (indices into patchCircle) starting after the neutral token. */
export function getAvailablePatchIndices(state: GameState): number[] {
  const len = state.patchCircle.length;
  if (len === 0) return [];
  const indices: number[] = [];
  for (let i = 0; i < Math.min(3, len); i++) {
    indices.push((state.neutralTokenIndex + i) % len);
  }
  return indices;
}

/** Get the actual Patch objects for the 3 available patches. */
export function getAvailablePatches(state: GameState): Patch[] {
  return getAvailablePatchIndices(state).map(i => state.patchCircle[i]);
}

/** Check if the active player can afford a specific patch. */
export function canAfford(state: GameState, patchChoice: number): boolean {
  const patches = getAvailablePatches(state);
  if (patchChoice < 0 || patchChoice >= patches.length) return false;
  return state.players[state.activePlayerId].buttons >= patches[patchChoice].buttonCost;
}

/** Deep-clone the game state for immutable updates. */
function cloneState(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map(p => ({
      ...p,
      quilt: p.quilt.map(row => [...row]),
    })) as [PlayerState, PlayerState],
    patchCircle: [...state.patchCircle],
    claimedSpecialPatchSpaces: state.claimedSpecialPatchSpaces.map(c => ({ ...c })),
  };
}

/**
 * Process time board events (button income, special patches) when a player
 * moves from oldPos to newPos. Mutates the state in place.
 * Returns true if the player needs to place a special patch.
 */
function processTimeBoardEvents(
  state: GameState,
  playerId: 0 | 1,
  oldPos: number,
  newPos: number
): boolean {
  const events = getTriggeredEvents(oldPos, newPos);
  let needsSpecialPatchPlacement = false;

  for (const { position, event } of events) {
    if (event === 'buttonIncome') {
      state.players[playerId].buttons += state.players[playerId].totalButtonIncome;
    }
    if (event === 'specialPatch' && !state.claimedSpecialPatchSpaces.some(c => c.position === position)) {
      state.claimedSpecialPatchSpaces.push({ position, playerId });
      needsSpecialPatchPlacement = true;
    }
  }

  return needsSpecialPatchPlacement;
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
  if (has7x7Block(state.players[playerId].quilt)) {
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
  const opponent = newState.players[playerId === 0 ? 1 : 0];

  switch (action.type) {
    case 'ADVANCE': {
      if (newState.phase !== 'playing') return null;

      // Move one space forward
      const newPos = Math.min(player.timePosition + 1, TIME_BOARD_SPACES - 1);
      if (newPos <= player.timePosition) return null; // Already at end

      const oldPos = player.timePosition;
      player.buttons += 1;
      player.timePosition = newPos;

      // Track first to finish for tiebreaker
      if (newPos >= TIME_BOARD_SPACES - 1 && newState.firstToFinish === null) {
        newState.firstToFinish = playerId;
      }

      const needsSpecialPatch = processTimeBoardEvents(newState, playerId, oldPos, newPos);

      if (needsSpecialPatch && hasEmptySpace(player.quilt)) {
        newState.phase = 'placingSpecialPatch';
      } else {
        newState.activePlayerId = resolveActivePlayer(newState);
        checkGameEnd(newState);
      }

      return newState;
    }

    case 'TAKE_PATCH': {
      if (newState.phase !== 'playing') return null;

      const availableIndices = getAvailablePatchIndices(newState);
      if (action.patchChoice < 0 || action.patchChoice >= availableIndices.length) return null;

      const circleIndex = availableIndices[action.patchChoice];
      const patch = newState.patchCircle[circleIndex];

      // Check affordability
      if (player.buttons < patch.buttonCost) return null;

      // Apply placement
      const newQuilt = applyPlacement(player.quilt, patch.shape, action.placement);
      if (!newQuilt) return null;

      // Pay for patch
      player.buttons -= patch.buttonCost;
      player.quilt = newQuilt;
      player.totalButtonIncome += patch.buttonIncome;

      // Move neutral token to where the patch was
      newState.neutralTokenIndex = circleIndex % newState.patchCircle.length;

      // Remove patch from circle
      newState.patchCircle.splice(circleIndex, 1);

      // Adjust neutral token index after removal
      if (newState.patchCircle.length > 0) {
        newState.neutralTokenIndex = newState.neutralTokenIndex % newState.patchCircle.length;
      }

      // Move time token
      const oldPos = player.timePosition;
      player.timePosition = Math.min(
        player.timePosition + patch.timeCost,
        TIME_BOARD_SPACES - 1
      );

      if (player.timePosition >= TIME_BOARD_SPACES - 1 && newState.firstToFinish === null) {
        newState.firstToFinish = playerId;
      }

      // Check special tile
      checkSpecialTile(newState, playerId);

      // Process time board events
      const needsSpecialPatch = processTimeBoardEvents(newState, playerId, oldPos, player.timePosition);

      if (needsSpecialPatch && hasEmptySpace(player.quilt)) {
        newState.phase = 'placingSpecialPatch';
      } else {
        newState.activePlayerId = resolveActivePlayer(newState);
        checkGameEnd(newState);
      }

      return newState;
    }

    case 'PLACE_SPECIAL_PATCH': {
      if (newState.phase !== 'placingSpecialPatch') return null;

      const { row, col } = action;
      if (
        row < 0 || row >= QUILT_SIZE ||
        col < 0 || col >= QUILT_SIZE ||
        player.quilt[row][col]
      ) {
        return null;
      }

      player.quilt[row][col] = true;

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

function hasEmptySpace(quilt: boolean[][]): boolean {
  for (const row of quilt) {
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

/** Calculate total buttons earned from advancing 1 space (1 base + potential button income). */
export function advanceReward(state: GameState): number {
  const player = state.players[state.activePlayerId];
  const newPos = Math.min(player.timePosition + 1, TIME_BOARD_SPACES - 1);
  let reward = 1;
  if (BUTTON_INCOME_SPACES.includes(newPos)) {
    reward += player.totalButtonIncome;
  }
  return reward;
}
