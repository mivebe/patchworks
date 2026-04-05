import { describe, it, expect } from 'vitest';
import {
  initGame,
  applyAction,
  getAvailablePatches,
  canAdvance,
  advanceButtonReward,
  resolveActivePlayer,
} from '../gameEngine';
import type { GameState } from '../types';
import { STARTING_BUTTONS, TIME_BOARD_SPACES } from '../types';

function createTestGame(): GameState {
  return initGame('Alice', 'Bob');
}

describe('initGame', () => {
  it('creates a valid initial game state', () => {
    const state = createTestGame();
    expect(state.players[0].name).toBe('Alice');
    expect(state.players[1].name).toBe('Bob');
    expect(state.players[0].buttons).toBe(STARTING_BUTTONS);
    expect(state.players[1].buttons).toBe(STARTING_BUTTONS);
    expect(state.players[0].timePosition).toBe(0);
    expect(state.players[1].timePosition).toBe(0);
    expect(state.patchCircle.length).toBe(33);
    expect(state.phase).toBe('playing');
    expect(state.activePlayerId).toBe(0);
  });
});

describe('getAvailablePatches', () => {
  it('returns 3 patches', () => {
    const state = createTestGame();
    const patches = getAvailablePatches(state);
    expect(patches.length).toBe(3);
  });

  it('returns fewer if circle has < 3 patches', () => {
    const state = createTestGame();
    state.patchCircle = [state.patchCircle[0]];
    const patches = getAvailablePatches(state);
    expect(patches.length).toBe(1);
  });
});

describe('ADVANCE action', () => {
  it('moves player ahead of opponent and earns buttons', () => {
    const state = createTestGame();
    // Player 0 at 0, player 1 at 0. Advance puts player 0 at 1.
    const newState = applyAction(state, { type: 'ADVANCE' });
    expect(newState).not.toBeNull();
    expect(newState!.players[0].timePosition).toBe(1);
    expect(newState!.players[0].buttons).toBe(STARTING_BUTTONS + 1);
  });

  it('calculates correct reward', () => {
    const state = createTestGame();
    state.players[1].timePosition = 10;
    // Player 0 at 0 advances to 11, earning 11 buttons
    expect(advanceButtonReward(state)).toBe(11);
  });

  it('cannot advance if already ahead', () => {
    const state = createTestGame();
    state.players[0].timePosition = 5;
    state.players[1].timePosition = 3;
    expect(canAdvance(state)).toBe(false);
  });

  it('switches turn to the player further behind', () => {
    const state = createTestGame();
    state.players[1].timePosition = 10;
    const newState = applyAction(state, { type: 'ADVANCE' });
    expect(newState).not.toBeNull();
    // Player 0 moved to 11, player 1 at 10 — player 1 is behind
    expect(newState!.activePlayerId).toBe(1);
  });
});

describe('TAKE_PATCH action', () => {
  it('takes a patch, pays cost, places on quilt, moves time token', () => {
    const state = createTestGame();
    const patches = getAvailablePatches(state);
    const patch = patches[0];

    // Give enough buttons to afford
    state.players[0].buttons = 20;

    const newState = applyAction(state, {
      type: 'TAKE_PATCH',
      patchChoice: 0,
      placement: { row: 0, col: 0, rotation: 0, flipped: false },
    });

    expect(newState).not.toBeNull();
    // Buttons = start - cost + any button income from crossing income spaces
    expect(newState!.players[0].buttons).toBeGreaterThanOrEqual(20 - patch.buttonCost);
    expect(newState!.players[0].timePosition).toBe(
      Math.min(patch.timeCost, TIME_BOARD_SPACES - 1)
    );
    expect(newState!.players[0].totalButtonIncome).toBe(patch.buttonIncome);
    expect(newState!.patchCircle.length).toBe(32);
  });

  it('rejects if cannot afford', () => {
    const state = createTestGame();
    state.players[0].buttons = 0;
    const result = applyAction(state, {
      type: 'TAKE_PATCH',
      patchChoice: 0,
      placement: { row: 0, col: 0, rotation: 0, flipped: false },
    });
    // May or may not be null depending on the patch cost — if cost is 0 it could succeed
    if (getAvailablePatches(state)[0].buttonCost > 0) {
      expect(result).toBeNull();
    }
  });

  it('rejects invalid placement', () => {
    const state = createTestGame();
    state.players[0].buttons = 20;
    const result = applyAction(state, {
      type: 'TAKE_PATCH',
      patchChoice: 0,
      placement: { row: 8, col: 8, rotation: 0, flipped: false },
    });
    // Most patches are larger than 1x1, so this would be out of bounds
    const patch = getAvailablePatches(state)[0];
    const shapeRows = patch.shape.length;
    const shapeCols = patch.shape[0].length;
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
