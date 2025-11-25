import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";

import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { useTestimonialsStore } from "@/store/testimonialsStore";

import TestimonialSubmissionModal from "@/components/modals/TestimonialSubmissionModal";
import ApprovedTestimonials from "@/components/testimonials/ApprovedTestimonials";
import KeyStatistics from "@/components/stats/KeyStatistics";


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
  LogOut,
  Menu,
  X,
  User,
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { openAuthModal, showAuthModal } = useAppStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { fetchApprovedTestimonials } = useTestimonialsStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);

  const showSubmitTestimonialButton =
    isAuthenticated && user?.role !== "admin" && user?.isProfileComplete;

  async function handleLogout() {
    await logout();
    setMobileMenuOpen(false);
  }

  const handleStartLearningClick = () => {
    if (user.role === "admin") navigate("/admin");
    else if (!user?.isProfileComplete) navigate("/onboarding");
    else navigate("/dashboard");
  };

  const AuthButtons = () => (
    <div className="flex items-center space-x-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => openAuthModal("login")}
        className="cursor-pointer"
      >
        Sign In
      </Button>
      <Button
        size="sm"
        onClick={() => openAuthModal("register")}
        className="cursor-pointer"
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
      className={`cursor-pointer flex items-center gap-2 ${className}`}
    >
      Go to Dashboard
      <ArrowRight className="h-4 w-4" />
    </Button>
  );


  const features = [
    {
      icon: Calendar,
      title: "Structured 12-Week Plan",
      description:
        "From Week 0 Pretest to Exam Day, follow a proven daily schedule that covers all exam domains systematically.",
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description:
        "Track your Exam Readiness Score in real-time and identify weak areas with precision data visualization.",
    },
    {
      icon: Trophy,
      title: "Gamified Learning",
      description:
        "Stay motivated with XP, levels, daily streaks, and leaderboards. Learning feels like a game.",
    },
    {
      icon: CheckCircle,
      title: "Adaptive Assessments",
      description:
        "Weekly Post-Tests and Assessments that adapt to your performance to reinforce learning.",
    },
    {
      icon: FileText,
      title: "Realistic Mock Exams",
      description:
        "Full-length, timed simulations that mimic the actual Civil Service Exam experience.",
    },
    {
      icon: Users,
      title: "Community & Challenges",
      description:
        "Join study groups, challenge peers to quizzes, and learn together in a supportive community.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ------------------------------------------------------ */}
      {/* HEADER — Professional Responsive Version */}
      {/* ------------------------------------------------------ */}
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* BRAND */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black">
                <Target className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-[1.25rem] font-semibold tracking-tight">
                Previlace
              </h1>
            </div>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center gap-4">
              {!isAuthenticated ? (
                <AuthButtons />
              ) : (
                <>
                  <span className="text-sm text-gray-600 font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <DashboardButton />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Button>
                </>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              className="md:hidden p-2 rounded-lg border bg-white active:scale-95"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* MOBILE DROPDOWN */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 border rounded-lg shadow-sm bg-white overflow-hidden animate-fadeIn">
              {!isAuthenticated ? (
                <div className="p-4 space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAuthModal("login")}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openAuthModal("register")}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* User */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-black text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                  </div>

                  {/* Menu options */}
                  <Button
                    onClick={() => {
                      handleStartLearningClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------ */}
      {/* HERO */}
      {/* ------------------------------------------------------ */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black">
            <Target className="h-8 w-8 text-white" />
          </div>

          <h1 className="mb-4 text-4xl font-semibold tracking-tight">
            Your 12-Week Guided Journey to Civil Service Success
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
            Stop guessing what to study. Previlace provides a structured, adaptive plan that takes you from Week 0 to Exam Ready with personalized analytics and gamified learning.
          </p>

          <div className="flex justify-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Button
                  size="lg"
                  onClick={() => openAuthModal("register")}
                  className="cursor-pointer"
                >
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => openAuthModal("login")}
                >
                  Sign In
                </Button>
              </>
            ) : (
              <DashboardButton size="lg" />
            )}
          </div>
        </section>

        {/* STATS */}
        <KeyStatistics />

        {/* FEATURES */}
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

        {/* TESTIMONIALS */}
        <section className="py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black">
              <Quote className="h-6 w-6 text-white" />
            </div>

            <h2 className="mb-2 text-2xl font-semibold">
              Trusted by Thousands of Civil Service Passers
            </h2>
            <p className="mb-12 text-gray-600">
              Real stories from learners who achieved success with Previlace
            </p>
          </div>

          {showSubmitTestimonialButton && (
            <div className="flex justify-center mb-10">
              <Button
                className="bg-black text-white hover:bg-gray-800 transition shadow-lg hover:shadow-xl cursor-pointer"
                onClick={() => setIsSubmissionModalOpen(true)}
              >
                <Send className="mr-2 h-4 w-4" />
                Submit Your Success Story
              </Button>
            </div>
          )}

          <ApprovedTestimonials />
        </section>

        {/* CTA */}
        <section className="py-12 text-center">
          <div className="rounded-lg bg-black p-8 text-white">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <CheckCircle className="h-6 w-6 text-black" />
            </div>

            <h2 className="mb-3 text-2xl font-semibold">Ready to Start?</h2>
            <p className="mb-6 text-gray-300">
              Join thousands of successful Civil Service Exam passers.
            </p>

            {!isAuthenticated ? (
              <Button
                size="lg"
                variant="outline"
                className="border-white text-black hover:bg-white"
                onClick={() => openAuthModal("register")}
              >
                Create Your Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <DashboardButton
                size="lg"
                variant="outline"
                className="border-white text-black hover:bg-white"
              />
            )}
          </div>
        </section>
      </main>

      {isSubmissionModalOpen && (
        <TestimonialSubmissionModal
          onClose={() => setIsSubmissionModalOpen(false)}
          onSuccessfulSubmit={fetchApprovedTestimonials}
        />
      )}



      {/* FOOTER */}
      <footer className="mt-16 border-t">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-gray-500">
          © 2025 Previlace. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
