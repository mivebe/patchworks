import { create } from 'zustand';
import type { GameState, GameAction, Patch, Shape } from '../engine/types';
import type { RoomState } from '../../party/protocol';
import {
  getAvailablePatches,
  canAdvance,
  advanceReward,
} from '../engine/gameEngine';
import { transformShape } from '../engine/patchUtils';
import { calculateScore } from '../engine/scoring';

export type ActiveTab = 'myBoard' | 'opponent';
export type ConnectionPhase = 'lobby' | 'waiting' | 'coinFlip' | 'playing' | 'finished';

interface GameStore {
  // Connection state
  connectionPhase: ConnectionPhase;
  roomId: string | null;
  playerName: string;
  myPlayerId: 0 | 1 | null;
  roomState: RoomState | null;
  error: string | null;

  // Game state (received from server)
  gameState: GameState | null;

  // UI state
  activeTab: ActiveTab;
  selectedPatchChoice: number | null;
  currentRotation: number;
  isFlipped: boolean;
  hoverCell: { row: number; col: number } | null;
  pendingPlacement: { row: number; col: number } | null;

  // Send action callback (set by the component that owns the socket)
  _sendAction: ((action: GameAction) => void) | null;
  setSendAction: (fn: (action: GameAction) => void) => void;

  // Derived helpers
  getAvailablePatches: () => Patch[];
  getSelectedPatch: () => Patch | null;
  getTransformedShape: () => Shape | null;
  canAdvance: () => boolean;
  advanceReward: () => number;
  getScore: (playerId: 0 | 1) => number;
  isMyTurn: () => boolean;

  // Lobby actions
  setPlayerName: (name: string) => void;
  createRoom: () => void;
  joinRoom: (roomId: string) => void;
  returnToLobby: () => void;

  // Server state handlers
  handleAssigned: (playerId: 0 | 1) => void;
  handleRoomState: (state: RoomState) => void;
  handleGameState: (gameState: GameState) => void;
  handlePlayerJoined: (playerName: string, playerId: 0 | 1) => void;
  handleError: (message: string) => void;
  finishCoinFlip: () => void;

  // UI actions
  setActiveTab: (tab: ActiveTab) => void;
  selectPatch: (choice: number | null) => void;
  rotate: () => void;
  flip: () => void;
  setHoverCell: (cell: { row: number; col: number } | null) => void;
  setPendingPlacement: (cell: { row: number; col: number } | null) => void;
  confirmPlacement: () => void;

