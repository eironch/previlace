import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  Briefcase,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  LayoutDashboard,
  Layout,
  Users,
  Calendar,
  FileText,
  CheckSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";

export const studentNavItems = [
  { id: "dashboard", icon: Home, title: "Dashboard", path: "/dashboard" },
  { id: "subjects", icon: BookOpen, title: "Study", path: "/dashboard/subjects" },
  { id: "jobs", icon: Briefcase, title: "Career", path: "/dashboard/jobs" },
  { id: "analytics", icon: BarChart3, title: "Progress", path: "/dashboard/analytics" },
  { id: "tickets", icon: MessageSquare, title: "Support", path: "/dashboard/tickets" },
];

export const adminNavItems = [
  { id: "dashboard", icon: LayoutDashboard, title: "Dashboard", path: "/admin" },
  { id: "analytics", icon: BarChart3, title: "Analytics", path: "/admin/analytics" },
  { id: "users", icon: Users, title: "Users", path: "/admin/users" },
  { id: "questions", icon: BookOpen, title: "Questions", path: "/admin/questions" },
  { id: "classes", icon: Calendar, title: "Class Schedule", path: "/admin/classes" },
  { id: "resources", icon: FileText, title: "Resources", path: "/admin/resources" },
];

export const superAdminNavItems = [
  { id: "dashboard", icon: LayoutDashboard, title: "Dashboard", path: "/admin" },
  { id: "analytics", icon: BarChart3, title: "Analytics", path: "/admin/analytics" },
  { id: "users", icon: Users, title: "Users", path: "/admin/users" },
  { id: "questions", icon: BookOpen, title: "Questions", path: "/admin/questions" },
  { id: "classes", icon: Calendar, title: "Class Schedule", path: "/admin/classes" },
  { id: "landing", icon: Layout, title: "Landing Page", path: "/admin/landing" },
  { id: "resources", icon: FileText, title: "Resources", path: "/admin/resources" },
];

export const instructorNavItems = [
  { id: "dashboard", icon: Home, title: "Dashboard", path: "/instructor" },
  { id: "classes", icon: Calendar, title: "My Classes", path: "/instructor/classes" },
  { id: "availability", icon: Settings, title: "Availability", path: "/instructor/availability" },
  { id: "inbox", icon: MessageSquare, title: "Inbox", path: "/dashboard/inbox" },
];

export default function Sidebar({ isMobile, isOpen, setIsOpen, activeTab, onTabChange, isCollapsed: controlledIsCollapsed, setIsCollapsed: controlledSetIsCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [localIsCollapsed, setLocalIsCollapsed] = useState(false);

  const isCollapsed = controlledIsCollapsed !== undefined ? controlledIsCollapsed : localIsCollapsed;
  const setIsCollapsed = controlledSetIsCollapsed || setLocalIsCollapsed;

  // On mobile, we use isOpen/setIsOpen from props.
  // On desktop, we use local isCollapsed state (or controlled).

  let navItems = studentNavItems;
  if (user?.role === "super_admin") {
    navItems = superAdminNavItems;
  } else if (user?.role === "admin") {
    navItems = adminNavItems;
  } else if (user?.role === "instructor") {
    navItems = instructorNavItems;
  }

  const isActive = (item) => {
    if (activeTab && item.id) {
      return activeTab === item.id;
    }
    return location.pathname === item.path;
  };

  const sidebarVariants = {
    expanded: { width: 240 },
    collapsed: { width: 80 },
    mobileOpen: { x: 0 },
    mobileClosed: { x: "-100%" },
  };

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial="mobileClosed"
              animate="mobileOpen"
              exit="mobileClosed"
              variants={sidebarVariants}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <span className="text-xl font-bold text-gray-900">Previlace</span>
                  <button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-gray-100">
                    <ChevronLeft className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                
                <nav className="flex-1 px-2 py-4 space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id || item.path}
                      onClick={() => {
                        if (onTabChange && item.id) {
                          onTabChange(item.id);
                        } else {
                          navigate(item.path);
                        }
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive(item)
                          ? "bg-black text-white"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 ${isActive(item) ? "text-white" : "text-gray-500"}`} />
                      {item.title}
                    </button>
                  ))}
                </nav>


                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[140px]">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/dashboard/settings");
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Settings className="mr-3 h-5 w-5 text-gray-500" />
                    Settings
                  </button>
                  <button
                    onClick={logout}
                    className="flex w-full items-center px-3 py-2 mt-1 text-sm font-medium bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      className="relative hidden h-screen flex-col border-r border-gray-300 bg-white shadow-sm md:flex"
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!isCollapsed && <span className="text-xl font-bold text-gray-900">Previlace</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 ${isCollapsed ? "mx-auto" : ""}`}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => (
          <button
            key={item.id || item.path}
            onClick={() => {
              if (onTabChange && item.id) {
                onTabChange(item.id);
              } else {
                navigate(item.path);
              }
            }}
            className={`group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              isActive(item)
                ? "bg-black text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? item.title : ""}
          >
            <item.icon
              className={`h-5 w-5 flex-shrink-0 transition-colors ${
                isActive(item) ? "text-white" : "text-gray-500 group-hover:text-gray-900"
              } ${!isCollapsed ? "mr-3" : ""}`}
            />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {item.title}
              </motion.span>
            )}
          </button>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-4">
        {!isCollapsed ? (
          <>
            <div className="mb-4 flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="truncate text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="mb-4 flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white" title={`${user?.firstName} ${user?.lastName}`}>
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/dashboard/settings")}
          className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Settings" : ""}
        >
          <Settings className={`h-5 w-5 text-gray-500 ${!isCollapsed ? "mr-3" : ""}`} />
          {!isCollapsed && <span>Settings</span>}
        </button>
        
        <button
          onClick={logout}
          className={`mt-1 flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Sign Out" : ""}
        >
          <LogOut className={`h-5 w-5 ${!isCollapsed ? "mr-3" : ""}`} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.div>
  );
}
