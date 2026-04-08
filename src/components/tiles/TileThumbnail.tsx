import type { Tile } from '../../engine/types';

interface TileThumbnailProps {
  tile: Tile;
  isAvailable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export function TileThumbnail({
  tile,
  isAvailable = false,
  isSelected = false,
  onClick,
  size = 'sm',
}: TileThumbnailProps) {
  const cellSize = size === 'sm' ? 'w-3 h-3' : 'w-5 h-5';
  const cols = tile.shape[0].length;

  let borderClass = 'border-2 border-gray-700';
  if (isSelected) borderClass = 'border-2 border-yellow-400 shadow-lg shadow-yellow-400/20';
  else if (isAvailable) borderClass = 'border-2 border-green-400';

  return (
    <button
      onClick={onClick}
      disabled={!isAvailable}
      className={`flex flex-col items-center gap-1 p-1.5 md:p-2 rounded-lg ${borderClass} ${
        isAvailable ? 'cursor-pointer hover:bg-gray-700/50' : 'opacity-40 cursor-default'
      } transition-all bg-gray-800/50`}
    >
      <div
        className="grid gap-px"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {tile.shape.flatMap((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`${cellSize} ${cell ? 'bg-amber-400' : 'bg-transparent'}`}
            />
          ))
        )}
      </div>
      {size === 'md' && (
        <div className="flex gap-2 text-xs text-gray-300 mt-1">
          <span title="Gem cost">💎{tile.gemCost}</span>
          <span title="Time cost">⏳{tile.timeCost}</span>
          {tile.gemIncome > 0 && (
            <span title="Gem income" className="text-green-400">📈+{tile.gemIncome}</span>
          )}
        </div>
      )}
    </button>
  );
}
