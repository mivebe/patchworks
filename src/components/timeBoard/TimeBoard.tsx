import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { BUTTON_INCOME_SPACES, SPECIAL_PATCH_SPACES } from '../../engine/timeBoard';
import { TIME_BOARD_SPACES } from '../../engine/types';
import { playerTheme } from '../../theme';

export function TimeBoard() {
  const gameState = useGameStore((s) => s.gameState);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const [collapsed, setCollapsed] = useState(false);
  if (!gameState || myPlayerId === null) return null;

  const [p0, p1] = gameState.players;
  const p0Theme = playerTheme(0, myPlayerId);
  const p1Theme = playerTheme(1, myPlayerId);
  const buttonSet = new Set(BUTTON_INCOME_SPACES);
  const specialSet = new Set(SPECIAL_PATCH_SPACES);
  const claimedMap = new Map(gameState.claimedSpecialPatchSpaces.map(c => [c.position, c.playerId]));

  return (
    <div className={collapsed ? 'px-2' : 'p-2 md:p-4'}>
      <button
        onClick={() => setCollapsed((c) => !c)}
        className={`flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mx-auto ${collapsed ? '' : 'mb-1.5'}`}
      >
        <span className={`transition-transform ${collapsed ? '-rotate-90' : ''}`}>▼</span>
        Time Board
      </button>
      {!collapsed && <div className="flex flex-wrap gap-1 justify-center max-w-lg mx-auto">
        {Array.from({ length: TIME_BOARD_SPACES }, (_, i) => {
          const isButton = buttonSet.has(i);
          const isSpecial = specialSet.has(i);
          const claimedBy = claimedMap.get(i);
          const isClaimed = claimedBy !== undefined;
          const p0Here = p0.timePosition === i;
          const p1Here = p1.timePosition === i;

          let bgClass = 'bg-gray-700';
          if (isButton && isSpecial) bgClass = isClaimed ? 'bg-pink-900 opacity-50' : 'bg-pink-700';
          else if (isButton) bgClass = 'bg-amber-700';
          else if (isSpecial) bgClass = isClaimed ? 'bg-teal-900 opacity-50' : 'bg-teal-700';

          const claimedIndicator = isClaimed && !p0Here && !p1Here;

          return (
            <div
              key={i}
              className={`w-6 h-6 md:w-7 md:h-7 ${bgClass} rounded-sm flex items-center justify-center text-[10px] relative`}
              title={`Space ${i}${isButton ? ' (Button Income)' : ''}${isSpecial ? (isClaimed ? ` (Claimed by ${claimedBy === 0 ? p0.name : p1.name})` : ' (Special Patch)') : ''}`}
            >
              {p0Here && p1Here ? (
                <svg width="14" height="14" viewBox="0 0 14 14" className="md:w-4 md:h-4">
                  <clipPath id={`left-${i}`}><rect x="0" y="0" width="7" height="14" /></clipPath>
                  <clipPath id={`right-${i}`}><rect x="7" y="0" width="7" height="14" /></clipPath>
                  <circle cx="7" cy="7" r="6" fill={p0Theme.hex} clipPath={`url(#left-${i})`} />
                  <circle cx="7" cy="7" r="6" fill={p1Theme.hex} clipPath={`url(#right-${i})`} />
                  <circle cx="7" cy="7" r="6" fill="none" stroke="white" strokeWidth="1" />
                </svg>
              ) : p0Here ? (
                <span className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-full ${p0Theme.dot} ring-1 ring-white`} />
              ) : p1Here ? (
                <span className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-full ${p1Theme.dot} ring-1 ring-white`} />
              ) : claimedIndicator ? (
                <span className={`font-bold ${claimedBy === 0 ? p0Theme.text : p1Theme.text}`}>
                  {claimedBy === 0 ? '1' : '2'}
                </span>
              ) : (
                <span className="text-white">{i}</span>
              )}
            </div>
          );
        })}
      </div>}
    </div>
  );
}
