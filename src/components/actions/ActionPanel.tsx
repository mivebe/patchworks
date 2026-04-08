import { useGameStore } from '../../store/gameStore';

export function ActionPanel() {
  const gameState = useGameStore((s) => s.gameState);
  const selectedTileChoice = useGameStore((s) => s.selectedTileChoice);
  const canAdvanceAction = useGameStore((s) => s.canAdvance);
  const advanceRewardValue = useGameStore((s) => s.advanceReward);
  const advance = useGameStore((s) => s.advance);
  const rotate = useGameStore((s) => s.rotate);
  const flip = useGameStore((s) => s.flip);
  const selectTile = useGameStore((s) => s.selectTile);
  const currentRotation = useGameStore((s) => s.currentRotation);
  const isFlipped = useGameStore((s) => s.isFlipped);
  const isMyTurn = useGameStore((s) => s.isMyTurn);
  const pendingPlacement = useGameStore((s) => s.pendingPlacement);
  const confirmPlacement = useGameStore((s) => s.confirmPlacement);

  if (!gameState || gameState.phase === 'gameOver') return null;

  const myTurn = isMyTurn();
  const isPlacingSpecialTile = gameState.phase === 'placingSpecialTile';
  const hasTileSelected = selectedTileChoice !== null;

  if (!myTurn && !isPlacingSpecialTile) {
    return (
      <div className="px-2 py-2 md:px-4 md:py-3 text-gray-500 text-center text-sm">
        Waiting for opponent...
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-2 py-1.5 md:gap-3 md:px-4 md:py-2">
      {isPlacingSpecialTile ? (
        <div className="text-yellow-300 font-medium text-sm md:text-base">
          Tap an empty cell to place your 1x1 tile
        </div>
      ) : (
        <>
          <button
            onClick={advance}
            disabled={!canAdvanceAction()}
            className="px-3 py-1.5 text-sm md:px-4 md:py-2 md:text-base rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium transition-colors"
          >
            Advance 1⏳ (+{advanceRewardValue()}💎)
          </button>

          {hasTileSelected && (
            <>
              <div className="h-6 w-px bg-gray-600 hidden md:block" />
              <button
                onClick={rotate}
                className="px-2 py-1.5 text-sm md:px-3 md:py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                title="Rotate (R)"
              >
                Rotate {currentRotation > 0 && `(${currentRotation * 90}°)`}
              </button>
              <button
                onClick={flip}
                className="px-2 py-1.5 text-sm md:px-3 md:py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                title="Flip (F)"
              >
                Flip {isFlipped && '(on)'}
              </button>
              <button
                onClick={() => selectTile(null)}
                className="px-2 py-1.5 text-sm md:px-3 md:py-2 rounded-lg bg-gray-700 hover:bg-red-700 text-gray-300 transition-colors"
              >
                Cancel
              </button>
              {pendingPlacement ? (
                <button
                  onClick={confirmPlacement}
                  className="px-3 py-1.5 text-sm md:px-4 md:py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors animate-pulse"
                >
                  Confirm
                </button>
              ) : (
                <span className="hidden md:inline text-gray-400 text-sm">Drag tile on mosaic to place</span>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
