import type { GameState, GameAction } from '../src/engine/types';

/** Messages sent from client to server. */
export type ClientMessage =
  | { type: 'JOIN'; playerName: string }
  | { type: 'ACTION'; action: GameAction };

/** Messages sent from server to client. */
export type ServerMessage =
  | { type: 'ROOM_STATE'; state: RoomState }
  | { type: 'GAME_STATE'; gameState: GameState }
  | { type: 'ERROR'; message: string }
  | { type: 'PLAYER_JOINED'; playerName: string; playerId: 0 | 1 }
  | { type: 'ASSIGNED'; playerId: 0 | 1 };

export interface RoomState {
  phase: 'waiting' | 'playing' | 'finished';
  players: { id: string; name: string; playerId: 0 | 1 }[];
  gameState: GameState | null;
}

/** A room listing shown in the lobby. */
export interface OpenRoom {
  roomId: string;
  hostName: string;
  createdAt: number;
}

/** Messages for the lobby room. */
export type LobbyServerMessage =
  | { type: 'ROOM_LIST'; rooms: OpenRoom[] };

export type LobbyClientMessage =
  | { type: 'SUBSCRIBE' };
