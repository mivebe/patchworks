import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { usePartySocket } from '../../hooks/usePartySocket';
import type { ServerMessage } from '../../../party/protocol';
import type { GameAction } from '../../engine/types';

export function GameConnection() {
  const roomId = useGameStore((s) => s.roomId);
  const playerName = useGameStore((s) => s.playerName);
  const reconnectToken = useGameStore((s) => s.reconnectToken);
  const setSendAction = useGameStore((s) => s.setSendAction);
  const handleAssigned = useGameStore((s) => s.handleAssigned);
  const handleRoomState = useGameStore((s) => s.handleRoomState);
  const handleGameState = useGameStore((s) => s.handleGameState);
  const handlePlayerJoined = useGameStore((s) => s.handlePlayerJoined);
  const handlePlayerDisconnected = useGameStore((s) => s.handlePlayerDisconnected);
  const handlePlayerReconnected = useGameStore((s) => s.handlePlayerReconnected);
  const handleError = useGameStore((s) => s.handleError);
  const sendFnRef = useRef<((msg: { type: 'JOIN'; playerName: string; reconnectToken: string }) => void) | null>(null);

  const onMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'ASSIGNED':
        handleAssigned(msg.playerId);
        break;
      case 'ROOM_STATE':
        handleRoomState(msg.state);
        break;
      case 'GAME_STATE':
        handleGameState(msg.gameState);
        break;
      case 'PLAYER_JOINED':
        handlePlayerJoined(msg.playerName, msg.playerId);
        break;
      case 'PLAYER_DISCONNECTED':
        handlePlayerDisconnected(msg.playerId);
        break;
      case 'PLAYER_RECONNECTED':
        handlePlayerReconnected(msg.playerId);
        break;
      case 'ERROR':
        handleError(msg.message);
        break;
    }
  }, [handleAssigned, handleRoomState, handleGameState, handlePlayerJoined, handlePlayerDisconnected, handlePlayerReconnected, handleError]);

  // Send JOIN on every socket open — server handles duplicates idempotently
  const onOpen = useCallback(() => {
    if (playerName) {
      sendFnRef.current?.({ type: 'JOIN', playerName, reconnectToken });
    }
  }, [playerName, reconnectToken]);

  const { send } = usePartySocket({ roomId, onMessage, onOpen });

  // Keep send ref up to date via effect (not during render)
  useEffect(() => {
    sendFnRef.current = send;
  }, [send]);

  // Provide the send function to the store for game actions
  useEffect(() => {
    const sendAction = (action: GameAction) => {
      send({ type: 'ACTION', action });
    };
    setSendAction(sendAction);
  }, [send, setSendAction]);

  return null;
}
