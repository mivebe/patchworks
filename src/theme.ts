/**
 * Centralized color theme for the game.
 * Change these values to re-skin player colors across the entire app.
 */

export const theme = {
  player1: {
    /** Filled quilt cells */
    cell: 'bg-purple-500',
    /** Raw hex color for inline styles (SVG, canvas) */
    hex: '#a855f7',
    /** Text on time board, claimed patches */
    text: 'text-purple-400',
    /** Tab / button active background */
    tabActive: 'bg-purple-600',
    /** PlayerInfo panel background */
    panelBg: 'bg-purple-950/40 ring-1 ring-purple-500/30',
    /** CoinFlip card */
    coinBg: 'bg-purple-600',
    coinBorder: 'border-purple-400',
    coinShadow: 'shadow-purple-500/30',
    /** Score card dot */
    dot: 'bg-purple-500',
  },
  player2: {
    cell: 'bg-cyan-500',
    hex: '#06b6d4',
    text: 'text-cyan-400',
    tabActive: 'bg-cyan-600',
    panelBg: 'bg-cyan-950/40 ring-1 ring-cyan-500/30',
    coinBg: 'bg-cyan-600',
    coinBorder: 'border-cyan-400',
    coinShadow: 'shadow-cyan-500/30',
    dot: 'bg-cyan-500',
  },
  /** Accent color used for interactive UI elements (buttons, focus rings, hints) */
  accent: {
    bg: 'bg-purple-600',
    bgHover: 'hover:bg-purple-500',
    focusBorder: 'focus:border-purple-500',
    hintActive: 'bg-purple-500 text-white',
  },
} as const;

/** Helper to get a player's theme by id. */
export function playerTheme(playerId: 0 | 1) {
  return playerId === 0 ? theme.player1 : theme.player2;
}
