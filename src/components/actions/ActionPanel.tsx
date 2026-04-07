import { useGameStore } from '../../store/gameStore';

export function ActionPanel() {
  const gameState = useGameStore((s) => s.gameState);
  const selectedPatchChoice = useGameStore((s) => s.selectedPatchChoice);
  const canAdvanceAction = useGameStore((s) => s.canAdvance);
  const advanceReward = useGameStore((s) => s.advanceReward);
  const advance = useGameStore((s) => s.advance);
  const rotate = useGameStore((s) => s.rotate);
  const flip = useGameStore((s) => s.flip);
  const selectPatch = useGameStore((s) => s.selectPatch);
  const currentRotation = useGameStore((s) => s.currentRotation);
  const isFlipped = useGameStore((s) => s.isFlipped);
  const isMyTurn = useGameStore((s) => s.isMyTurn);

  if (!gameState || gameState.phase === 'gameOver') return null;

  const myTurn = isMyTurn();
  const isPlacingSpecialPatch = gameState.phase === 'placingSpecialPatch';
  const hasPatchSelected = selectedPatchChoice !== null;

  if (!myTurn && !isPlacingSpecialPatch) {
    return (
      <div className="px-2 py-2 md:px-4 md:py-3 text-gray-500 text-center text-sm">
        Waiting for opponent...
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-2 py-1.5 md:gap-3 md:px-4 md:py-2">
      {isPlacingSpecialPatch ? (
        <div className="text-yellow-300 font-medium text-sm md:text-base">
          Tap an empty cell to place your 1x1 patch
        </div>
      ) : (
        <>
          <button
            onClick={advance}
            disabled={!canAdvanceAction()}
            className="px-3 py-1.5 text-sm md:px-4 md:py-2 md:text-base rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium transition-colors"
          >
            Advance (+{advanceReward()}$)
          </button>

          {hasPatchSelected && (
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
                onClick={() => selectPatch(null)}
                className="px-2 py-1.5 text-sm md:px-3 md:py-2 rounded-lg bg-gray-700 hover:bg-red-700 text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <span className="hidden md:inline text-gray-400 text-sm">Click on quilt to place</span>
            </>
          )}
        </>
      )}
    </div>
  );
}
