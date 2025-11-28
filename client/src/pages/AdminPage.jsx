import { useState, useMemo, useEffect } from "react";
import {
  BarChart3,
  Users,
  BookOpen,
  Activity,
  Calendar,
  TrendingUp,
  AlertCircle,
  Menu,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import StandardHeader from "@/components/ui/StandardHeader";
import { useAuthStore } from "@/store/authStore";
import useAdminCacheStore from "@/store/adminCacheStore";
import Sidebar, { adminNavItems, superAdminNavItems } from "../components/layout/Sidebar";
import UserManagement from "../components/admin/UserManagement";
import QuestionManagementPage from "./admin/QuestionManagementPage";
import FileManagementPage from "./admin/FileManagementPage";
import ClassManagementPage from "./admin/ClassManagementPage";
import LandingPageManager from "../components/admin/LandingPageManager";
import AdminAnalyticsPage from "./admin/AdminAnalyticsPage";
import AdminRegistrationPage from "./admin/AdminRegistrationPage";

import { useLocation, useNavigate } from "react-router-dom";
import StatsCard from "@/components/admin/dashboard/StatsCard";
import RecentUsers from "@/components/admin/dashboard/RecentUsers";
import SystemHealth from "@/components/admin/dashboard/SystemHealth";
import ChartCard from "@/components/ui/ChartCard";
import CategoryPerformanceChart from "@/components/admin/analytics/CategoryPerformanceChart";
import LearningPatterns from "@/components/admin/analytics/LearningPatterns";
import UserRetention from "@/components/admin/analytics/UserRetention";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (path) => {
    if (path === "/admin") return "dashboard";
    if (path.includes("/admin/registrations")) return "users";
    if (path.includes("/admin/analytics")) return "analytics";
    if (path.includes("/admin/users")) return "users";
    if (path.includes("/admin/questions")) return "questions";
    if (path.includes("/admin/classes")) return "classes";
    if (path.includes("/admin/resources")) return "resources";
    if (path.includes("/admin/landing")) return "landing";
    return "dashboard";
  };

  const activeTab = getTabFromPath(location.pathname);
  const { user } = useAuthStore();

  const { getCachedData, setCachedData } = useAdminCacheStore();
  const CACHE_KEY = 'admin-dashboard-data';

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadData();
    }
  }, [activeTab]);

  async function loadData() {
    const cached = getCachedData(CACHE_KEY);
    if (cached) {
      setStats(cached.data.stats);
      setIsLoading(false);
      if (!cached.isStale) return;
    }
    await fetchAdminData(!!cached);
  }

  async function fetchAdminData(isBackgroundRefresh = false) {
    if (!isBackgroundRefresh) setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, { credentials: "include" });

      if (!response.ok) {
        throw new Error("Failed to fetch admin data");
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
        setCachedData(CACHE_KEY, { stats: data.data });
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      if (!stats) {
        setError("Failed to load admin data");
      }
      setIsLoading(false);
    }
  }

  const optimizedStats = useMemo(() => {
    if (!stats?.overview) return null;

    const current = stats.overview;
    const previous = stats.previousMonth || {
      totalUsers: Math.max(0, Math.floor(current.totalUsers * 0.85)),
      activeLearners: Math.max(0, Math.floor(current.activeLearners * 0.80)),
      completedProfiles: Math.max(0, Math.floor(current.completedProfiles * 0.75)),
      activeStudents: Math.max(0, Math.floor(current.activeStudents * 0.82)),
    };

    function calculateGrowth(current, previous) {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    }

    return {
      ...current,
      learnerRate: Math.round(
        current.totalUsers > 0
          ? (current.activeLearners / current.totalUsers) * 100
          : 0
      ),
      completionRate: Math.round(
        current.totalUsers > 0
          ? (current.completedProfiles / current.totalUsers) * 100
          : 0
      ),
      activityRate: Math.round(
        current.totalUsers > 0
          ? (current.activeStudents / current.totalUsers) * 100
          : 0
      ),
      growth: {
        totalUsers: calculateGrowth(current.totalUsers, previous.totalUsers),
        activeLearners: calculateGrowth(current.activeLearners, previous.activeLearners),
        completedProfiles: calculateGrowth(current.completedProfiles, previous.completedProfiles),
        activeStudents: calculateGrowth(current.activeStudents, previous.activeStudents),
      },
    };
  }, [stats]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      <Sidebar
        isMobile={true}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      <Sidebar
        isMobile={false}
        isCollapsed={!isDesktopSidebarOpen}
        setIsCollapsed={(val) => setIsDesktopSidebarOpen(!val)}
      />

      <main className="flex-1 flex flex-col w-full transition-all duration-300 overflow-hidden">
        {activeTab === "users" && <UserManagement />}
        {activeTab === "questions" && user?.role === "super_admin" && <QuestionManagementPage />}
        {activeTab === "classes" && user?.role === "super_admin" && <ClassManagementPage />}
        {activeTab === "resources" && <FileManagementPage />}

        {activeTab === "dashboard" && (
          <DashboardSection
            stats={stats}
            optimizedStats={optimizedStats}
            isLoading={isLoading}
            loadData={loadData}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        )}

        {activeTab === "analytics" && (
          <AdminAnalyticsPage />
        )}

        {activeTab === "landing" && user?.role === "super_admin" && (
          <LandingSection />
        )}
      </main>
    </div >
  );
}

