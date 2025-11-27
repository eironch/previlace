import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  Briefcase,
  BarChart3,
  MessageSquare,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import NotificationBell from "./notifications/NotificationBell";

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: Home, title: "Dashboard", path: "/dashboard" },
    { icon: BookOpen, title: "Study", path: "/dashboard/subjects" },
    { icon: Briefcase, title: "Career", path: "/dashboard/jobs" },
    { icon: BarChart3, title: "Progress", path: "/dashboard/analytics" },
    { icon: MessageSquare, title: "Support", path: "/dashboard/tickets" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-300 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex cursor-pointer items-center" onClick={() => navigate("/")}>
              <span className="text-xl font-bold text-gray-900">Previlace</span>
            </div>

            <div className="ml-10 hidden md:flex md:space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`inline-flex items-center border-b-2 px-4 text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "border-black text-gray-900"
                      : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <NotificationBell />
            <button
              onClick={() => navigate("/dashboard/settings")}
              className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              <span className="font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900">
                <span className="text-xs font-semibold text-white">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/25" onClick={() => setIsMobileMenuOpen(false)} />

          <div className="relative flex w-full max-w-xs flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-300 px-4 pb-4 pt-5">
              <h2 className="text-xl font-bold text-gray-900">Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="rounded-full p-1 text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="mt-5 flex-1 space-y-1 overflow-y-auto px-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center rounded-md px-3 py-3 text-base font-medium ${
                    isActive(item.path) ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive(item.path) ? "text-white" : "text-gray-500"}`} />
                  {item.title}
                </button>
              ))}
            </nav>

            <div className="border-t border-gray-300 p-4">
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => navigate("/dashboard/settings")}
                className="mb-2 flex w-full items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </button>
              <button
                onClick={logout}
                className="flex w-full items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
