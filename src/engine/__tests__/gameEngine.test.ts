import { describe, it, expect } from 'vitest';
import {
  initGame,
  applyAction,
  getAvailableTiles,
  canAdvance,
  resolveActivePlayer,
} from '../gameEngine';
import type { GameState } from '../types';
import { STARTING_GEMS, TIME_BOARD_SPACES } from '../types';

function createTestGame(): GameState {
  const state = initGame('Alice', 'Bob');
  state.activePlayerId = 0; // pin for deterministic tests
  return state;
}

describe('initGame', () => {
  it('creates a valid initial game state', () => {
    const state = createTestGame();
    expect(state.players[0].name).toBe('Alice');
    expect(state.players[1].name).toBe('Bob');
    expect(state.players[0].gems).toBe(STARTING_GEMS);
    expect(state.players[1].gems).toBe(STARTING_GEMS);
    expect(state.players[0].timePosition).toBe(0);
    expect(state.players[1].timePosition).toBe(0);
    expect(state.tileCircle.length).toBe(33);
    expect(state.phase).toBe('playing');
    expect(state.activePlayerId).toBe(0);
  });
});

describe('getAvailableTiles', () => {
  it('returns 3 tiles', () => {
    const state = createTestGame();
    const tiles = getAvailableTiles(state);
    expect(tiles.length).toBe(3);
  });

  it('returns fewer if circle has < 3 tiles', () => {
    const state = createTestGame();
    state.tileCircle = [state.tileCircle[0]];
    const tiles = getAvailableTiles(state);
    expect(tiles.length).toBe(1);
  });
});

describe('ADVANCE action', () => {
  it('moves player one space forward and earns 1 gem', () => {
    const state = createTestGame();
    const newState = applyAction(state, { type: 'ADVANCE' });
    expect(newState).not.toBeNull();
    expect(newState!.players[0].timePosition).toBe(1);
    expect(newState!.players[0].gems).toBe(STARTING_GEMS + 1);
  });

  it('advances only one space even when opponent is far ahead', () => {
    const state = createTestGame();
    state.players[1].timePosition = 10;
    const newState = applyAction(state, { type: 'ADVANCE' });
    expect(newState).not.toBeNull();
    expect(newState!.players[0].timePosition).toBe(1);
    expect(newState!.players[0].gems).toBe(STARTING_GEMS + 1);
  });

  it('cannot advance if at end of board', () => {
    const state = createTestGame();
    state.players[0].timePosition = TIME_BOARD_SPACES - 1;
    expect(canAdvance(state)).toBe(false);
  });

  it('switches turn to the player further behind', () => {
    const state = createTestGame();
    state.players[1].timePosition = 10;
    const newState = applyAction(state, { type: 'ADVANCE' });
    expect(newState).not.toBeNull();
    expect(newState!.activePlayerId).toBe(0);
  });
});

describe('TAKE_TILE action', () => {
  it('takes a tile, pays cost, places on mosaic, moves time token', () => {
    const state = createTestGame();
    const tiles = getAvailableTiles(state);
    const tile = tiles[0];

    state.players[0].gems = 20;

    const newState = applyAction(state, {
      type: 'TAKE_TILE',
      tileChoice: 0,
      placement: { row: 0, col: 0, rotation: 0, flipped: false },
    });

    expect(newState).not.toBeNull();
    expect(newState!.players[0].gems).toBeGreaterThanOrEqual(20 - tile.gemCost);
    expect(newState!.players[0].timePosition).toBe(
      Math.min(tile.timeCost, TIME_BOARD_SPACES - 1)
    );
    expect(newState!.players[0].totalGemIncome).toBe(tile.gemIncome);
    expect(newState!.tileCircle.length).toBe(32);
  });

  it('rejects if cannot afford', () => {
    const state = createTestGame();
    state.players[0].gems = 0;
    const result = applyAction(state, {
      type: 'TAKE_TILE',
      tileChoice: 0,
      placement: { row: 0, col: 0, rotation: 0, flipped: false },
    });
    if (getAvailableTiles(state)[0].gemCost > 0) {
      expect(result).toBeNull();
    }
  });

  it('rejects invalid placement', () => {
    const state = createTestGame();
    state.players[0].gems = 20;
    const result = applyAction(state, {
      type: 'TAKE_TILE',
      tileChoice: 0,
      placement: { row: 8, col: 8, rotation: 0, flipped: false },
    });
    const tile = getAvailableTiles(state)[0];
    const shapeRows = tile.shape.length;
    const shapeCols = tile.shape[0].length;
    if (shapeRows > 1 || shapeCols > 1) {
      expect(result).toBeNull();
    }
  });
});

describe('resolveActivePlayer', () => {
  it('selects the player further behind', () => {
    const state = createTestGame();
    state.players[0].timePosition = 5;
    state.players[1].timePosition = 3;
    expect(resolveActivePlayer(state)).toBe(1);
  });

  it('returns current active player when tied', () => {
    const state = createTestGame();
    state.players[0].timePosition = 5;
    state.players[1].timePosition = 5;
    state.activePlayerId = 1;
    expect(resolveActivePlayer(state)).toBe(1);
  });
});

describe('game end', () => {
  it('ends when both players reach the final space', () => {
    const state = createTestGame();
    state.players[0].timePosition = TIME_BOARD_SPACES - 1;
    state.players[1].timePosition = TIME_BOARD_SPACES - 2;
    state.activePlayerId = 1;

    const newState = applyAction(state, { type: 'ADVANCE' });
    expect(newState).not.toBeNull();
    expect(newState!.phase).toBe('gameOver');
  });
});
