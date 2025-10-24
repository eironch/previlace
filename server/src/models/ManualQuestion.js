import mongoose from "mongoose";

const answerVariantSchema = new mongoose.Schema({
  value: { type: String, required: true },
  format: {
    type: String,
    enum: ["latex", "text", "mathml", "fraction", "decimal", "percentage"],
    default: "text",
  },
  confidence: { type: Number, default: 1 },
  explanation: String,
});

const validationResultSchema = new mongoose.Schema({
  fieldId: String,
  isValid: Boolean,
  errors: [
    {
      type: {
        type: String,
        enum: ["syntax", "semantic", "business", "accessibility"],
      },
      message: String,
      suggestion: String,
      severity: {
        type: String,
        enum: ["critical", "high", "medium", "low"],
      },
    },
  ],
  warnings: [String],
  qualityScore: { type: Number, min: 0, max: 100 },
});

const manualQuestionSchema = new mongoose.Schema(
  {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionTemplate",
      required: false,
      index: true,
    },
    templateVersion: {
      type: Number,
      default: 1,
    },
    fieldValues: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map(),
    },
    renderedContent: {
      html: String,
      latex: String,
      mathml: String,
      plainText: String,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    questionMath: {
      type: String,
      trim: true,
    },
    options: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
        },
        math: {
          type: String,
          trim: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
        explanation: String,
      },
    ],
    answerConfiguration: {
      correctAnswers: [answerVariantSchema],
      tolerance: {
        numeric: { type: Number, default: 0.01 },
        percentage: { type: Number, default: 1 },
      },
      equivalenceGroups: [
        {
          name: String,
          expressions: [String],
        },
      ],
      partialCreditRules: [
        {
          condition: String,
          points: Number,
          feedback: String,
        },
      ],
    },
    explanation: {
      type: String,
      trim: true,
    },
    explanationMath: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
      index: true,
    },
    estimatedTime: {
      type: Number,
      default: 60,
    },
    subjectArea: {
      type: String,
      required: true,
      enum: [
        "Verbal Ability",
        "Numerical Ability",
        "General Information",
        "Clerical Ability",
        "Logic",
      ],
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Vocabulary",
        "Grammar",
        "Reading Comprehension",
        "Mathematics",
        "General Information",
        "Clerical",
        "Analytical Reasoning",
      ],
      index: true,
    },
    examLevel: {
      type: String,
      required: true,
      enum: ["Professional", "Subprofessional", "Both"],
      index: true,
    },
    language: {
      type: String,
      required: true,
      enum: ["English", "Filipino"],
      default: "English",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    passageText: {
      type: String,
      trim: true,
    },
    passageTitle: {
      type: String,
      trim: true,
    },
    questionType: {
      type: String,
      required: true,
      enum: [
        "multiple_choice",
        "true_false",
        "fill_blank",
        "matching",
        "sequence",
        "essay",
        "numeric",
        "matrix",
      ],
    },
    points: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["draft", "review", "approved", "published", "rejected", "archived"],
      default: "draft",
      index: true,
    },
    workflowState: {
      type: String,
      enum: ["draft", "review", "approved", "published", "archived"],
      default: "draft",
      index: true,
    },
    validationResults: validationResultSchema,
    qualityMetrics: {
      completenessScore: { type: Number, min: 0, max: 100, default: 0 },
      clarityScore: { type: Number, min: 0, max: 100, default: 0 },
      accuracyScore: { type: Number, min: 0, max: 100, default: 0 },
      engagementScore: { type: Number, min: 0, max: 100, default: 0 },
      accessibilityScore: { type: Number, min: 0, max: 100, default: 0 },
      overallScore: { type: Number, min: 0, max: 100, default: 0 },
    },
    reviewHistory: [
      {
        reviewerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        action: {
          type: String,
          enum: ["approved", "rejected", "requested_changes"],
        },
        notes: String,
        reviewedAt: Date,
        checklistScores: {
          type: Map,
          of: Number,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["editor", "reviewer", "viewer"],
        },
        addedAt: Date,
      },
    ],
    versionHistory: [
      {
        version: Number,
        changes: String,
        fieldValues: Map,
        modifiedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        modifiedAt: Date,
      },
    ],
    currentVersion: {
      type: Number,
      default: 1,
    },
    parentQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ManualQuestion",
    },
    usageStats: {
      totalAttempts: { type: Number, default: 0 },
      correctAttempts: { type: Number, default: 0 },
      incorrectAttempts: { type: Number, default: 0 },
      avgResponseTime: { type: Number, default: 0 },
      lastUsed: Date,
    },
    performanceData: {
      discriminationIndex: Number,
      difficultyIndex: Number,
      guessingParameter: Number,
      reliabilityCoefficient: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      source: {
        type: String,
        enum: ["manual", "ai_generated", "imported", "cloned"],
        default: "manual",
      },
      aiGenerationParams: {
        model: String,
        prompt: String,
        temperature: Number,
      },
      references: [String],
      contentHash: String,
      lastValidated: Date,
      version: {
        type: Number,
        default: 1,
      },
    },
    auditTrail: [
      {
        action: String,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        timestamp: Date,
        details: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

manualQuestionSchema.virtual("template", {
  ref: "QuestionTemplate",
  localField: "templateId",
  foreignField: "_id",
  justOne: true,
});

manualQuestionSchema.virtual("creator", {
  ref: "User",
  localField: "createdBy",
  foreignField: "_id",
  justOne: true,
});

manualQuestionSchema.virtual("difficultyScore").get(function () {
  if (this.usageStats.totalAttempts === 0) return null;
  return (this.usageStats.correctAttempts / this.usageStats.totalAttempts) * 100;
});

manualQuestionSchema.virtual("effectivenessScore").get(function () {
  if (this.usageStats.totalAttempts < 10) return null;
  const correctRate = this.usageStats.correctAttempts / this.usageStats.totalAttempts;
  return correctRate >= 0.3 && correctRate <= 0.8 ? "Good" : "Review";
});

manualQuestionSchema.methods.incrementUsage = function (isCorrect, responseTime) {
  this.usageStats.totalAttempts += 1;
  if (isCorrect) {
    this.usageStats.correctAttempts += 1;
  } else {
    this.usageStats.incorrectAttempts += 1;
  }
  
  if (responseTime) {
    const prevAvg = this.usageStats.avgResponseTime || 0;
    const prevTotal = this.usageStats.totalAttempts - 1;
    this.usageStats.avgResponseTime = (prevAvg * prevTotal + responseTime) / this.usageStats.totalAttempts;
  }
  
  this.usageStats.lastUsed = new Date();
  return this.save();
};

manualQuestionSchema.methods.submitForReview = function () {
  if (this.workflowState !== "draft") {
    throw new Error("Question must be in draft state to submit for review");
  }
  this.workflowState = "review";
  this.status = "review";
  this.auditTrail.push({
    action: "submitted_for_review",
    userId: this.createdBy,
    timestamp: new Date(),
  });
  return this.save();
};

manualQuestionSchema.methods.approve = function (reviewerId, notes, checklistScores) {
  this.workflowState = "approved";
  this.status = "approved";
  this.reviewHistory.push({
    reviewerId,
    action: "approved",
    notes,
    reviewedAt: new Date(),
    checklistScores,
  });
  this.auditTrail.push({
    action: "approved",
    userId: reviewerId,
    timestamp: new Date(),
    details: { notes },
  });
  return this.save();
};

manualQuestionSchema.methods.reject = function (reviewerId, notes, checklistScores) {
  this.workflowState = "draft";
  this.status = "rejected";
  this.reviewHistory.push({
    reviewerId,
    action: "rejected",
    notes,
    reviewedAt: new Date(),
    checklistScores,
  });
  this.auditTrail.push({
    action: "rejected",
    userId: reviewerId,
    timestamp: new Date(),
    details: { notes },
  });
  return this.save();
};

manualQuestionSchema.methods.publish = function () {
  if (this.workflowState !== "approved") {
    throw new Error("Question must be approved before publishing");
  }
  this.workflowState = "published";
  this.status = "published";
  this.auditTrail.push({
    action: "published",
    timestamp: new Date(),
  });
  return this.save();
};

manualQuestionSchema.methods.archive = function (reason) {
  this.workflowState = "archived";
  this.status = "archived";
  this.isActive = false;
  this.auditTrail.push({
    action: "archived",
    timestamp: new Date(),
    details: { reason },
  });
  return this.save();
};

manualQuestionSchema.methods.createVersion = function (changes, userId) {
  this.versionHistory.push({
    version: this.currentVersion,
    changes,
    fieldValues: new Map(this.fieldValues),
    modifiedBy: userId,
    modifiedAt: new Date(),
  });
  this.currentVersion += 1;
  this.metadata.version = this.currentVersion;
  return this.save();
};

manualQuestionSchema.methods.revertToVersion = function (version) {
  const historicalVersion = this.versionHistory.find((v) => v.version === version);
  if (!historicalVersion) {
    throw new Error("Version not found");
  }
  this.fieldValues = historicalVersion.fieldValues;
  this.currentVersion = version;
  this.metadata.version = version;
  this.auditTrail.push({
    action: "reverted_to_version",
    timestamp: new Date(),
    details: { version },
  });
  return this.save();
};

manualQuestionSchema.methods.clone = function (userId) {
  const clonedData = this.toObject();
  delete clonedData._id;
  delete clonedData.createdAt;
  delete clonedData.updatedAt;
  delete clonedData.usageStats;
  delete clonedData.performanceData;
  delete clonedData.reviewHistory;
  delete clonedData.auditTrail;
  
  clonedData.createdBy = userId;
  clonedData.parentQuestion = this._id;
  clonedData.workflowState = "draft";
  clonedData.status = "draft";
  clonedData.currentVersion = 1;
  clonedData.versionHistory = [];
  clonedData.metadata.source = "cloned";
  clonedData.metadata.version = 1;
  
  return this.constructor.create(clonedData);
};

manualQuestionSchema.methods.calculateQualityScore = function () {
  const weights = {
    completeness: 0.2,
    clarity: 0.2,
    accuracy: 0.2,
    engagement: 0.2,
    accessibility: 0.2,
  };
  
  const scores = this.qualityMetrics;
  const overall =
    scores.completenessScore * weights.completeness +
    scores.clarityScore * weights.clarity +
    scores.accuracyScore * weights.accuracy +
    scores.engagementScore * weights.engagement +
    scores.accessibilityScore * weights.accessibility;
  
  this.qualityMetrics.overallScore = Math.round(overall);
  return this.save();
};

manualQuestionSchema.statics.getByFilters = function (filters) {
  const query = { isActive: true };
  
  if (filters.category) query.category = filters.category;
  if (filters.subjectArea) query.subjectArea = filters.subjectArea;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.examLevel) {
    query.$or = [{ examLevel: filters.examLevel }, { examLevel: "Both" }];
  }
  if (filters.workflowState) query.workflowState = filters.workflowState;
  if (filters.language) query.language = filters.language;
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  return this.find(query)
    .populate("templateId", "name category")
    .populate("createdBy", "firstName lastName")
    .sort({ createdAt: -1 });
};

manualQuestionSchema.statics.getRandomQuestions = function (filters, limit = 10) {
  const query = { workflowState: "published", isActive: true };
  
  if (filters.category) query.category = filters.category;
  if (filters.subjectArea) query.subjectArea = filters.subjectArea;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.examLevel) {
    query.$or = [{ examLevel: filters.examLevel }, { examLevel: "Both" }];
  }
  
  return this.aggregate([{ $match: query }, { $sample: { size: limit } }]);
};

