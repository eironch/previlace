import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import { useManualQuestionStore } from "@/store/manualQuestionStore";

export default function DevTools() {
  const { user, set, logout } = useAuthStore();
  const { setShowAuthModal } = useAppStore();
  const { createQuestion, fetchQuestions, fetchQuestionCounts, resetFilters } = useManualQuestionStore();
  const [isCreatingTest, setIsCreatingTest] = useState(false);

  const sampleQuestions = [
    {
      questionText: "What is the capital of the Philippines?",
      questionType: "multiple_choice",
      options: [
        { text: "Manila", isCorrect: true },
        { text: "Cebu", isCorrect: false },
        { text: "Davao", isCorrect: false },
        { text: "Iloilo", isCorrect: false },
      ],
      explanation: "Manila is the capital and second-most populous city of the Philippines.",
      category: "General Information",
      subjectArea: "General Information",
      difficulty: "Beginner",
      examLevel: "Both",
      language: "English",
      status: "draft",
      metadata: {
        source: "manual",
        version: 1,
      },
    },
    {
      questionText: "The statement 'All government employees must pass the Civil Service Examination' is:",
      questionType: "true_false",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
      explanation: "Some positions are exempt from the Civil Service Examination requirement.",
      category: "General Information",
      subjectArea: "General Information",
      difficulty: "Intermediate",
      examLevel: "Professional",
      language: "English",
      status: "review",
      metadata: {
        source: "manual",
        version: 1,
      },
    },
    {
      questionText: "Calculate 15% of 240.",
      questionType: "numeric",
      explanation: "15% of 240 = 0.15 × 240 = 36",
      category: "Mathematics",
      subjectArea: "Numerical Ability",
      difficulty: "Beginner",
      examLevel: "Both",
      language: "English",
      status: "draft",
      metadata: {
        source: "manual",
        version: 1,
      },
    },
  ];

  async function handleCreateTestQuestions() {
    setIsCreatingTest(true);
    
    try {
      for (const questionData of sampleQuestions) {
        await createQuestion(questionData);
      }

      resetFilters();
      const reviewFilter = { status: ["draft", "review"] };
      await fetchQuestions(1, reviewFilter);
      await fetchQuestionCounts(reviewFilter);

      alert("Test questions created successfully!");
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error creating test questions:", error);
      }
      alert("Error creating test questions.");
    } finally {
      setIsCreatingTest(false);
    }
  }

  const resetProfile = () => {
    // reset profile-related localStorage and state
    localStorage.removeItem("user_data");
    set({ user: null, isAuthenticated: false });
    alert("Profile data reset (local)");
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    alert("localStorage cleared");
  };

  const triggerLogout = async () => {
    await logout();
    alert("Logged out");
  };

  const openAuth = () => setShowAuthModal(true);

  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 9999 }}>
      <div className="bg-black text-white rounded-full p-3 shadow-lg w-12 h-12 flex items-center justify-center cursor-pointer">
        <button
          aria-label="dev-tools"
          onClick={() => {
            const el = document.getElementById("devtools-panel");
            if (el) el.style.display = el.style.display === "none" ? "block" : "none";
          }}
          className="w-full h-full"
        >
          ⚙️
        </button>
      </div>

      <div id="devtools-panel" style={{ display: "none", marginTop: 8 }}>
        <div className="bg-white rounded-lg shadow-lg p-4 w-64 text-sm">
          <div className="mb-2 font-semibold">Dev Tools</div>
          <div className="space-y-2">
            <button onClick={resetProfile} className="w-full rounded border px-2 py-1">Reset profile data</button>
            <button onClick={clearLocalStorage} className="w-full rounded border px-2 py-1">Clear localStorage</button>
            <button onClick={triggerLogout} className="w-full rounded border px-2 py-1">Logout</button>
            <button onClick={openAuth} className="w-full rounded border px-2 py-1">Open auth modal</button>
            <button onClick={() => location.reload()} className="w-full rounded border px-2 py-1">Reload page</button>
            <button onClick={() => console.log({ user })} className="w-full rounded border px-2 py-1">Log user to console</button>
            <button onClick={handleCreateTestQuestions} disabled={isCreatingTest} className="w-full rounded border px-2 py-1 bg-blue-100">
              {isCreatingTest ? "Creating..." : "Add Test Questions"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
