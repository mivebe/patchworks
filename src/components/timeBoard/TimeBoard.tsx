import { useGameStore } from '../../store/gameStore';
import { BUTTON_INCOME_SPACES, SPECIAL_PATCH_SPACES } from '../../engine/timeBoard';
import { TIME_BOARD_SPACES } from '../../engine/types';

export function TimeBoard() {
  const gameState = useGameStore((s) => s.gameState);

  if (!gameState) return null;

  const [p0, p1] = gameState.players;
  const buttonSet = new Set(BUTTON_INCOME_SPACES);
  const specialSet = new Set(SPECIAL_PATCH_SPACES);

  return (
    <div className="p-2 md:p-4">
      <h3 className="text-white font-bold mb-3 text-center">Time Board</h3>
      <div className="flex flex-wrap gap-1 justify-center max-w-lg mx-auto">
        {Array.from({ length: TIME_BOARD_SPACES }, (_, i) => {
          const isButton = buttonSet.has(i);
          const isSpecial = specialSet.has(i);
          const p0Here = p0.timePosition === i;
          const p1Here = p1.timePosition === i;

          let bgClass = 'bg-gray-700';
          if (isButton && isSpecial) bgClass = 'bg-purple-700';
          else if (isButton) bgClass = 'bg-amber-700';
          else if (isSpecial) bgClass = 'bg-cyan-700';

          return (
            <div
              key={i}
              className={`w-6 h-6 md:w-7 md:h-7 ${bgClass} rounded-sm flex items-center justify-center text-[10px] relative`}
              title={`Space ${i}${isButton ? ' (Button Income)' : ''}${isSpecial ? ' (Special Patch)' : ''}`}
            >
              {p0Here && p1Here ? (
                <div className="flex flex-col items-center leading-none">
                  <span className="text-blue-400 font-bold">1</span>
                  <span className="text-rose-400 font-bold">2</span>
                </div>
              ) : p0Here ? (
                <span className="text-blue-400 font-bold">1</span>
              ) : p1Here ? (
                <span className="text-rose-400 font-bold">2</span>
              ) : (
                <span className="text-gray-500">{i}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-6 mt-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-amber-700 inline-block" /> Button Income
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-cyan-700 inline-block" /> Special Patch
        </span>
      </div>
    </div>
  );
}
