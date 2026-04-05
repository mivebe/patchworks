import type * as Party from 'partykit/server';
import type { ClientMessage, ServerMessage, RoomState } from './protocol';
import type { GameState } from '../src/engine/types';
import { initGame, applyAction } from '../src/engine/gameEngine';

interface PlayerConnection {
  connectionId: string;
  name: string;
  playerId: 0 | 1;
}

export default class PatchworkServer implements Party.Server {
  players: PlayerConnection[] = [];
  gameState: GameState | null = null;

  constructor(readonly room: Party.Room) {}

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
      })),
      gameState: this.gameState,
    };
  }

  send(connection: Party.Connection, msg: ServerMessage) {
    connection.send(JSON.stringify(msg));
  }

  broadcast(msg: ServerMessage) {
    this.room.broadcast(JSON.stringify(msg));
  }

  onConnect(connection: Party.Connection) {
    // Send current room state so reconnecting clients catch up
    this.send(connection, { type: 'ROOM_STATE', state: this.getRoomState() });
  }

  onMessage(message: string, sender: Party.Connection) {
    let parsed: ClientMessage;
    try {
      parsed = JSON.parse(message as string);
    } catch {
      this.send(sender, { type: 'ERROR', message: 'Invalid message format' });
      return;
    }

    switch (parsed.type) {
      case 'JOIN': {
        // Check if this connection is already a player (reconnect)
        const existing = this.players.find((p) => p.connectionId === sender.id);
        if (existing) {
          existing.name = parsed.playerName;
          // Re-send their assignment so they recover their playerId
          this.send(sender, { type: 'ASSIGNED', playerId: existing.playerId });
          this.broadcast({ type: 'ROOM_STATE', state: this.getRoomState() });
          if (this.gameState) {
            this.send(sender, { type: 'GAME_STATE', gameState: this.gameState });
          }
          return;
        }

        if (this.players.length >= 2) {
          this.send(sender, { type: 'ERROR', message: 'Room is full' });
          return;
        }

        const playerId = (this.players.length === 0 ? 0 : 1) as 0 | 1;
        this.players.push({
          connectionId: sender.id,
          name: parsed.playerName,
          playerId,
        });

        // Tell this client their assigned playerId
        this.send(sender, { type: 'ASSIGNED', playerId });

        this.broadcast({
          type: 'PLAYER_JOINED',
          playerName: parsed.playerName,
          playerId,
        });

        // Start the game when both players have joined
        if (this.players.length === 2) {
          this.gameState = initGame(this.players[0].name, this.players[1].name);
          this.broadcast({ type: 'GAME_STATE', gameState: this.gameState });
        }

        this.broadcast({ type: 'ROOM_STATE', state: this.getRoomState() });
        break;
      }

      case 'ACTION': {
        if (!this.gameState) {
          this.send(sender, { type: 'ERROR', message: 'Game has not started' });
          return;
        }

        // Verify it's this player's turn
        const player = this.players.find((p) => p.connectionId === sender.id);
        if (!player) {
          this.send(sender, { type: 'ERROR', message: 'You are not in this game' });
          return;
        }

        if (player.playerId !== this.gameState.activePlayerId) {
          this.send(sender, { type: 'ERROR', message: 'Not your turn' });
          return;
        }

        // Validate and apply the action
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
    // Don't remove the player — allow reconnection.
    // Just notify others.
    const player = this.players.find((p) => p.connectionId === connection.id);
    if (player) {
      this.broadcast({
        type: 'ROOM_STATE',
        state: this.getRoomState(),
      });
    }
  }
}

PatchworkServer satisfies Party.Worker;
