import ManualQuestion from "../models/ManualQuestion.js";
import UserProgress from "../models/UserProgress.js";
import Topic from "../models/Topic.js";
import questionSelectionService from "./questionSelectionService.js";

class AdaptiveQuizService {
  async createSubjectQuiz(userId, subjectId, examLevel, questionCount = 20) {
    const topics = await Topic.find({ subjectId, isActive: true });

    if (topics.length === 0) {
      throw new Error("No topics found for this subject");
    }

    const topicIds = topics.map((t) => t._id);
    const userPerformance = await this.getSubjectPerformance(userId, subjectId);
    const weakTopics = userPerformance.weakTopics || [];
    const difficulty = this.calculateAdaptiveDifficulty(userPerformance.averageScore);

    const questionsPerTopic = Math.floor(questionCount / topics.length);
    const selectedQuestions = [];

    for (const topic of topics) {
      const isWeakTopic = weakTopics.includes(topic._id.toString());
      const topicQuestionCount = isWeakTopic ? questionsPerTopic + 1 : questionsPerTopic;

      const topicQuestions = await this.selectTopicQuestions(
        userId,
        topic._id,
        difficulty,
        examLevel,
        topicQuestionCount
      );

      selectedQuestions.push(...topicQuestions);
    }

    if (selectedQuestions.length === 0) {
      const fallbackQuestions = await this.selectFallbackQuestions(subjectId, examLevel, questionCount);
      if (fallbackQuestions.length === 0) {
        throw new Error("No questions available for this subject. Please try another subject or contact support.");
      }
      return {
        questions: fallbackQuestions,
        difficulty,
        targetTopics: topicIds,
        weakTopics,
      };
    }

    return {
      questions: selectedQuestions.slice(0, questionCount),
      difficulty,
      targetTopics: topicIds,
      weakTopics,
    };
  }

  async createTopicQuiz(userId, topicId, examLevel, questionCount = 10) {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      throw new Error("Topic not found");
    }

    const topicPerformance = await this.getTopicPerformance(userId, topicId);
    const difficulty = this.calculateAdaptiveDifficulty(topicPerformance.accuracy);

    const questions = await this.selectTopicQuestions(
      userId,
      topicId,
      difficulty,
      examLevel,
      questionCount
    );

    if (questions.length === 0) {
      const fallbackQuestions = await this.selectFallbackQuestionsForTopic(topicId, examLevel, questionCount);
      if (fallbackQuestions.length === 0) {
        throw new Error("No questions available for this topic. Please try another topic or contact support.");
      }
      return {
        questions: fallbackQuestions,
        difficulty,
        targetTopic: topicId,
      };
    }

