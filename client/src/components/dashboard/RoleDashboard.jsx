import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, FileQuestion, BookOpen, Settings, BarChart3, Building2 } from "lucide-react";

function RoleDashboard() {
  const { user, isSuperAdmin, isAdmin, isStudent } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const studentCards = [
    {
      title: "My Progress",
      description: "Track your learning journey",
      icon: BarChart3,
      link: "/dashboard",
      color: "bg-blue-500",
    },
    {
      title: "Study Materials",
      description: "Access review content",
      icon: BookOpen,
      link: "/subjects",
      color: "bg-green-500",
    },
    {
      title: "Practice Exams",
      description: "Test your knowledge",
      icon: FileQuestion,
      link: "/exams",
      color: "bg-purple-500",
    },
  ];

  const adminCards = [
    {
      title: "Students",
      description: "Manage center students",
      icon: Users,
      link: "/admin/users",
      color: "bg-cyan-500",
    },
    {
      title: "Questions",
      description: "Create and manage questions",
      icon: FileQuestion,
      link: "/admin/questions",
      color: "bg-orange-500",
    },
    {
      title: "Analytics",
      description: "Center performance metrics",
      icon: BarChart3,
      link: "/admin/analytics",
      color: "bg-pink-500",
    },
  ];

  const superAdminCards = [
    {
      title: "System Dashboard",
      description: "Platform-wide overview",
      icon: LayoutDashboard,
      link: "/admin",
      color: "bg-gray-700",
    },
    {
      title: "All Users",
      description: "Manage all platform users",
      icon: Users,
      link: "/admin/users",
      color: "bg-blue-600",
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: Settings,
      link: "/admin/settings",
      color: "bg-red-600",
    },
  ];

  function getCards() {
    if (isSuperAdmin()) return [...superAdminCards, ...adminCards, ...studentCards];
    if (isAdmin()) return [...adminCards, ...studentCards];
    return studentCards;
  }

  function getRoleTitle() {
    if (isSuperAdmin()) return "Super Administrator";
    if (isAdmin()) return "Review Center Admin";
    return "Student";
  }

  const cards = getCards();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.firstName || user.email}</h1>
          <p className="mt-2 text-gray-600">{getRoleTitle()} Dashboard</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                onClick={() => navigate(card.link)}
                className="rounded-lg border border-gray-200 bg-white p-6 text-left transition-all hover:border-black hover:shadow-lg"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${card.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{card.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{card.description}</p>
              </button>
            );
          })}
        </div>

        {user.reviewCenterId && (isAdmin() || isSuperAdmin()) && (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900">Quick Stats</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Exams</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Questions Created</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoleDashboard;
