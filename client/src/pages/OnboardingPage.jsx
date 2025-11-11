import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { User, GraduationCap, Clock, Calendar } from "lucide-react";

// Helper function to generate an array of future years (e.g., 2025, 2026, 2027)
const getCurrentYear = () => new Date().getFullYear();
const getFutureYears = (count = 3) => {
    const startYear = getCurrentYear();
    return Array.from({ length: count }, (_, i) => startYear + i);
};
const FUTURE_YEARS = getFutureYears();

// Helper function to calculate the date string (e.g., "2026-03-01" or "2026-08-01")
const calculateTargetDate = (month, year) => {
    if (!month || !year) return "";
    const datePart = month === 'March' ? '03-01' : '08-01'; 
    return `${year}-${datePart}`;
};


export default function OnboardingPage() {
    const [step, setStep] = useState(0);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [showPolicy, setShowPolicy] = useState(false); 
    
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        examType: "",
        targetExamMonth: "", 
        targetExamYear: "", 
        targetExamDate: "", 
        studyModes: [],
        preferredStudyTime: "",
        agreeTerms: false,
    });

    const { closeAuthModal } = useAppStore();
    const { user, updateProfile } = useAuthStore();

    function handleChange(key, value) {
        let newForm = { ...form, [key]: value };

        if (key === 'targetExamMonth' || key === 'targetExamYear') {
            const month = key === 'targetExamMonth' ? value : form.targetExamMonth;
            const year = key === 'targetExamYear' ? value : form.targetExamYear;
            newForm.targetExamDate = calculateTargetDate(month, year);
        }
        
        setForm(newForm);
        // Clear error when changing relevant fields
        if (["firstName", "lastName", "agreeTerms", "examType", "targetExamMonth", "targetExamYear", "preferredStudyTime"].includes(key)) {
             setError(""); 
        }
    }

    function toggleArray(key, value) {
        const current = form[key];
        const updated = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        setForm({ ...form, [key]: updated });
        // Clear error when changing study modes
        if (key === "studyModes") setError(""); 
    }

    function nextStep() {
        if (step === 1) { // Validation for Identity & Legal
            if (!form.firstName.trim() || !form.lastName.trim()) {
                setError("Please provide your first and last name to continue.");
                return;
            }
            if (!form.agreeTerms) {
                setError("You must agree to the Terms & Privacy Policy to continue.");
                return;
            }
            setError("");
        }
        
        if (step === 2) { // Validation for Exam & Planning
             if (!form.examType || !form.targetExamDate) {
                setError("Please select your exam level and target exam month/year.");
                return;
            }
            setError("");
        }

        // 💡 Validation for Step 3 (Preferences/Study Habits)
        if (step === 3) {
            if (form.studyModes.length === 0) {
                setError("Please select at least one preferred study method.");
                return;
            }
            if (!form.preferredStudyTime) {
                setError("Please select your preferred study time.");
                return;
            }
            // All checks passed, move to final step (Step 4)
            setError("");
            setStep(step + 1);
            return;
        }

        if (step < steps.length - 1) setStep(step + 1);
    }

    function prevStep() {
        if (step > 0) {
            setStep(step - 1);
        }
    }

    async function handleFinish() {
        // We rely on validation in nextStep, but keep a final failsafe check here
        if (!form.agreeTerms) {
            setError("You must agree to the terms to continue.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            await updateProfile({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                examType: form.examType,
                targetExamDate: form.targetExamDate, 
                studyModes: form.studyModes,
                preferredStudyTime: form.preferredStudyTime,
                agreeTerms: form.agreeTerms,
                isProfileComplete: true,
            });
            closeAuthModal();
        } catch {
            setError("Failed to save profile. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }
    
    // Placeholder content for Policy
    const PolicyContent = () => (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-60 overflow-y-auto text-xs text-gray-700 mt-4 transition-all duration-300">
            <h4 className="font-bold mb-2 text-black">Previlace Terms of Service & Privacy Policy</h4>
            <p className="mb-3 font-semibold">Terms of Service Summary:</p>
            <ul className="list-disc ml-4 space-y-1 mb-3">
                <li>**Use of Service**: The platform is for Civil Service Exam preparation only.</li>
                <li>**Intellectual Property**: All quiz content, flashcards, and mock exams are copyrighted material of Previlace.</li>
                <li>**Disclaimer**: We do not guarantee passing the exam. Our tools are aids for study.</li>
            </ul>
            <p className="mb-3 font-semibold">Privacy Policy Summary:</p>
            <ul className="list-disc ml-4 space-y-1">
                <li>**Data Collected**: Name, email, exam type, study preferences, and performance data.</li>
                <li>**Purpose**: Data is used strictly for personalizing your study plan and improving platform services.</li>
                <li>**Sharing**: We do not sell your personal data. Data may be shared in anonymized form for analytics.</li>
            </ul>
        </div>
    );

    // 💡 Helper function to determine button disabled status
    const isStepButtonDisabled = () => {
        if (step === 1) {
            return !form.firstName.trim() || !form.lastName.trim() || !form.agreeTerms;
        }
        if (step === 2) {
            return !form.examType || !form.targetExamDate;
        }
        if (step === 3) {
            // Disabled if no study mode or no preferred time is selected
            return form.studyModes.length === 0 || !form.preferredStudyTime;
        }
        return false;
    };
    // ----------------------------------------------------


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
                        <label className="mb-2 block text-sm font-medium text-gray-700">First Name</label>
                        <input 
                            type="text" 
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black" 
                            value={form.firstName} 
                            onChange={(e) => handleChange("firstName", e.target.value)} 
                            placeholder="Enter your first name" 
                            autoComplete="given-name"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Last Name</label>
                        <input 
                            type="text" 
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black" 
                            value={form.lastName} 
                            onChange={(e) => handleChange("lastName", e.target.value)} 
                            placeholder="Enter your last name" 
                            autoComplete="family-name"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email" 
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-gray-500" 
                            value={user?.email || 'Email provided via sign-up'} 
                            disabled 
                        />
                    </div>
                    
                    {/* AGREEMENT CHECKBOX WITH POLICY LINK */}
                    <div>
                        <label className="flex items-start gap-3">
                            <input 
                                type="checkbox" 
                                checked={form.agreeTerms} 
                                onChange={(e) => handleChange("agreeTerms", e.target.checked)} 
                                className="mt-1 rounded" 
                            />
                            <div>
                                <div className="font-medium text-gray-900">
                                    I agree to the 
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPolicy(!showPolicy)} 
                                        className="text-black underline font-semibold ml-1 hover:text-gray-700"
                                    >
                                        Terms & Privacy Policy
                                    </button>
                                </div>
                                <div className="text-sm text-gray-600">You must agree to continue.</div>
                            </div>
                        </label>
                    </div>

                    {/* POLICY CONTENT (Collapsible) */}
                    {showPolicy && <PolicyContent />}
                </div>
            ),
        },
        {
            icon: GraduationCap,
            title: "Study Core",
            subtitle: "Exam & planning", 
            content: (
                <div className="space-y-6">
                    <div>
                        <label className="mb-3 block text-sm font-medium text-gray-700">Exam Level</label>
                        <div className="grid grid-cols-2 gap-4">
                            {[{ value: "Professional", desc: "Second-level positions" }, { value: "Sub-Professional", desc: "First-level positions" }].map((type) => (
                                <button type="button" key={type.value} className={`rounded-lg border-2 p-4 text-left transition-all focus:outline-none focus:ring-2 ${form.examType === type.value ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-300 bg-white text-gray-900"}`} onClick={() => handleChange("examType", type.value)}>
                                    <div className="font-medium">{type.value}</div>
                                    <div className={`text-sm ${form.examType === type.value ? "text-gray-300" : "text-gray-500"}`}>{type.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Target Exam Month and Year Selects */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Target Exam Date</label>
                        <div className="grid grid-cols-2 gap-4">
                             {/* Month Select */}
                            <select 
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black" 
                                value={form.targetExamMonth} 
                                onChange={(e) => handleChange("targetExamMonth", e.target.value)}
                            >
                                <option value="" disabled>Select Month</option>
                                <option value="March">March</option>
                                <option value="August">August</option>
                            </select>
                            
                            {/* Year Select */}
                            <select 
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black" 
                                value={form.targetExamYear} 
                                onChange={(e) => handleChange("targetExamYear", e.target.value)}
                            >
                                <option value="" disabled>Select Year</option>
                                {FUTURE_YEARS.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        
                         {form.targetExamDate && (
                            <p className="mt-2 text-xs text-gray-500">Target Date calculated: {form.targetExamDate}</p>
                        )}
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
                            {["Text-based Modules", "Practice Quizzes", "Interactive Flashcards", "Mock Exams"].map((mode) => (
                                <label key={mode} className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 p-3 transition-colors hover:bg-gray-50">
                                    <input type="checkbox" checked={form.studyModes.includes(mode)} onChange={() => toggleArray("studyModes", mode)} className="rounded" />
                                    <span className="text-sm text-gray-700">{mode}</span>
                                </label>
                            ))}
                        </div>
                        {/* Show error immediately if none are selected */}
                        {step === 3 && form.studyModes.length === 0 && (
                            <p className="text-sm text-red-500 mt-2">Please select at least one study method.</p>
                        )}
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Preferred Study Time</label>
                        <select className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black" value={form.preferredStudyTime} onChange={(e) => handleChange("preferredStudyTime", e.target.value)}>
                            <option value="">Select time</option>
                            {/* Simplified options */}
                            <option value="Morning">Morning</option>
                            <option value="Afternoon">Afternoon</option>
                            <option value="Evening">Evening</option>
                            <option value="Flexible">Flexible</option>
                        </select>
                        {/* Show error immediately if none is selected */}
                        {step === 3 && !form.preferredStudyTime && (
                            <p className="text-sm text-red-500 mt-2">Please select your preferred study time.</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            icon: Calendar,
            title: "Ready to Go!", // 💡 Updated Title
            subtitle: "Welcome aboard", // 💡 Updated Subtitle
            content: (
                <div className="space-y-6 text-center">
                    <div className="text-4xl font-extrabold text-black">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-900">Setup Complete!</h2>
                    <p className="text-lg text-gray-600">We are thrilled to be part of your career journey. Your personalized study plan is now active.</p>
                    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
                    
                    {/* The final button initiates the submission and redirects */}
                    <button 
                        onClick={handleFinish} 
                        disabled={isSubmitting} 
                        className="w-full rounded-lg bg-black px-6 py-4 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {isSubmitting ? "Setting up your profile..." : "Start Studying"}
                    </button>
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
                    {/* Display general error at the bottom of the content card */}
                    {error && step < steps.length -1 && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 mt-6">{error}</div>}
                </div>

                {/* Navigation buttons are only shown between the introduction and the final screen */}
                {step > 0 && step < steps.length - 1 && (
                    <div className="mt-8 flex justify-between">
                        {/* Show back button only if we are past the welcome screen */}
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Back
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={nextStep}
                            disabled={isStepButtonDisabled()}
                            className="rounded-lg bg-black px-6 py-3 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {/* 💡 Button text now changes based on step */}
                            {step === steps.length - 2 ? "Complete Setup" : "Continue"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}