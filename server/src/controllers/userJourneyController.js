import UserJourney from "../models/UserJourney.js";
import StudyPlan from "../models/StudyPlan.js";
import DailyActivity from "../models/DailyActivity.js";
import UserActivity from "../models/UserActivity.js";

export async function initializeJourney(req, res) {
  try {
    const userId = req.user._id;
    const { studyPlanId, journeyType = "linear" } = req.body;

    const existingJourney = await UserJourney.findOne({ userId });
    if (existingJourney) {
      return res.status(400).json({ message: "Journey already exists for this user" });
    }

    const studyPlan = await StudyPlan.findById(studyPlanId);
    if (!studyPlan) {
      return res.status(404).json({ message: "Study plan not found" });
    }

    if (!studyPlan.enrolledStudents.includes(userId)) {
      return res.status(403).json({ message: "User not enrolled in this study plan" });
    }

    const firstWeekActivities = await DailyActivity.find({
      studyPlanId,
      weekNumber: 1,
    }).select("_id");

    const journey = await UserJourney.create({
      userId,
      studyPlanId,
      currentWeek: 1,
      journeyType,
      unlockedActivities: firstWeekActivities.map(a => a._id),
      weeklyProgress: [{
        weekNumber: 1,
        activitiesCompleted: 0,
        totalActivities: firstWeekActivities.length,
        saturdayAttendance: false,
        sundayAttendance: false,
        xpEarned: 0,
      }],
    });

    return res.status(201).json({
      message: "Journey initialized successfully",
      journey,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error initializing journey:", error);
    }
    return res.status(500).json({ message: "Server error initializing journey" });
  }
}

export async function getJourney(req, res) {
  try {
    const userId = req.user._id;

    let journey = await UserJourney.findOne({ userId })
      .populate("studyPlanId")
      .populate("unlockedActivities")
      .populate("currentActivity");

    if (!journey) {
      const activePlan = await StudyPlan.findOne({ isActive: true, status: "active" });
      
      if (!activePlan) {
        return res.status(404).json({ 
          message: "No active study plan found. Please contact administrator.",
        });
      }

      if (!activePlan.enrolledStudents.includes(userId)) {
        activePlan.enrolledStudents.push(userId);
        await activePlan.save();
      }

      const firstWeekActivities = await DailyActivity.find({
        studyPlanId: activePlan._id,
        weekNumber: 1,
      }).select("_id");

      journey = await UserJourney.create({
        userId,
        studyPlanId: activePlan._id,
        currentWeek: 1,
        unlockedActivities: firstWeekActivities.map(a => a._id),
        weeklyProgress: [{
          weekNumber: 1,
          activitiesCompleted: 0,
          totalActivities: firstWeekActivities.length,
          saturdayAttendance: false,
          sundayAttendance: false,
          xpEarned: 0,
        }],
      });

      journey = await UserJourney.findById(journey._id)
        .populate("studyPlanId")
        .populate("unlockedActivities")
        .populate("currentActivity");
    }

    return res.status(200).json({ journey });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching journey:", error);
    }
    return res.status(500).json({ message: "Server error fetching journey" });
  }
}

export async function getJourneyPath(req, res) {
  try {
    const userId = req.user._id;

    const journey = await UserJourney.findOne({ userId })
      .populate("studyPlanId");

    if (!journey) {
      return res.status(404).json({ message: "Journey not found" });
    }

    const allActivities = await DailyActivity.find({
      studyPlanId: journey.studyPlanId._id,
    })
      .populate("subjectId", "name")
      .populate("topicIds", "name")
      .sort({ weekNumber: 1, dayOfWeek: 1, order: 1 });

    const userActivities = await UserActivity.find({
      userId,
      activityId: { $in: allActivities.map(a => a._id) },
    });

    const path = allActivities.map(activity => {
      const userActivity = userActivities.find(
        ua => ua.activityId.toString() === activity._id.toString()
      );

      const isUnlocked = journey.unlockedActivities.some(
        id => id.toString() === activity._id.toString()
      );

      const isCompleted = journey.completedActivities.some(
        ca => ca.activityId.toString() === activity._id.toString()
      );

      return {
        activityId: activity._id,
        weekNumber: activity.weekNumber,
        dayOfWeek: activity.dayOfWeek,
        activityDate: activity.activityDate,
        title: activity.title,
        activityType: activity.activityType,
        estimatedDuration: activity.estimatedDuration,
        xpReward: activity.xpReward,
        subjectName: activity.subjectId?.name,
        status: userActivity?.status || (isUnlocked ? "unlocked" : "locked"),
        isUnlocked,
        isCompleted,
        score: userActivity?.score,
        completedAt: userActivity?.completedAt,
        order: activity.order,
      };
    });

    return res.status(200).json({ path });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching journey path:", error);
    }
    return res.status(500).json({ message: "Server error fetching journey path" });
  }
}

