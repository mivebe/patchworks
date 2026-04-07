import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { usePartySocket } from '../../hooks/usePartySocket';
import type { ServerMessage } from '../../../party/protocol';
import type { GameAction } from '../../engine/types';

export function GameConnection() {
  const roomId = useGameStore((s) => s.roomId);
  const playerName = useGameStore((s) => s.playerName);
  const setSendAction = useGameStore((s) => s.setSendAction);
  const handleAssigned = useGameStore((s) => s.handleAssigned);
  const handleRoomState = useGameStore((s) => s.handleRoomState);
  const handleGameState = useGameStore((s) => s.handleGameState);
  const handlePlayerJoined = useGameStore((s) => s.handlePlayerJoined);
  const handleError = useGameStore((s) => s.handleError);
  const joinedRef = useRef(false);
  const sendFnRef = useRef<((msg: { type: 'JOIN'; playerName: string }) => void) | null>(null);

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
      case 'ERROR':
        handleError(msg.message);
        break;
    }
  }, [handleAssigned, handleRoomState, handleGameState, handlePlayerJoined, handleError]);

  const onOpen = useCallback(() => {
    if (playerName && !joinedRef.current) {
      joinedRef.current = true;
      sendFnRef.current?.({ type: 'JOIN', playerName });
    }
  }, [playerName]);

  const { send } = usePartySocket({ roomId, onMessage, onOpen });

  // Keep send ref up to date via effect (not during render)
  useEffect(() => {
    sendFnRef.current = send;
  }, [send]);

  // Reset joined flag when room changes
  useEffect(() => {
    joinedRef.current = false;
  }, [roomId]);

  // Provide the send function to the store for game actions
  useEffect(() => {
    const sendAction = (action: GameAction) => {
      send({ type: 'ACTION', action });
    };
    setSendAction(sendAction);
  }, [send, setSendAction]);

  return null;
}
