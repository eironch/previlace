import { useNavigate } from "react-router-dom";
import { Target, BookOpen, BarChart3, TrendingDown } from "lucide-react";

function QuickActionsCard() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Target,
      title: "Practice Mode",
      desc: "Review any topic",
      path: "/subjects",
    },
    {
      icon: BookOpen,
      title: "Mock Exam",
      desc: "Full practice test",
      path: "/dashboard/mock-exam",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      desc: "View performance",
      path: "/dashboard/analytics",
    },
    {
      icon: TrendingDown,
      title: "Weak Areas",
      desc: "Focus on mistakes",
      path: "/dashboard/analytics?tab=weak-areas",
    },
  ];

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-start gap-2 rounded-lg border border-gray-300 p-4 text-left transition-all hover:border-black hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
              <action.icon className="h-5 w-5 text-gray-900" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{action.title}</p>
              <p className="text-xs text-gray-500">{action.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickActionsCard;
