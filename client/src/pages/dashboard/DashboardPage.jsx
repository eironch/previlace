import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Briefcase, 
  FileText, 
  MessageSquare,
  Trophy,
  BarChart3,
  LogOut,
  Settings
} from "lucide-react";

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      icon: BookOpen,
      title: "Subjects",
      description: "Browse subjects and topics",
      path: "/dashboard/subjects",
    },
    {
      icon: Target,
      title: "Practice Quiz",
      description: "Test your knowledge",
      path: "/dashboard/quiz",
    },
    {
      icon: Trophy,
      title: "Mock Exam",
      description: "Full CSE simulation",
      path: "/dashboard/mock-exam",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track your progress",
      path: "/dashboard/analytics",
    },
    {
      icon: TrendingUp,
      title: "Study Plan",
      description: "Personalized schedule",
      path: "/dashboard/study-plan",
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Exam preferences",
      path: "/dashboard/settings",
    },
    {
      icon: Briefcase,
      title: "Jobs",
      description: "Government openings",
      path: "/dashboard/jobs",
    },
    {
      icon: FileText,
      title: "Resume",
      description: "Build your resume",
      path: "/dashboard/resume",
    },
    {
      icon: MessageSquare,
      title: "Interview Prep",
      description: "Practice interviews",
      path: "/dashboard/interview-prep",
    },
  ];

  async function handleLogout() {
    await logout();
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-xl font-semibold text-black">Previlace</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}
          </h2>
          <p className="text-gray-600">
            Ready to continue your Civil Service Exam preparation?
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="group rounded-lg border border-gray-200 bg-white p-6 text-left transition-all hover:border-black hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-black">
                <item.icon className="h-6 w-6 text-gray-900 transition-colors group-hover:text-white" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-gray-900">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
