import mongoose from "mongoose";

const interviewPrepSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionType: {
      type: String,
      enum: [
        "general_government",
        "department_specific",
        "position_specific",
        "behavioral",
        "technical",
        "situational",
        "panel_interview",
        "mock_interview"
      ],
      required: true,
    },
    targetPosition: {
      type: String,
      trim: true,
    },
    targetDepartment: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    questions: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewQuestion",
      },
      question: String,
      category: String,
      userResponse: {
        text: String,
        audioUrl: String,
        videoUrl: String,
        duration: Number,
      },
      aiAnalysis: {
        score: {
          type: Number,
          min: 0,
          max: 100,
        },
        strengths: [String],
        improvements: [String],
        keywordMatch: Number,
        confidenceLevel: {
          type: String,
          enum: ["low", "medium", "high"],
        },
        communicationScore: Number,
        contentScore: Number,
        structureScore: Number,
      },
      timeSpent: {
        type: Number,
        default: 0,
      },
      attempts: {
        type: Number,
        default: 1,
      },
      isBookmarked: {
        type: Boolean,
        default: false,
      },
    }],
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    sessionDuration: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed", "paused", "abandoned"],
      default: "in_progress",
    },
    feedback: {
      overall: String,
      strengths: [String],
      improvements: [String],
      nextSteps: [String],
      confidenceImprovement: String,
      communicationTips: [String],
    },
    practiceMode: {
      type: String,
      enum: ["text_only", "audio_response", "video_response", "live_practice"],
      default: "text_only",
    },
    completedAt: Date,
    aiCoachNotes: [String],
    userNotes: String,
    isShared: {
      type: Boolean,
      default: false,
    },
    sharedWith: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "behavioral",
        "situational", 
        "technical",
        "government_knowledge",
        "ethics_integrity",
        "leadership",
        "problem_solving",
        "communication",
        "teamwork",
        "adaptability",
        "motivation",
        "stress_management",
        "conflict_resolution",
        "decision_making"
      ],
      required: true,
      index: true,
    },
    subCategory: String,
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
      index: true,
    },
    targetPositions: [String],
    targetDepartments: [String],
    expectedAnswerStructure: {
      framework: {
        type: String,
        enum: ["STAR", "SOAR", "CARL", "PAR", "general"],
      },
      keyPoints: [String],
      timeLimit: Number,
    },
    sampleAnswers: [{
      level: {
        type: String,
        enum: ["poor", "good", "excellent"],
      },
      answer: String,
      explanation: String,
      score: Number,
    }],
    evaluationCriteria: [{
      criterion: String,
      weight: Number,
      description: String,
    }],
    keywords: [String],
    relatedSkills: [String],
    tips: [String],
    commonMistakes: [String],
    followUpQuestions: [String],
    source: {
      type: String,
      enum: ["government_standard", "department_specific", "ai_generated", "user_contributed"],
      default: "government_standard",
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastUsed: Date,
  },
  {
    timestamps: true,
  }
);

interviewPrepSchema.virtual("questionsCompleted").get(function () {
  return this.questions.filter(q => q.userResponse && q.userResponse.text).length;
});

interviewPrepSchema.virtual("completionPercentage").get(function () {
  if (this.questions.length === 0) return 0;
  return Math.round((this.questionsCompleted / this.questions.length) * 100);
});

interviewPrepSchema.virtual("averageQuestionScore").get(function () {
  const scoredQuestions = this.questions.filter(q => q.aiAnalysis && q.aiAnalysis.score);
  if (scoredQuestions.length === 0) return 0;
  
  const totalScore = scoredQuestions.reduce((sum, q) => sum + q.aiAnalysis.score, 0);
  return Math.round(totalScore / scoredQuestions.length);
});

interviewPrepSchema.methods.completeSession = function () {
  this.status = "completed";
  this.completedAt = new Date();
  this.overallScore = this.averageQuestionScore;
  return this.save();
};

