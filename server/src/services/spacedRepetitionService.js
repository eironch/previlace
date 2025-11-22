import UserActivity from "../models/UserActivity.js";
import DailyActivity from "../models/DailyActivity.js";
import ManualQuestion from "../models/ManualQuestion.js";

class SpacedRepetitionService {
  async getMistakesForReview(userId, limit = 10) {
    const userActivities = await UserActivity.find({
      userId,
      "mistakes.0": { $exists: true },
      "mistakes.reviewedAt": { $exists: false },
    })
      .populate("mistakes.questionId")
      .sort({ createdAt: -1 })
      .limit(50);

    const mistakes = [];
    for (const activity of userActivities) {
      for (const mistake of activity.mistakes) {
        if (!mistake.reviewedAt) {
          mistakes.push({
            activityId: activity._id,
            questionId: mistake.questionId,
            incorrectAnswer: mistake.incorrectAnswer,
            correctAnswer: mistake.correctAnswer,
            explanation: mistake.explanation,
            daysSinceMistake: this.calculateDaysSince(activity.completedAt),
          });
        }
      }
    }

    return this.prioritizeMistakes(mistakes).slice(0, limit);
  }

  prioritizeMistakes(mistakes) {
    return mistakes.sort((a, b) => {
      const priorityA = this.calculatePriority(a);
      const priorityB = this.calculatePriority(b);
      return priorityB - priorityA;
    });
  }

  calculatePriority(mistake) {
    const daysSinceMistake = mistake.daysSinceMistake;
    
    let priority = 10;
    
    if (daysSinceMistake === 0) priority += 20;
    else if (daysSinceMistake === 1) priority += 15;
    else if (daysSinceMistake <= 3) priority += 10;
    else if (daysSinceMistake <= 7) priority += 5;
    
    return priority;
  }

  calculateDaysSince(date) {
    if (!date) return 0;
    const now = new Date();
    const past = new Date(date);
    return Math.floor((now - past) / (1000 * 60 * 60 * 24));
  }

  async scheduleNextReview(userId, questionId, wasCorrect) {
    const userActivities = await UserActivity.find({
      userId,
      "mistakes.questionId": questionId,
    });

    if (userActivities.length === 0) return null;

    const activity = userActivities[userActivities.length - 1];
    const mistake = activity.mistakes.find(
      m => m.questionId.toString() === questionId.toString()
    );

    if (!mistake) return null;

    if (wasCorrect) {
      mistake.reviewedAt = new Date();
      await activity.save();
      return null;
    }

    return {
      questionId,
      nextReviewDate: this.calculateNextReviewDate(),
    };
  }

  calculateNextReviewDate() {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    return now;
  }

  async trackMistake(userActivityId, questionId, incorrectAnswer, correctAnswer, explanation) {
    const activity = await UserActivity.findById(userActivityId);
    if (!activity) {
      throw new Error("User activity not found");
    }

    const existingMistake = activity.mistakes.find(
      m => m.questionId.toString() === questionId.toString()
    );

    if (!existingMistake) {
      activity.mistakes.push({
        questionId,
        incorrectAnswer,
        correctAnswer,
        explanation,
      });
      await activity.save();
    }

    return activity;
  }

  async getMistakePatterns(userId) {
    const activities = await UserActivity.find({ userId })
      .populate("activityId")
      .populate("mistakes.questionId");

    const patterns = {
      bySubject: {},
      byTopic: {},
      byDifficulty: {},
      totalMistakes: 0,
      repeatedMistakes: 0,
    };

    for (const activity of activities) {
      if (!activity.mistakes || activity.mistakes.length === 0) continue;

      for (const mistake of activity.mistakes) {
        patterns.totalMistakes++;

        if (mistake.reviewedAt) {
          patterns.repeatedMistakes++;
        }

        if (activity.activityId?.subjectId) {
          const subjectId = activity.activityId.subjectId.toString();
          patterns.bySubject[subjectId] = (patterns.bySubject[subjectId] || 0) + 1;
        }

        if (mistake.questionId?.difficulty) {
          const difficulty = mistake.questionId.difficulty;
          patterns.byDifficulty[difficulty] = (patterns.byDifficulty[difficulty] || 0) + 1;
        }
      }
    }

    return patterns;
  }

  async generateReviewActivity(userId, subjectId) {
    const mistakes = await this.getMistakesForReview(userId, 15);
    const questionIds = mistakes.map(m => m.questionId._id || m.questionId);

    return {
      activityType: "review",
      subjectId,
      title: "Mistake Review Session",
      description: "Focus on questions you previously got wrong",
      questionCount: questionIds.length,
      content: {
        questions: questionIds,
        instructions: "Review these questions and try to get them correct this time",
      },
    };
  }
}

export default new SpacedRepetitionService();
