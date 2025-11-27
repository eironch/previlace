import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import useExamStore from "../../store/examStore";

function QuizTimer() {
  const {
    timeRemaining,
    updateTimer,
    sessionActive,
    isPaused,
    currentSession,
  } = useExamStore();
  const [displayTime, setDisplayTime] = useState(timeRemaining);
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    setDisplayTime(timeRemaining);
    setIsWarning(timeRemaining <= 300 && timeRemaining > 60);
    setIsCritical(timeRemaining <= 60);
  }, [timeRemaining]);

  useEffect(() => {
    if (!sessionActive || isPaused || !currentSession) return;

    const interval = setInterval(() => {
      setDisplayTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive, isPaused, currentSession]);

  useEffect(() => {
    updateTimer(displayTime);
  }, [displayTime, updateTimer]);

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  function getTimerColor() {
    if (isCritical) return "text-red-600";
    if (isWarning) return "text-yellow-600";
    return "text-gray-700";
  }

  function getBackgroundColor() {
    if (isCritical) return "bg-red-50 border-red-200";
    if (isWarning) return "bg-yellow-50 border-yellow-200";
    return "bg-gray-50 border-gray-200";
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${getBackgroundColor()}`}
    >
      <div className="flex items-center gap-1">
        {(isWarning || isCritical) && (
          <AlertTriangle className={`h-4 w-4 ${getTimerColor()}`} />
        )}
        {!isWarning && !isCritical && (
          <Clock className={`h-4 w-4 ${getTimerColor()}`} />
        )}
      </div>

      <div className="flex flex-col">
        <span className={`font-mono text-sm font-bold ${getTimerColor()}`}>
          {formatTime(displayTime)}
        </span>
        {isPaused && <span className="text-xs text-gray-500">Paused</span>}
      </div>
    </div>
  );
}

export default QuizTimer;