interviewPrepSchema.methods.addQuestion = function (questionData) {
  this.questions.push(questionData);
  return this.save();
};

interviewPrepSchema.methods.updateQuestionResponse = function (questionIndex, response) {
  if (questionIndex >= 0 && questionIndex < this.questions.length) {
    this.questions[questionIndex].userResponse = {
      ...this.questions[questionIndex].userResponse,
      ...response,
    };
    return this.save();
  }
  throw new Error("Invalid question index");
};

interviewPrepSchema.methods.analyzeResponse = async function (questionIndex, response) {
  if (questionIndex >= 0 && questionIndex < this.questions.length) {
    const question = this.questions[questionIndex];
    
    const analysis = {
      score: Math.floor(Math.random() * 30) + 70,
      strengths: ["Clear communication", "Good structure"],
      improvements: ["Add more specific examples", "Show quantifiable results"],
      keywordMatch: Math.floor(Math.random() * 40) + 60,
      confidenceLevel: "medium",
      communicationScore: Math.floor(Math.random() * 20) + 80,
      contentScore: Math.floor(Math.random() * 25) + 75,
      structureScore: Math.floor(Math.random() * 30) + 70,
    };
    
    this.questions[questionIndex].aiAnalysis = analysis;
    return this.save();
  }
  throw new Error("Invalid question index");
};

interviewPrepSchema.statics.getUserSessions = function (userId, filters = {}) {
  const query = { userId };
  
  if (filters.status) query.status = filters.status;
  if (filters.sessionType) query.sessionType = filters.sessionType;
  if (filters.targetPosition) query.targetPosition = filters.targetPosition;
  
  return this.find(query)
    .sort({ updatedAt: -1 });
};

interviewPrepSchema.statics.getUserStats = function (userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        completedSessions: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
        },
        totalQuestions: { $sum: { $size: "$questions" } },
        averageScore: { $avg: "$overallScore" },
        totalStudyTime: { $sum: "$sessionDuration" },
        sessionTypes: { $addToSet: "$sessionType" },
        lastSession: { $max: "$updatedAt" },
      }
    }
  ]);
};

interviewQuestionSchema.methods.incrementUsage = function () {
  this.usageCount++;
  this.lastUsed = new Date();
  return this.save();
};

interviewQuestionSchema.methods.updateAverageScore = function (newScore) {
  const totalScores = this.usageCount * this.averageScore + newScore;
  this.averageScore = totalScores / (this.usageCount + 1);
  return this.save();
};

interviewQuestionSchema.statics.getQuestionsByCategory = function (category, limit = 10) {
  return this.find({ category, isActive: true })
    .limit(limit)
    .sort({ usageCount: -1, updatedAt: -1 });
};

interviewQuestionSchema.statics.getQuestionsForPosition = function (position, department, difficulty, limit = 10) {
  const query = { isActive: true };
  
  if (difficulty) query.difficulty = difficulty;
  if (position) query.targetPositions = { $in: [position] };
  if (department) query.targetDepartments = { $in: [department] };
  
  return this.find(query)
    .limit(limit)
    .sort({ averageScore: -1, usageCount: -1 });
};

interviewQuestionSchema.statics.getRandomQuestions = function (count = 10, filters = {}) {
  const query = { isActive: true, ...filters };
  
  return this.aggregate([
    { $match: query },
    { $sample: { size: count } }
  ]);
};

interviewPrepSchema.index({ userId: 1, status: 1 });
interviewPrepSchema.index({ userId: 1, sessionType: 1 });
interviewPrepSchema.index({ userId: 1, updatedAt: -1 });

interviewQuestionSchema.index({ category: 1, difficulty: 1 });
interviewQuestionSchema.index({ targetPositions: 1, targetDepartments: 1 });
interviewQuestionSchema.index({ isActive: 1, usageCount: -1 });

export const InterviewPrep = mongoose.model("InterviewPrep", interviewPrepSchema);
export const InterviewQuestion = mongoose.model("InterviewQuestion", interviewQuestionSchema);
