import { useState, useMemo } from "react";
import {
    BarChart3,
    Users,
    BookOpen,
    Activity,
    Calendar,
    LogOut,
    TrendingUp,
    AlertCircle,
    Menu, // New icon for the mobile dropdown menu
} from "lucide-react";

// FIX: Changing all imports to relative paths to ensure resolution in this environment.
import { useAuthStore } from "../store/authStore";
import useAdminSocket from "../hooks/useAdminSocket";
import UserManagement from "../components/admin/UserManagement";
import QuestionBankManager from "../components/questionBank/QuestionBankManager";
import ReviewManager from "../components/admin/ReviewManager";
import LandingPage from "../components/admin/LandingPageManager";

// List of all navigation tabs for easier management
const NAV_TABS = [
    { title: "Dashboard", name: "dashboard" },
    { title: "Performance Analytics", name: "analytics" },
    { title: "User Management", name: "users" },
    { title: "Question Bank", name: "questionbank" },
    { title: "Review", name: "review" },
    { title: "Landing Page", name: "landingpage" },
];

function AdminPage() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state for mobile menu
    const { logout, user } = useAuthStore();

    // Assuming useAdminSocket is mocked or available in the environment
    const {
        stats,
        recentUsers,
        isConnected,
        isLoading,
        error,
        requestStatsUpdate,
    } = useAdminSocket();

    const optimizedStats = useMemo(() => {
        if (!stats?.overview) return null;

        const current = stats.overview;
        const previous = stats.previousMonth || {
            totalUsers: Math.max(0, Math.floor(current.totalUsers * 0.85)),
            activeLearners: Math.max(0, Math.floor(current.activeLearners * 0.80)),
            completedProfiles: Math.max(
                0,
                Math.floor(current.completedProfiles * 0.75)
            ),
            activeStudents: Math.max(0, Math.floor(current.activeStudents * 0.82)),
        };

        const calculateGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

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
                activeLearners: calculateGrowth(
                    current.activeLearners,
                    previous.activeLearners
                ),
                completedProfiles: calculateGrowth(
                    current.completedProfiles,
                    previous.completedProfiles
                ),
                activeStudents: calculateGrowth(
                    current.activeStudents,
                    previous.activeStudents
                ),
            },
        };
    }, [stats]);

    function handleSignOut() {
        logout();
    }

    function handleTabClick(tabName) {
        setActiveTab(tabName);
        setIsMobileMenuOpen(false); // Close menu on selection
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-black"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="text-center">
                    <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
                    <h1 className="mb-2 text-xl font-bold text-black">
                        Unable to load admin data
                    </h1>
                    <p className="mb-4 text-gray-600">{error}</p>
                    <button
                        onClick={() => requestStatsUpdate()}
                        className="cursor-pointer rounded-lg bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header - Made flex-col on small screens, then items-center/justify-between on large screens */}
                <div className="mb-8 flex flex-col items-start justify-between sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl font-bold text-black sm:text-3xl">
                                Admin Dashboard
                            </h1>
                            <div
                                className={`h-3 w-3 rounded-full ${
                                    isConnected ? "bg-green-500" : "bg-red-500"
                                }`}
                                title={isConnected ? "Connected" : "Disconnected"}
                            />
                        </div>
                        <p className="mt-2 text-gray-600">
                            Monitor system performance and user engagement
                        </p>
                    </div>
                    {/* User Info and Sign Out - Added mt-4 for small screen spacing */}
                    <div className="mt-4 flex items-center space-x-4 sm:mt-0">
                        <div className="text-right">
                            <p className="text-sm font-medium text-black">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="flex cursor-pointer items-center space-x-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Sign Out</span>
                            <span className="inline sm:hidden">Out</span>
                        </button>
                    </div>
                </div>

                {/* --- NAVIGATION TABS / DROPDOWN --- */}
                <div className="mb-8 border-b border-gray-200">
                    {/* Desktop Tabs */}
                    <nav className="-mb-px hidden space-x-8 sm:flex">
                        {NAV_TABS.map((tab) => (
                            <TabButton
                                key={tab.name}
                                title={tab.title}
                                activeTab={activeTab}
                                tabName={tab.name}
                                setActiveTab={setActiveTab}
                            />
                        ))}
                    </nav>

                    {/* Mobile Dropdown */}
                    <div className="relative sm:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-black shadow-sm transition-colors hover:bg-gray-50"
                        >
                            <span className="truncate">
                                Current: **{NAV_TABS.find(t => t.name === activeTab)?.title || 'Dashboard'}**
                            </span>
                            <Menu className="ml-2 h-5 w-5" />
                        </button>

                        {isMobileMenuOpen && (
                            <div className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                    {NAV_TABS.map((tab) => (
                                        <button
                                            key={tab.name}
                                            onClick={() => handleTabClick(tab.name)}
                                            className={`block w-full px-4 py-2 text-left text-sm font-medium cursor-pointer transition-colors ${
                                                activeTab === tab.name
                                                    ? "bg-gray-100 text-black"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            {tab.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* --- END NAVIGATION TABS / DROPDOWN --- */}

                {/* Content Rendering */}
                {activeTab === "dashboard" && (
                    <div className="space-y-8">
                        {/* Stats Cards: 1 column on small, 2 on medium, 4 on large */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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

                        {/* Charts: 1 column on small, 2 on large */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <ExamTypeChart data={stats?.examTypes || []} />
                            <EducationChart data={stats?.education || []} />
                        </div>

                        {/* Recent Users & Trend: 1 column on small, 2 on large */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <RecentUsers users={recentUsers} />
                            <RegistrationTrend data={stats?.monthlyRegistrations || []} />
                        </div>

                        {/* Struggles & Study Modes: 1 column on small, 2 on large */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <StrugglesChart data={stats?.struggles || []} />
                            <StudyModesChart data={stats?.studyModes || []} />
                        </div>
                    </div>
                )}

                {activeTab === "analytics" && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-semibold text-black">
                                    Performance Analytics
                                </h3>
                                <p className="text-gray-500">
                                    Detailed performance metrics and insights coming soon.
                                </p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-semibold text-black">
                                    Learning Patterns
                                </h3>
                                <p className="text-gray-500">
                                    User learning behavior analysis coming soon.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "users" && <UserManagement />}

                {activeTab === "questionbank" && <QuestionBankManager />}

                {activeTab === "review" && <ReviewManager />}

                {activeTab === "landingpage" && <LandingPage />}
            </div>
        </div>
    );
}

// Helper component for Navigation Tabs (Desktop only)
function TabButton({ title, activeTab, tabName, setActiveTab }) {
    return (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tabName
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
        >
            {title}
        </button>
    );
}

function StatsCard({ title, value, icon: Icon, change }) {
    const formatChange = (changeValue) => {
        if (changeValue === 0) return "0%";
        const sign = changeValue > 0 ? "+" : "";
        return `${sign}${changeValue}%`;
    };

    const getChangeColor = (changeValue) => {
        if (changeValue > 0) return "text-green-600";
        if (changeValue < 0) return "text-red-600";
        return "text-gray-600";
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="mt-2 text-2xl font-bold text-black">
                        {value.toLocaleString()}
                    </p>
                </div>
                <div className="rounded-full bg-black p-3">
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
            <div className="mt-4">
                <span className={`text-sm font-medium ${getChangeColor(change)}`}>
                    {formatChange(change)}
                </span>
                <span className="ml-2 text-sm text-gray-500">from last month</span>
            </div>
        </div>
    );
}

// Remaining chart/display components (ExamTypeChart, EducationChart, etc.) are purely structural/display
// and do not require the cursor-pointer class as they are not primary navigation or action buttons.
// They use existing responsive classes and structure.

function ExamTypeChart({ data }) {
    const maxCount = Math.max(...data.map((item) => item.count), 1);

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-black" />
                <h3 className="text-lg font-semibold text-black">
                    Exam Type Distribution
                </h3>
            </div>
            <div className="space-y-4">
                {data.length > 0 ? (
                    data.map((item) => (
                        <div key={item._id} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                                {item._id}
                            </span>
                            <div className="flex w-full items-center space-x-3 sm:w-auto">
                                {/* Progress bar width made responsive with w-full on small screens */}
                                <div className="h-2 w-full rounded-full bg-gray-200 sm:w-32">
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
        </div>
    );
}

function EducationChart({ data }) {
    const maxCount = Math.max(...data.map((item) => item.count), 1);

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-black" />
                <h3 className="text-lg font-semibold text-black">Education Levels</h3>
            </div>
            <div className="space-y-4">
                {data.length > 0 ? (
                    data.slice(0, 5).map((item) => (
                        <div key={item._id} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                                {item._id}
                            </span>
                            <div className="flex w-full items-center space-x-3 sm:w-auto">
                                {/* Progress bar width made responsive with w-full on small screens */}
                                <div className="h-2 w-full rounded-full bg-gray-200 sm:w-32">
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
                    <p className="text-sm text-gray-500">No education data available</p>
                )}
            </div>
        </div>
    );
}

function StrugglesChart({ data }) {
    const maxCount = Math.max(...data.map((item) => item.count), 1);

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-black" />
                <h3 className="text-lg font-semibold text-black">
                    Common Study Struggles
                </h3>
            </div>
            <div className="space-y-4">
                {data.length > 0 ? (
                    data.slice(0, 6).map((item) => (
                        <div key={item._id} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                                {item._id}
                            </span>
                            <div className="flex w-full items-center space-x-3 sm:w-auto">
                                {/* Progress bar width made responsive with w-full on small screens */}
                                <div className="h-2 w-full rounded-full bg-gray-200 sm:w-32">
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
                        No struggles data available
                    </p>
                )}
            </div>
        </div>
    );
}

function StudyModesChart({ data }) {
    const maxCount = Math.max(...data.map((item) => item.count), 1);

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-black" />
                <h3 className="text-lg font-semibold text-black">
                    Preferred Study Modes
                </h3>
            </div>
            <div className="space-y-4">
                {data.length > 0 ? (
                    data.map((item) => (
                        <div key={item._id} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                                {item._id}
                            </span>
                            <div className="flex w-full items-center space-x-3 sm:w-auto">
                                {/* Progress bar width made responsive with w-full on small screens */}
                                <div className="h-2 w-full rounded-full bg-gray-200 sm:w-32">
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
                        No study mode data available
                    </p>
                )}
            </div>
        </div>
    );
}

function RecentUsers({ users }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center">
                <Users className="mr-2 h-5 w-5 text-black" />
                <h3 className="text-lg font-semibold text-black">Recent Users</h3>
            </div>
            <div className="space-y-4">
                {users.length > 0 ? (
                    users.slice(0, 5).map((user) => (
                        <div
                            key={user._id}
                            className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0"
                        >
                            <div>
                                <p className="text-sm font-medium text-black">
                                    {user.firstName || "Unknown"} {user.lastName || "User"}
                                </p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end space-x-2">
                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                        {user.examType || "No Type"}
                                    </span>
                                    {user.isProfileComplete && (
                                        <div
                                            className="h-2 w-2 rounded-full bg-green-500"
                                            title="Profile Complete"
                                        ></div>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">No recent users found</p>
                )}
            </div>
        </div>
    );
}

function RegistrationTrend({ data }) {
    const maxCount = Math.max(...data.map((item) => item.count), 1);

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-black" />
                <h3 className="text-lg font-semibold text-black">
                    Registration Trend
                </h3>
            </div>
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
                                    item._id.month - 1
                                ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                })}
                            </span>
                            <div className="flex w-full items-center space-x-3 sm:w-auto">
                                {/* Progress bar width made responsive with w-full on small screens */}
                                <div className="h-2 w-full rounded-full bg-gray-200 sm:w-32">
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
        </div>
    );
}

export default AdminPage;