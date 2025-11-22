import DailyActivity from "../models/DailyActivity.js";
import UserActivity from "../models/UserActivity.js";
import UserJourney from "../models/UserJourney.js";
import Streak from "../models/Streak.js";
import activityGeneratorService from "../services/activityGeneratorService.js";
import spacedRepetitionService from "../services/spacedRepetitionService.js";
import feedbackService from "../services/feedbackService.js";

export async function generateActivities(req, res) {
  try {
    const { studyPlanId, weekNumber } = req.body;

    const activities = await activityGeneratorService.generateWeekActivities(studyPlanId, weekNumber);

    return res.status(201).json({
      message: "Activities generated successfully",
      activities,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error generating activities:", error);
    }
    return res.status(500).json({ message: error.message || "Server error generating activities" });
  }
}

export async function getActivitiesByWeek(req, res) {
  try {
    const { studyPlanId, weekNumber } = req.params;
    const userId = req.user._id;

    const activities = await DailyActivity.find({ studyPlanId, weekNumber })
      .populate("subjectId", "name")
      .populate("topicIds", "name")
      .sort({ dayOfWeek: 1, order: 1 });

    const userActivities = await UserActivity.find({
      userId,
      activityId: { $in: activities.map(a => a._id) },
    });

    const activitiesWithStatus = activities.map(activity => {
      const userActivity = userActivities.find(
        ua => ua.activityId.toString() === activity._id.toString()
      );

      return {
        ...activity.toObject(),
        userStatus: userActivity?.status || "locked",
        userScore: userActivity?.score,
        completed: userActivity?.completedAt,
      };
    });

    return res.status(200).json({ activities: activitiesWithStatus });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching activities:", error);
    }
    return res.status(500).json({ message: "Server error fetching activities" });
  }
}

export async function getActivity(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const activity = await DailyActivity.findById(id)
      .populate("subjectId", "name")
      .populate("topicIds", "name")
      .populate("content.questions");

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const userActivity = await UserActivity.findOne({ userId, activityId: id });

    return res.status(200).json({
      activity,
      userActivity,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching activity:", error);
    }
    return res.status(500).json({ message: "Server error fetching activity" });
  }
}

export async function startActivity(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const activity = await DailyActivity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    let userActivity = await UserActivity.findOne({ userId, activityId: id });

    if (!userActivity) {
      userActivity = await UserActivity.create({
        userId,
        activityId: id,
        status: "in_progress",
        startedAt: new Date(),
        maxScore: activity.questionCount || 0,
      });

      const journey = await UserJourney.findOne({ userId });
      if (journey) {
        journey.currentActivity = id;
        if (!journey.unlockedActivities.includes(id)) {
          journey.unlockedActivities.push(id);
        }
        await journey.save();
      }
    } else if (userActivity.status === "locked") {
      userActivity.status = "in_progress";
      userActivity.startedAt = new Date();
      await userActivity.save();
    }

    return res.status(200).json({
      message: "Activity started",
      userActivity,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error starting activity:", error);
    }
    return res.status(500).json({ message: "Server error starting activity" });
  }
}

export async function submitAnswer(req, res) {
  try {
    const { id } = req.params;
    const { questionId, selectedAnswer, timeSpent } = req.body;
    const userId = req.user._id;

    const userActivity = await UserActivity.findOne({ userId, activityId: id });
    if (!userActivity) {
      return res.status(404).json({ message: "User activity not found" });
    }

    const ManualQuestion = (await import("../models/ManualQuestion.js")).default;
    const question = await ManualQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const isCorrect = selectedAnswer === question.correctAnswer;
    const attemptNumber = userActivity.answers.filter(a => 
      a.questionId.toString() === questionId
    ).length + 1;

    userActivity.answers.push({
      questionId,
      selectedAnswer,
      isCorrect,
      timeSpent,
      attemptNumber,
    });

    if (!isCorrect) {
      await spacedRepetitionService.trackMistake(
        userActivity._id,
        questionId,
        selectedAnswer,
        question.correctAnswer,
        question.explanation
      );
    }

    await userActivity.save();

    const feedback = await feedbackService.generateImmediateFeedback(
      questionId,
      selectedAnswer,
      isCorrect
    );

    return res.status(200).json({
      isCorrect,
      feedback,
      progress: {
        answered: userActivity.answers.length,
        total: userActivity.maxScore,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error submitting answer:", error);
    }
    return res.status(500).json({ message: "Server error submitting answer" });
  }
}

export async function completeActivity(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const userActivity = await UserActivity.findOne({ userId, activityId: id });
    if (!userActivity) {
      return res.status(404).json({ message: "User activity not found" });
    }

    if (userActivity.status === "completed" || userActivity.status === "perfect") {
      return res.status(400).json({ message: "Activity already completed" });
    }

    const activity = await DailyActivity.findById(id);
    const correctAnswers = userActivity.answers.filter(a => a.isCorrect).length;
    const totalQuestions = userActivity.answers.length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const isPerfect = correctAnswers === totalQuestions && totalQuestions > 0;

    userActivity.status = isPerfect ? "perfect" : "completed";
    userActivity.completedAt = new Date();
    userActivity.score = score;
    userActivity.timeSpent = userActivity.answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
    userActivity.xpEarned = isPerfect ? activity.xpReward * 1.5 : activity.xpReward;
    await userActivity.save();

    const journey = await UserJourney.findOne({ userId });
    if (journey) {
      journey.completedActivities.push({
        activityId: id,
        completedAt: new Date(),
        score,
        timeSpent: userActivity.timeSpent,
        xpEarned: userActivity.xpEarned,
        isPerfect,
      });
      journey.totalXP += userActivity.xpEarned;
      
      const newLevel = Math.floor(journey.totalXP / 100) + 1;
      if (newLevel > journey.level) {
        journey.level = newLevel;
      }

      await journey.save();
    }

    let streak = await Streak.findOne({ userId });
    if (streak) {
      const now = new Date();
      const lastActivity = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null;

      const isYesterday = function(date1, date2) {
        const yesterday = new Date(date2);
        yesterday.setDate(yesterday.getDate() - 1);
        return date1.getFullYear() === yesterday.getFullYear() &&
          date1.getMonth() === yesterday.getMonth() &&
          date1.getDate() === yesterday.getDate();
      };

      const isSameDay = function(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getDate() === date2.getDate();
      };

      if (!lastActivity || isYesterday(lastActivity, now)) {
        streak.currentStreak += 1;
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
      } else if (!isSameDay(lastActivity, now)) {
        streak.currentStreak = 1;
        streak.lastActivityDate = now;
      }

      await streak.save();
    }

    const summary = await feedbackService.generateActivitySummary(userActivity._id);

    return res.status(200).json({
      message: "Activity completed",
      userActivity,
      summary,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error completing activity:", error);
    }
    return res.status(500).json({ message: "Server error completing activity" });
  }
}

export async function getMistakeReview(req, res) {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    const mistakes = await spacedRepetitionService.getMistakesForReview(userId, parseInt(limit));

    return res.status(200).json({ mistakes });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching mistakes:", error);
    }
    return res.status(500).json({ message: "Server error fetching mistakes" });
  }
}