    return {
      questions,
      difficulty,
      targetTopic: topicId,
    };
  }

  async selectTopicQuestions(userId, topicId, difficulty, examLevel, questionCount) {
    const recentQuestions = await questionSelectionService.getRecentlyAnsweredQuestions(userId, 30);

    const query = {
      topicId,
      status: "published",
      isActive: true,
      _id: { $nin: recentQuestions },
    };

    if (examLevel) {
      const normalizedExamLevel = examLevel.replace(/-/g, '').toLowerCase();
      query.$or = [
        { examLevel: { $regex: new RegExp(`^${examLevel}$`, "i") } },
        { examLevel: { $regex: new RegExp(`^${normalizedExamLevel}$`, "i") } },
        { examLevel: "Both" }
      ];
    }

    const allQuestions = await ManualQuestion.find(query);

    if (allQuestions.length === 0) {
      const queryWithoutRecent = {
        topicId,
        status: "published",
        isActive: true,
      };
      
      if (examLevel) {
        const normalizedExamLevel = examLevel.replace(/-/g, '').toLowerCase();
        queryWithoutRecent.$or = [
          { examLevel: { $regex: new RegExp(`^${examLevel}$`, "i") } },
          { examLevel: { $regex: new RegExp(`^${normalizedExamLevel}$`, "i") } },
          { examLevel: "Both" }
        ];
      }
      
      const fallbackQuestions = await ManualQuestion.find(queryWithoutRecent);
      if (fallbackQuestions.length > 0) {
        return this.shuffleArray(fallbackQuestions).slice(0, questionCount);
      }
      return [];
    }

    const difficultyGroups = {
      beginner: allQuestions.filter((q) => /^beginner$/i.test(q.difficulty)),
      intermediate: allQuestions.filter((q) => /^intermediate$/i.test(q.difficulty)),
      advanced: allQuestions.filter((q) => /^advanced$/i.test(q.difficulty)),
    };

    const selected = [];
    const difficultyLower = difficulty.toLowerCase();

    if (difficultyLower === "beginner") {
      selected.push(...this.shuffleArray(difficultyGroups.beginner).slice(0, Math.floor(questionCount * 0.6)));
      selected.push(...this.shuffleArray(difficultyGroups.intermediate).slice(0, Math.floor(questionCount * 0.3)));
      selected.push(...this.shuffleArray(difficultyGroups.advanced).slice(0, Math.floor(questionCount * 0.1)));
    } else if (difficultyLower === "intermediate") {
      selected.push(...this.shuffleArray(difficultyGroups.beginner).slice(0, Math.floor(questionCount * 0.2)));
      selected.push(...this.shuffleArray(difficultyGroups.intermediate).slice(0, Math.floor(questionCount * 0.6)));
      selected.push(...this.shuffleArray(difficultyGroups.advanced).slice(0, Math.floor(questionCount * 0.2)));
    } else {
      selected.push(...this.shuffleArray(difficultyGroups.beginner).slice(0, Math.floor(questionCount * 0.1)));
      selected.push(...this.shuffleArray(difficultyGroups.intermediate).slice(0, Math.floor(questionCount * 0.3)));
      selected.push(...this.shuffleArray(difficultyGroups.advanced).slice(0, Math.floor(questionCount * 0.6)));
    }

    // Fallback logic: If selected count is less than requested, fill with remaining questions
    if (selected.length < questionCount) {
      const remainingNeeded = questionCount - selected.length;
      const selectedIds = selected.map(q => q._id.toString());
      const remainingQuestions = allQuestions.filter(
        q => !selectedIds.includes(q._id.toString())
      );
      selected.push(...this.shuffleArray(remainingQuestions).slice(0, remainingNeeded));
    }

    return this.shuffleArray(selected).slice(0, questionCount);
  }

  async selectFallbackQuestions(subjectId, examLevel, questionCount) {
    const topics = await Topic.find({ subjectId, isActive: true });
    const topicIds = topics.map((t) => t._id);

    const query = {
      topicId: { $in: topicIds },
      status: "published",
      isActive: true,
    };

    if (examLevel) {
      const normalizedExamLevel = examLevel.replace(/-/g, '').toLowerCase();
      query.$or = [
        { examLevel: { $regex: new RegExp(`^${examLevel}$`, "i") } },
        { examLevel: { $regex: new RegExp(`^${normalizedExamLevel}$`, "i") } },
        { examLevel: "Both" }
      ];
    }

    const questions = await ManualQuestion.find(query).limit(questionCount * 2);
    return this.shuffleArray(questions).slice(0, questionCount);
  }

  async selectFallbackQuestionsForTopic(topicId, examLevel, questionCount) {
    const query = {
      topicId,
      status: "published",
      isActive: true,
    };

    if (examLevel) {
      const normalizedExamLevel = examLevel.replace(/-/g, '').toLowerCase();
      query.$or = [
        { examLevel: { $regex: new RegExp(`^${examLevel}$`, "i") } },
        { examLevel: { $regex: new RegExp(`^${normalizedExamLevel}$`, "i") } },
        { examLevel: "Both" }
      ];
    }

    const questions = await ManualQuestion.find(query).limit(questionCount * 2);
    return this.shuffleArray(questions).slice(0, questionCount);
  }

  async getSubjectPerformance(userId, subjectId) {
    const progress = await UserProgress.findOne({ userId, subjectId });

    if (!progress || !progress.topicProgress) {
      return {
        averageScore: 0.5,
        weakTopics: [],
      };
    }

    const topicScores = progress.topicProgress.map((tp) => ({
      topicId: tp.topicId,
      score: tp.bestScore || 0,
      attempts: tp.attempts || 0,
    }));

    const averageScore =
      topicScores.reduce((sum, t) => sum + t.score, 0) / topicScores.length;

    const weakTopics = topicScores
      .filter((t) => t.score < 60 || t.attempts < 3)
      .map((t) => t.topicId.toString());

    return {
      averageScore: averageScore / 100,
      weakTopics,
    };
  }

  async getTopicPerformance(userId, topicId) {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return { accuracy: 0.5 };
    }

    const progress = await UserProgress.findOne({
      userId,
      subjectId: topic.subjectId,
    });

    if (!progress || !progress.topicProgress) {
      return { accuracy: 0.5 };
    }

    const topicProgress = progress.topicProgress.find(
      (tp) => tp.topicId.toString() === topicId.toString()
    );

    if (!topicProgress || !topicProgress.bestScore) {
      return { accuracy: 0.5 };
    }

    return {
      accuracy: topicProgress.bestScore / 100,
    };
  }

  calculateAdaptiveDifficulty(accuracy) {
    if (accuracy >= 0.75) return "advanced";
    if (accuracy >= 0.5) return "intermediate";
    return "beginner";
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async createPostTest(userId, weekNumber, subjects, examLevel, questionCount = 30) {
    const allTopics = [];
    for (const subject of subjects) {
      const topics = await Topic.find({ subjectId: subject._id, isActive: true });
      allTopics.push(...topics);
    }

    if (allTopics.length === 0) {
      throw new Error("No topics found for this week");
    }

    const selectedQuestions = [];
    const questionsPerTopic = Math.ceil(questionCount / allTopics.length);

    for (const topic of allTopics) {
      const topicQuestions = await this.selectTopicQuestions(
        userId,
        topic._id,
        "intermediate",
        examLevel,
        questionsPerTopic
      );
      selectedQuestions.push(...topicQuestions);
    }

    return {
      questions: this.shuffleArray(selectedQuestions).slice(0, questionCount),
      weekNumber,
      topicsCovered: allTopics.map(t => t._id),
    };
  }

  async createAssessment(userId, currentWeekNumber, examLevel, questionCount = 20) {
    const previousWeekQuestions = [];
    const mixedQuestions = [];

    const previousWeekQuestionCount = Math.floor(questionCount * 0.7);
    const mixedQuestionCount = questionCount - previousWeekQuestionCount;

    if (currentWeekNumber > 1) {
      const recentHistory = await questionSelectionService.getRecentlyAnsweredQuestions(userId, 7);
      
      if (recentHistory.length > 0) {
        const recentTopics = await Topic.find({
          _id: { $in: recentHistory.map(h => h.topicId).filter(Boolean) }
        });

        for (const topic of recentTopics) {
          const questions = await this.selectTopicQuestions(
            userId,
            topic._id,
            "intermediate",
            examLevel,
            3
          );
          previousWeekQuestions.push(...questions);
        }
      }
    }

    const allTopics = await Topic.find({ isActive: true });
    const randomTopics = this.shuffleArray(allTopics).slice(0, 5);
    
    for (const topic of randomTopics) {
      const questions = await this.selectTopicQuestions(
        userId,
        topic._id,
        "intermediate",
        examLevel,
        2
      );
      mixedQuestions.push(...questions);
    }

    const allQuestions = [
      ...this.shuffleArray(previousWeekQuestions).slice(0, previousWeekQuestionCount),
      ...this.shuffleArray(mixedQuestions).slice(0, mixedQuestionCount),
    ];

    return {
      questions: this.shuffleArray(allQuestions),
      previousWeekQuestions: previousWeekQuestions.length,
      mixedQuestions: mixedQuestions.length,
    };
  }

  async createPretest(userId, examLevel, questionCount = 100) {
    const allSubjects = await Topic.distinct("subjectId", { isActive: true });
    
    if (allSubjects.length === 0) {
      throw new Error("No subjects available for pretest");
    }

    const questionsPerSubject = Math.floor(questionCount / allSubjects.length);
    const selectedQuestions = [];

    for (const subjectId of allSubjects) {
      const topics = await Topic.find({ subjectId, isActive: true });
      const questionsPerTopic = Math.ceil(questionsPerSubject / topics.length);

      for (const topic of topics) {
        const topicQuestions = await this.selectTopicQuestions(
          userId,
          topic._id,
          "intermediate",
          examLevel,
          questionsPerTopic
        );
        selectedQuestions.push(...topicQuestions);
      }
    }

    return {
      questions: this.shuffleArray(selectedQuestions).slice(0, questionCount),
      subjectsCovered: allSubjects,
    };
  }
}

export default new AdaptiveQuizService();
