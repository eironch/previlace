import ManualQuestion from "../models/ManualQuestion.js";
import Achievement from "../models/Achievement.js";
import { AppError, catchAsync } from "../utils/AppError.js";

const sampleAchievements = [
  {
    name: "First Steps",
    description: "Complete your first quiz",
    icon: "🎯",
    category: "milestone",
    criteria: { type: "completedQuizzes", value: 1, period: "oneTime" },
    pointsValue: 10,
    rarityLevel: "common",
    displayOrder: 1,
  },
  {
    name: "Hot Streak",
    description: "Maintain a 7-day study streak",
    icon: "🔥",
    category: "streak",
    criteria: { type: "streak", value: 7, period: "oneTime" },
    pointsValue: 25,
    rarityLevel: "rare",
    displayOrder: 2,
  },
  {
    name: "Perfectionist",
    description: "Score 100% on any quiz",
    icon: "💯",
    category: "accuracy",
    criteria: { type: "perfectScores", value: 1, period: "oneTime" },
    pointsValue: 30,
    rarityLevel: "epic",
    displayOrder: 3,
  },
  {
    name: "Quiz Master",
    description: "Complete 50 quizzes",
    icon: "👑",
    category: "milestone",
    criteria: { type: "completedQuizzes", value: 50, period: "allTime" },
    pointsValue: 100,
    rarityLevel: "legendary",
    displayOrder: 4,
  },
];

function generateComprehensiveQuestions() {
  const categories = {
    "General Information": Array(50)
      .fill(null)
      .map((_, i) => ({
        questionText: `What is the definition of the Civil Service? (Question ${i + 1})`,
        questionType: "multiple_choice",
        options: [
          { text: "A group of government employees", isCorrect: true },
          { text: "A military organization", isCorrect: false },
          { text: "A private business entity", isCorrect: false },
          { text: "An educational institution", isCorrect: false },
        ],
        explanation:
          "The Civil Service refers to the system of government employees excluding the military.",
        category: "General Information",
        subjectArea: "General Information",
        difficulty: ["beginner", "intermediate", "advanced"][i % 3],
        examLevel: ["professional", "subprofessional", "both"][i % 3],
        language: "English",
        status: "published",
        workflowState: "published",
        questionType: "multiple_choice",
        metadata: { source: "manual", version: 1 },
      })),
    Grammar: Array(50)
      .fill(null)
      .map((_, i) => ({
        questionText: `Identify the grammatically correct option (Question ${i + 1})`,
        questionType: "multiple_choice",
        options: [
          { text: "She have completed her work.", isCorrect: false },
          { text: "She has completed her work.", isCorrect: true },
          { text: "She are completing her work.", isCorrect: false },
          { text: "She were completed her work.", isCorrect: false },
        ],
        explanation:
          "Use 'has' for singular third-person subjects with present perfect tense.",
        category: "Grammar",
        subjectArea: "Verbal Ability",
        difficulty: ["beginner", "intermediate", "advanced"][i % 3],
        examLevel: ["professional", "subprofessional", "both"][i % 3],
        language: "English",
        status: "published",
        workflowState: "published",
        questionType: "multiple_choice",
        metadata: { source: "manual", version: 1 },
      })),
    Vocabulary: Array(50)
      .fill(null)
      .map((_, i) => ({
        questionText: `Find the synonym of "ANALYZE" (Question ${i + 1})`,
        questionType: "multiple_choice",
        options: [
          { text: "Examine", isCorrect: true },
          { text: "Ignore", isCorrect: false },
          { text: "Synthesize", isCorrect: false },
          { text: "Simplify", isCorrect: false },
        ],
        explanation: "Analyze means to examine something carefully and in detail.",
        category: "Vocabulary",
        subjectArea: "Verbal Ability",
        difficulty: ["beginner", "intermediate", "advanced"][i % 3],
        examLevel: ["professional", "subprofessional", "both"][i % 3],
        language: "English",
        status: "published",
        workflowState: "published",
        questionType: "multiple_choice",
        metadata: { source: "manual", version: 1 },
      })),
    Mathematics: Array(50)
      .fill(null)
      .map((_, i) => ({
        questionText: `Calculate 20% of 250 (Question ${i + 1})`,
        questionType: "multiple_choice",
        options: [
          { text: "50", isCorrect: true },
          { text: "40", isCorrect: false },
          { text: "60", isCorrect: false },
          { text: "45", isCorrect: false },
        ],
        explanation: "20% of 250 = 0.20 × 250 = 50",
        category: "Mathematics",
        subjectArea: "Numerical Ability",
        difficulty: ["beginner", "intermediate", "advanced"][i % 3],
        examLevel: ["professional", "subprofessional", "both"][i % 3],
        language: "English",
        status: "published",
        workflowState: "published",
        questionType: "multiple_choice",
        metadata: { source: "manual", version: 1 },
      })),
    "Analytical Reasoning": Array(50)
      .fill(null)
      .map((_, i) => ({
        questionText: `Complete the series: 3, 6, 9, 12, ___ (Question ${i + 1})`,
        questionType: "multiple_choice",
        options: [
          { text: "15", isCorrect: true },
          { text: "14", isCorrect: false },
          { text: "16", isCorrect: false },
          { text: "13", isCorrect: false },
        ],
        explanation: "The series increases by 3 each time.",
        category: "Analytical Reasoning",
        subjectArea: "Logic",
        difficulty: ["beginner", "intermediate", "advanced"][i % 3],
        examLevel: ["professional", "subprofessional", "both"][i % 3],
        language: "English",
        status: "published",
        workflowState: "published",
        questionType: "multiple_choice",
        metadata: { source: "manual", version: 1 },
      })),
    Clerical: Array(50)
      .fill(null)
      .map((_, i) => ({
        questionText: `Arrange in alphabetical order: Smith, Jones, Anderson, Brown (Question ${i + 1})`,
        questionType: "multiple_choice",
        options: [
          { text: "Anderson, Brown, Jones, Smith", isCorrect: true },
          { text: "Smith, Jones, Anderson, Brown", isCorrect: false },
          { text: "Brown, Anderson, Jones, Smith", isCorrect: false },
          { text: "Jones, Anderson, Smith, Brown", isCorrect: false },
        ],
        explanation:
          "Alphabetical order: A comes before B, B before J, and J before S.",
        category: "Clerical",
        subjectArea: "Clerical Ability",
        difficulty: ["beginner", "intermediate", "advanced"][i % 3],
        examLevel: ["professional", "subprofessional", "both"][i % 3],
        language: "English",
        status: "published",
        workflowState: "published",
        questionType: "multiple_choice",
        metadata: { source: "manual", version: 1 },
      })),
  };

  const allQuestions = [];
  for (const category in categories) {
    allQuestions.push(...categories[category]);
  }

  return allQuestions;
}

