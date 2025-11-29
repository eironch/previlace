import { useRef, useEffect, useState, useMemo, forwardRef, useImperativeHandle } from "react";
import { CheckCircle, Circle, BookOpen, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "@/components/ui/Modal";
import useDashboardStore from "@/store/dashboardStore";

const JourneyMap = forwardRef(({ studyPlan }, ref) => {
  const navigate = useNavigate();
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { preAssessmentCompleted, mockExamCompleted } = useDashboardStore();

  const scrollContainerRef = useRef(null);
  const currentSessionRef = useRef(null);

  const scrollToCurrent = () => {
    if (currentSessionRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = currentSessionRef.current;
      
      const containerWidth = container.offsetWidth;
      const elementLeft = element.offsetLeft;
      const elementWidth = element.offsetWidth;
      
      // Center the element
      const scrollLeft = elementLeft - (containerWidth / 2) + (elementWidth / 2);
      
      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth"
      });
    }
  };

  useImperativeHandle(ref, () => ({
    scrollToCurrent
  }));

  if (!studyPlan) {
    return (
      <div className="rounded-lg border border-gray-300 bg-white p-6 text-center">
        <p className="text-sm text-gray-600">No active study plan found.</p>
      </div>
    );
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

  const allSessions = useMemo(() => studyPlan.weeks.flatMap((week, weekIndex) => {
    const weekStart = new Date(week.startDate);
    const saturdayDate = new Date(weekStart);
    saturdayDate.setDate(weekStart.getDate() + 5); // Assuming week starts Monday
    const sundayDate = new Date(weekStart);
    sundayDate.setDate(weekStart.getDate() + 6);

    return [
      {
        id: `${week.weekNumber}-sat`,
        weekNumber: week.weekNumber,
        day: "Sat",
        subject: week.saturdaySession?.subjectId,
        topics: week.saturdaySession?.topics || [],
        status: determineSessionStatus(week.saturdaySession, week.weekNumber, saturdayDate),
        date: saturdayDate.toISOString(),
      },
      {
        id: `${week.weekNumber}-sun`,
        weekNumber: week.weekNumber,
        day: "Sun",
        subject: week.sundaySession?.subjectId,
        topics: week.sundaySession?.topics || [],
        status: determineSessionStatus(week.sundaySession, week.weekNumber, sundayDate),
        date: sundayDate.toISOString(),
      },
    ];
  }), [studyPlan]);

  function determineSessionStatus(session, weekNumber, date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionDate = new Date(date);
    sessionDate.setHours(0, 0, 0, 0);

    if (sessionDate < today) return "completed";
    if (sessionDate.getTime() === today.getTime()) return "current";
    
    // Fallback if date comparison fails but week is current
    if (weekNumber === currentWeekNumber) return "current";
    
    return "upcoming";
  }

  function handleSessionClick(session) {
    if (session.subject) {
      setSelectedSession(session);
      setIsModalOpen(true);
    }
  }

  function handleTopicClick(topic) {
    navigate(`/dashboard/topics/${topic._id}`);
  }

  useEffect(() => {
    // Only scroll on mount
    scrollToCurrent();
  }, []); 

  const lastWeekNumber = studyPlan?.weeks?.length || 12;

  return (
    <>
      <div className="relative -mx-2">
        <div ref={scrollContainerRef} className="overflow-x-auto pb-2">
          <div className="relative flex items-start gap-8 px-4 py-4 sm:gap-10 md:gap-12" style={{ minWidth: `${allSessions.length * 120}px` }}>
            <div className="absolute left-4 right-4 top-[48px] h-0.5 bg-gray-200" />
            
            {allSessions.map((session) => (
              <div 
                key={session.id} 
                ref={session.status === "current" ? currentSessionRef : null}
                className="relative flex flex-col items-center" 
                style={{ minWidth: "100px" }}
              >
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
                      {session.weekNumber === 1 ? "Pre-Assessment" : 
                       session.weekNumber === lastWeekNumber ? "Mock Exam" : 
                       session.subject.name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          selectedSession?.weekNumber === 1 ? "Pre-Assessment" :
          selectedSession?.weekNumber === lastWeekNumber ? "Mock Exam" :
          selectedSession?.subject?.name || "Study Session"
        }
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <p className="text-sm text-gray-500">Week {selectedSession?.weekNumber} • {selectedSession?.day}</p>
              <p className="text-xs text-gray-400">{new Date(selectedSession?.date).toLocaleDateString()}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${
              selectedSession?.status === 'completed' ? 'bg-green-100 text-green-700' :
              selectedSession?.status === 'current' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {selectedSession?.weekNumber === 1 ? 'Pre-Assessment' :
               selectedSession?.weekNumber === lastWeekNumber ? 'Mock Exam' :
               selectedSession?.status === 'completed' ? 'Completed' :
               selectedSession?.status === 'current' ? 'Current' : 'Upcoming'}
            </span>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900">
              {selectedSession?.weekNumber === 1 ? 'Assessment Details' : 
               selectedSession?.weekNumber === lastWeekNumber ? 'Mock Exam Details' : 
               'Topics to Study'}
            </h4>
            
            {(selectedSession?.weekNumber === 1 || selectedSession?.weekNumber === lastWeekNumber) ? (
              <div className="rounded-lg border border-gray-200 p-4 text-center">
                <p className="mb-3 text-sm text-gray-600">
                  {selectedSession?.weekNumber === 1 
                    ? "Take the pre-assessment to gauge your current knowledge level." 
                    : "Take the mock exam to simulate the actual test environment."}
                </p>
                <button
                  onClick={() => navigate(selectedSession?.weekNumber === 1 ? "/dashboard/assessment" : "/dashboard/mock-exam")}
                  disabled={
                    (selectedSession?.weekNumber === 1 && preAssessmentCompleted) ||
                    (selectedSession?.weekNumber === lastWeekNumber && mockExamCompleted)
                  }
                  className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                    (selectedSession?.weekNumber === 1 && preAssessmentCompleted) ||
                    (selectedSession?.weekNumber === lastWeekNumber && mockExamCompleted)
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-black hover:bg-gray-800"
                  }`}
                >
                  {(selectedSession?.weekNumber === 1 && preAssessmentCompleted) ||
                   (selectedSession?.weekNumber === lastWeekNumber && mockExamCompleted)
                    ? "Completed"
                    : `Start ${selectedSession?.weekNumber === 1 ? "Pre-Assessment" : "Mock Exam"}`}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedSession?.topics?.map((topic) => (
                  <button
                    key={topic._id}
                    onClick={() => handleTopicClick(topic)}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 hover:border-gray-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                        <BookOpen size={14} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{topic.name}</p>
                        <p className="text-xs text-gray-500">{topic.estimatedMinutes} mins</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                ))}
                {(!selectedSession?.topics || selectedSession.topics.length === 0) && (
                  <p className="text-sm text-gray-500 italic">No topics assigned for this session.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
});

JourneyMap.displayName = "JourneyMap";

export default JourneyMap;