  // Game actions (send to server)
  advance: () => void;
  placePatch: (row: number, col: number) => void;
  placeSpecialPatch: (row: number, col: number) => void;
}

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Connection state
  connectionPhase: 'lobby',
  roomId: null,
  playerName: localStorage.getItem('patchwork_playerName') || '',
  myPlayerId: null,
  roomState: null,
  error: null,

  // Game state
  gameState: null,

  // UI state
  activeTab: 'myBoard',
  selectedPatchChoice: null,
  currentRotation: 0,
  isFlipped: false,
  hoverCell: null,
  pendingPlacement: null,

  _sendAction: null,
  setSendAction: (fn) => set({ _sendAction: fn }),

  // Derived helpers
  getAvailablePatches: () => {
    const { gameState } = get();
    if (!gameState) return [];
    return getAvailablePatches(gameState);
  },

  getSelectedPatch: () => {
    const { gameState, selectedPatchChoice } = get();
    if (!gameState || selectedPatchChoice === null) return null;
    const patches = getAvailablePatches(gameState);
    return patches[selectedPatchChoice] ?? null;
  },

  getTransformedShape: () => {
    const patch = get().getSelectedPatch();
    if (!patch) return null;
    const { currentRotation, isFlipped } = get();
    return transformShape(patch.shape, currentRotation, isFlipped);
  },

  canAdvance: () => {
    const { gameState } = get();
    if (!gameState || gameState.phase !== 'playing') return false;
    if (!get().isMyTurn()) return false;
    return canAdvance(gameState);
  },

  advanceReward: () => {
    const { gameState } = get();
    if (!gameState) return 0;
    return advanceReward(gameState);
  },

  getScore: (playerId: 0 | 1) => {
    const { gameState } = get();
    if (!gameState) return 0;
    return calculateScore(gameState.players[playerId]);
  },

  isMyTurn: () => {
    const { gameState, myPlayerId } = get();
    if (!gameState || myPlayerId === null) return false;
    return gameState.activePlayerId === myPlayerId;
  },

  // Lobby actions
  setPlayerName: (name) => {
    localStorage.setItem('patchwork_playerName', name);
    set({ playerName: name });
  },

  createRoom: () => {
    const roomId = generateRoomId();
    set({ roomId, connectionPhase: 'waiting', error: null });
  },

  joinRoom: (roomId) => {
    set({ roomId: roomId.toUpperCase(), connectionPhase: 'waiting', error: null });
  },

  returnToLobby: () => set({
    connectionPhase: 'lobby',
    roomId: null,
    myPlayerId: null,
    roomState: null,
    gameState: null,
    error: null,
    selectedPatchChoice: null,
    activeTab: 'myBoard',
  }),

  // Server state handlers
  handleAssigned: (playerId) => {
    set({ myPlayerId: playerId });
  },

  handleRoomState: (state) => {
    const { connectionPhase: current } = get();
    // Don't overwrite coinFlip phase — let the animation finish
    if (current === 'coinFlip') {
      set({ roomState: state });
      return;
    }

    const phase: ConnectionPhase = state.phase === 'waiting'
      ? 'waiting'
      : state.phase === 'finished'
        ? 'finished'
        : 'playing';

    set({ roomState: state, connectionPhase: phase });

    if (state.gameState) {
      set({ gameState: state.gameState });
    }
  },

  handleGameState: (gameState) => {
    const { connectionPhase, myPlayerId } = get();
    // First game state received (from waiting) → show coin flip
    const isFirstGameState = connectionPhase === 'waiting';
    const isMyTurn = myPlayerId !== null && gameState.activePlayerId === myPlayerId;
    set({
      gameState,
      connectionPhase: gameState.phase === 'gameOver'
        ? 'finished'
        : isFirstGameState
          ? 'coinFlip'
          : 'playing',
      selectedPatchChoice: null,
      currentRotation: 0,
      isFlipped: false,
      hoverCell: null,
      pendingPlacement: null,
      activeTab: isMyTurn ? 'myBoard' : 'opponent',
    });
  },

  handlePlayerJoined: () => {
    // Player joined notification — playerId is handled by ASSIGNED message
  },

  handleError: (message) => set({ error: message }),

  finishCoinFlip: () => set({ connectionPhase: 'playing' }),

  // UI actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  selectPatch: (choice) => set({
    selectedPatchChoice: choice,
    currentRotation: 0,
    isFlipped: false,
    hoverCell: null,
    pendingPlacement: null,
  }),

  rotate: () => set({ currentRotation: (get().currentRotation + 1) % 4, pendingPlacement: null }),
  flip: () => set({ isFlipped: !get().isFlipped, pendingPlacement: null }),
  setHoverCell: (cell) => set({ hoverCell: cell }),
  setPendingPlacement: (cell) => set({ pendingPlacement: cell }),
  confirmPlacement: () => {
    const { pendingPlacement, _sendAction, selectedPatchChoice, currentRotation, isFlipped } = get();
    if (!_sendAction || pendingPlacement === null || selectedPatchChoice === null || !get().isMyTurn()) return;
    _sendAction({
      type: 'TAKE_PATCH',
      patchChoice: selectedPatchChoice,
      placement: { row: pendingPlacement.row, col: pendingPlacement.col, rotation: currentRotation, flipped: isFlipped },
    });
    set({ pendingPlacement: null });
  },

  // Game actions — send to server
  advance: () => {
    const { _sendAction } = get();
    if (!_sendAction || !get().isMyTurn()) return;
    _sendAction({ type: 'ADVANCE' });
  },

  placePatch: (row, col) => {
    const { _sendAction, selectedPatchChoice, currentRotation, isFlipped } = get();
    if (!_sendAction || selectedPatchChoice === null || !get().isMyTurn()) return;
    _sendAction({
      type: 'TAKE_PATCH',
      patchChoice: selectedPatchChoice,
      placement: { row, col, rotation: currentRotation, flipped: isFlipped },
    });
  },

  placeSpecialPatch: (row, col) => {
    const { _sendAction } = get();
    if (!_sendAction || !get().isMyTurn()) return;
    _sendAction({ type: 'PLACE_SPECIAL_PATCH', row, col });
  },
}));
