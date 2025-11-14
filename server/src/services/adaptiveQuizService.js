import ManualQuestion from "../models/ManualQuestion.js";
import UserQuestionHistory from "../models/UserQuestionHistory.js";
import UserProgress from "../models/UserProgress.js";
import Topic from "../models/Topic.js";
import adaptiveDifficultyService from "./adaptiveDifficultyService.js";
import questionSelectionService from "./questionSelectionService.js";

class AdaptiveQuizService {
  async createSubjectQuiz(userId, subjectId, examLevel, questionCount = 20) {
    const topics = await Topic.find({ subjectId, isActive: true });
    const topicIds = topics.map((t) => t._id);

    const userPerformance = await this.getSubjectPerformance(
      userId,
      subjectId
    );

    const weakTopics = userPerformance.weakTopics || [];
    const difficulty = this.calculateAdaptiveDifficulty(
      userPerformance.averageScore
    );

    let questionsPerTopic = Math.floor(questionCount / topics.length);
    let remainingQuestions = questionCount % topics.length;

    const selectedQuestions = [];

    for (const topic of topics) {
      const isWeakTopic = weakTopics.includes(topic._id.toString());
      const topicQuestionCount = isWeakTopic
        ? questionsPerTopic + 1
        : questionsPerTopic;

      const topicQuestions = await this.selectTopicQuestions(
        userId,
        topic._id,
        difficulty,
        examLevel,
        topicQuestionCount
      );

      selectedQuestions.push(...topicQuestions);

      if (isWeakTopic && remainingQuestions > 0) {
        remainingQuestions--;
      }
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
    const difficulty = this.calculateAdaptiveDifficulty(
      topicPerformance.accuracy
    );

    const questions = await this.selectTopicQuestions(
      userId,
      topicId,
      difficulty,
      examLevel,
      questionCount
    );

    return {
      questions,
      difficulty,
      targetTopic: topicId,
    };
  }

  async createMockExam(userId, examLevel, questionCount = 50) {
    const userPerformance = await this.getOverallPerformance(userId);
    const difficulty = this.calculateAdaptiveDifficulty(
      userPerformance.overallAccuracy
    );

    const weakCategories = userPerformance.weakCategories || [];

    const difficultyDistribution =
      adaptiveDifficultyService.selectQuestionsByAdaptiveDifficulty;

    const query = {
      status: "published",
      isActive: true,
      examLevel: examLevel || { $in: ["Professional", "Sub-Professional"] },
    };

    let questions = await ManualQuestion.aggregate([
      { $match: query },
      { $sample: { size: questionCount * 2 } },
    ]);

    if (weakCategories.length > 0) {
      const weakQuestions = questions.filter((q) =>
        weakCategories.includes(q.category)
      );
      const strongQuestions = questions.filter(
        (q) => !weakCategories.includes(q.category)
      );

      const weakCount = Math.ceil(questionCount * 0.6);
      questions = [
        ...weakQuestions.slice(0, weakCount),
        ...strongQuestions.slice(0, questionCount - weakCount),
      ];
    }

    return {
      questions: questions.slice(0, questionCount),
      difficulty,
      weakCategories,
      isAdaptive: true,
    };
  }

  async selectTopicQuestions(
    userId,
    topicId,
    difficulty,
    examLevel,
    questionCount
  ) {
    const recentQuestions = await questionSelectionService.getRecentlyAnsweredQuestions(
      userId,
      30
    );

    const query = {
      topicId,
      status: "published",
      isActive: true,
      _id: { $nin: recentQuestions },
    };

    if (examLevel) {
      query.examLevel = examLevel;
    }

    const allQuestions = await ManualQuestion.find(query);

    const difficultyGroups = {
      beginner: allQuestions.filter((q) => q.difficulty === "beginner"),
      intermediate: allQuestions.filter(
        (q) => q.difficulty === "intermediate"
      ),
      advanced: allQuestions.filter((q) => q.difficulty === "advanced"),
    };

    const selected = [];

    if (difficulty === "beginner") {
      selected.push(...this.shuffleArray(difficultyGroups.beginner).slice(0, Math.floor(questionCount * 0.6)));
      selected.push(...this.shuffleArray(difficultyGroups.intermediate).slice(0, Math.floor(questionCount * 0.3)));
      selected.push(...this.shuffleArray(difficultyGroups.advanced).slice(0, Math.floor(questionCount * 0.1)));
    } else if (difficulty === "intermediate") {
      selected.push(...this.shuffleArray(difficultyGroups.beginner).slice(0, Math.floor(questionCount * 0.2)));
      selected.push(...this.shuffleArray(difficultyGroups.intermediate).slice(0, Math.floor(questionCount * 0.6)));
      selected.push(...this.shuffleArray(difficultyGroups.advanced).slice(0, Math.floor(questionCount * 0.2)));
    } else {
      selected.push(...this.shuffleArray(difficultyGroups.beginner).slice(0, Math.floor(questionCount * 0.1)));
      selected.push(...this.shuffleArray(difficultyGroups.intermediate).slice(0, Math.floor(questionCount * 0.3)));
      selected.push(...this.shuffleArray(difficultyGroups.advanced).slice(0, Math.floor(questionCount * 0.6)));
    }

    return this.shuffleArray(selected).slice(0, questionCount);
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

  async getOverallPerformance(userId) {
    const allProgress = await UserProgress.find({ userId });

    if (!allProgress || allProgress.length === 0) {
      return {
        overallAccuracy: 0.5,
        weakCategories: [],
      };
    }

    let totalScore = 0;
    let totalAttempts = 0;

    allProgress.forEach((progress) => {
      totalScore += progress.averageScore || 0;
      totalAttempts += progress.totalAttempts || 0;
    });

    const overallAccuracy =
      totalAttempts > 0 ? totalScore / (allProgress.length * 100) : 0.5;

    const weakCategories = await questionSelectionService.identifyWeakAreas(
      userId
    );

    return {
      overallAccuracy,
      weakCategories,
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
}

export default new AdaptiveQuizService();
