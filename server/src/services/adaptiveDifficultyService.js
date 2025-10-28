const DIFFICULTY_THRESHOLDS = {
  beginner: { min: 0, max: 0.3 },
  intermediate: { min: 0.3, max: 0.7 },
  advanced: { min: 0.7, max: 1.0 },
};

const adaptiveDifficultyService = {
  calculateCurrentDifficulty(performanceHistory, windowSize = 10) {
    if (!performanceHistory || performanceHistory.length === 0) {
      return "beginner";
    }

    const recentAttempts = performanceHistory.slice(-windowSize);
    const correctCount = recentAttempts.filter((a) => a.isCorrect).length;
    const accuracy = correctCount / recentAttempts.length;

    if (accuracy >= 0.8) return "advanced";
    if (accuracy >= 0.5) return "intermediate";
    return "beginner";
  },

  shouldAdjustDifficulty(currentAccuracy, questionCount = 10) {
    return questionCount >= 5;
  },

  getAdjustedDifficulty(userPerformance, currentDifficulty) {
    const { categoryAccuracies } = userPerformance;

    const avgAccuracy =
      Object.values(categoryAccuracies).reduce((sum, acc) => sum + acc, 0) /
      Object.keys(categoryAccuracies).length;

    if (avgAccuracy >= 0.8 && currentDifficulty !== "advanced") {
      return "advanced";
    }

    if (avgAccuracy < 0.5 && currentDifficulty !== "beginner") {
      return "beginner";
    }

    return currentDifficulty;
  },

  selectQuestionsByAdaptiveDifficulty(availableQuestions, targetDifficulty, count) {
    const difficultyGroups = {
      beginner: [],
      intermediate: [],
      advanced: [],
    };

    availableQuestions.forEach((q) => {
      if (difficultyGroups[q.difficulty]) {
        difficultyGroups[q.difficulty].push(q);
      }
    });

    const selected = [];
    const baseCount = Math.floor(count / 3);

    const difficulties = ["beginner", "intermediate", "advanced"];
    const targetIndex = difficulties.indexOf(targetDifficulty);

    if (targetIndex !== -1) {
      const mainDiff = difficulties[targetIndex];
      const mainQuestions = difficultyGroups[mainDiff].sort(
        () => Math.random() - 0.5
      );
      selected.push(...mainQuestions.slice(0, baseCount * 2));

      const otherDiff1 = difficulties[(targetIndex + 1) % 3];
      const otherQuestions1 = difficultyGroups[otherDiff1].sort(
        () => Math.random() - 0.5
      );
      selected.push(...otherQuestions1.slice(0, baseCount / 2));
    }

    return selected.slice(0, count);
  },

  calculateDifficultyScore(question, userAccuracy) {
    const difficultyMultiplier = {
      beginner: 1,
      intermediate: 1.5,
      advanced: 2,
    }[question.difficulty] || 1;

    const accuracyFactor = Math.max(0.5, 2 - userAccuracy);

    return difficultyMultiplier * accuracyFactor;
  },

  analyzeDifficultyProgression(performanceHistory) {
    if (performanceHistory.length < 3) {
      return {
        trend: "insufficient_data",
        recommendation: "Complete more quizzes to analyze progression",
      };
    }

    const chunks = [];
    const chunkSize = Math.floor(performanceHistory.length / 3);

    for (let i = 0; i < 3; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      const chunk = performanceHistory.slice(start, end);
      const accuracy =
        chunk.filter((a) => a.isCorrect).length / chunk.length;
      chunks.push(accuracy);
    }

    const improving = chunks[2] > chunks[0];
    const trend = improving ? "improving" : "declining";
    const recommendation = improving
      ? "Ready to increase difficulty"
      : "Focus on fundamentals before advancing";

    return {
      trend,
      recommendation,
      firstThirdAccuracy: Math.round(chunks[0] * 100),
      lastThirdAccuracy: Math.round(chunks[2] * 100),
    };
  },
};

export default adaptiveDifficultyService;
