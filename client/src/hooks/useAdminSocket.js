import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function useAdminSocket() {
  const [stats, setStats] = useState({
    overview: {
      totalUsers: 0,
      activeLearners: 0,
      completedProfiles: 0,
      activeStudents: 0,
    },
    examTypes: [],
    education: [],
    struggles: [],
    studyModes: [],
    monthlyRegistrations: [],
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const isInitializedRef = useRef(false);
  const dataFetchedRef = useRef(false);
  const { user } = useAuthStore();

  async function fetchFallbackData() {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    try {
      setError(null);

      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/stats`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/admin/users/recent`, {
          credentials: "include",
        }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.success) {
          setRecentUsers(usersData.data.users || []);
        }
      }

      setIsLoading(false);
    } catch (error) {
      setError("Failed to load admin data");
      setIsLoading(false);
      dataFetchedRef.current = false;
    }
  }

  const initializeSocket = useCallback(() => {
    if (!user?.role || user.role !== "admin") {
      setError("Unauthorized admin access");
      setIsLoading(false);
      return;
    }

    if (isInitializedRef.current || socketRef.current?.connected) {
      return;
    }

    isInitializedRef.current = true;

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io(API_BASE_URL, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      timeout: 5000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 3,
      forceNew: true,
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      setError(null);
      socketRef.current.emit("join-admin", user._id);
    });

    socketRef.current.on("admin-stats-update", (data) => {
      if (data?.success && data?.data) {
        setStats(data.data);
        setIsLoading(false);
      }
    });

    socketRef.current.on("admin-users-update", (data) => {
      if (data?.success && data?.data?.users) {
        setRecentUsers(data.data.users);
      }
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });

    socketRef.current.on("connect_error", () => {
      setIsConnected(false);
      if (!dataFetchedRef.current) {
        setTimeout(() => {
          fetchFallbackData();
        }, 1000);
      }
    });
  }, [user]);

  const requestStatsUpdate = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("request-stats-update");
    } else {
      dataFetchedRef.current = false;
      fetchFallbackData();
    }
  }, []);

  function cleanup() {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    isInitializedRef.current = false;
    dataFetchedRef.current = false;
  }

  useEffect(() => {
    if (!user?.role || user.role !== "admin") {
      setError("Unauthorized admin access");
      setIsLoading(false);
      return;
    }

    fetchFallbackData();

    const socketTimeout = setTimeout(() => {
      initializeSocket();
    }, 500);

    return () => {
      clearTimeout(socketTimeout);
      cleanup();
    };
  }, [user._id]);

  return {
    stats,
    recentUsers,
    isConnected,
    isLoading,
    error,
    requestStatsUpdate,
  };
}

export default useAdminSocket;