export async function getTodayActivities(req, res) {
  try {
    const userId = req.user._id;

    const journey = await UserJourney.findOne({ userId });
    if (!journey) {
      return res.status(404).json({ message: "Journey not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayActivities = await DailyActivity.find({
      studyPlanId: journey.studyPlanId,
      activityDate: { $gte: today, $lt: tomorrow },
    })
      .populate("subjectId", "name")
      .populate("topicIds", "name")
      .sort({ order: 1 });

    const userActivities = await UserActivity.find({
      userId,
      activityId: { $in: todayActivities.map(a => a._id) },
    });

    const activities = todayActivities.map(activity => {
      const userActivity = userActivities.find(
        ua => ua.activityId.toString() === activity._id.toString()
      );

      const isUnlocked = journey.unlockedActivities.some(
        id => id.toString() === activity._id.toString()
      );

      return {
        ...activity.toObject(),
        status: userActivity?.status || (isUnlocked ? "unlocked" : "locked"),
        score: userActivity?.score,
        completedAt: userActivity?.completedAt,
      };
    });

    return res.status(200).json({ activities });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching today activities:", error);
    }
    return res.status(500).json({ message: "Server error fetching today activities" });
  }
}

export async function getWeekProgress(req, res) {
  try {
    const { weekNumber } = req.params;
    const userId = req.user._id;

    const journey = await UserJourney.findOne({ userId });
    if (!journey) {
      return res.status(404).json({ message: "Journey not found" });
    }

    const weekProgress = journey.weeklyProgress.find(
      w => w.weekNumber === parseInt(weekNumber)
    );

    if (!weekProgress) {
      return res.status(404).json({ message: "Week progress not found" });
    }

    const weekActivities = await DailyActivity.find({
      studyPlanId: journey.studyPlanId,
      weekNumber: parseInt(weekNumber),
    })
      .populate("subjectId", "name")
      .sort({ dayOfWeek: 1, order: 1 });

    const userActivities = await UserActivity.find({
      userId,
      activityId: { $in: weekActivities.map(a => a._id) },
    });

    const activities = weekActivities.map(activity => {
      const userActivity = userActivities.find(
        ua => ua.activityId.toString() === activity._id.toString()
      );

      return {
        ...activity.toObject(),
        status: userActivity?.status || "locked",
        score: userActivity?.score,
        completedAt: userActivity?.completedAt,
      };
    });

    return res.status(200).json({
      weekProgress,
      activities,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching week progress:", error);
    }
    return res.status(500).json({ message: "Server error fetching week progress" });
  }
}

export async function unlockNextActivity(req, res) {
  try {
    const userId = req.user._id;

    const journey = await UserJourney.findOne({ userId });
    if (!journey) {
      return res.status(404).json({ message: "Journey not found" });
    }

    const completedCount = journey.completedActivities.length;
    const unlockedCount = journey.unlockedActivities.length;

    if (journey.journeyType === "linear") {
      if (completedCount >= unlockedCount) {
        const allActivities = await DailyActivity.find({
          studyPlanId: journey.studyPlanId,
        }).sort({ weekNumber: 1, dayOfWeek: 1, order: 1 });

        const nextActivity = allActivities.find(
          activity => !journey.unlockedActivities.some(
            id => id.toString() === activity._id.toString()
          )
        );

        if (nextActivity) {
          journey.unlockedActivities.push(nextActivity._id);
          await journey.save();

          return res.status(200).json({
            message: "Next activity unlocked",
            activityId: nextActivity._id,
          });
        }
      }
    }

    return res.status(200).json({ message: "No activities to unlock" });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error unlocking next activity:", error);
    }
    return res.status(500).json({ message: "Server error unlocking activity" });
  }
}

export async function updateDailyGoal(req, res) {
  try {
    const userId = req.user._id;
    const { dailyGoal } = req.body;

    if (dailyGoal < 10 || dailyGoal > 120) {
      return res.status(400).json({ message: "Daily goal must be between 10 and 120 minutes" });
    }

    const journey = await UserJourney.findOneAndUpdate(
      { userId },
      { dailyGoal },
      { new: true }
    );

    if (!journey) {
      return res.status(404).json({ message: "Journey not found" });
    }

    return res.status(200).json({
      message: "Daily goal updated",
      journey,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error updating daily goal:", error);
    }
    return res.status(500).json({ message: "Server error updating daily goal" });
  }
}

export async function switchJourneyType(req, res) {
  try {
    const userId = req.user._id;
    const { journeyType } = req.body;

    if (!["linear", "flexible"].includes(journeyType)) {
      return res.status(400).json({ message: "Invalid journey type" });
    }

    const journey = await UserJourney.findOne({ userId });
    if (!journey) {
      return res.status(404).json({ message: "Journey not found" });
    }

    journey.journeyType = journeyType;

    if (journeyType === "flexible") {
      const weekActivities = await DailyActivity.find({
        studyPlanId: journey.studyPlanId,
        weekNumber: journey.currentWeek,
      }).select("_id");

      journey.unlockedActivities = weekActivities.map(a => a._id);
    }

    await journey.save();

    return res.status(200).json({
      message: "Journey type updated",
      journey,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error switching journey type:", error);
    }
    return res.status(500).json({ message: "Server error switching journey type" });
  }
}