export async function getActivitySummary(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const userActivity = await UserActivity.findOne({ userId, activityId: id });
    if (!userActivity) {
      return res.status(404).json({ message: "User activity not found" });
    }

    const summary = await feedbackService.generateActivitySummary(userActivity._id);

    return res.status(200).json({ summary });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching summary:", error);
    }
    return res.status(500).json({ message: "Server error fetching summary" });
  }
}

export async function getProgressFeedback(req, res) {
  try {
    const userId = req.user._id;
    const { subjectId, timeframe = 7 } = req.query;

    const feedback = await feedbackService.generateProgressFeedback(
      userId,
      subjectId,
      parseInt(timeframe)
    );

    return res.status(200).json({ feedback });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching progress feedback:", error);
    }
    return res.status(500).json({ message: "Server error fetching progress feedback" });
  }
}

export async function regenerateActivity(req, res) {
  try {
    const { id } = req.params;

    const activity = await activityGeneratorService.regenerateActivity(id);

    return res.status(200).json({
      message: "Activity regenerated successfully",
      activity,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error regenerating activity:", error);
    }
    return res.status(500).json({ message: error.message || "Server error regenerating activity" });
  }
}

export async function getTodayActivity(req, res) {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activities = await DailyActivity.find({
      activityDate: { $gte: today, $lt: tomorrow },
      activityType: "challenge",
    })
      .populate("subjectId", "name")
      .populate("topicIds", "name")
      .sort({ order: 1 })
      .limit(1);

    if (!activities.length) {
      return res.status(200).json({ activity: null });
    }

    const activity = activities[0];
    const userActivity = await UserActivity.findOne({
      userId,
      activityId: activity._id,
    });

    return res.status(200).json({
      activity: {
        ...activity.toObject(),
        userStatus: userActivity?.status || "locked",
        userScore: userActivity?.score,
        completed: userActivity?.completedAt,
        answered: userActivity?.answers?.length || 0,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching today activity:", error);
    }
    return res.status(500).json({ message: "Server error fetching today activity" });
  }
}

export async function getWeeklyProgress(req, res) {
  try {
    const userId = req.user._id;
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);

    const activities = await DailyActivity.find({
      activityDate: { $gte: monday, $lte: friday },
      activityType: "challenge",
    })
      .populate("subjectId", "name")
      .sort({ activityDate: 1 });

    const userActivities = await UserActivity.find({
      userId,
      activityId: { $in: activities.map((a) => a._id) },
    });

    const weeklyProgress = activities.map((activity) => {
      const userActivity = userActivities.find(
        (ua) => ua.activityId.toString() === activity._id.toString()
      );

      return {
        date: activity.activityDate,
        dayName: new Date(activity.activityDate).toLocaleDateString("en-US", { weekday: "long" }),
        activity: activity.title,
        status: userActivity?.status || "locked",
        score: userActivity?.score,
        timeSpent: userActivity?.timeSpent,
        completed: userActivity?.completedAt,
      };
    });

    return res.status(200).json({ weeklyProgress });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching weekly progress:", error);
    }
    return res.status(500).json({ message: "Server error fetching weekly progress" });
  }
}
