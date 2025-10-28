import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Clock, Target, Settings } from "lucide-react";
import { Label } from "@/components/ui/Label";
import useExamStore from "@/store/examStore";

function QuizSetupPage() {
  const navigate = useNavigate();
  const [setupConfig, setSetupConfig] = useState({
    mode: "practice",
    categories: [],
    difficulty: "",
    examLevel: "Professional",
    questionCount: 10,
    timeLimit: 600,
    title: ""
  });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const { startQuizSession, startMockExam, loading, error } = useExamStore();

  function handleCategoryToggle(category) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }

  async function handleStartQuiz() {
    const config = {
      ...setupConfig,
      categories: selectedCategories.length > 0 ? selectedCategories : [],
      title: setupConfig.title || `${setupConfig.mode.charAt(0).toUpperCase() + setupConfig.mode.slice(1)} Quiz`
    };

    try {
      if (setupConfig.mode === "mock") {
        await startMockExam(setupConfig.examLevel.toLowerCase());
      } else {
        await startQuizSession(config);
      }
      navigate("/dashboard/quiz-session");
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Failed to start quiz:", err);
      }
    }
  }

  function getTimeInMinutes(seconds) {
    return Math.floor(seconds / 60);
  }

  function formatTimeLimit(seconds) {
    const minutes = Math.floor(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  }

  const categoryOptions = [
    "Numerical Ability",
    "Verbal Ability", 
    "General Information",
    "Clerical Ability",
    "Logic & Reasoning",
    "Reading Comprehension",
    "Grammar & Language",
    "Philippine Constitution"
  ];

  const modeDescriptions = {
    practice: "Unlimited practice with immediate feedback",
    timed: "Timed quiz with final results",
    mock: "Full-length practice exam",
    custom: "Customizable quiz settings"
  };

  const mockExamDefaults = {
    Professional: { questions: 170, time: 10800 },
    "Sub-Professional": { questions: 165, time: 9000 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
          <p className="mt-2 text-gray-600">Configure your quiz settings and start practicing</p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-lg">
          <div className="space-y-8">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-600" />
                <Label className="text-lg font-semibold">Quiz Mode</Label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(modeDescriptions).map(([mode, description]) => (
                  <div
                    key={mode}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      setupConfig.mode === mode
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSetupConfig({ ...setupConfig, mode })}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={setupConfig.mode === mode}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="font-semibold capitalize">{mode}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            {setupConfig.mode !== "mock" && (
              <div>
                <Label htmlFor="title" className="mb-2 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Quiz Title
                </Label>
                <input
                  id="title"
                  type="text"
                  value={setupConfig.title}
                  onChange={(e) => setSetupConfig({ ...setupConfig, title: e.target.value })}
                  placeholder="Enter quiz title (optional)"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="examLevel" className="mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Exam Level
                </Label>
                <select
                  id="examLevel"
                  value={setupConfig.examLevel}
                  onChange={(e) => setSetupConfig({ 
                    ...setupConfig, 
                    examLevel: e.target.value,
                    ...(setupConfig.mode === "mock" ? {
                      questionCount: mockExamDefaults[e.target.value].questions,
                      timeLimit: mockExamDefaults[e.target.value].time
                    } : {})
                  })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="Professional">Professional</option>
                  <option value="Sub-Professional">Sub-Professional</option>
                </select>
              </div>

              {setupConfig.mode !== "mock" && (
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <select
                    id="difficulty"
                    value={setupConfig.difficulty}
                    onChange={(e) => setSetupConfig({ ...setupConfig, difficulty: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Mixed Difficulty</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              )}
            </div>

            {setupConfig.mode !== "mock" && (
              <div>
                <Label className="mb-3 block">Subject Categories</Label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryOptions.map((category) => (
                    <label
                      key={category}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all ${
                        selectedCategories.includes(category)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">{category}</span>
                    </label>
                  ))}
                </div>
                {selectedCategories.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">All categories will be included if none selected</p>
                )}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="questionCount" className="mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Number of Questions
                </Label>
                <input
                  id="questionCount"
                  type="number"
                  min="5"
                  max="200"
                  value={setupConfig.questionCount}
                  onChange={(e) => setSetupConfig({ 
                    ...setupConfig, 
                    questionCount: parseInt(e.target.value) || 5 
                  })}
                  disabled={setupConfig.mode === "mock"}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
                />
                {setupConfig.mode === "mock" && (
                  <p className="mt-1 text-sm text-gray-500">
                    Mock exam uses standard question count ({mockExamDefaults[setupConfig.examLevel].questions} questions)
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="timeLimit" className="mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Limit
                </Label>
                <div className="flex gap-2">
                  <input
                    id="timeLimit"
                    type="number"
                    min="60"
                    max="14400"
                    step="60"
                    value={getTimeInMinutes(setupConfig.timeLimit)}
                    onChange={(e) => setSetupConfig({ 
                      ...setupConfig, 
                      timeLimit: (parseInt(e.target.value) || 10) * 60 
                    })}
                    disabled={setupConfig.mode === "mock"}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
                  />
                  <div className="flex items-center rounded-lg bg-gray-100 px-3">
                    <span className="text-sm text-gray-600">min</span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Duration: {formatTimeLimit(setupConfig.timeLimit)}
                  {setupConfig.mode === "mock" && " (Standard exam time)"}
                </p>
              </div>
            </div>

            {setupConfig.mode === "mock" && (
              <div className="rounded-lg bg-blue-50 p-4">
                <h3 className="font-semibold text-blue-900">Mock Exam Settings</h3>
                <div className="mt-2 grid gap-2 text-sm text-blue-800">
                  <div>Questions: {mockExamDefaults[setupConfig.examLevel].questions}</div>
                  <div>Time Limit: {formatTimeLimit(mockExamDefaults[setupConfig.examLevel].time)}</div>
                  <div>Format: Simulates actual {setupConfig.examLevel} CSE</div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStartQuiz}
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Starting..." : "Start Quiz"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizSetupPage;
