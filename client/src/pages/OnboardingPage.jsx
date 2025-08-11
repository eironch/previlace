import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    examType: "",
    education: "",
    hasTakenExam: "",
    previousScore: "",
    reviewExperience: "",
    struggles: [],
    studyMode: [],
    studyTime: "",
    hoursPerWeek: "",
    targetDate: "",
    reason: "",
    targetScore: "",
    showLeaderboard: false,
    receiveReminders: false,
    studyBuddy: false,
    agreeTerms: false,
  });

  const { closeAuthModal } = useAppStore();
  const { updateProfile } = useAuthStore();

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const toggleCheckbox = (key, value) => {
    const current = form[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setForm({ ...form, [key]: updated });
  };

  const handleFinish = async () => {
    if (form.agreeTerms) {
      try {
        await updateProfile({
          ...form,
          isProfileComplete: true
        });
        closeAuthModal();
      } catch (error) {
        alert("Failed to save profile. Please try again.");
      }
    } else {
      alert("You must agree to the terms.");
    }
  };

  const steps = [
    {
      content: (
        <>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Welcome Onboard!</h1>
          <p className="text-gray-700 text-lg mb-6">Let's pass that exam together.</p>
          <button
            onClick={() => setStep(step + 1)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Let's Get Started
          </button>
        </>
      ),
    },
    {
      content: (
        <>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">What are you studying for?</h2>
          <div className="flex gap-4">
            {["Professional", "Subprofessional"].map((type) => (
              <button
                key={type}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  form.examType === type ? "bg-gray-200" : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => handleChange("examType", type)}
              >
                {type}
              </button>
            ))}
          </div>
        </>
      ),
    },
    {
      content: (
        <>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Academic & Review Background</h2>
          <label className="block mb-2 text-gray-700">Highest Educational Attainment:</label>
          <input
            type="text"
            className="w-full border p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-black"
            value={form.education}
            onChange={(e) => handleChange("education", e.target.value)}
          />
          <label className="block mb-2 text-gray-700">Have you taken the Civil Service Exam before?</label>
          <div className="flex gap-4 mb-2">
            {["Yes", "No"].map((ans) => (
              <button
                key={ans}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  form.hasTakenExam === ans ? "bg-gray-200" : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => handleChange("hasTakenExam", ans)}
              >
                {ans}
              </button>
            ))}
          </div>
          {form.hasTakenExam === "Yes" && (
            <input
              type="text"
              placeholder="Previous score or result"
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
              value={form.previousScore}
              onChange={(e) => handleChange("previousScore", e.target.value)}
            />
          )}
        </>
      ),
    },
    {
      content: (
        <>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Review Experience</h2>
          <select
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
            value={form.reviewExperience}
            onChange={(e) => handleChange("reviewExperience", e.target.value)}
          >
            <option value="">Select one</option>
            <option value="Self-study">Self-study</option>
            <option value="Review center (in person)">Review center (in person)</option>
            <option value="None">None</option>
          </select>
        </>
      ),
    },
    {
      content: (
        <>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Learning Preferences</h2>
          <label className="block mb-1 text-gray-700">Subjects you struggle with most:</label>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {["Numerical Ability", "Verbal Ability", "General Information", "Clerical Ability", "Logic", "Grammar"].map((subject) => (
              <label key={subject} className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={form.struggles.includes(subject)}
                  onChange={() => toggleCheckbox("struggles", subject)}
                />
                {subject}
              </label>
            ))}
          </div>
          <label className="block mb-1 text-gray-700">Preferred study mode:</label>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {["Video Lessons", "Text Modules", "Practice Quizzes", "Live Sessions"].map((mode) => (
              <label key={mode} className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={form.studyMode.includes(mode)}
                  onChange={() => toggleCheckbox("studyMode", mode)}
                />
                {mode}
              </label>
            ))}
          </div>
          <label className="block mb-1 text-gray-700">Preferred study time:</label>
          <select
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
            value={form.studyTime}
            onChange={(e) => handleChange("studyTime", e.target.value)}
          >
            <option value="">Select</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
            <option value="Flexible">Flexible</option>
          </select>
        </>
      ),
    },
    {
      content: (
        <>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Goal Setting</h2>
          <label className="block mb-2 text-gray-700">How many hours/week can you study?</label>
          <input
            type="number"
            className="w-full border p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-black"
            value={form.hoursPerWeek}
            onChange={(e) => handleChange("hoursPerWeek", e.target.value)}
          />
          <label className="block mb-2 text-gray-700">Target Exam Date</label>
          <input
            type="date"
            className="w-full border p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-black"
            value={form.targetDate}
            onChange={(e) => handleChange("targetDate", e.target.value)}
          />
          <label className="block mb-2 text-gray-700">Main Reason for Taking the Exam</label>
          <select
            className="w-full border p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-black"
            value={form.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
          >
            <option value="">Select</option>
            <option value="Government Job">Government Job</option>
            <option value="Career Advancement">Career Advancement</option>
            <option value="Personal Development">Personal Development</option>
            <option value="Other">Other</option>
          </select>
          <label className="block mb-2 text-gray-700">Target Score or Result (optional)</label>
          <input
            type="text"
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
            value={form.targetScore}
            onChange={(e) => handleChange("targetScore", e.target.value)}
          />
        </>
      ),
    },
    {
      content: (
        <>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Optional Enhancements</h2>
          <label className="flex items-center gap-2 mb-2 text-gray-700">
            <input
              type="checkbox"
              checked={form.showLeaderboard}
              onChange={(e) => handleChange("showLeaderboard", e.target.checked)}
            />
            Include me in the leaderboard
          </label>
          <label className="flex items-center gap-2 mb-2 text-gray-700">
            <input
              type="checkbox"
              checked={form.receiveReminders}
              onChange={(e) => handleChange("receiveReminders", e.target.checked)}
            />
            Receive reminders/motivational messages
          </label>
          <label className="flex items-center gap-2 mb-2 text-gray-700">
            <input
              type="checkbox"
              checked={form.studyBuddy}
              onChange={(e) => handleChange("studyBuddy", e.target.checked)}
            />
            Match me with a study buddy/group
          </label>
        </>
      ),
    },
    {
      content: (
        <>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Privacy & Consent</h2>
          <label className="flex items-center gap-2 mb-4 text-gray-700">
            <input
              type="checkbox"
              checked={form.agreeTerms}
              onChange={(e) => handleChange("agreeTerms", e.target.checked)}
            />
            I agree to the terms and privacy policy.
          </label>
          <button
            onClick={handleFinish}
            className="px-6 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Finish & Go to Dashboard
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 flex items-center justify-center px-4 py-12">
      <div 
        key={step}
        className="w-full max-w-xl space-y-6 animate-fade-in"
      >
        {steps[step].content}
        {step < steps.length - 1 && (
          <div className="text-right">
            <button
              onClick={() => setStep(step + 1)}
              className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
