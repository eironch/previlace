class SM2AlgorithmService {
  static DEFAULT_EASE_FACTOR = 2.5;
  static MIN_EASE_FACTOR = 1.3;
  static MAX_EASE_FACTOR = 3.0;

  static QUALITY_RATINGS = {
    COMPLETE_BLACKOUT: 0,
    INCORRECT_REMEMBERED_AFTER: 1,
    INCORRECT_EASY_TO_RECALL: 2,
    CORRECT_DIFFICULT: 3,
    CORRECT_HESITATION: 4,
    CORRECT_PERFECT: 5,
  };

  static MASTERY_THRESHOLDS = {
    BEGINNER: { minInterval: 0, maxInterval: 3, minRepetitions: 0 },
    INTERMEDIATE: { minInterval: 4, maxInterval: 14, minRepetitions: 3 },
    ADVANCED: { minInterval: 15, maxInterval: 60, minRepetitions: 6 },
    MASTERED: { minInterval: 61, minRepetitions: 10 },
  };

  calculateQualityRating(isCorrect, responseTimeMs, averageTimeMs, consecutiveCorrect) {
    if (!isCorrect) {
      if (consecutiveCorrect >= 2) {
        return this.constructor.QUALITY_RATINGS.INCORRECT_EASY_TO_RECALL;
      }
      return this.constructor.QUALITY_RATINGS.INCORRECT_REMEMBERED_AFTER;
    }

    const timeRatio = responseTimeMs / (averageTimeMs || 30000);

    if (timeRatio <= 0.5 && consecutiveCorrect >= 3) {
      return this.constructor.QUALITY_RATINGS.CORRECT_PERFECT;
    }
    if (timeRatio <= 0.8) {
      return this.constructor.QUALITY_RATINGS.CORRECT_HESITATION;
    }
    return this.constructor.QUALITY_RATINGS.CORRECT_DIFFICULT;
  }

  calculateNextReview(currentData, qualityRating) {
    let { easeFactor, interval, repetitions } = currentData;

    easeFactor = easeFactor || this.constructor.DEFAULT_EASE_FACTOR;
    interval = interval || 0;
    repetitions = repetitions || 0;

    const newEaseFactor = this.calculateNewEaseFactor(easeFactor, qualityRating);

    let newInterval;
    let newRepetitions;

    if (qualityRating < 3) {
      newRepetitions = 0;
      newInterval = 1;
    } else {
      newRepetitions = repetitions + 1;

      if (newRepetitions === 1) {
        newInterval = 1;
      } else if (newRepetitions === 2) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * newEaseFactor);
      }
    }

    newInterval = Math.max(1, Math.min(newInterval, 365));

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      nextReviewDate,
      lastReviewedAt: new Date(),
      qualityRating,
    };
  }

  calculateNewEaseFactor(currentEaseFactor, qualityRating) {
    const newEaseFactor =
      currentEaseFactor +
      (0.1 - (5 - qualityRating) * (0.08 + (5 - qualityRating) * 0.02));

    return Math.max(
      this.constructor.MIN_EASE_FACTOR,
      Math.min(this.constructor.MAX_EASE_FACTOR, newEaseFactor)
    );
  }

  determineMasteryLevel(interval, repetitions, accuracy) {
    const thresholds = this.constructor.MASTERY_THRESHOLDS;

    if (
      interval >= thresholds.MASTERED.minInterval &&
      repetitions >= thresholds.MASTERED.minRepetitions &&
      accuracy >= 0.9
    ) {
      return "mastered";
    }

    if (
      interval >= thresholds.ADVANCED.minInterval &&
      repetitions >= thresholds.ADVANCED.minRepetitions &&
      accuracy >= 0.75
    ) {
      return "advanced";
    }

    if (
      interval >= thresholds.INTERMEDIATE.minInterval &&
      repetitions >= thresholds.INTERMEDIATE.minRepetitions &&
      accuracy >= 0.6
    ) {
      return "intermediate";
    }

    return "beginner";
  }

  calculatePriority(questionHistory) {
    const {
      nextReviewDate,
      easeFactor,
      interval,
      incorrectAttempts,
      totalAttempts,
      lastAttemptAt,
    } = questionHistory;

    let priority = 0;

    const now = new Date();
    const reviewDate = new Date(nextReviewDate);
    const daysOverdue = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24));

    if (daysOverdue > 0) {
      priority += Math.min(daysOverdue * 10, 100);
    }

    if (easeFactor < 2.0) {
      priority += (2.5 - easeFactor) * 30;
    }

    if (totalAttempts > 0) {
      const errorRate = incorrectAttempts / totalAttempts;
      priority += errorRate * 50;
    }

    if (interval < 7) {
      priority += (7 - interval) * 5;
    }

    if (lastAttemptAt) {
      const daysSinceLastAttempt = Math.floor(
        (now - new Date(lastAttemptAt)) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastAttempt > 7) {
        priority += Math.min(daysSinceLastAttempt, 30);
      }
    }

    return Math.min(priority, 200);
  }

  selectQuestionsWithInterleaving(questions, targetCount) {
    const topicGroups = {};
    questions.forEach((q) => {
      const topicId = q.topicId?.toString() || "unknown";
      if (!topicGroups[topicId]) {
        topicGroups[topicId] = [];
      }
      topicGroups[topicId].push(q);
    });

    Object.values(topicGroups).forEach((group) => {
      group.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    });

    const selected = [];
    const topicKeys = Object.keys(topicGroups);
    let topicIndex = 0;

    while (selected.length < targetCount && topicKeys.length > 0) {
      const topicId = topicKeys[topicIndex % topicKeys.length];
      const group = topicGroups[topicId];

      if (group.length > 0) {
        selected.push(group.shift());
      }

      if (group.length === 0) {
        const idx = topicKeys.indexOf(topicId);
        topicKeys.splice(idx, 1);
        if (topicKeys.length > 0) {
          topicIndex = topicIndex % topicKeys.length;
        }
      } else {
        topicIndex++;
      }
    }

    return selected;
  }

  calculateOptimalSessionSize(userPerformance, availableTime) {
    const baseQuestions = 10;
    const { recentAccuracy, averageTimePerQuestion, streak } = userPerformance;

    let adjustedCount = baseQuestions;

    if (recentAccuracy >= 0.8) {
      adjustedCount += 5;
    } else if (recentAccuracy < 0.5) {
      adjustedCount -= 3;
    }

    if (streak >= 7) {
      adjustedCount += 3;
    }

    if (availableTime && averageTimePerQuestion) {
      const timeBasedMax = Math.floor(
        (availableTime * 60 * 1000) / averageTimePerQuestion
      );
      adjustedCount = Math.min(adjustedCount, timeBasedMax);
    }

    return Math.max(5, Math.min(adjustedCount, 50));
  }

  getReviewDistribution(totalQuestions) {
    return {
      dueForReview: Math.floor(totalQuestions * 0.4),
      weakAreas: Math.floor(totalQuestions * 0.3),
      newQuestions: Math.floor(totalQuestions * 0.2),
      reinforcement: Math.floor(totalQuestions * 0.1),
    };
  }
}

export default new SM2AlgorithmService();
