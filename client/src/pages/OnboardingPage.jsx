import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { User, GraduationCap, Calendar } from "lucide-react";

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

// CORE SUBJECTS
const CORE_SUBJECTS = [
    "Numerical Ability",
    "Verbal Ability",
    "General Information",
    "Clerical Ability",
    "Logic & Reasoning",
    "Reading Comprehension",
    "Grammar & Language",
    "Philippine Constitution",
];


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
        strongSubjects: [], 
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
        if (["firstName", "lastName", "agreeTerms", "examType", "targetExamMonth", "targetExamYear"].includes(key)) {
             setError(""); 
        }
    }

    function toggleArray(key, value) {
        const current = form[key];
        const updated = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        setForm({ ...form, [key]: updated });
        // Clear error when changing strong subjects
        if (key === "strongSubjects") setError(""); 
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
        
        // Validation for Step 2 (Study Core: Exam, Planning, & Subjects)
        if (step === 2) { 
            if (!form.examType || !form.targetExamDate) {
                setError("Please select your exam level and target exam month/year.");
                return;
            }
            // Subject selection is optional, no validation here.
            
            // All checks passed, move to final step (Step 3)
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
        if (!form.agreeTerms) {
            setError("You must agree to the terms to continue.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        // Calculate weakSubjects from unselected subjects
        const weakSubjects = CORE_SUBJECTS.filter(subject => !form.strongSubjects.includes(subject));

        try {
            await updateProfile({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                examType: form.examType,
                targetExamDate: form.targetExamDate, 
                strongSubjects: form.strongSubjects,
                weakSubjects: weakSubjects, 
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

    // Helper function to determine button disabled status
    const isStepButtonDisabled = () => {
        if (step === 1) { // Essentials
            return !form.firstName.trim() || !form.lastName.trim() || !form.agreeTerms;
        }
        if (step === 2) { // Study Core
            // Only check for ExamType and TargetDate.
            return !form.examType || !form.targetExamDate;
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
                    <button 
                        type="button" 
                        onClick={nextStep} 
                        className="rounded-lg bg-black px-8 py-3 text-white transition-opacity hover:opacity-90 cursor-pointer" // Added cursor-pointer
                    >
                        Get Started
                    </button>
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
                    
                    {/* AGREEMENT CHECKBOX WITH POLICY LINK (UPDATED TEXT) */}
                    <div>
                        <label className="flex items-start gap-3 cursor-pointer"> {/* Added cursor-pointer to entire label for clickability */}
                            <input 
                                type="checkbox" 
                                checked={form.agreeTerms} 
                                onChange={(e) => handleChange("agreeTerms", e.target.checked)} 
                                className="mt-1 rounded cursor-pointer" 
                            />
                            <div>
                                <div className="font-medium text-gray-900">
                                    {/* 💡 Updated text for agreement */}
                                    I have read and agree to Previlace's 
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPolicy(!showPolicy)} 
                                        className="text-black underline font-semibold ml-1 hover:text-gray-700 cursor-pointer" // Added cursor-pointer
                                    >
                                        Terms of Service and Privacy Policy
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
            subtitle: "Exam planning & subject assessment", 
            content: (
                <div className="space-y-6">
                    {/* Exam Level Selection */}
                    <div>
                        <label className="mb-3 block text-sm font-medium text-gray-700">Exam Level</label>
                        <div className="grid grid-cols-2 gap-4">
                            {[{ value: "Professional", desc: "Second-level positions" }, { value: "Sub-Professional", desc: "First-level positions" }].map((type) => (
                                <button 
                                    type="button" 
                                    key={type.value} 
                                    className={`rounded-lg border-2 p-4 text-left transition-all focus:outline-none focus:ring-2 cursor-pointer ${form.examType === type.value ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-300 bg-white text-gray-900"}`} 
                                    onClick={() => handleChange("examType", type.value)}
                                > {/* Added cursor-pointer */}
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
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer" // Added cursor-pointer
                                value={form.targetExamMonth} 
                                onChange={(e) => handleChange("targetExamMonth", e.target.value)}
                            >
                                <option value="" disabled>Select Month</option>
                                <option value="March">March</option>
                                <option value="August">August</option>
                            </select>
                            
                            {/* Year Select */}
                            <select 
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer" // Added cursor-pointer
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

                    {/* Strong Subjects Selection (Optional) */}
                    <div>
                        <label className="mb-3 block text-sm font-medium text-gray-700">Strong Subjects (Optional)</label>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {CORE_SUBJECTS.map((subject) => (
                                <label key={subject} className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 p-3 transition-colors hover:bg-gray-50">
                                    <input 
                                        type="checkbox" 
                                        checked={form.strongSubjects.includes(subject)} 
                                        onChange={() => toggleArray("strongSubjects", subject)} 
                                        className="rounded cursor-pointer" 
                                    />
                                    <span className="text-sm text-gray-700">{subject}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            icon: Calendar,
            title: "Ready to Go!", 
            subtitle: "Welcome aboard", 
            content: (
                <div className="space-y-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Setup Complete!</h2>
                    <p className="text-lg text-gray-600">We are thrilled to be part of your career journey. Your personalized study plan is now active.</p>
                    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
                    
                    {/* The final button initiates the submission and redirects */}
                    <button 
                        onClick={handleFinish} 
                        disabled={isSubmitting} 
                        className="w-full rounded-lg bg-black px-6 py-4 text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer" // Added cursor-pointer
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
                    <div className={`mt-8 flex ${step > 1 ? 'justify-between' : 'justify-end'}`}>
                        {/* Show back button only if we are past the welcome screen (step 0) and the essentials step (step 1) */}
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer" // Added cursor-pointer
                            >
                                Back
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={nextStep}
                            disabled={isStepButtonDisabled()}
                            className={`rounded-lg bg-black px-6 py-3 text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer ${step === 1 ? 'w-full' : ''}`} // Added cursor-pointer
                        >
                            {/* Button text now changes based on the new final step */}
                            {step === steps.length - 2 ? "Complete Setup" : "Continue"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}