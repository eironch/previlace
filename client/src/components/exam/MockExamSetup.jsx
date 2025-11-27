import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Clock, BookOpen, Target, AlertTriangle, Info } from "lucide-react";
import useExamStore from "../../store/examStore";

function MockExamSetup() {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState("professional");
  const [isStarting, setIsStarting] = useState(false);
  const { startMockExam, error } = useExamStore();

  const examConfigs = {
    professional: {
      questions: 170,
      timeLimit: 10800,
      passing: 80,
      description: "Professional level exam covering advanced topics including analytical reasoning, numerical ability, and general information.",
      sections: [
        { name: "General Information", questions: 40, time: 2400 },
        { name: "Numerical Reasoning", questions: 40, time: 2400 },
        { name: "Analytical Reasoning", questions: 40, time: 2400 },
        { name: "Verbal Reasoning", questions: 25, time: 1500 },
        { name: "Clerical Operations", questions: 25, time: 2100 }
      ]
    },
    "sub-professional": {
      questions: 165,
      timeLimit: 9000,
      passing: 80,
      description: "Sub-professional level exam focusing on basic skills including vocabulary, grammar, and clerical operations.",
      sections: [
        { name: "Vocabulary", questions: 40, time: 2100 },
        { name: "Grammar & Correct Usage", questions: 40, time: 2100 },
        { name: "Paragraph Organization", questions: 25, time: 1500 },
        { name: "Reading Comprehension", questions: 35, time: 2100 },
        { name: "Numerical Reasoning", questions: 25, time: 1200 }
      ]
    }
  };

  const currentConfig = examConfigs[selectedLevel];

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  async function handleStartExam() {
    setIsStarting(true);
    try {
      await startMockExam(selectedLevel);
      navigate("/dashboard/quiz-session");
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Failed to start mock exam:", err);
      }
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-200">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mock Civil Service Exam</h1>
          <p className="text-gray-600">Take a full-length practice exam to assess your readiness</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {Object.entries(examConfigs).map(([level, config]) => (
            <div
              key={level}
              className={`cursor-pointer rounded-xl border-2 p-6 transition-all ${
                selectedLevel === level
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-white hover:border-gray-300"
              }`}
              onClick={() => setSelectedLevel(level)}
            >
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="radio"
                  checked={selectedLevel === level}
                  onChange={() => {}}
                  className="h-4 w-4 text-blue-600"
                />
                <h3 className="text-lg font-bold text-gray-900 capitalize">
                  {level.replace("-", " ")} Level
                </h3>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{config.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span>{config.questions} Questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>{formatTime(config.timeLimit)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1).replace("-", " ")} Level Details
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{currentConfig.questions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatTime(currentConfig.timeLimit)}</div>
              <div className="text-sm text-gray-600">Time Limit</div>
            </div>
            
            <div className="rounded-lg bg-purple-50 p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Play className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{currentConfig.passing}%</div>
              <div className="text-sm text-gray-600">Passing Score</div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Exam Sections</h4>
            <div className="space-y-3">
              {currentConfig.sections.map((section, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div>
                    <span className="font-medium text-gray-900">{section.name}</span>
                    <p className="text-sm text-gray-600">{section.questions} questions</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-700">
                      {formatTime(section.time)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Important Instructions</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• This is a full-length practice exam that simulates the actual CSE</li>
                  <li>• Once started, the timer cannot be paused</li>
                  <li>• You can navigate between questions but cannot return after submission</li>
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Find a quiet environment free from distractions</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">What to Expect</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Comprehensive performance analysis after completion</p>
                  <p>• Detailed breakdown by subject and difficulty level</p>
                  <p>• Comparison with other test takers</p>
                  <p>• Personalized study recommendations</p>
                  <p>• Exam readiness assessment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleStartExam}
            disabled={isStarting}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isStarting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Starting Exam...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Start Mock Exam ({formatTime(currentConfig.timeLimit)})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MockExamSetup;
