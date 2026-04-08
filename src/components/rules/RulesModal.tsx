import { useEffect } from 'react';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export function RulesModal({ open, onClose }: RulesModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">How to Play</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 space-y-4 text-sm text-gray-300">
          <Section title="Overview">
            Tessera is a two-player strategy game. You compete to build the
            most complete mosaic on your personal 9&times;9 grid while managing
            gems (currency) and time.
          </Section>

          <Section title="Turn Order">
            The player <strong className="text-white">furthest behind</strong>{' '}
            on the time board always takes the next turn. If both players are on
            the same space, the player on top goes.
          </Section>

          <Section title="Actions">
            <p className="mb-2">On your turn, pick one:</p>
            <div className="space-y-2">
              <div>
                <strong className="text-amber-400">Advance</strong> &mdash; Move
                your token to one space ahead of your opponent. You earn{' '}
                <strong className="text-white">1 gem per space moved</strong>.
              </div>
              <div>
                <strong className="text-emerald-400">Take a Tile</strong>{' '}
                &mdash; Buy one of the next 3 glass tiles from the market. Pay its
                gem cost, place it on your mosaic (rotate / flip as needed),
                and advance on the time board by its time cost. The neutral
                token moves to where that tile was.
              </div>
            </div>
          </Section>

          <Section title="The Time Board">
            A shared track of <strong className="text-white">54 spaces</strong>.
            <div className="mt-2 space-y-1">
              <div>
                <span className="inline-block w-3 h-3 rounded-sm bg-amber-700 mr-1.5 align-middle" />
                <strong className="text-amber-400">Gem Income</strong>{' '}
                (spaces 5, 11, 17, 23, 29, 35, 41, 47, 53) &mdash; When you
                pass one of these, you earn gems equal to the total gem
                icons on all tiles you have placed so far.
              </div>
              <div>
                <span className="inline-block w-3 h-3 rounded-sm bg-cyan-700 mr-1.5 align-middle" />
                <strong className="text-cyan-400">Special Tile</strong>{' '}
                (spaces 20, 26, 32, 44, 50) &mdash; The{' '}
                <strong className="text-white">first player</strong> to pass
                each of these spaces receives a free 1&times;1 tile to place
                immediately. Once claimed, the other player cannot collect it.
              </div>
            </div>
          </Section>

          <Section title="7&times;7 Bonus Tile">
            The first player to completely fill any 7&times;7 area on their
            mosaic earns a <strong className="text-white">+7 point</strong>{' '}
            bonus. Only one player can earn this.
          </Section>

          <Section title="Game End &amp; Scoring">
            The game ends when both players reach or pass space 53.
            <div className="mt-2 bg-gray-700/50 rounded-lg px-3 py-2 font-mono text-white text-center">
              Score = Gems &minus; (2 &times; Empty Cells) + (7 if bonus tile)
            </div>
            <p className="mt-2">Highest score wins!</p>
          </Section>

          <Section title="Controls">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong className="text-white">R</strong> &mdash; Rotate tile
              </li>
              <li>
                <strong className="text-white">F</strong> &mdash; Flip tile
              </li>
              <li>Tap a cell on your mosaic to place the selected tile</li>
            </ul>
          </Section>

          <Section title="Player Info Legend">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base">💎</span>
                <span><strong className="text-white">Gems</strong> &mdash; Your currency. Spend to buy tiles. Remaining gems count toward your final score.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">📈</span>
                <span><strong className="text-green-400">Income</strong> &mdash; Gem income from placed tiles. Earned each time you pass a gem income space.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">⏳</span>
                <span><strong className="text-white">Position</strong> &mdash; Your position on the time board (0&ndash;53). The player furthest behind takes the next turn.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🔲</span>
                <span><strong className="text-red-400">Empty Cells</strong> &mdash; Unfilled cells on your 9&times;9 mosaic. Each costs 2 points at game end.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">⭐</span>
                <span><strong className="text-yellow-400">7&times;7 Bonus</strong> &mdash; First to fill a 7&times;7 area earns +7 points. Shows ✓ if earned, ✗ if not.</span>
              </div>
            </div>
          </Section>

          <Section title="Time Board Legend">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-sm bg-gray-700" />
                <span><strong className="text-white">Normal space</strong> &mdash; No special effect.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-sm bg-amber-700" />
                <span><strong className="text-amber-400">Gem Income</strong> &mdash; Earn gems equal to your total tile income.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-sm bg-teal-700" />
                <span><strong className="text-teal-400">Special Tile</strong> &mdash; First to pass gets a free 1&times;1 tile.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-sm bg-teal-900 opacity-50" />
                <span className="text-gray-400">Special Tile (claimed) &mdash; Already taken by a player.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full bg-purple-500 ring-1 ring-white" />
                <span>Your position on the board.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full bg-cyan-500 ring-1 ring-white" />
                <span>Opponent's position on the board.</span>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <div>{children}</div>
    </div>
  );
}
