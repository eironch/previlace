const mistakeAnalysisService = {
  classifyMistake(question, userAnswer, correctAnswer, timeSpent, avgTime) {
    if (userAnswer === correctAnswer) {
      return null;
    }

    const timeRatio = timeSpent / avgTime;

    if (timeRatio > 2.5) {
      return "time-pressure";
    }

    const userOptionIndex = question.options.findIndex(
      (opt) => opt.text === userAnswer
    );
    const correctOptionIndex = question.options.findIndex(
      (opt) => opt.text === correctAnswer
    );

    const optionDifference = Math.abs(userOptionIndex - correctOptionIndex);
    if (optionDifference === 1) {
      return "careless";
    }

    return "knowledge-gap";
  },

  analyzePatterns(userAnswerHistory, questions) {
    const mistakes = userAnswerHistory.filter((a) => !a.isCorrect);

    const categoryErrors = {};
    const difficultyErrors = {};
    const mistakeTypes = {
      "careless": 0,
      "knowledge-gap": 0,
      "time-pressure": 0,
    };

    mistakes.forEach((mistake) => {
      const question = questions.find(
        (q) => q._id.toString() === mistake.questionId.toString()
      );

      if (question) {
        categoryErrors[question.category] =
          (categoryErrors[question.category] || 0) + 1;
        difficultyErrors[question.difficulty] =
          (difficultyErrors[question.difficulty] || 0) + 1;
      }

      if (mistake.mistakeType) {
        mistakeTypes[mistake.mistakeType]++;
      }
    });

    const topProblemCategories = Object.entries(categoryErrors)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    const mistakeTrend = Object.entries(mistakeTypes)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / mistakes.length) * 100),
      }));

    return {
      totalMistakes: mistakes.length,
      topProblemCategories,
      mistakeTrend,
      categoryBreakdown: categoryErrors,
      difficultyBreakdown: difficultyErrors,
    };
  },

  generateRemediationPlan(analysisResults, userHistories) {
    const { topProblemCategories, mistakeTrend } = analysisResults;

    const remediationPlan = topProblemCategories.map((category) => {
      const categoryHistories = userHistories.filter(
        (h) => h.category === category
      );
      const avgAccuracy =
        categoryHistories.reduce((sum, h) => sum + (h.correctAttempts / h.totalAttempts), 0) /
        categoryHistories.length;

      return {
        category,
        priority: 1 - avgAccuracy,
        recommendedSessions: Math.ceil((1 - avgAccuracy) * 10),
        focusTopics: categoryHistories
          .sort((a, b) => (b.correctAttempts / b.totalAttempts) - (a.correctAttempts / a.totalAttempts))
          .slice(0, 3)
          .map((h) => h.category),
      };
    });

    const primaryMistakeType = mistakeTrend[0]?.type;
    const mistakeRecommendations = {
      "careless": "Review questions more carefully, take notes of tricky options",
      "knowledge-gap": "Study the concept from beginning, use flashcards",
      "time-pressure": "Practice with time constraints, improve speed gradually",
    };

    return {
      remediationPlan,
      mistakeFocus: mistakeRecommendations[primaryMistakeType] || "Continue practicing",
      estimatedTimeToMastery: Math.ceil(
        remediationPlan.reduce((sum, p) => sum + p.recommendedSessions, 0) * 0.5
      ),
    };
  },

  calculateMistakeFrequency(userHistories) {
    const frequency = {};

    userHistories.forEach((history) => {
      if (history.totalAttempts === 0) return;

      const mistakeRate = 1 - (history.correctAttempts / history.totalAttempts);
      frequency[history.questionId] = mistakeRate;
    });

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .map(([questionId, rate]) => ({
        questionId,
        mistakeRate: Math.round(rate * 100),
      }));
  },

  identifySystematicErrors(userAnswerHistory, questions) {
    const optionDistribution = {};

    userAnswerHistory.forEach((answer) => {
      if (answer.isCorrect) return;

      const question = questions.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );
      if (!question) return;

      const chosenOptionIndex = question.options.findIndex(
        (opt) => opt.text === answer.userAnswer
      );
      const correctOptionIndex = question.options.findIndex(
        (opt) => opt.isCorrect
      );

      const key = `option_${chosenOptionIndex}_correct_${correctOptionIndex}`;
      optionDistribution[key] = (optionDistribution[key] || 0) + 1;
    });

    const systematicPatterns = Object.entries(optionDistribution)
      .filter(([, count]) => count >= 3)
      .map(([pattern, count]) => ({
        pattern,
        frequency: count,
        recommendation: "This pattern suggests specific distractor effectiveness",
      }));

    return systematicPatterns;
  },
};

export default mistakeAnalysisService;
