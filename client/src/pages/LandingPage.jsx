import Button from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import {
  Brain,
  TrendingUp,
  Users,
  FileText,
  Target,
  Star,
  Quote,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  const { openAuthModal } = useAppStore();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (!user?.isProfileComplete) {
        navigate("/onboarding");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const testimonials = [
    {
      name: "Maria Santos",
      role: "Civil Service Passer - Professional Level",
      content:
        "Previlace's AI-powered questions helped me identify my weak areas. I passed the Professional Level exam on my first try after using the platform for 3 months.",
      rating: 5,
    },
    {
      name: "John Dela Cruz",
      role: "Government Employee - Department of Health",
      content:
        "The job matching feature was incredible. I got connected to the perfect position right after passing my exam. The resume builder made my application stand out.",
      rating: 5,
    },
    {
      name: "Ana Rodriguez",
      role: "Recent Graduate - Subprofessional Level Passer",
      content:
        "As a fresh graduate, I was overwhelmed by the exam coverage. Previlace's personalized study plan made everything manageable and achievable.",
      rating: 5,
    },
    {
      name: "Carlos Mendoza",
      role: "Working Professional - Career Changer",
      content:
        "I studied while working full-time. The flexible schedule and progress tracking kept me motivated. Successfully transitioned to government service after 6 months.",
      rating: 5,
    },
  ];

  const features = [
    {
      icon: Brain,
      title: "AI-Enhanced Learning",
      description:
        "Personalized questions and adaptive testing powered by artificial intelligence",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Monitor your progress with detailed analytics and performance insights",
    },
    {
      icon: Target,
      title: "Job Matching",
      description:
        "Find relevant government positions that match your qualifications",
    },
    {
      icon: FileText,
      title: "Resume Builder",
      description:
        "Create professional resumes optimized for government applications",
    },
    {
      icon: Users,
      title: "Interview Prep",
      description:
        "Practice with government-specific interview questions and feedback",
    },
    {
      icon: CheckCircle,
      title: "Success Tracking",
      description:
        "Follow your journey from exam preparation to career placement",
    },
  ];

  const stats = [
    { number: "17.22%", label: "Average CSE Pass Rate" },
    { number: "85%", label: "Previlace User Pass Rate" },
    { number: "3,000+", label: "Successful Students" },
    { number: "500+", label: "Government Jobs Matched" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-black">
                <Target className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold">Previlace</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAuthModal("login")}
              >
                Sign In
              </Button>
              <Button size="sm" onClick={() => openAuthModal("register")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-semibold">
            Master the Civil Service Exam
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
            AI-enhanced preparation platform with adaptive testing, job
            matching, and comprehensive career support for government service.
          </p>
          <div className="flex justify-center space-x-3">
            <Button size="lg" onClick={() => openAuthModal("register")}>
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
          </div>
        </section>

        <section className="py-12">
          <div className="grid grid-cols-2 gap-8 rounded-lg bg-gray-50 p-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-black">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

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

        <section className="py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black">
              <Quote className="h-6 w-6 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">
              Trusted by Thousands of Civil Service Passers
            </h2>
            <p className="mb-12 text-gray-600">
              Real stories from successful government employees
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="mb-4 flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-black text-black" />
                  ))}
                </div>
                <p className="mb-4 text-gray-700">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                    <span className="text-sm font-semibold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-12 text-center">
          <div className="rounded-lg bg-black p-8 text-white">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <CheckCircle className="h-6 w-6 text-black" />
            </div>
            <h2 className="mb-3 text-2xl font-semibold">
              Ready to Start Your Journey?
            </h2>
            <p className="mb-6 text-gray-300">
              Join thousands of successful Civil Service Exam takers
            </p>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-black hover:bg-white"
              onClick={() => openAuthModal("register")}
            >
              Create Your Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

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
