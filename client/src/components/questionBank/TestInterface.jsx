import { useState, useEffect } from "react";
import { useTestStore } from "../../store/testStore";
import TestQuestion from "./TestQuestion";
import TestTimer from "./TestTimer";
import TestNavigation from "./TestNavigation";
import TestResults from "./TestResults";
import Button from "../ui/button";
import { Play, Settings } from "lucide-react";

function TestInterface() {
  const [showConfiguration, setShowConfiguration] = useState(true);
  const [config, setConfig] = useState({
    title: "",
    category: "",
    subjectArea: "",
    difficulty: "",
    examLevel: "Professional",
    questionCount: 10,
    timeLimit: 600,
  });

  const {
    currentTest,
    testQuestions,
    currentQuestionIndex,
    isActive,
    testResult,
    error,
    startTest,
    resetTest,
    getCurrentQuestion,
  } = useTestStore();

  useEffect(() => {
    return () => {
      if (isActive) {
        resetTest();
      }
    };
  }, []);

  function updateConfig(field, value) {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }

  async function handleStartTest() {
    const result = await startTest(config);

    if (result.success) {
      setShowConfiguration(false);
    }
  }

  function handleBackToConfig() {
    resetTest();
    setShowConfiguration(true);
  }

  const currentQuestion = getCurrentQuestion();

  if (testResult) {
    return <TestResults onBackToConfig={handleBackToConfig} />;
  }

  if (showConfiguration || !currentTest) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-black">
                Start New Test
              </h1>
              <p className="text-gray-600">
                Configure your practice test settings
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Test Title
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => updateConfig("title", e.target.value)}
                  placeholder="Enter test title"
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Exam Level
                  </label>
                  <select
                    value={config.examLevel}
                    onChange={(e) => updateConfig("examLevel", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Subprofessional">Subprofessional</option>
                    <option value="Both">Both Levels</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Category
                  </label>
                  <select
                    value={config.category}
                    onChange={(e) => updateConfig("category", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Vocabulary">Vocabulary</option>
                    <option value="Grammar">Grammar</option>
                    <option value="Reading Comprehension">
                      Reading Comprehension
                    </option>
                    <option value="General Information">
                      General Information
                    </option>
                    <option value="Clerical">Clerical</option>
                    <option value="Analytical Reasoning">
                      Analytical Reasoning
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Subject Area
                  </label>
                  <select
                    value={config.subjectArea}
                    onChange={(e) =>
                      updateConfig("subjectArea", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">All Subject Areas</option>
                    <option value="Verbal Ability">Verbal Ability</option>
                    <option value="Numerical Ability">Numerical Ability</option>
                    <option value="General Information">
                      General Information
                    </option>
                    <option value="Clerical Ability">Clerical Ability</option>
                    <option value="Logic">Logic</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Difficulty
                  </label>
                  <select
                    value={config.difficulty}
                    onChange={(e) => updateConfig("difficulty", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">All Difficulties</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={config.questionCount}
                    onChange={(e) =>
                      updateConfig("questionCount", parseInt(e.target.value))
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={config.timeLimit / 60}
                    onChange={(e) =>
                      updateConfig("timeLimit", parseInt(e.target.value) * 60)
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <Button
                onClick={handleStartTest}
                className="flex w-full items-center justify-center gap-2 py-3"
              >
                <Play className="h-5 w-5" />
                Start Test
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading test questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackToConfig}>
              <Settings className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-black">
                {currentTest.title}
              </h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {testQuestions.length}
              </p>
            </div>
          </div>

          <TestTimer />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <TestQuestion question={currentQuestion} />
          </div>

          <div className="lg:col-span-1">
            <TestNavigation />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestInterface;
