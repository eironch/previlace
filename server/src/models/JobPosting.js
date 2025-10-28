import mongoose from "mongoose";

const jobPostingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    agency: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    salaryGrade: {
      type: String,
      trim: true,
    },
    salaryRange: {
      min: Number,
      max: Number,
    },
    jobLevel: {
      type: String,
      enum: ["Entry Level", "Mid Level", "Senior Level", "Executive"],
      default: "Entry Level",
    },
    examLevel: {
      type: String,
      enum: ["Professional", "Sub-Professional"],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    qualifications: [String],
    responsibilities: [String],
    requirements: {
      education: String,
      experience: String,
      skills: [String],
      certifications: [String],
    },
    applicationDeadline: {
      type: Date,
      required: true,
      index: true,
    },
    applicationMethod: {
      type: String,
      enum: ["Online", "Walk-in", "Email", "Mail"],
      default: "Online",
    },
    applicationUrl: {
      type: String,
      trim: true,
    },
    contactInformation: {
      email: String,
      phone: String,
      address: String,
    },
    status: {
      type: String,
      enum: ["active", "expired", "filled", "cancelled"],
      default: "active",
      index: true,
    },
    sourceUrl: {
      type: String,
      required: true,
    },
    sourceWebsite: {
      type: String,
      required: true,
    },
    postedDate: {
      type: Date,
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    crawledAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    matchingKeywords: [String],
    viewCount: {
      type: Number,
      default: 0,
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

jobPostingSchema.virtual("isExpired").get(function () {
  return new Date() > this.applicationDeadline;
});

jobPostingSchema.virtual("daysRemaining").get(function () {
  const now = new Date();
  const deadline = new Date(this.applicationDeadline);
  const diffTime = deadline - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

jobPostingSchema.virtual("isUrgent").get(function () {
  return this.daysRemaining <= 7 && this.daysRemaining > 0;
});

jobPostingSchema.methods.incrementView = function () {
  this.viewCount++;
  return this.save();
};

jobPostingSchema.methods.incrementApplication = function () {
  this.applicationCount++;
  return this.save();
};

jobPostingSchema.methods.updateStatus = function (newStatus) {
  this.status = newStatus;
  this.lastUpdated = new Date();
  return this.save();
};

jobPostingSchema.statics.findActiveJobs = function (filters = {}) {
  const query = {
    status: "active",
    applicationDeadline: { $gte: new Date() },
  };

  if (filters.examLevel) query.examLevel = filters.examLevel;
  if (filters.location) query.location = new RegExp(filters.location, "i");
  if (filters.department) query.department = new RegExp(filters.department, "i");
  if (filters.jobLevel) query.jobLevel = filters.jobLevel;
  if (filters.salaryGrade) query.salaryGrade = filters.salaryGrade;

  return this.find(query)
    .sort({ postedDate: -1, daysRemaining: 1 })
    .lean();
};

jobPostingSchema.statics.findMatchingJobs = function (userProfile) {
  const matchQuery = {
    status: "active",
    applicationDeadline: { $gte: new Date() },
  };

  if (userProfile.examType) {
    matchQuery.examLevel = userProfile.examType;
  }

  if (userProfile.preferredWorkLocations?.length) {
    matchQuery.location = { $in: userProfile.preferredWorkLocations };
  }

  if (userProfile.preferredDepartments?.length) {
    matchQuery.department = { $in: userProfile.preferredDepartments };
  }

  if (userProfile.targetPositions?.length) {
    matchQuery.title = { 
      $regex: userProfile.targetPositions.join("|"), 
      $options: "i" 
    };
  }

  return this.find(matchQuery)
    .sort({ postedDate: -1 })
    .limit(20);
};

jobPostingSchema.statics.getJobStats = function () {
  return this.aggregate([
    {
      $match: {
        status: "active",
        applicationDeadline: { $gte: new Date() },
      },
    },
    {
      $group: {
        _id: null,
        totalActive: { $sum: 1 },
        totalViews: { $sum: "$viewCount" },
        totalApplications: { $sum: "$applicationCount" },
        avgSalaryMin: { $avg: "$salaryRange.min" },
        avgSalaryMax: { $avg: "$salaryRange.max" },
        departmentDistribution: { $push: "$department" },
        locationDistribution: { $push: "$location" },
        levelDistribution: { $push: "$examLevel" },
      },
    },
  ]);
};

jobPostingSchema.statics.getPopularJobs = function (limit = 10) {
  return this.find({
    status: "active",
    applicationDeadline: { $gte: new Date() },
  })
    .sort({ viewCount: -1, applicationCount: -1 })
    .limit(limit);
};

jobPostingSchema.statics.getUrgentJobs = function () {
  const urgentDate = new Date();
  urgentDate.setDate(urgentDate.getDate() + 7);

  return this.find({
    status: "active",
    applicationDeadline: { $lte: urgentDate, $gte: new Date() },
  })
    .sort({ applicationDeadline: 1 });
};

jobPostingSchema.statics.cleanupExpiredJobs = function () {
  return this.updateMany(
    {
      applicationDeadline: { $lt: new Date() },
      status: "active",
    },
    {
      $set: { status: "expired", lastUpdated: new Date() },
    }
  );
};

jobPostingSchema.index({ title: "text", description: "text" });
jobPostingSchema.index({ department: 1, location: 1 });
jobPostingSchema.index({ examLevel: 1, status: 1 });
jobPostingSchema.index({ applicationDeadline: 1, status: 1 });
jobPostingSchema.index({ postedDate: -1 });
jobPostingSchema.index({ "salaryRange.min": 1, "salaryRange.max": 1 });

export default mongoose.model("JobPosting", jobPostingSchema);