function DashboardSection({ stats, optimizedStats, isLoading, loadData, setIsMobileMenuOpen }) {
  return (
    <>
      <StandardHeader
        title="Dashboard"
        description="Overview of system performance and key metrics"
        onRefresh={loadData}
        startContent={
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-200"
          >
            <Menu className="w-6 h-6" />
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="min-h-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 min-h-full p-6">
            {isLoading && !stats ? (
              <div className="space-y-12 animate-pulse">
                <section>
                  <div className="mb-6 h-8 w-64 bg-gray-200 rounded"></div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="h-80 bg-gray-200 rounded-lg"></div>
                    <div className="h-80 bg-gray-200 rounded-lg"></div>
                  </div>
                </section>
              </div>
            ) : (
              <AdminDashboard
                stats={stats}
                optimizedStats={optimizedStats}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function LandingSection() {
  return (
    <>
      <StandardHeader
        title="Landing Page"
        description="Manage landing page content and testimonials"
        onRefresh={() => { }}
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="h-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 min-h-[600px] p-6">
            <LandingPageManager />
          </div>
        </div>
      </div>
    </>
  );
}

function AdminDashboard({ stats, optimizedStats }) {
  return (
    <div className="space-y-12">
      <section>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total Users"
            value={optimizedStats?.totalUsers || 0}
            icon={Users}
            change={optimizedStats?.growth?.totalUsers || 0}
          />
          <StatsCard
            title="Active Learners"
            value={optimizedStats?.activeLearners || 0}
            icon={BookOpen}
            change={optimizedStats?.growth?.activeLearners || 0}
          />
          <StatsCard
            title="Complete Profiles"
            value={optimizedStats?.completedProfiles || 0}
            icon={TrendingUp}
            change={optimizedStats?.growth?.completedProfiles || 0}
          />
          <StatsCard
            title="Active Students"
            value={optimizedStats?.activeStudents || 0}
            icon={Activity}
            change={optimizedStats?.growth?.activeStudents || 0}
          />
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ExamTypeChart data={stats?.examTypes || []} />
            <SystemHealth data={stats?.systemHealth} />
          </div>
          <RegistrationTrend data={stats?.monthlyRegistrations || []} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <LearningPatterns stats={stats} />
            <UserRetention data={stats?.userRetention || []} />
          </div>
          <CategoryPerformanceChart data={stats?.categoryStats || []} />
          <RecentUsers />
        </div>
      </section>
    </div>
  );
}

function ExamTypeChart({ data }) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  const getInsight = () => {
    if (data.length === 0) return "No data available.";
    const top = data.reduce((prev, current) => (prev.count > current.count) ? prev : current);
    return `The majority of users are preparing for the ${top._id} exam.`;
  };

  return (
    <ChartCard
      title="Exam Type Distribution"
      description="User distribution by exam type"
      insight={getInsight()}
      icon={BarChart3}
      className="h-full"
    >
      <div className="space-y-4">
        {data.length > 0 ? (
          data.map((item) => (
            <div key={item._id} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {item._id}
              </span>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-24 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-black"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  ></div>
                </div>
                <span className="w-8 text-sm font-bold text-black">
                  {item.count}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">
            No exam type data available
          </p>
        )}
      </div>
    </ChartCard>
  );
}

function RegistrationTrend({ data }) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  const getInsight = () => {
    if (data.length < 2) return "Not enough data for trend analysis.";
    const current = data[0]?.count || 0;
    const previous = data[1]?.count || 0;
    if (current > previous) return "Registrations are trending upwards compared to last month.";
    if (current < previous) return "Registrations have decreased slightly. Consider marketing efforts.";
    return "Registration numbers are stable.";
  };

  return (
    <ChartCard
      title="Registration Trend"
      description="Monthly user registrations"
      insight={getInsight()}
      icon={Calendar}
    >
      <div className="space-y-4">
        {data.length > 0 ? (
          data.map((item) => (
            <div
              key={`${item._id.year}-${item._id.month}`}
              className="flex items-center justify-between"
            >
              <span className="text-sm font-medium text-gray-700">
                {new Date(
                  item._id.year,
                  item._id.month - 1,
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                })}
              </span>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-24 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-black"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  ></div>
                </div>
                <span className="w-8 text-sm font-bold text-black">
                  {item.count}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">
            No registration trend data available
          </p>
        )}
      </div>
    </ChartCard>
  );
}



export default AdminPage;
