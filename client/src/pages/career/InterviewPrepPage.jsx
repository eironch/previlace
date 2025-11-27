import React, { useState, useEffect } from "react";
import { Mic, Play, CheckCircle, Clock, MessageSquare } from "lucide-react";
import { interviewService } from "../../services/interviewService";
import { useNavigate } from "react-router-dom";

export default function InterviewPrepPage() {
  const [activeInterview, setActiveInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await interviewService.getInterviews();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch interview history:", error);
    }
  };

  const startNewSession = async (type) => {
    setLoading(true);
    try {
      const interview = await interviewService.startInterview({ type });
      setActiveInterview(interview);
      setCurrentQuestionIndex(0);
      setAnswer("");
    } catch (error) {
      console.error("Failed to start interview:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;

    setLoading(true);
    try {
      const currentQuestion = activeInterview.questions[currentQuestionIndex];
      const updatedInterview = await interviewService.submitAnswer(activeInterview._id, {
        questionId: currentQuestion._id,
        answer,
      });
      setActiveInterview(updatedInterview);
      setAnswer("");
      
      if (currentQuestionIndex < activeInterview.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        await interviewService.completeInterview(activeInterview._id);
        setActiveInterview(null);
        fetchHistory();
        alert("Interview completed! Check your history for feedback.");
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setLoading(false);
    }
  };

  if (activeInterview) {
    const question = activeInterview.questions[currentQuestionIndex];
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Question {currentQuestionIndex + 1} of {activeInterview.questions.length}
            </h2>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {activeInterview.type.toUpperCase()}
            </span>
          </div>

          <div className="mb-8 text-center">
            <h3 className="text-2xl font-semibold text-gray-900">{question.question}</h3>
          </div>

          <div className="mb-6">
            <textarea
              rows={6}
              className="w-full rounded-lg border border-gray-300 p-4 focus:border-black focus:ring-black"
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setActiveInterview(null)}
              className="rounded-lg px-6 py-2 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitAnswer}
              disabled={loading || !answer.trim()}
              className="flex items-center gap-2 rounded-lg bg-black px-6 py-2 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Answer"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Interview Prep</h1>

        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {[
            { type: "behavioral", title: "Behavioral", desc: "Practice common HR questions" },
            { type: "technical", title: "Technical", desc: "Civil engineering concepts" },
            { type: "mixed", title: "Mixed", desc: "A blend of both types" },
          ].map((mode) => (
            <button
              key={mode.type}
              onClick={() => startNewSession(mode.type)}
              className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm transition-all hover:border-black hover:shadow-md"
            >
              <div className="mb-4 rounded-full bg-gray-100 p-4">
                <Mic className="h-8 w-8 text-gray-900" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">{mode.title}</h3>
              <p className="text-gray-600">{mode.desc}</p>
            </button>
          ))}
        </div>

        <h2 className="mb-6 text-xl font-bold text-gray-900">Practice History</h2>
        <div className="space-y-4">
          {history.map((session) => (
            <div
              key={session._id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-100 p-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{session.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(session.createdAt).toLocaleDateString()} • Score: {session.score || "N/A"}
                  </p>
                </div>
              </div>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
