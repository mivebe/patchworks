import { useEffect, useRef, useState } from 'react';
import PartySocket from 'partysocket';
import type { OpenRoom, LobbyServerMessage } from '../../party/protocol';

const PARTY_HOST = import.meta.env.VITE_PARTY_HOST || 'localhost:1999';
const LOBBY_ROOM_ID = '__LOBBY__';

export function useLobbySocket(active: boolean) {
  const [rooms, setRooms] = useState<OpenRoom[]>([]);
  const socketRef = useRef<PartySocket | null>(null);

  useEffect(() => {
    if (!active) {
      socketRef.current?.close();
      socketRef.current = null;
      return;
    }

    const socket = new PartySocket({
      host: PARTY_HOST,
      room: LOBBY_ROOM_ID,
    });

    socket.addEventListener('message', (event) => {
      try {
        const msg: LobbyServerMessage = JSON.parse(event.data);
        if (msg.type === 'ROOM_LIST') {
          setRooms(msg.rooms);
        }
      } catch {
        // ignore
      }
    });

    socketRef.current = socket;

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [active]);

  return rooms;
}
