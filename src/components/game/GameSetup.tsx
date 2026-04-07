import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useLobbySocket } from '../../hooks/useLobbySocket';

export function GameSetup() {
  const storedName = useGameStore((s) => s.playerName);
  const [name, setName] = useState(storedName);
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'join'>('menu');
  const createRoom = useGameStore((s) => s.createRoom);
  const joinRoom = useGameStore((s) => s.joinRoom);
  const setPlayerName = useGameStore((s) => s.setPlayerName);

  const openRooms = useLobbySocket(true);
  const hasName = name.trim().length > 0;

  const handleCreate = () => {
    if (!hasName) return;
    setPlayerName(name.trim());
    createRoom();
  };

  const handleJoin = () => {
    if (!hasName || !joinCode.trim()) return;
    setPlayerName(name.trim());
    joinRoom(joinCode.trim());
  };

  const handleJoinRoom = (roomId: string) => {
    if (!hasName) return;
    setPlayerName(name.trim());
    joinRoom(roomId);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-xl p-4 md:p-8 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Patchwork</h1>
        <p className="text-gray-400 text-center mb-8">Online multiplayer</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {mode === 'menu' ? (
            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={handleCreate}
                disabled={!hasName}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-colors"
              >
                Create Room
              </button>
              <button
                onClick={() => setMode('join')}
                disabled={!hasName}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-colors"
              >
                Join with Code
              </button>
            </div>
          ) : (
            <div className="space-y-3 mt-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Room Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AB12CD"
                  maxLength={6}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-center text-2xl tracking-widest font-mono"
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                />
              </div>
              <button
                onClick={handleJoin}
                disabled={!joinCode.trim() || !hasName}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-colors"
              >
                Join
              </button>
              <button
                onClick={() => setMode('menu')}
                className="w-full py-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                Back
              </button>
            </div>
          )}

          {/* Open rooms */}
          <div className="mt-6 border-t border-gray-700 pt-4">
            <h3 className="text-sm text-gray-400 mb-3">
              Open Rooms {openRooms.length > 0 && `(${openRooms.length})`}
            </h3>
            {openRooms.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-3">
                No open rooms — create one!
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {openRooms.map((room) => (
                  <div
                    key={room.roomId}
                    className="flex items-center justify-between bg-gray-700/50 rounded-lg px-4 py-3"
                  >
                    <div>
                      <span className="text-white font-medium">{room.hostName}</span>
                      <span className="text-gray-500 text-xs ml-2 font-mono">{room.roomId}</span>
                    </div>
                    <button
                      onClick={() => handleJoinRoom(room.roomId)}
                      disabled={!hasName}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
