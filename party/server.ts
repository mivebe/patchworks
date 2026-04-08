import type * as Party from 'partykit/server';
import type {
  ClientMessage,
  ServerMessage,
  RoomState,
  LobbyServerMessage,
  OpenRoom,
} from './protocol';
import type { GameState } from '../src/engine/types';
import { initGame, applyAction } from '../src/engine/gameEngine';

const LOBBY_ROOM_ID = '__LOBBY__';

interface PlayerConnection {
  connectionId: string;
  name: string;
  playerId: 0 | 1;
  reconnectToken: string;
  connected: boolean;
}

export default class PatchworkServer implements Party.Server {
  players: PlayerConnection[] = [];
  gameState: GameState | null = null;

  // Lobby-only state (only used when room.id === LOBBY_ROOM_ID)
  openRooms: Map<string, OpenRoom> = new Map();

  constructor(readonly room: Party.Room) {}

  get isLobby() {
    return this.room.id === LOBBY_ROOM_ID;
  }

  // ─── Lobby methods ───

  broadcastRoomList() {
    const msg: LobbyServerMessage = {
      type: 'ROOM_LIST',
      rooms: Array.from(this.openRooms.values()),
    };
    this.room.broadcast(JSON.stringify(msg));
  }

  async onRequest(req: Party.Request): Promise<Response> {
    // HTTP endpoint used by game rooms to notify the lobby
    if (!this.isLobby) {
      return new Response('Not found', { status: 404 });
    }

    if (req.method === 'POST') {
      const body = await req.json() as
        | { action: 'add'; room: OpenRoom }
        | { action: 'remove'; roomId: string };

      if (body.action === 'add') {
        this.openRooms.set(body.room.roomId, body.room);
      } else if (body.action === 'remove') {
        this.openRooms.delete(body.roomId);
      }

      this.broadcastRoomList();
      return new Response('OK');
    }

    // GET returns current room list
    const rooms = Array.from(this.openRooms.values());
    return new Response(JSON.stringify(rooms), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ─── Common methods ───

  getRoomState(): RoomState {
    return {
      phase: this.gameState
        ? this.gameState.phase === 'gameOver'
          ? 'finished'
          : 'playing'
        : this.players.length < 2
          ? 'waiting'
          : 'playing',
      players: this.players.map((p) => ({
        id: p.connectionId,
        name: p.name,
        playerId: p.playerId,
        connected: p.connected,
      })),
      gameState: this.gameState,
    };
  }

  send(connection: Party.Connection, msg: ServerMessage | LobbyServerMessage) {
    connection.send(JSON.stringify(msg));
  }

  broadcast(msg: ServerMessage) {
    this.room.broadcast(JSON.stringify(msg));
  }

  /** Notify the lobby room that this game room changed status. */
  async notifyLobby(action: 'add' | 'remove') {
    if (this.isLobby) return;
    try {
      const lobby = this.room.context.parties.main.get(LOBBY_ROOM_ID);
      if (action === 'add' && this.players.length === 1) {
        await lobby.fetch('/', {
          method: 'POST',
          body: JSON.stringify({
            action: 'add',
            room: {
              roomId: this.room.id,
              hostName: this.players[0].name,
              createdAt: Date.now(),
            } satisfies OpenRoom,
          }),
        });
      } else if (action === 'remove') {
        await lobby.fetch('/', {
          method: 'POST',
          body: JSON.stringify({ action: 'remove', roomId: this.room.id }),
        });
      }
    } catch {
      // Lobby notification is best-effort
    }
  }

  // ─── Game room handlers ───

  onConnect(connection: Party.Connection) {
    if (this.isLobby) {
      // Send current room list to new lobby subscriber
      this.send(connection, {
        type: 'ROOM_LIST',
        rooms: Array.from(this.openRooms.values()),
      });
      return;
    }

    // Send current room state so reconnecting clients catch up
    this.send(connection, { type: 'ROOM_STATE', state: this.getRoomState() });
  }

  onMessage(message: string, sender: Party.Connection) {
    if (this.isLobby) {
      // Lobby clients just subscribe — no messages needed
      return;
    }

    let parsed: ClientMessage;
    try {
      parsed = JSON.parse(message as string);
    } catch {
      this.send(sender, { type: 'ERROR', message: 'Invalid message format' });
      return;
    }

    switch (parsed.type) {
      case 'JOIN': {
        // 1. Same connection ID (PartySocket auto-reconnect, no page reload)
        const existingByConn = this.players.find((p) => p.connectionId === sender.id);
        if (existingByConn) {
          existingByConn.name = parsed.playerName;
          existingByConn.connected = true;
          this.send(sender, { type: 'ASSIGNED', playerId: existingByConn.playerId });
          this.broadcast({ type: 'PLAYER_RECONNECTED', playerId: existingByConn.playerId });
          this.broadcast({ type: 'ROOM_STATE', state: this.getRoomState() });
          if (this.gameState) {
            this.send(sender, { type: 'GAME_STATE', gameState: this.gameState });
          }
          return;
        }

        // 2. Same reconnect token (page reload — new connection ID)
        const existingByToken = this.players.find((p) => p.reconnectToken === parsed.reconnectToken);
        if (existingByToken) {
          existingByToken.connectionId = sender.id;
          existingByToken.name = parsed.playerName;
          existingByToken.connected = true;
          this.send(sender, { type: 'ASSIGNED', playerId: existingByToken.playerId });
          this.broadcast({ type: 'PLAYER_RECONNECTED', playerId: existingByToken.playerId });
          this.broadcast({ type: 'ROOM_STATE', state: this.getRoomState() });
          if (this.gameState) {
            this.send(sender, { type: 'GAME_STATE', gameState: this.gameState });
          }
          return;
        }

        // 3. New player
        if (this.players.length >= 2) {
          this.send(sender, { type: 'ERROR', message: 'Room is full' });
          return;
        }

        const playerId = (this.players.length === 0 ? 0 : 1) as 0 | 1;
        this.players.push({
          connectionId: sender.id,
          name: parsed.playerName,
          playerId,
          reconnectToken: parsed.reconnectToken,
          connected: true,
        });

        this.send(sender, { type: 'ASSIGNED', playerId });

        this.broadcast({
          type: 'PLAYER_JOINED',
          playerName: parsed.playerName,
          playerId,
        });

        // First player joined — notify lobby that room is open
        if (this.players.length === 1) {
          this.notifyLobby('add');
        }

        // Start the game when both players have joined
        if (this.players.length === 2) {
          this.gameState = initGame(this.players[0].name, this.players[1].name);
          this.broadcast({ type: 'GAME_STATE', gameState: this.gameState });
          // Room is full — remove from lobby
          this.notifyLobby('remove');
        }

        this.broadcast({ type: 'ROOM_STATE', state: this.getRoomState() });
        break;
      }

      case 'ACTION': {
        if (!this.gameState) {
          this.send(sender, { type: 'ERROR', message: 'Game has not started' });
          return;
        }

        const player = this.players.find((p) => p.connectionId === sender.id);
        if (!player) {
          this.send(sender, { type: 'ERROR', message: 'You are not in this game' });
          return;
        }

        if (player.playerId !== this.gameState.activePlayerId) {
          this.send(sender, { type: 'ERROR', message: 'Not your turn' });
          return;
        }

        const newState = applyAction(this.gameState, parsed.action);
        if (!newState) {
          this.send(sender, { type: 'ERROR', message: 'Invalid action' });
          return;
        }

        this.gameState = newState;
        this.broadcast({ type: 'GAME_STATE', gameState: this.gameState });
        break;
      }
    }
  }

  onClose(connection: Party.Connection) {
    if (this.isLobby) return;

    const player = this.players.find((p) => p.connectionId === connection.id);
    if (player) {
      player.connected = false;
      this.broadcast({ type: 'PLAYER_DISCONNECTED', playerId: player.playerId });
      this.broadcast({ type: 'ROOM_STATE', state: this.getRoomState() });
    }
  }
}

PatchworkServer satisfies Party.Worker;
