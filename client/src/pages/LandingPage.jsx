import Button from "@/components/ui/Button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { useTestimonialsStore } from "@/store/testimonialsStore";
import { useStatsStore } from "@/store/statsStore";
import TestimonialSubmissionModal from '@/components/modals/TestimonialSubmissionModal';
import ApprovedTestimonials from '../components/testimonials/ApprovedTestimonials'; // 💡 Keep this import
import KeyStatistics from '../components/stats/KeyStatistics'; // 💡 Keep this import

import {
    BookOpen,
    TrendingUp,
    Target,
    Quote,
    CheckCircle,
    ArrowRight,
    Trophy,
    Briefcase,
    Layers,
    Repeat,
    Send,
} from "lucide-react";

export default function LandingPage() {
    const { openAuthModal } = useAppStore();
    const { isAuthenticated, user } = useAuthStore();
    const navigate = useNavigate();
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);

    // Get the action to refresh testimonials
    const { fetchApprovedTestimonials } = useTestimonialsStore();

    const showSubmitTestimonialButton = isAuthenticated && user?.role !== 'admin' && user?.isProfileComplete;

    // FUNCTION TO HANDLE AUTHENTICATED BUTTON CLICK
    const handleStartLearningClick = () => {
        if (user.role === 'admin') {
            navigate('/admin');
        } else if (!user?.isProfileComplete) {
            navigate('/onboarding');
        } else {
            navigate('/dashboard');
        }
    };


    // --- Helper Components for Buttons (Updated with cursor-pointer) ---

    const AuthButtons = () => (
        <div className="flex items-center space-x-3">
            <Button
                variant="outline"
                size="sm"
                onClick={() => openAuthModal("login")}
                className="cursor-pointer" // Added cursor-pointer
            >
                Sign In
            </Button>
            <Button 
                size="sm" 
                onClick={() => openAuthModal("register")}
                className="cursor-pointer" // Added cursor-pointer
            >
                Get Started
            </Button>
        </div>
    );

    const DashboardButton = ({ size = "sm", variant, className }) => (
        <Button 
            size={size} 
            onClick={handleStartLearningClick} 
            variant={variant} 
            className={`cursor-pointer ${className}`} // Added cursor-pointer
        >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
    );

    // --- Feature and Stats data (Unchanged) ---
    const features = [
        { icon: BookOpen, title: "Comprehensive Question Bank", description: "Access hundreds of Civil Service Exam questions organized by subject and difficulty." },
        { icon: Layers, title: "Mock Exams & Practice Quizzes", description: "Simulate real exam conditions and measure your readiness with full-length mock exams." },
        { icon: TrendingUp, title: "Progress Tracking", description: "View analytics on your scores, study time, and weak areas to improve effectively." },
        { icon: Trophy, title: "Achievements & Leaderboards", description: "Earn badges, climb ranks, and compete with other learners for motivation." },
        { icon: Repeat, title: "Flashcards & Mistake Review", description: "Reinforce memory with spaced repetition and reattempt questions you previously missed." },
        { icon: Briefcase, title: "Career Advancement Tools", description: "Access smart tools that help you build a professional resume and discover job opportunities tailored to your qualifications and exam performance."
}    ];


    return (
        <div className="min-h-screen bg-white">
            {/* Header (Unchanged) */}
            <header className="border-b">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center">
                            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-black">
                                <Target className="h-4 w-4 text-white" />
                            </div>
                            <h1 className="text-xl font-semibold">Previlace</h1>
                        </div>
                        {/* HEADER BUTTON CHANGE */}
                        {isAuthenticated ? <DashboardButton /> : <AuthButtons />}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Hero Section (Unchanged) */}
                <section className="py-16 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black">
                        <Target className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="mb-4 text-4xl font-semibold">
                        Prepare. Pass. Pursue Your Career.
                    </h1>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
                        Previllace is your all-in-one platform for Civil Service Exam
                        preparation and government career development. Study smart,
                        practice confidently, and find opportunities that match your goals.
                    </p>

                    {/* HERO BUTTON CHANGE */}
                    <div className="flex justify-center space-x-3">
                        {isAuthenticated ? (
                            <DashboardButton size="lg" />
                        ) : (
                            <>
                                <Button 
                                    size="lg" 
                                    onClick={() => openAuthModal("register")}
                                    className="cursor-pointer" // Added cursor-pointer
                                >
                                    Start Learning
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => openAuthModal("login")}
                                    className="cursor-pointer" // Added cursor-pointer
                                >
                                    Sign In
                                </Button>
                            </>
                        )}
                    </div>
                </section>
                    <KeyStatistics />


                {/* Features (Unchanged) */}
                <section className="py-12">
                    <h2 className="mb-8 text-center text-2xl font-semibold">
                        Everything You Need to Succeed
                    </h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-black">
                                        <feature.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <CardTitle>{feature.title}</CardTitle>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-12">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black">
                            <Quote className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="mb-2 text-2xl font-semibold">
                            Trusted by Thousands of Civil Service Passers
                        </h2>
                        <p className="mb-12 text-gray-600">
                            Real stories from our learners who achieved success with Previlace
                        </p>
                    </div>

                    {/* Submission Button */}
                    {showSubmitTestimonialButton && (
                        <div className="flex justify-center mb-10">
                            <Button 
                                className="bg-black text-white hover:bg-gray-800 active:bg-gray-900 transition-all duration-150 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-gray-900 cursor-pointer" // Added cursor-pointer
                                onClick={() => setIsSubmissionModalOpen(true)}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                <span className="font-semibold tracking-wide">
                                    Submit Your Success Story
                                </span>
                            </Button>
                        </div>
                    )}

                    {/* 💡 REPLACED: Manual display loop with the dedicated component */}
                    <ApprovedTestimonials />

                </section>

                {/* Call to Action (Unchanged) */}
                <section className="py-12 text-center">
                    <div className="rounded-lg bg-black p-8 text-white">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white">
                            <CheckCircle className="h-6 w-6 text-black" />
                        </div>
                        <h2 className="mb-3 text-2xl font-semibold">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="mb-6 text-gray-300">
                            Join thousands of successful Civil Service Exam passers and begin
                            your path toward a government career today.
                        </p>
                        {/* CTA BUTTON CHANGE */}
                        {isAuthenticated ? (
                            <DashboardButton 
                                size="lg" 
                                variant="outline" 
                                className="border-white text-black hover:bg-white" 
                            />
                        ) : (
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white text-black hover:bg-white cursor-pointer" // Added cursor-pointer
                                onClick={() => openAuthModal("register")}
                            >
                                Create Your Free Account
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </section>
            </main>

            {/* TESTIMONIAL SUBMISSION MODAL */}
            {isSubmissionModalOpen && (
                <TestimonialSubmissionModal
                    onClose={() => setIsSubmissionModalOpen(false)}
                    // 💡 IMPORTANT: On successful submit, tell the store component to refresh its data
                    onSuccessfulSubmit={fetchApprovedTestimonials}
                />
            )}

            {/* Footer (Unchanged) */}
            <footer className="mt-16 border-t">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="text-center text-sm text-gray-500">
                        <p>&copy; 2025 Previlace. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}