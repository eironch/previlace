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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";

export default function Sidebar({ isMobile, isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // On mobile, we use isOpen/setIsOpen from props.
  // On desktop, we use local isCollapsed state.
  
  const navItems = [
    { icon: Home, title: "Dashboard", path: "/dashboard" },
    { icon: BookOpen, title: "Study", path: "/dashboard/subjects" },
    { icon: Briefcase, title: "Career", path: "/dashboard/jobs" },
    { icon: BarChart3, title: "Progress", path: "/dashboard/analytics" },
    { icon: MessageSquare, title: "Support", path: "/dashboard/tickets" },
  ];

  const isActive = (path) => location.pathname === path;

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
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive(item.path)
                          ? "bg-black text-white"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 ${isActive(item.path) ? "text-white" : "text-gray-500"}`} />
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
                    className="flex w-full items-center px-3 py-2 mt-1 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
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
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              isActive(item.path)
                ? "bg-black text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? item.title : ""}
          >
            <item.icon
              className={`h-5 w-5 flex-shrink-0 transition-colors ${
                isActive(item.path) ? "text-white" : "text-gray-500 group-hover:text-gray-900"
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
          className={`mt-1 flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 ${
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
