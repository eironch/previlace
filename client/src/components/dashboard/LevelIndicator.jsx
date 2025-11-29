import { TrendingUp } from "lucide-react";


function LevelIndicator({ user }) {
  const { level, exp: xp, nextLevelExp: xpToNextLevel } = user || {};

  const progress = xpToNextLevel > 0 ? Math.min((xp / xpToNextLevel) * 100, 100) : 0;

  return (
    <div className="flex w-full items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2 sm:w-auto">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
        <TrendingUp className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">Level {level}</span>
          <span className="text-xs text-gray-500">{xp}/{xpToNextLevel} XP</span>
        </div>
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-black transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

export default LevelIndicator;
