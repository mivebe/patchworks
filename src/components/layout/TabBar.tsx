import { useGameStore, type ActiveTab } from '../../store/gameStore';

const TABS: { key: ActiveTab; label: string; shortLabel: string }[] = [
  { key: 'myBoard', label: 'My Board', shortLabel: 'Mine' },
  { key: 'opponent', label: 'Opponent', shortLabel: 'Opp' },
  { key: 'timeBoard', label: 'Time Board', shortLabel: 'Time' },
];

export function TabBar() {
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);

  return (
    <div className="flex border-b border-gray-700">
      {TABS.map(({ key, label, shortLabel }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`px-2.5 py-2 text-xs md:px-5 md:py-2.5 md:text-sm font-medium transition-colors ${
            activeTab === key
              ? 'text-white border-b-2 border-white bg-gray-800/50'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <span className="md:hidden">{shortLabel}</span>
          <span className="hidden md:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
