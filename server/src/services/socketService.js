import { Server } from "socket.io";

class SocketService {
  constructor() {
    this.io = null;
    this.adminRooms = new Map();
    this.statsCache = null;
    this.usersCache = null;
    this.lastStatsUpdate = 0;
    this.CACHE_DURATION = 30000;
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      },
      transports: ["polling", "websocket"],
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupHandlers();
    this.startUpdateInterval();
  }

  setupHandlers() {
    this.io.on("connection", (socket) => {
      socket.on("join-admin", async (adminId) => {
        if (!adminId) return;

        socket.join("admin-dashboard");
        this.adminRooms.set(socket.id, adminId);

        await this.sendCurrentData(socket);
      });

      socket.on("request-stats-update", async () => {
        await this.updateAndBroadcast();
      });

      socket.on("disconnect", () => {
        this.adminRooms.delete(socket.id);
      });
    });
  }

  async sendCurrentData(socket) {
    const data = await this.getOrUpdateStats();
    const users = await this.getOrUpdateUsers();

    if (data) {
      socket.emit("admin-stats-update", { success: true, data });
    }

    if (users) {
      socket.emit("admin-users-update", {
        success: true,
        data: { users },
      });
    }
  }

  async getOrUpdateStats() {
    if (this.shouldUpdate()) {
      await this.updateStats();
    }
    return this.statsCache;
  }

  async getOrUpdateUsers() {
    if (this.shouldUpdate()) {
      await this.updateUsers();
    }
    return this.usersCache;
  }

  shouldUpdate() {
    return Date.now() - this.lastStatsUpdate > this.CACHE_DURATION;
  }

  async updateStats() {
    try {
      const User = (await import("../models/User.js")).default;
      const baseQuery = { role: "user" };

      const [
        totalUsers,
        activeLearners,
        completedProfiles,
        activeStudents,
        examTypeStats,
        educationStats,
        strugglesStats,
        studyModeStats,
        monthlyRegistrations,
      ] = await Promise.all([
        User.countDocuments(baseQuery),
        User.countDocuments({
          ...baseQuery,
          isProfileComplete: true,
          $or: [
            { studyMode: { $exists: true, $not: { $size: 0 } } },
            { struggles: { $exists: true, $not: { $size: 0 } } },
            { targetDate: { $ne: "" } },
          ],
        }),
        User.countDocuments({ ...baseQuery, isProfileComplete: true }),
        User.countDocuments({
          ...baseQuery,
          lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }),
        User.aggregate([
          { $match: baseQuery },
          { $match: { examType: { $ne: "" } } },
          { $group: { _id: "$examType", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        User.aggregate([
          { $match: { ...baseQuery, education: { $ne: "" } } },
          { $group: { _id: "$education", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        User.aggregate([
          { $match: baseQuery },
          { $match: { struggles: { $exists: true, $not: { $size: 0 } } } },
          { $unwind: "$struggles" },
          { $group: { _id: "$struggles", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        User.aggregate([
          { $match: baseQuery },
          { $match: { studyMode: { $exists: true, $not: { $size: 0 } } } },
          { $unwind: "$studyMode" },
          { $group: { _id: "$studyMode", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        User.aggregate([
          { $match: baseQuery },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": -1, "_id.month": -1 } },
          { $limit: 6 },
        ]),
      ]);

      const overview = {
        totalUsers,
        activeLearners,
        completedProfiles,
        activeStudents,
        learnerRate:
          totalUsers > 0 ? Math.round((activeLearners / totalUsers) * 100) : 0,
        completionRate:
          totalUsers > 0
            ? Math.round((completedProfiles / totalUsers) * 100)
            : 0,
        activityRate:
          totalUsers > 0
            ? Math.round((activeStudents / totalUsers) * 100)
            : 0,
      };

      this.statsCache = {
        overview,
        examTypes: examTypeStats,
        education: educationStats,
        struggles: strugglesStats,
        studyModes: studyModeStats,
        monthlyRegistrations,
      };

      this.lastStatsUpdate = Date.now();
    } catch (error) {
      this.statsCache = null;
    }
  }

  async updateUsers() {
    try {
      const User = (await import("../models/User.js")).default;

      const users = await User.find({ role: "user" })
        .select(
          "firstName lastName email createdAt isProfileComplete examType lastLogin"
        )
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      this.usersCache = users || [];
    } catch (error) {
      this.usersCache = [];
    }
  }

  async updateAndBroadcast() {
    if (this.adminRooms.size === 0) return;

    await this.updateStats();
    await this.updateUsers();

    if (this.statsCache) {
      this.io.to("admin-dashboard").emit("admin-stats-update", {
        success: true,
        data: this.statsCache,
      });
    }

    if (this.usersCache) {
      this.io.to("admin-dashboard").emit("admin-users-update", {
        success: true,
        data: { users: this.usersCache },
      });
    }
  }

  startUpdateInterval() {
    setInterval(async () => {
      if (this.adminRooms.size > 0) {
        await this.updateAndBroadcast();
      }
    }, 60000);
  }
}

export default new SocketService();