manualQuestionSchema.statics.bulkCreate = async function (questions, userId) {
  const results = {
    successful: [],
    failed: [],
  };
  
  for (const questionData of questions) {
    try {
      questionData.createdBy = userId;
      const question = await this.create(questionData);
      results.successful.push(question);
    } catch (error) {
      results.failed.push({
        data: questionData,
        error: error.message,
      });
    }
  }
  
  return results;
};

manualQuestionSchema.statics.getQuestionStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: "$category",
        total: { $sum: 1 },
        approved: {
          $sum: { $cond: [{ $eq: ["$workflowState", "approved"] }, 1, 0] },
        },
        published: {
          $sum: { $cond: [{ $eq: ["$workflowState", "published"] }, 1, 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ["$workflowState", "review"] }, 1, 0] },
        },
        avgQuality: { $avg: "$qualityMetrics.overallScore" },
      },
    },
  ]);
};

manualQuestionSchema.statics.searchQuestions = function (searchQuery, filters = {}) {
  const query = {
    isActive: true,
    workflowState: { $in: ["approved", "published"] },
    $or: [
      { questionText: { $regex: searchQuery, $options: "i" } },
      { explanation: { $regex: searchQuery, $options: "i" } },
      { tags: { $in: [new RegExp(searchQuery, "i")] } },
    ],
  };
  
  Object.assign(query, filters);
  
  return this.find(query)
    .populate("templateId", "name category")
    .populate("createdBy", "firstName lastName")
    .sort({ "qualityMetrics.overallScore": -1 });
};

manualQuestionSchema.index({ templateId: 1, templateVersion: 1 });
manualQuestionSchema.index({ category: 1, subjectArea: 1, difficulty: 1 });
manualQuestionSchema.index({ examLevel: 1, workflowState: 1 });
manualQuestionSchema.index({ createdBy: 1 });
manualQuestionSchema.index({ workflowState: 1, createdAt: -1 });
manualQuestionSchema.index({ "usageStats.totalAttempts": -1 });
manualQuestionSchema.index({ "qualityMetrics.overallScore": -1 });
manualQuestionSchema.index({ tags: 1 });
manualQuestionSchema.index({
  questionText: "text",
  explanation: "text",
  tags: "text",
});

export default mongoose.model("ManualQuestion", manualQuestionSchema);
