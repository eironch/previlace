import Streak from "../models/Streak.js";
import UserActivity from "../models/UserActivity.js";
import UserQuestionHistory from "../models/UserQuestionHistory.js";

function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

function isYesterday(date1, date2) {
  const yesterday = new Date(date2);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date1, yesterday);
}

export async function getStreak(req, res) {
  try {
    let streak = await Streak.findOne({ userId: req.user._id });

    if (!streak) {
      streak = new Streak({ userId: req.user._id });
      await streak.save();
    }

    // Fetch activity history for the calendar
    const history = await UserQuestionHistory.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const streakHistory = history.map(h => ({
      date: h._id,
      count: h.count
    }));

    return res.status(200).json({ streak, history: streakHistory });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching streak:", error);
    }
    return res.status(500).json({ message: "Server error fetching streak" });
  }
}

export async function updateStreak(req, res) {
  try {
    let streak = await Streak.findOne({ userId: req.user._id });

    if (!streak) {
      streak = new Streak({ userId: req.user._id });
    }

    const now = new Date();
    const lastActivity = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null;

    if (!lastActivity || isYesterday(lastActivity, now)) {
      streak.currentStreak += 1;
      streak.totalActivitiesCompleted += 1;
      streak.lastActivityDate = now;

      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }

      const milestones = [3, 7, 14, 30, 60, 100, 365];
      if (milestones.includes(streak.currentStreak)) {
        streak.milestones.push({
          days: streak.currentStreak,
          achievedAt: now,
        });
      }

      await streak.save();

      return res.status(200).json({
        message: "Streak updated successfully",
        streak,
        milestone: milestones.includes(streak.currentStreak),
        milestoneDay: milestones.includes(streak.currentStreak) ? streak.currentStreak : null,
      });
    } else if (isSameDay(lastActivity, now)) {
      streak.totalActivitiesCompleted += 1;
      await streak.save();

      return res.status(200).json({
        message: "Activity counted for today",
        streak,
        milestone: false,
      });
    } else {
      if (streak.freezesAvailable > 0 && streak.recoveryWindowEnd && now <= new Date(streak.recoveryWindowEnd)) {
        return res.status(200).json({
          message: "Streak in recovery window",
          streak,
          recoveryAvailable: true,
        });
      }

      streak.currentStreak = 0;
      streak.lastActivityDate = null;
      streak.recoveryWindowEnd = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      await streak.save();

      return res.status(200).json({
        message: "Streak broken, starting fresh",
        streak,
        milestone: false,
        recoveryAvailable: true,
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error updating streak:", error);
    }
    return res.status(500).json({ message: "Server error updating streak" });
  }
}

export async function useStreakFreeze(req, res) {
  try {
    const streak = await Streak.findOne({ userId: req.user._id });

    if (!streak) {
      return res.status(404).json({ message: "Streak not found" });
    }

    if (streak.freezesAvailable <= 0) {
      return res.status(400).json({ message: "No streak freezes available" });
    }

    streak.freezesAvailable -= 1;
    streak.freezeUsedDates.push(new Date());
    await streak.save();

    return res.status(200).json({
      message: "Streak freeze used successfully",
      streak,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error using streak freeze:", error);
    }
    return res.status(500).json({ message: "Server error using streak freeze" });
  }
}

export async function purchaseStreakFreeze(req, res) {
  try {
    const { count = 1 } = req.body;

    const streak = await Streak.findOne({ userId: req.user._id });

    if (!streak) {
      return res.status(404).json({ message: "Streak not found" });
    }

    streak.freezesAvailable += count;
    await streak.save();

    return res.status(200).json({
      message: "Streak freeze purchased successfully",
      streak,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error purchasing streak freeze:", error);
    }
    return res.status(500).json({ message: "Server error purchasing streak freeze" });
  }
}

export async function startRecovery(req, res) {
  try {
    const streak = await Streak.findOne({ userId: req.user._id });

    if (!streak) {
      return res.status(404).json({ message: "Streak not found" });
    }

    if (streak.currentStreak > 0) {
      return res.status(400).json({ message: "Streak is not broken" });
    }

    const recoveryEnd = new Date();
    recoveryEnd.setHours(recoveryEnd.getHours() + 48);

    streak.recoveryWindowEnd = recoveryEnd;
    await streak.save();

    return res.status(200).json({
      message: "Recovery window started",
      streak,
      recoveryEnd,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error starting recovery:", error);
    }
    return res.status(500).json({ message: "Server error starting recovery" });
  }
}

export async function recoverStreak(req, res) {
  try {
    const streak = await Streak.findOne({ userId: req.user._id });

    if (!streak) {
      return res.status(404).json({ message: "Streak not found" });
    }

    if (!streak.recoveryWindowEnd) {
      return res.status(400).json({ message: "No recovery window active" });
    }

    const now = new Date();
    if (now > streak.recoveryWindowEnd) {
      return res.status(400).json({ message: "Recovery window expired" });
    }

    streak.currentStreak = streak.longestStreak;
    streak.lastActivityDate = now;
    streak.recoveryWindowEnd = null;
    await streak.save();

    return res.status(200).json({
      message: "Streak recovered successfully",
      streak,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error recovering streak:", error);
    }
    return res.status(500).json({ message: "Server error recovering streak" });
  }
}
