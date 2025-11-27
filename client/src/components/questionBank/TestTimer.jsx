import { useEffect } from "react";
import { useTestStore } from "../../store/testStore";
import { Clock, AlertTriangle } from "lucide-react";

function TestTimer() {
  const { timeRemaining, isActive, updateTimer } = useTestStore();

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      updateTimer(Math.max(0, timeRemaining - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, isActive, updateTimer]);

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  const isLowTime = timeRemaining <= 300;
  const isCriticalTime = timeRemaining <= 60;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
        isCriticalTime
          ? "bg-red-200 text-red-700"
          : isLowTime
            ? "bg-yellow-200 text-yellow-700"
            : "bg-gray-200 text-gray-700"
      }`}
    >
      {isCriticalTime ? (
        <AlertTriangle className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <span className="font-mono text-lg font-semibold">
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
}

export default TestTimer;