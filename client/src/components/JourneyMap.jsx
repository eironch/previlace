import React, { useEffect, useState } from "react";
import { journeyService } from "../services/journeyService";
import { useAuthStore } from "../store/authStore";
import { CheckCircle, Lock, PlayCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const JourneyMap = () => {
  const { user } = useAuthStore();
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJourney = async () => {
      const userId = user?.id || user?._id;
      if (userId) {
        try {
          const data = await journeyService.getJourney(userId);
          setJourney(data);
        } catch (error) {
          console.error("Failed to fetch journey", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchJourney();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading your journey...</div>;
  }

  if (!journey) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No journey found. Please contact your administrator to assign a study plan.</p>
      </div>
    );
  }

  // Helper to check node status
  const getNodeStatus = (nodeId) => {
    const completed = journey.completedNodes.find((n) => n.nodeId === nodeId);
    if (completed) return "completed";
    if (journey.unlockedNodes.includes(nodeId)) return "unlocked";
    return "locked";
  };

  // Mock rendering of nodes based on StudyPlan (which we should probably fetch or include in the journey response)
  // For now, we'll assume the journey object contains enough info or we iterate through the study plan schedule.
  // Since the backend `getJourney` populates `studyPlanId`, we can access the schedule there.
  
  const schedule = journey.studyPlanId?.schedule || [];

  if (schedule.length === 0) {
      return (
          <div className="text-center p-8">
              <p className="text-gray-600">Your study plan is being generated. Please check back later.</p>
          </div>
      );
  }

  return (
    <div className="relative max-w-2xl mx-auto p-4 pb-20">
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 -translate-x-1/2 z-0" />
      
      {schedule.map((week, weekIndex) => (
        <div key={week.week} className="relative z-10 mb-12">
          <div className="flex justify-center mb-4">
            <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-bold">
              Week {week.week}
            </span>
          </div>
          
          <div className="flex flex-col items-center gap-8">
            {/* 
              For MVP, we are mapping the "Subject" as a single node for the week.
              In reality, we might have multiple topics/nodes per week.
              We'll use the subjectId as the base for the node ID for now.
            */}
            {(() => {
               const nodeId = `week-${week.week}-${week.subjectId._id || week.subjectId}`; // Match backend format
               const status = getNodeStatus(nodeId);
               
               return (
                 <div 
                   key={nodeId}
                   onClick={() => {
                     if (status !== "locked") {
                       // Navigate to quiz or content
                       // For now, just log or alert
                       navigate(`/dashboard/quiz-session?subjectId=${week.subjectId._id || week.subjectId}`);
                     }
                   }}
                   className={`
                     relative flex items-center justify-center w-20 h-20 rounded-full border-4 
                     transition-all transform hover:scale-110 cursor-pointer bg-white
                     ${status === 'completed' ? 'border-green-500 text-green-500' : 
                       status === 'unlocked' ? 'border-blue-500 text-blue-500' : 
                       'border-gray-300 text-gray-300 bg-gray-50 cursor-not-allowed'}
                   `}
                 >
                   {status === 'completed' && <CheckCircle className="w-8 h-8" />}
                   {status === 'unlocked' && <PlayCircle className="w-8 h-8" />}
                   {status === 'locked' && <Lock className="w-8 h-8" />}
                   
                   {/* Label */}
                   <div className="absolute top-full mt-2 w-32 text-center">
                      <p className="text-sm font-medium text-gray-900 bg-white/80 backdrop-blur-sm rounded px-1">
                        {week.subjectId.name || "Subject"}
                      </p>
                   </div>
                 </div>
               );
            })()}
          </div>
        </div>
      ))}
      
      <div className="flex justify-center mt-8">
        <div className="flex items-center gap-2 text-yellow-500">
            <Star className="w-6 h-6 fill-current" />
            <span className="font-bold text-xl">Exam Day</span>
        </div>
      </div>
    </div>
  );
};

export default JourneyMap;
