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
            Patchwork is a two-player strategy game. You compete to build the
            most complete quilt on your personal 9&times;9 grid while managing
            buttons (currency) and time.
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
                <strong className="text-white">1 button per space moved</strong>.
              </div>
              <div>
                <strong className="text-emerald-400">Take a Patch</strong>{' '}
                &mdash; Buy one of the next 3 patches from the market. Pay its
                button cost, place it on your quilt (rotate / flip as needed),
                and advance on the time board by its time cost. The neutral
                token moves to where that patch was.
              </div>
            </div>
          </Section>

          <Section title="The Time Board">
            A shared track of <strong className="text-white">54 spaces</strong>.
            <div className="mt-2 space-y-1">
              <div>
                <span className="inline-block w-3 h-3 rounded-sm bg-amber-700 mr-1.5 align-middle" />
                <strong className="text-amber-400">Button Income</strong>{' '}
                (spaces 5, 11, 17, 23, 29, 35, 41, 47, 53) &mdash; When you
                pass one of these, you earn buttons equal to the total button
                icons on all patches you have placed so far.
              </div>
              <div>
                <span className="inline-block w-3 h-3 rounded-sm bg-cyan-700 mr-1.5 align-middle" />
                <strong className="text-cyan-400">Special Patch</strong>{' '}
                (spaces 20, 26, 32, 44, 50) &mdash; The{' '}
                <strong className="text-white">first player</strong> to pass
                each of these spaces receives a free 1&times;1 patch to place
                immediately. Once claimed, the other player cannot collect it.
              </div>
            </div>
          </Section>

          <Section title="7&times;7 Bonus Tile">
            The first player to completely fill any 7&times;7 area on their
            quilt earns a <strong className="text-white">+7 point</strong>{' '}
            bonus. Only one player can earn this.
          </Section>

          <Section title="Game End &amp; Scoring">
            The game ends when both players reach or pass space 53.
            <div className="mt-2 bg-gray-700/50 rounded-lg px-3 py-2 font-mono text-white text-center">
              Score = Buttons &minus; (2 &times; Empty Cells) + (7 if bonus tile)
            </div>
            <p className="mt-2">Highest score wins!</p>
          </Section>

          <Section title="Controls">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong className="text-white">R</strong> &mdash; Rotate patch
              </li>
              <li>
                <strong className="text-white">F</strong> &mdash; Flip patch
              </li>
              <li>Tap a cell on your quilt to place the selected patch</li>
            </ul>
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
