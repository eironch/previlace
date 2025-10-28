import UserQuestionHistory from "../models/UserQuestionHistory.js";

class SpacedRepetitionService {
  calculateNextReview(attempt, currentEaseFactor = 2.5) {
    const { isCorrect, responseTime, difficulty } = attempt;
    
    let easeFactor = currentEaseFactor;
    let interval = 1;
    
    if (isCorrect) {
      if (responseTime < 10000) {
        easeFactor = Math.min(easeFactor + 0.1, 3.0);
      }
      
      switch (difficulty) {
        case "beginner":
          interval = Math.ceil(easeFactor * 1);
          break;
        case "intermediate":
          interval = Math.ceil(easeFactor * 2);
          break;
        case "advanced":
          interval = Math.ceil(easeFactor * 3);
          break;
        default:
          interval = Math.ceil(easeFactor * 2);
      }
    } else {
      easeFactor = Math.max(easeFactor - 0.2, 1.3);
      interval = 1;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
    
    return {
      nextReviewDate,
      easeFactor,
      interval,
      repetitions: isCorrect ? attempt.repetitions + 1 : 0
    };
  }

  async updateQuestionHistory(userId, questionId, attempt) {
    const history = await UserQuestionHistory.findOneAndUpdate(
      { userId, questionId },
      {},
      { upsert: true, new: true }
    );

    const spData = this.calculateNextReview(attempt, history.spacedRepetitionData?.easeFactor);
    
    await history.recordAttempt(
      attempt.sessionId,
      attempt.isCorrect,
      attempt.timeSpent,
      attempt.userAnswer
    );

    history.spacedRepetitionData = {
      ...history.spacedRepetitionData,
      ...spData
    };

    return history.save();
  }

  async getDueQuestions(userId, limit = 50) {
    return UserQuestionHistory.find({
      userId,
      'spacedRepetitionData.nextReviewDate': { $lte: new Date() },
      masteryLevel: { $ne: 'mastered' }
    })
    .sort({ 'spacedRepetitionData.nextReviewDate': 1 })
    .limit(limit);
  }

  async getReviewSchedule(userId, days = 7) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return UserQuestionHistory.aggregate([
      {
        $match: {
          userId,
          'spacedRepetitionData.nextReviewDate': {
            $gte: new Date(),
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$spacedRepetitionData.nextReviewDate"
            }
          },
          count: { $sum: 1 },
          questions: {
            $push: {
              questionId: "$questionId",
              masteryLevel: "$masteryLevel",
              nextReview: "$spacedRepetitionData.nextReviewDate"
            }
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
  }

  calculateMasteryLevel(history) {
    const accuracy = history.totalAttempts > 0 
      ? history.correctAttempts / history.totalAttempts 
      : 0;
    
    const recentAccuracy = this.calculateRecentAccuracy(history.attempts);
    const avgResponseTime = history.averageResponseTime || 0;

    if (accuracy >= 0.9 && recentAccuracy >= 0.9 && avgResponseTime < 30000) {
      return "mastered";
    } else if (accuracy >= 0.7 && recentAccuracy >= 0.7) {
      return "proficient";
    } else if (accuracy >= 0.5) {
      return "learning";
    } else {
      return "struggling";
    }
  }

  calculateRecentAccuracy(attempts, recentCount = 5) {
    if (!attempts || attempts.length === 0) return 0;
    
    const recentAttempts = attempts.slice(-recentCount);
    const correct = recentAttempts.filter(a => a.isCorrect).length;
    
    return correct / recentAttempts.length;
  }
}

export default new SpacedRepetitionService();
