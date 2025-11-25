import { CheckCircle, Circle, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

function JourneyMap({ studyPlan }) {
  const navigate = useNavigate();

  if (!studyPlan) {
    return (
      <div className="rounded-lg border border-gray-300 bg-white p-6 text-center">
        <p className="text-sm text-gray-600">No active study plan</p>
        <button
          onClick={() => navigate("/dashboard/study-plan")}
          className="mt-4 rounded-lg bg-black px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
        >
          View Study Plans
        </button>
      </div>
    );
  }

  function determineSessionStatus(session, weekIndex) {
    if (!session?.date) {
      return weekIndex === 0 ? "current" : "upcoming";
    }

    const sessionDate = new Date(session.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    sessionDate.setHours(0, 0, 0, 0);

    if (sessionDate < today) return "completed";
    if (sessionDate.getTime() === today.getTime()) return "current";
    return "upcoming";
  }

  const getCurrentWeekNumber = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const week of studyPlan.weeks) {
      if (!week.startDate || !week.endDate) continue;
      const start = new Date(week.startDate);
      const end = new Date(week.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      if (today >= start && today <= end) {
        return week.weekNumber;
      }
    }
    return 0;
  };

  const currentWeekNumber = getCurrentWeekNumber();

  const allSessions = studyPlan.weeks.flatMap((week, weekIndex) => [
    {
      id: `${week.weekNumber}-sat`,
      weekNumber: week.weekNumber,
      day: "Sat",
      subject: week.saturdaySession?.subjectId,
      status: determineSessionStatus(week.saturdaySession, weekIndex),
      date: week.saturdaySession?.date,
    },
    {
      id: `${week.weekNumber}-sun`,
      weekNumber: week.weekNumber,
      day: "Sun",
      subject: week.sundaySession?.subjectId,
      status: determineSessionStatus(week.sundaySession, weekIndex),
      date: week.sundaySession?.date,
    },
  ]);

  function handleSessionClick(session) {
    if (session.subject?._id) {
      navigate(`/dashboard/subjects/${session.subject._id}`);
    }
  }

  function showLockIcon(session) {
    return session.status === "upcoming" && session.weekNumber > currentWeekNumber + 1;
  }

  return (
    <div className="relative -mx-2">
      <div className="overflow-x-auto pb-2">
        <div className="relative flex items-start gap-8 px-4 py-4 sm:gap-10 md:gap-12" style={{ minWidth: `${allSessions.length * 120}px` }}>
          <div className="absolute left-4 right-4 top-[48px] h-0.5 bg-gray-200" />
          
          {allSessions.map((session) => (
            <div key={session.id} className="relative flex flex-col items-center" style={{ minWidth: "100px" }}>
              <button
                onClick={() => handleSessionClick(session)}
                className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white transition-all ${
                  session.status === "completed"
                    ? "cursor-pointer bg-black text-white hover:bg-gray-800"
                    : session.status === "current"
                      ? "cursor-pointer bg-gray-900 text-white ring-2 ring-gray-900"
                      : "cursor-pointer bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {session.status === "completed" ? (
                  <CheckCircle size={20} />
                ) : showLockIcon(session) ? (
                  <Lock size={20} />
                ) : (
                  <Circle size={20} fill="currentColor" />
                )}
              </button>
              <div className="mt-2 flex flex-col items-center">
                <p className={`text-xs font-semibold ${
                  session.status === "completed" || session.status === "current"
                    ? "text-gray-900"
                    : "text-gray-600"
                }`}>
                  Week {session.weekNumber}
                </p>
                <p className="text-xs text-gray-500">{session.day}</p>
                {session.subject && (
                  <p className="mt-1 w-[100px] break-words text-center text-xs font-medium leading-tight text-gray-700">
                    {session.subject.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default JourneyMap;
