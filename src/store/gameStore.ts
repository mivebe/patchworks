import { create } from 'zustand';
import type { GameState, GameAction, Tile, Shape } from '../engine/types';
import type { RoomState } from '../../party/protocol';
import {
  getAvailableTiles,
  canAdvance,
  advanceReward,
} from '../engine/gameEngine';
import { transformShape } from '../engine/tileUtils';
import { calculateScore } from '../engine/scoring';

export type ActiveTab = 'myBoard' | 'opponent';
export type ConnectionPhase = 'lobby' | 'waiting' | 'coinFlip' | 'playing' | 'finished';

// ─── Session persistence ───

const SESSION_KEY = 'tessera_session';

interface SessionData {
  roomId: string;
  reconnectToken: string;
  playerName: string;
}

function saveSession(data: SessionData) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

function loadSession(): SessionData | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

// ─── Store ───

const savedSession = loadSession();

interface GameStore {
  // Connection state
  connectionPhase: ConnectionPhase;
  roomId: string | null;
  playerName: string;
  myPlayerId: 0 | 1 | null;
  roomState: RoomState | null;
  error: string | null;
  reconnectToken: string;
  opponentDisconnected: boolean;

  // Game state (received from server)
  gameState: GameState | null;

  // UI state
  activeTab: ActiveTab;
  selectedTileChoice: number | null;
  currentRotation: number;
  isFlipped: boolean;
  hoverCell: { row: number; col: number } | null;
  pendingPlacement: { row: number; col: number } | null;

  // Send action callback (set by the component that owns the socket)
  _sendAction: ((action: GameAction) => void) | null;
  setSendAction: (fn: (action: GameAction) => void) => void;

  // Derived helpers
  getAvailableTiles: () => Tile[];
  getSelectedTile: () => Tile | null;
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
  handlePlayerDisconnected: (playerId: 0 | 1) => void;
  handlePlayerReconnected: (playerId: 0 | 1) => void;
  handleError: (message: string) => void;
  finishCoinFlip: () => void;

  // UI actions
  setActiveTab: (tab: ActiveTab) => void;
  selectTile: (choice: number | null) => void;
  rotate: () => void;
  flip: () => void;
  setHoverCell: (cell: { row: number; col: number } | null) => void;
  setPendingPlacement: (cell: { row: number; col: number } | null) => void;
  confirmPlacement: () => void;

  // Game actions (send to server)
  advance: () => void;
  placeTile: (row: number, col: number) => void;
  placeSpecialTile: (row: number, col: number) => void;
}

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Connection state — restore from session if available
  connectionPhase: savedSession ? 'waiting' : 'lobby',
  roomId: savedSession?.roomId ?? null,
  playerName: savedSession?.playerName ?? localStorage.getItem('tessera_playerName') ?? '',
  myPlayerId: null,
  roomState: null,
  error: null,
  reconnectToken: savedSession?.reconnectToken ?? crypto.randomUUID(),
  opponentDisconnected: false,

  // Game state
  gameState: null,

  // UI state
  activeTab: 'myBoard',
  selectedTileChoice: null,
  currentRotation: 0,
  isFlipped: false,
  hoverCell: null,
  pendingPlacement: null,

  _sendAction: null,
  setSendAction: (fn) => set({ _sendAction: fn }),

  // Derived helpers
  getAvailableTiles: () => {
    const { gameState } = get();
    if (!gameState) return [];
    return getAvailableTiles(gameState);
  },

  getSelectedTile: () => {
    const { gameState, selectedTileChoice } = get();
    if (!gameState || selectedTileChoice === null) return null;
    const tiles = getAvailableTiles(gameState);
    return tiles[selectedTileChoice] ?? null;
  },

  getTransformedShape: () => {
    const tile = get().getSelectedTile();
    if (!tile) return null;
    const { currentRotation, isFlipped } = get();
    return transformShape(tile.shape, currentRotation, isFlipped);
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
    localStorage.setItem('tessera_playerName', name);
    set({ playerName: name });
  },

  createRoom: () => {
    const { reconnectToken, playerName } = get();
    const roomId = generateRoomId();
    saveSession({ roomId, reconnectToken, playerName });
    set({ roomId, connectionPhase: 'waiting', error: null });
  },

  joinRoom: (roomId) => {
    const { reconnectToken, playerName } = get();
    const upper = roomId.toUpperCase();
    saveSession({ roomId: upper, reconnectToken, playerName });
    set({ roomId: upper, connectionPhase: 'waiting', error: null });
  },

  returnToLobby: () => {
    clearSession();
    set({
      connectionPhase: 'lobby',
      roomId: null,
      myPlayerId: null,
      roomState: null,
      gameState: null,
      error: null,
      selectedTileChoice: null,
      activeTab: 'myBoard',
      opponentDisconnected: false,
      reconnectToken: crypto.randomUUID(),
    });
  },

  // Server state handlers
  handleAssigned: (playerId) => {
    set({ myPlayerId: playerId });
  },

  handleRoomState: (state) => {
    const { connectionPhase: current } = get();
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
    const isFirstGameState = connectionPhase === 'waiting';
    const isMyTurn = myPlayerId !== null && gameState.activePlayerId === myPlayerId;
    set({
      gameState,
      connectionPhase: gameState.phase === 'gameOver'
        ? 'finished'
        : isFirstGameState
          ? 'coinFlip'
          : 'playing',
      selectedTileChoice: null,
      currentRotation: 0,
      isFlipped: false,
      hoverCell: null,
      pendingPlacement: null,
      activeTab: isMyTurn ? 'myBoard' : 'opponent',
    });
  },

  handlePlayerJoined: () => {},

  handlePlayerDisconnected: (playerId) => {
    const { myPlayerId } = get();
    if (playerId !== myPlayerId) {
      set({ opponentDisconnected: true });
    }
  },

  handlePlayerReconnected: (playerId) => {
    const { myPlayerId } = get();
    if (playerId !== myPlayerId) {
      set({ opponentDisconnected: false });
    }
  },

  handleError: (message) => set({ error: message }),

  finishCoinFlip: () => set({ connectionPhase: 'playing' }),

  // UI actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  selectTile: (choice) => set({
    selectedTileChoice: choice,
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
    const { pendingPlacement, _sendAction, selectedTileChoice, currentRotation, isFlipped } = get();
    if (!_sendAction || pendingPlacement === null || selectedTileChoice === null || !get().isMyTurn()) return;
    _sendAction({
      type: 'TAKE_TILE',
      tileChoice: selectedTileChoice,
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

  placeTile: (row, col) => {
    const { _sendAction, selectedTileChoice, currentRotation, isFlipped } = get();
    if (!_sendAction || selectedTileChoice === null || !get().isMyTurn()) return;
    _sendAction({
      type: 'TAKE_TILE',
      tileChoice: selectedTileChoice,
      placement: { row, col, rotation: currentRotation, flipped: isFlipped },
    });
  },

  placeSpecialTile: (row, col) => {
    const { _sendAction } = get();
    if (!_sendAction || !get().isMyTurn()) return;
    _sendAction({ type: 'PLACE_SPECIAL_TILE', row, col });
  },
}));
