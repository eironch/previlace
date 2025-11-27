import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Trophy } from "lucide-react";
import useActivityStore from "@/store/activityStore";

const getDayName = (date) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getDay()];
};

const getChallengeTypeForDay = (dayName) => {
  const types = {
    Monday: { title: "New Week Launch", desc: "15 questions from last class", xp: 15 },
    Tuesday: { title: "Spaced Repetition", desc: "10 questions reviewing mistakes", xp: 10 },
    Wednesday: { title: "Deep Dive", desc: "20 questions on weakest topic", xp: 20 },
    Thursday: { title: "Speed Challenge", desc: "15 timed questions", xp: 15 },
    Friday: { title: "Weekly Review", desc: "25 comprehensive questions", xp: 25 },
  };
  return types[dayName] || types.Monday;
};

function DailyChallengeCard() {
  const navigate = useNavigate();
  const { todayActivity: challenge, fetchTodayActivity, loading, error } = useActivityStore();

  const today = new Date();
  const dayName = getDayName(today);
  const isWeekend = dayName === "Saturday" || dayName === "Sunday";

  useEffect(() => {
    if (!isWeekend) {
      fetchTodayActivity();
    }
  }, [isWeekend, fetchTodayActivity]);

  function handleStartChallenge() {
    if (challenge?._id) {
      navigate(`/dashboard/quiz-session?activityId=${challenge._id}`);
    } else {
      navigate("/dashboard/subjects");
    }
  }

  if (loading) {
    return <div className="h-48 animate-pulse rounded-lg bg-gray-200"></div>;
  }

  if (isWeekend) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weekend Class</h3>
            <p className="text-sm text-gray-500">Enjoy your class today</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <Calendar className="h-6 w-6 text-gray-900" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Daily Challenge</h3>
            <p className="text-sm text-gray-500">Unable to load challenge</p>
          </div>
        </div>
        <button
          onClick={fetchTodayActivity}
          className="mt-4 w-full rounded-lg border border-gray-200 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-50"
        >
          Try Again
        </button>
      </div>
    );
  }

  const challengeType = getChallengeTypeForDay(dayName);
  const isCompleted = challenge?.userStatus === "completed" || challenge?.userStatus === "perfect";
  const isInProgress = challenge?.userStatus === "in_progress";
  const progress = challenge?.answered || 0;
  const total = challenge?.questionCount || parseInt(challengeType.desc.match(/\d+/)?.[0] || "15");

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{dayName}'s Challenge</h3>
            <p className="text-sm text-gray-500">{challengeType.title}</p>
          </div>
        </div>
        {!isCompleted && (
          <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
            <Trophy className="h-4 w-4 text-gray-900" />
            <span className="text-sm font-semibold text-gray-900">+{challengeType.xp} XP</span>
          </div>
        )}
      </div>

      <p className="mb-4 text-gray-600">{challengeType.desc}</p>

      {isCompleted ? (
        <div className="rounded-lg bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800">Challenge Completed</p>
              <p className="text-sm text-green-600">Score: {challenge?.score || 0}%</p>
            </div>
            <div className="rounded-full bg-green-100 px-3 py-1">
              <span className="text-sm font-semibold text-green-700">+{challengeType.xp} XP</span>
            </div>
          </div>
        </div>
      ) : isInProgress ? (
        <>
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-gray-900">
                {progress}/{total}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="h-full bg-black transition-all" style={{ width: `${(progress / total) * 100}%` }} />
            </div>
          </div>
          <button
            onClick={handleStartChallenge}
            className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Continue Challenge
          </button>
        </>
      ) : (
        <button
          onClick={handleStartChallenge}
          className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
        >
          Start Challenge
        </button>
      )}
    </div>
  );
}

export default DailyChallengeCard;
