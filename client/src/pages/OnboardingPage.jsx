import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { User, GraduationCap, Clock, Calendar } from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    examType: "",
    targetExamDate: "",
    weakSubjects: [],
    studyModes: [],
    preferredStudyTime: "",
    dailyStudyHours: "",
    agreeTerms: false,
  });

  const { closeAuthModal } = useAppStore();
  const { updateProfile } = useAuthStore();

  function handleChange(key, value) {
    setForm({ ...form, [key]: value });
    if (key === "fullName") setError("");
  }

  function toggleArray(key, value) {
    const current = form[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setForm({ ...form, [key]: updated });
  }

  function nextStep() {
    // validate basic information before proceeding
    if (step === 1) {
      if (!form.fullName) {
        setError("Please provide your full name to continue.");
        return;
      }
      setError("");
    }

    if (step < steps.length - 1) setStep(step + 1);
  }

  function prevStep() {
    if (step > 0) {
      setStep(step - 1);
    }
  }

  async function handleFinish() {
    if (!form.agreeTerms) {
      setError("You must agree to the terms to continue.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await updateProfile({
        ...form,
        isProfileComplete: true,
      });
      closeAuthModal();
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const steps = [
    {
      icon: User,
      title: "Welcome to Previlace",
      subtitle: "Your pathway to Civil Service success",
      content: (
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black text-white">
              <User size={32} />
            </div>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Welcome to Previlace</h1>
          <p className="mb-8 text-lg text-gray-600">Let's personalize your study plan quickly.</p>
          <button type="button" onClick={nextStep} className="rounded-lg bg-black px-8 py-3 text-white transition-opacity hover:opacity-90">Get Started</button>
        </div>
      ),
    },
    {
      icon: User,
      title: "Essentials",
      subtitle: "Identity & legal",
      content: (
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black" value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} placeholder="Enter your full name" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="Enter your email" />
          </div>
          <div>
            <label className="flex items-start gap-3">
              <input type="checkbox" checked={form.agreeTerms} onChange={(e) => handleChange("agreeTerms", e.target.checked)} className="mt-1 rounded" />
              <div>
                <div className="font-medium text-gray-900">Terms & Privacy Policy</div>
                <div className="text-sm text-gray-600">I agree to the terms of service and privacy policy</div>
              </div>
            </label>
          </div>
        </div>
      ),
    },
    {
      icon: GraduationCap,
      title: "Study Core",
      subtitle: "Exam & weaknesses",
      content: (
        <div className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">Exam Level</label>
            <div className="grid grid-cols-2 gap-4">
              {[{ value: "Professional", desc: "Second-level positions" }, { value: "Sub-Professional", desc: "First-level positions" }].map((type) => (
                <button type="button" key={type.value} className={`rounded-lg border-2 p-4 text-left transition-all focus:outline-none focus:ring-2 ${form.examType === type.value ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-300 bg-white text-gray-900"}`} onClick={() => handleChange("examType", type.value)}>
                  <div className="font-medium">{type.value}</div>
                  <div className="text-sm text-gray-400">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Target Exam Date</label>
            <input type="date" className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black" value={form.targetExamDate} onChange={(e) => handleChange("targetExamDate", e.target.value)} />
          </div>
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">Weak Subjects</label>
            <div className="grid grid-cols-2 gap-3">
              {["Numerical Ability", "Verbal Ability", "General Information", "Clerical Ability", "Logic & Reasoning", "Reading Comprehension", "Grammar & Language", "Philippine Constitution"].map((subject) => (
                <label key={subject} className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 p-3 transition-colors hover:bg-gray-50">
                  <input type="checkbox" checked={form.weakSubjects.includes(subject)} onChange={() => toggleArray("weakSubjects", subject)} className="rounded" />
                  <span className="text-sm text-gray-700">{subject}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: Clock,
      title: "Preferences",
      subtitle: "Study habits",
      content: (
        <div className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">Preferred Study Methods</label>
            <div className="grid grid-cols-2 gap-3">
              {["Video Lessons", "Text-based Modules", "Practice Quizzes", "Interactive Flashcards", "Mock Exams", "Study Groups"].map((mode) => (
                <label key={mode} className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 p-3 transition-colors hover:bg-gray-50">
                  <input type="checkbox" checked={form.studyModes.includes(mode)} onChange={() => toggleArray("studyModes", mode)} className="rounded" />
                  <span className="text-sm text-gray-700">{mode}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Preferred Study Time</label>
            <select className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black" value={form.preferredStudyTime} onChange={(e) => handleChange("preferredStudyTime", e.target.value)}>
              <option value="">Select time</option>
              <option value="Early Morning (5-8 AM)">Early Morning (5-8 AM)</option>
              <option value="Morning (8-12 PM)">Morning (8-12 PM)</option>
              <option value="Afternoon (12-6 PM)">Afternoon (12-6 PM)</option>
              <option value="Evening (6-10 PM)">Evening (6-10 PM)</option>
              <option value="Night (10 PM-12 AM)">Night (10 PM-12 AM)</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Daily Study Hours</label>
            <select className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black" value={form.dailyStudyHours} onChange={(e) => handleChange("dailyStudyHours", e.target.value)}>
              <option value="">Select hours</option>
              <option value="1-2 hours">1-2 hours</option>
              <option value="3-4 hours">3-4 hours</option>
              <option value="5-6 hours">5-6 hours</option>
              <option value="6+ hours">6+ hours</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      icon: Calendar,
      title: "Finish",
      subtitle: "Complete setup",
      content: (
        <div className="space-y-6">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          <button onClick={handleFinish} disabled={isSubmitting || !form.agreeTerms} className="w-full rounded-lg bg-black px-6 py-4 text-white transition-opacity hover:opacity-90 disabled:opacity-50">{isSubmitting ? "Setting up your profile..." : "Complete Setup"}</button>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
              <currentStep.icon size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{currentStep.title}</h1>
              <p className="text-sm text-gray-600">{currentStep.subtitle}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {step + 1} of {steps.length}
          </div>
        </div>

        <div className="mb-8 h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-black transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          {currentStep.content}
        </div>

        {step > 0 && step < steps.length - 1 && (
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={nextStep}
              className="rounded-lg bg-black px-6 py-3 text-white transition-opacity hover:opacity-90"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
