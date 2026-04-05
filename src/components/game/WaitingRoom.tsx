import { useGameStore } from '../../store/gameStore';

export function WaitingRoom() {
  const roomId = useGameStore((s) => s.roomId);
  const roomState = useGameStore((s) => s.roomState);
  const returnToLobby = useGameStore((s) => s.returnToLobby);
  const playerCount = roomState?.players.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md shadow-2xl text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Waiting for opponent</h2>
        <p className="text-gray-400 mb-6">Share this room code with your opponent:</p>

        <div className="bg-gray-700 rounded-lg py-4 px-6 mb-6">
          <span className="text-4xl font-mono font-bold text-white tracking-[0.3em]">
            {roomId}
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-3 h-3 rounded-full ${playerCount >= 1 ? 'bg-green-500' : 'bg-gray-600'}`} />
          <span className="text-gray-300">Player 1</span>
          <span className="text-gray-500 mx-2">vs</span>
          <div className={`w-3 h-3 rounded-full ${playerCount >= 2 ? 'bg-green-500' : 'bg-gray-600 animate-pulse'}`} />
          <span className="text-gray-300">Player 2</span>
        </div>

        {playerCount < 2 && (
          <div className="text-gray-500 text-sm mb-4">
            Waiting for player 2 to join...
          </div>
        )}

        <button
          onClick={returnToLobby}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}
