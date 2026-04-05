import { useEffect, useRef, useCallback } from 'react';
import PartySocket from 'partysocket';
import type { ClientMessage, ServerMessage } from '../../party/protocol';

const PARTY_HOST = import.meta.env.VITE_PARTY_HOST || 'localhost:1999';

interface UsePartySocketOptions {
  roomId: string | null;
  onMessage: (msg: ServerMessage) => void;
  onOpen?: () => void;
}

export function usePartySocket({ roomId, onMessage, onOpen }: UsePartySocketOptions) {
  const socketRef = useRef<PartySocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  onMessageRef.current = onMessage;
  onOpenRef.current = onOpen;

  useEffect(() => {
    if (!roomId) return;

    const socket = new PartySocket({
      host: PARTY_HOST,
      room: roomId,
    });

    socket.addEventListener('open', () => {
      onOpenRef.current?.();
    });

    socket.addEventListener('message', (event) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data);
        onMessageRef.current(msg);
      } catch {
        // ignore malformed messages
      }
    });

    socketRef.current = socket;

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [roomId]);

  const send = useCallback((msg: ClientMessage) => {
    const socket = socketRef.current;
    if (!socket) return;

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(msg));
    } else {
      // Queue the message until the socket opens
      const handler = () => {
        socket.send(JSON.stringify(msg));
        socket.removeEventListener('open', handler);
      };
      socket.addEventListener('open', handler);
    }
  }, []);

  return { send };
}
