interface QuiltCellProps {
  filled: boolean;
  preview?: 'valid' | 'invalid' | null;
  isSpecialPatchTarget?: boolean;
  onClick?: () => void;
  playerColor?: string;
}

export function QuiltCell({
  filled,
  preview,
  isSpecialPatchTarget,
  onClick,
  playerColor = 'bg-blue-500',
}: QuiltCellProps) {
  let className = 'aspect-square w-full border border-gray-600 transition-colors duration-75 ';

  if (filled) {
    className += playerColor + ' ';
  } else if (preview === 'valid') {
    className += 'bg-green-400/50 ';
  } else if (preview === 'invalid') {
    className += 'bg-red-400/50 ';
  } else if (isSpecialPatchTarget) {
    className += 'bg-yellow-400/20 hover:bg-yellow-400/40 cursor-pointer ';
  } else {
    className += 'bg-gray-800 ';
  }

  if (onClick) {
    className += 'cursor-pointer ';
  }

  return (
    <div
      className={className}
      onClick={onClick}
    />
  );
}