const populateTestData = catchAsync(async (req, res, next) => {
  const userId = req.user?._id || null;

  const existingQuestions = await ManualQuestion.countDocuments();
  if (existingQuestions > 0) {
    return next(
      new AppError(
        "Database already contains questions. Clear first or use a different approach.",
        400
      )
    );
  }

  const questions = generateComprehensiveQuestions().map((q) => ({
    ...q,
    createdBy: userId,
  }));

  const createdQuestions = await ManualQuestion.insertMany(questions);

  const existingAchievements = await Achievement.countDocuments();
  let createdAchievements = [];

  if (existingAchievements === 0) {
    createdAchievements = await Achievement.insertMany(sampleAchievements);
  }

  res.status(201).json({
    success: true,
    message: "Test data populated successfully",
    data: {
      questionsCreated: createdQuestions.length,
      achievementsCreated: createdAchievements.length,
    },
  });
});

const clearTestData = catchAsync(async (req, res, next) => {
  await ManualQuestion.deleteMany({});
  await Achievement.deleteMany({});

  res.json({
    success: true,
    message: "Test data cleared successfully",
  });
});

const seedComprehensiveData = catchAsync(async (req, res, next) => {
  const userId = req.user?._id || null;
  const existingCount = await ManualQuestion.countDocuments();

  if (existingCount > 0) {
    return next(
      new AppError(
        `Database already contains ${existingCount} questions. Reset first.`,
        400
      )
    );
  }

  const questions = generateComprehensiveQuestions().map((q) => ({
    ...q,
    createdBy: userId,
  }));

  const created = await ManualQuestion.insertMany(questions);

  res.status(201).json({
    success: true,
    message: `Seeded ${created.length} comprehensive questions successfully`,
    data: {
      questionsCreated: created.length,
      byCategory: {
        "General Information": 50,
        Grammar: 50,
        Vocabulary: 50,
        Mathematics: 50,
        "Analytical Reasoning": 50,
        Clerical: 50,
      },
      totalQuestions: await ManualQuestion.countDocuments(),
    },
  });
});

const seedQuestions = catchAsync(async (req, res, next) => {
  const userId = req.user?._id || null;
  const { count = 50 } = req.body;

  if (count < 1 || count > 200) {
    return next(new AppError("Count must be between 1 and 200", 400));
  }

  const questions = generateComprehensiveQuestions()
    .slice(0, count)
    .map((q) => ({
      ...q,
      createdBy: userId,
    }));

  const created = await ManualQuestion.insertMany(questions);

  res.status(201).json({
    success: true,
    message: `${created.length} questions added successfully`,
    data: {
      questionsCreated: created.length,
      totalQuestions: await ManualQuestion.countDocuments(),
    },
  });
});

const resetQuestions = catchAsync(async (req, res, next) => {
  const result = await ManualQuestion.deleteMany({});

  res.json({
    success: true,
    message: "All questions deleted successfully",
    data: {
      deletedCount: result.deletedCount,
      totalRemaining: await ManualQuestion.countDocuments(),
    },
  });
});

const getQuestionCount = catchAsync(async (req, res, next) => {
  const count = await ManualQuestion.countDocuments();
  const byCategory = await ManualQuestion.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      totalQuestions: count,
      byCategory: Object.fromEntries(
        byCategory.map((item) => [item._id, item.count])
      ),
    },
  });
});

const resetAndReseed = catchAsync(async (req, res, next) => {
  if (process.env.NODE_ENV !== 'development') {
    return next(new AppError('This operation is only allowed in development mode', 403));
  }

  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  try {
    await execAsync('node src/scripts/seed.js', {
      cwd: process.cwd(),
      timeout: 120000,
    });

    res.json({
      success: true,
      message: 'Database reset and reseeded successfully',
      data: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Reseed error:', error);
    return next(new AppError('Failed to reset and reseed database', 500));
  }
});

export default {
  populateTestData,
  clearTestData,
  seedComprehensiveData,
  seedQuestions,
  resetQuestions,
  getQuestionCount,
  resetAndReseed,
};
