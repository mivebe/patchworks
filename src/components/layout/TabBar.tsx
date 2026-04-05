import { useGameStore, type ActiveTab } from '../../store/gameStore';

const TABS: { key: ActiveTab; label: string }[] = [
  { key: 'myBoard', label: 'My Board' },
  { key: 'opponent', label: 'Opponent' },
  { key: 'timeBoard', label: 'Time Board' },
];

export function TabBar() {
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);

  return (
    <div className="flex border-b border-gray-700">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`px-5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === key
              ? 'text-white border-b-2 border-white bg-gray-800/50'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
