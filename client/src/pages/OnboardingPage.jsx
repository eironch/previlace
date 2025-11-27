import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { BookOpen, BarChart2, CheckCircle, ArrowRight, LayoutDashboard } from "lucide-react";

export default function OnboardingPage() {
    const [step, setStep] = useState(0);
    const { closeAuthModal } = useAppStore();
    const { user } = useAuthStore();

    const steps = [
        {
            icon: LayoutDashboard,
            title: "Welcome to Previlace",
            subtitle: "Your AI-Enhanced Review Center",
            description: "We've set up your personalized dashboard based on your enrollment details. Everything you need to pass the Civil Service Exam is right here.",
            image: "dashboard_preview" // Placeholder for potential image
        },
        {
            icon: BookOpen,
            title: "Smart Study Plan",
            subtitle: "Tailored to Your Needs",
            description: "Your study plan adapts to your strengths and weaknesses. Focus on what matters most and track your daily progress.",
        },
        {
            icon: BarChart2,
            title: "Real-time Analytics",
            subtitle: "Track Your Growth",
            description: "Visualize your performance with detailed analytics. See exactly where you're improving and where you need more practice.",
        },
        {
            icon: CheckCircle,
            title: "Ready to Start?",
            subtitle: "Let's Ace This Exam",
            description: "Your account is fully configured. Jump into your dashboard and start your first review session now.",
        }
    ];

    const currentStep = steps[step];

    function nextStep() {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleFinish();
        }
    }

    function handleFinish() {
        closeAuthModal();
        // The user is already logged in, so closing the modal (if applicable) or redirecting is enough.
        // If this page is a route, we might want to navigate.
        // Assuming this component is rendered when isProfileComplete is false (or similar logic),
        // but since we auto-complete profile in admin gen, this might just be a "first login" tour.
        // For now, we'll just ensure we close any modal or redirect if needed.
        window.location.href = "/dashboard"; 
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                
                {/* Left Side - Visual/Icon */}
                <div className="w-full md:w-1/2 bg-black p-12 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="url(#grid)" />
                            <defs>
                                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                        </svg>
                    </div>
                    
                    <div className="relative z-10">
                        <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 border border-white/20">
                            <currentStep.icon className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">{currentStep.title}</h2>
                        <p className="text-gray-300 text-lg">{currentStep.subtitle}</p>
                    </div>

                    <div className="relative z-10 flex gap-2">
                        {steps.map((_, idx) => (
                            <div 
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === step ? "w-8 bg-white" : "w-2 bg-white/30"
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Side - Content & Navigation */}
                <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
                    <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            {step === 0 ? `Welcome, ${user?.firstName}!` : currentStep.title}
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            {currentStep.description}
                        </p>
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                        <button
                            onClick={() => setStep(Math.max(0, step - 1))}
                            className={`text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors ${
                                step === 0 ? "invisible" : ""
                            }`}
                        >
                            Back
                        </button>

                        <button
                            onClick={nextStep}
                            className="group flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all hover:scale-105 active:scale-95"
                        >
                            {step === steps.length - 1 ? "Go to Dashboard" : "Next"}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
