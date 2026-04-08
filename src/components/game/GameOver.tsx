import { useGameStore } from '../../store/gameStore';
import { calculateScore } from '../../engine/scoring';
import { countEmptySpaces } from '../../engine/patchUtils';
import { playerTheme } from '../../theme';

export function GameOver() {
  const gameState = useGameStore((s) => s.gameState);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const returnToLobby = useGameStore((s) => s.returnToLobby);

  if (!gameState || gameState.phase !== 'gameOver') return null;

  const scores = gameState.players.map((p) => ({
    player: p,
    score: calculateScore(p),
    empty: countEmptySpaces(p.quilt),
  }));

  const winner =
    scores[0].score > scores[1].score
      ? 0
      : scores[1].score > scores[0].score
        ? 1
        : gameState.firstToFinish;

  const iWon = winner === myPlayerId;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-800 rounded-xl p-4 md:p-8 w-full max-w-lg shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Game Over</h2>
        <p className="text-center mb-6 text-lg">
          {iWon ? (
            <span className="text-yellow-400 font-bold">You win!</span>
          ) : winner === null ? (
            <span className="text-gray-300">It's a draw!</span>
          ) : (
            <span className="text-gray-400">You lost.</span>
          )}
        </p>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {scores.map(({ player, score, empty }, i) => (
            <div
              key={i}
              className={`rounded-lg p-4 ${
                winner === i ? 'bg-yellow-600/20 ring-2 ring-yellow-400' : 'bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-3 h-3 rounded-full ${playerTheme(i as 0 | 1).dot}`} />
                <span className="text-white font-bold">
                  {player.name}
                  {i === myPlayerId && ' (You)'}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Buttons</span>
                  <span className="text-white">+{player.buttons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Empty ({empty})</span>
                  <span className="text-red-400">-{empty * 2}</span>
                </div>
                {player.hasSpecialTile && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">7x7 Bonus</span>
                    <span className="text-yellow-400">+7</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-600 pt-1 mt-1">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-white font-bold">{score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={returnToLobby}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
        >
          Back to Lobby
        </button>
      </div>
    </div>
  );
}
