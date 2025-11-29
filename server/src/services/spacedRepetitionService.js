import UserActivity from "../models/UserActivity.js";
import UserQuestionHistory from "../models/UserQuestionHistory.js";
import fsrsService from "./fsrsService.js";

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

  async prioritizeMistakesByRetrievability(userId, limit = 10) {
    const histories = await UserQuestionHistory.find({
      userId,
      incorrectAttempts: { $gt: 0 },
      "fsrsData.state": { $in: ["review", "relearning"] }
    }).populate("questionId");

    const now = new Date();
    const withRetrievability = histories.map(h => {
      const card = {
        stability: h.fsrsData.stability,
        state: fsrsService.stringToState(h.fsrsData.state),
        lastReview: h.fsrsData.lastReview
      };
      return {
        history: h,
        retrievability: fsrsService.getRetrievability(card, now)
      };
    });

    return withRetrievability
      .sort((a, b) => a.retrievability - b.retrievability)
      .slice(0, limit)
      .map(item => ({
        questionId: item.history.questionId,
        retrievability: item.retrievability,
        stability: item.history.fsrsData.stability,
        lapses: item.history.fsrsData.lapses
      }));
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

  async scheduleNextReview(userId, questionId, wasCorrect, responseTime = 30000) {
    const history = await UserQuestionHistory.findOne({ userId, questionId });
    if (!history) return null;

    history.updateFSRS(wasCorrect, responseTime);
    await history.save();

    return {
      questionId,
      nextReviewDate: history.fsrsData.due,
      stability: history.fsrsData.stability,
      retrievability: history.getRetrievability()
    };
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

  async getExamReadiness(userId, examDate) {
    return UserQuestionHistory.getExamReadiness(userId, examDate);
  }

  async getDueQuestions(userId, limit = 20) {
    return UserQuestionHistory.getDueForReview(userId, limit);
  }

  async getLowRetrievabilityQuestions(userId, threshold = 0.85, limit = 20) {
    return UserQuestionHistory.getByRetrievability(userId, threshold, limit);
  }
}

export default new SpacedRepetitionService();
