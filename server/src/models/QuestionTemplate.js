import mongoose from "mongoose";

const fieldDefinitionSchema = new mongoose.Schema({
  fieldId: {
    type: String,
    required: true,
    unique: true,
  },
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      "text",
      "richtext",
      "math",
      "choices",
      "numeric",
      "image",
      "table",
      "graph",
      "code",
      "audio",
      "passage",
    ],
  },
  validation: {
    required: { type: Boolean, default: false },
    minLength: Number,
    maxLength: Number,
    pattern: String,
    min: Number,
    max: Number,
    customValidator: String,
  },
  uiConfig: {
    placeholder: String,
    helpText: String,
    inputHints: String,
    rows: Number,
    cols: Number,
  },
  mathConfig: {
    keypadLayout: {
      type: String,
      enum: ["basic", "algebra", "calculus", "geometry", "statistics"],
      default: "basic",
    },
    allowedFunctions: [String],
    notationStyle: {
      type: String,
      enum: ["standard", "calculator", "programming"],
      default: "standard",
    },
    equivalenceChecking: { type: Boolean, default: true },
    stepByStep: { type: Boolean, default: false },
  },
  conditionalLogic: {
    showIf: {
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed,
    },
    requiredIf: {
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed,
    },
  },
  defaultValue: mongoose.Schema.Types.Mixed,
  order: Number,
});

const questionTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
    subjectAreas: [
      {
        type: String,
        enum: [
          "Verbal Ability",
          "Numerical Ability",
          "General Information",
          "Clerical Ability",
          "Logic",
        ],
      },
    ],
    examLevel: {
      type: String,
      required: true,
      enum: ["Professional", "Subprofessional", "Both"],
      index: true,
    },
    difficultyLevels: [
      {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
      },
    ],
    description: {
      type: String,
      required: true,
      trim: true,
    },
    fieldDefinitions: [fieldDefinitionSchema],
    conditionalLogicRules: [
      {
        id: String,
        conditions: [
          {
            field: String,
            operator: String,
            value: mongoose.Schema.Types.Mixed,
          },
        ],
        actions: [
          {
            type: String,
            target: String,
            value: mongoose.Schema.Types.Mixed,
          },
        ],
      },
    ],
    previewTemplate: {
      type: String,
      required: true,
    },
    parentTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionTemplate",
    },
    version: {
      type: Number,
      default: 1,
    },
    versionHistory: [
      {
        version: Number,
        changes: String,
        modifiedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        modifiedAt: Date,
      },
    ],
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["editor", "viewer", "reviewer"],
        },
        addedAt: Date,
      },
    ],
    usageStats: {
      totalQuestions: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
      avgCompletionTime: { type: Number, default: 0 },
      lastUsed: Date,
    },
    performanceMetrics: {
      avgQualityScore: { type: Number, default: 0 },
      reviewApprovalRate: { type: Number, default: 0 },
      userRating: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
    },
    keypadLayouts: {
      type: Map,
      of: {
        buttons: [
          {
            label: String,
            value: String,
            type: String,
            row: Number,
            col: Number,
          },
        ],
      },
    },
    answerConfiguration: {
      multipleAnswers: { type: Boolean, default: false },
      partialCredit: { type: Boolean, default: false },
      toleranceSettings: {
        numeric: { type: Number, default: 0.01 },
        percentage: { type: Number, default: 1 },
      },
      equivalenceGroups: [
        {
          name: String,
          expressions: [String],
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

questionTemplateSchema.virtual("questionsCount", {
  ref: "ManualQuestion",
  localField: "_id",
  foreignField: "templateId",
  count: true,
});

questionTemplateSchema.methods.incrementVersion = function () {
  this.version += 1;
  return this.save();
};

questionTemplateSchema.methods.publish = function () {
  this.isPublished = true;
  this.publishedAt = new Date();
  return this.save();
};

questionTemplateSchema.methods.unpublish = function () {
  this.isPublished = false;
  this.publishedAt = null;
  return this.save();
};

questionTemplateSchema.methods.addCollaborator = function (userId, role) {
  const existing = this.collaborators.find(
    (c) => c.user.toString() === userId
  );
  if (!existing) {
    this.collaborators.push({
      user: userId,
      role,
      addedAt: new Date(),
    });
  }
  return this.save();
};

questionTemplateSchema.methods.removeCollaborator = function (userId) {
  this.collaborators = this.collaborators.filter(
    (c) => c.user.toString() !== userId
  );
  return this.save();
};

questionTemplateSchema.methods.updateUsageStats = function (stats) {
  Object.assign(this.usageStats, stats);
  this.usageStats.lastUsed = new Date();
  return this.save();
};

questionTemplateSchema.methods.updatePerformanceMetrics = function (metrics) {
  Object.assign(this.performanceMetrics, metrics);
  return this.save();
};

questionTemplateSchema.methods.addRating = function (rating) {
  const currentRating = this.performanceMetrics.userRating || 0;
  const currentCount = this.performanceMetrics.ratingCount || 0;
  const newCount = currentCount + 1;
  const newRating = (currentRating * currentCount + rating) / newCount;

  this.performanceMetrics.userRating = newRating;
  this.performanceMetrics.ratingCount = newCount;
  return this.save();
};

questionTemplateSchema.methods.clone = function (userId) {
  const clonedData = this.toObject();
  delete clonedData._id;
  delete clonedData.createdAt;
  delete clonedData.updatedAt;
  clonedData.name = `${this.name} (Copy)`;
  clonedData.createdBy = userId;
  clonedData.version = 1;
  clonedData.versionHistory = [];
  clonedData.usageStats = {
    totalQuestions: 0,
    successRate: 0,
    avgCompletionTime: 0,
  };
  clonedData.performanceMetrics = {
    avgQualityScore: 0,
    reviewApprovalRate: 0,
    userRating: 0,
    ratingCount: 0,
  };
  clonedData.isPublished = false;
  return this.constructor.create(clonedData);
};

questionTemplateSchema.statics.getByCategory = function (
  category,
  examLevel = null
) {
  const query = { category, isActive: true, isPublished: true };
  if (examLevel) {
    query.$or = [{ examLevel }, { examLevel: "Both" }];
  }
  return this.find(query)
    .populate("createdBy", "firstName lastName")
    .populate("collaborators.user", "firstName lastName");
};

questionTemplateSchema.statics.getPopularTemplates = function (limit = 10) {
  return this.find({ isActive: true, isPublished: true })
    .sort({ "usageStats.totalQuestions": -1 })
    .limit(limit)
    .populate("createdBy", "firstName lastName");
};

questionTemplateSchema.statics.getRecommendedTemplates = async function (
  userId,
  limit = 5
) {
  const userQuestions = await mongoose
    .model("ManualQuestion")
    .find({ createdBy: userId })
    .distinct("templateId");

  const frequentCategories = await mongoose
    .model("ManualQuestion")
    .aggregate([
      { $match: { createdBy: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]);

  const categoryNames = frequentCategories.map((c) => c._id);

  return this.find({
    isActive: true,
    isPublished: true,
    _id: { $nin: userQuestions },
    category: { $in: categoryNames },
  })
    .sort({ "performanceMetrics.userRating": -1 })
    .limit(limit)
    .populate("createdBy", "firstName lastName");
};

questionTemplateSchema.statics.searchTemplates = function (searchQuery) {
  const query = {
    isActive: true,
    isPublished: true,
    $or: [
      { name: { $regex: searchQuery, $options: "i" } },
      { description: { $regex: searchQuery, $options: "i" } },
      { tags: { $in: [new RegExp(searchQuery, "i")] } },
      { category: { $regex: searchQuery, $options: "i" } },
    ],
  };
  return this.find(query)
    .populate("createdBy", "firstName lastName")
    .sort({ "usageStats.totalQuestions": -1 });
};

questionTemplateSchema.index({ category: 1, examLevel: 1 });
questionTemplateSchema.index({ "usageStats.totalQuestions": -1 });
questionTemplateSchema.index({ createdBy: 1 });
questionTemplateSchema.index({ isPublished: 1, isActive: 1 });
questionTemplateSchema.index({ tags: 1 });
questionTemplateSchema.index({
  name: "text",
  description: "text",
  tags: "text",
});

export default mongoose.model("QuestionTemplate", questionTemplateSchema);