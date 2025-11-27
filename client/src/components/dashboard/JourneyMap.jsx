import { CheckCircle, Circle, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function JourneyMap({ studyPlan }) {
  const navigate = useNavigate();

  if (!studyPlan) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
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

  const journeySteps = studyPlan.weeks.flatMap((week, weekIndex) => {
    const satStatus = determineStatus(week.saturdaySession, weekIndex);
    const sunStatus = determineStatus(week.sundaySession, weekIndex);

    return [
      {
        id: `${week.weekNumber}-sat`,
        title: `Week ${week.weekNumber}: Saturday`,
        subtitle: week.saturdaySession?.subjectId?.name || "No Subject",
        subjectId: week.saturdaySession?.subjectId?._id,
        status: satStatus,
        date: week.saturdaySession?.date,
      },
      {
        id: `${week.weekNumber}-sun`,
        title: `Week ${week.weekNumber}: Sunday`,
        subtitle: week.sundaySession?.subjectId?.name || "No Subject",
        subjectId: week.sundaySession?.subjectId?._id,
        status: sunStatus,
        date: week.sundaySession?.date,
      },
    ];
  });

  function determineStatus(session, weekIndex) {
    if (!session?.date) {
      if (weekIndex === 0) return "current";
      if (weekIndex < 2) return "upcoming";
      return "locked";
    }

    const sessionDate = new Date(session.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    sessionDate.setHours(0, 0, 0, 0);

    if (sessionDate < today) return "completed";
    if (sessionDate.getTime() === today.getTime()) return "current";

    const daysDiff = Math.floor((sessionDate - today) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) return "upcoming";
    return "locked";
  }

  return (
    <div className="relative">
      <div className="absolute bottom-4 left-6 top-4 w-0.5 bg-gray-200" />

      <div className="relative space-y-8">
        {journeySteps.map((step) => (
          <div key={step.id} className="flex items-start">
            <div
              className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white ${
                step.status === "completed"
                  ? "bg-black text-white"
                  : step.status === "current"
                    ? "bg-gray-900 text-white ring-2 ring-gray-900"
                    : step.status === "upcoming"
                      ? "bg-gray-200 text-gray-600"
                      : "bg-gray-100 text-gray-400"
              }`}
            >
              {step.status === "completed" ? (
                <CheckCircle size={20} />
              ) : step.status === "current" ? (
                <Circle size={20} fill="currentColor" />
              ) : (
                <Lock size={20} />
              )}
            </div>

            <div className="ml-4 flex-1">
              <div
                onClick={() => {
                  if (step.status !== "locked" && step.subjectId) {
                    navigate(`/dashboard/subjects/${step.subjectId}`);
                  }
                }}
                className={`rounded-lg border p-4 transition-all ${
                  step.status === "current"
                    ? "border-black bg-gray-50 shadow-sm cursor-pointer"
                    : step.status === "upcoming"
                      ? "border-gray-200 bg-white hover:border-gray-300 cursor-pointer"
                      : step.status === "locked"
                        ? "border-gray-100 bg-gray-50 opacity-75 cursor-not-allowed"
                        : "border-gray-200 bg-white hover:border-gray-300 cursor-pointer"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`font-semibold ${step.status === "locked" ? "text-gray-500" : "text-gray-900"}`}>
                      {step.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">{step.subtitle}</p>
                  </div>
                  {step.status !== "locked" && step.subjectId && (
                    <div className="rounded-full p-2 transition-colors hover:bg-white">
                      <ArrowRight size={16} className="text-gray-400 hover:text-gray-900" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JourneyMap;
