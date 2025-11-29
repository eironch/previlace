import cron from "node-cron";
import fsrsOptimizationService from "../services/fsrsOptimizationService.js";
import UserBehaviorProfile from "../models/UserBehaviorProfile.js";

let isRunning = false;

async function runOptimizationBatch(batchSize = 10) {
  if (isRunning) return { skipped: true, reason: "Already running" };
  isRunning = true;

  try {
    const pendingProfiles = await UserBehaviorProfile.find({
      $or: [
        { lastOptimizedAt: { $exists: false }, totalQuizzesTaken: { $gte: 20 } },
        { behaviorChangeDetected: true },
        {
          lastOptimizedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          totalQuizzesTaken: { $gte: 100 },
        },
      ],
    })
      .limit(batchSize)
      .select("userId")
      .lean();

    if (pendingProfiles.length === 0) {
      isRunning = false;
      return { processed: 0, message: "No users pending optimization" };
    }

    const results = [];
    for (const profile of pendingProfiles) {
      try {
        const result = await fsrsOptimizationService.optimizeForUser(profile.userId);
        results.push({ userId: profile.userId, success: result.success });
      } catch (err) {
        results.push({ userId: profile.userId, success: false, error: err.message });
      }
    }

    isRunning = false;
    return {
      processed: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  } catch (error) {
    isRunning = false;
    throw error;
  }
}

function startFSRSOptimizationJob() {
  cron.schedule("0 3 * * *", async () => {
    if (process.env.NODE_ENV === "development") {
      console.error("[FSRS Optimization] Starting daily optimization batch");
    }
    try {
      const result = await runOptimizationBatch(20);
      if (process.env.NODE_ENV === "development") {
        console.error("[FSRS Optimization] Batch complete:", result);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[FSRS Optimization] Batch failed:", error.message);
      }
    }
  });

  if (process.env.NODE_ENV === "development") {
    console.error("[FSRS Optimization] Daily job scheduled for 3:00 AM");
  }
}

export { startFSRSOptimizationJob, runOptimizationBatch };
