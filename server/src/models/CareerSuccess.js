import mongoose from "mongoose";

const careerSuccessSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    examResults: [{
      examType: {
        type: String,
        enum: ["Professional", "Sub-Professional"],
        required: true,
      },
      examDate: {
        type: Date,
        required: true,
      },
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      passed: {
        type: Boolean,
        required: true,
      },
      eligibilityNumber: String,
      validUntil: Date,
      attempts: {
        type: Number,
        default: 1,
      },
      preparationTime: Number,
      studyHours: Number,
      platformUsage: {
        sessionsCompleted: Number,
        questionsAnswered: Number,
        mockExamsTaken: Number,
        studyStreakDays: Number,
      },
    }],
    jobSearchActivity: {
      applicationsSubmitted: {
        type: Number,
        default: 0,
      },
      interviewsCompleted: {
        type: Number,
        default: 0,
      },
      jobOffersReceived: {
        type: Number,
        default: 0,
      },
      averageApplicationToInterviewRate: Number,
      averageInterviewToOfferRate: Number,
      searchStartDate: Date,
      firstJobOfferDate: Date,
      firstJobAcceptedDate: Date,
      searchDuration: Number,
    },
    currentEmployment: {
      isEmployed: {
        type: Boolean,
        default: false,
      },
      jobTitle: String,
      department: String,
      agency: String,
      location: String,
      startDate: Date,
      salaryGrade: String,
      monthlySalary: Number,
      employmentType: {
        type: String,
        enum: ["permanent", "contractual", "casual", "coterminous"],
      },
      jobLevel: {
        type: String,
        enum: ["Entry Level", "Mid Level", "Senior Level", "Executive"],
      },
      isGovernmentJob: {
        type: Boolean,
        default: true,
      },
      sourceOfHire: {
        type: String,
        enum: ["civilearn_platform", "job_board", "referral", "direct_application", "recruitment_agency", "other"],
      },
    },
    careerProgression: [{
      position: String,
      department: String,
      agency: String,
      startDate: Date,
      endDate: Date,
      salaryGrade: String,
      monthlySalary: Number,
      reasonForLeaving: String,
      achievements: [String],
      skills: [String],
      isCurrent: {
        type: Boolean,
        default: false,
      },
    }],
    professionalDevelopment: {
      trainingsCompleted: [{
        title: String,
        provider: String,
        completionDate: Date,
        duration: Number,
        certificateUrl: String,
      }],
      certifications: [{
        name: String,
        organization: String,
        issueDate: Date,
        expirationDate: Date,
        credentialId: String,
      }],
      additionalEducation: [{
        degree: String,
        institution: String,
        completionDate: Date,
        gpa: Number,
      }],
    },
    platformEngagement: {
      totalStudyDays: {
        type: Number,
        default: 0,
      },
      totalQuestionsAnswered: {
        type: Number,
        default: 0,
      },
      totalMockExamsTaken: {
        type: Number,
        default: 0,
      },
      longestStudyStreak: {
        type: Number,
        default: 0,
      },
      achievementsUnlocked: {
        type: Number,
        default: 0,
      },
      highestLeaderboardRank: Number,
      totalStudyHours: {
        type: Number,
        default: 0,
      },
      resumesCreated: {
        type: Number,
        default: 0,
      },
      interviewPracticeSessions: {
        type: Number,
        default: 0,
      },
      jobApplicationsThrough Platform: {
        type: Number,
        default: 0,
      },
      firstLoginDate: Date,
      lastActiveDate: Date,
      totalLoginDays: {
        type: Number,
        default: 0,
      },
    },
    successMetrics: {
      examSuccessRate: {
        type: Number,
        min: 0,
        max: 1,
        default: 0,
      },
      jobPlacementSuccess: {
        type: Boolean,
        default: false,
      },
      timeToEmployment: Number,
      salaryImprovement: Number,
      careerAdvancementLevel: {
        type: Number,
        default: 0,
      },
      platformROI: {
        studyTimeToSuccessRatio: Number,
        costBenefit: Number,
        engagementScore: Number,
      },
    },
    feedback: [{
      type: {
        type: String,
        enum: ["platform_review", "success_story", "improvement_suggestion", "testimonial"],
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      submittedAt: {
        type: Date,
        default: Date.now,
      },
      isPublic: {
        type: Boolean,
        default: false,
      },
      verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
    }],
    milestones: [{
      type: {
        type: String,
        enum: [
          "first_login",
          "profile_completed", 
          "first_quiz_completed",
          "first_mock_exam",
          "exam_registration",
          "exam_passed",
          "first_job_application",
          "first_interview",
          "first_job_offer",
          "employment_started",
          "promotion_received",
          "career_goal_achieved"
        ],
      },
      achievedAt: {
        type: Date,
        default: Date.now,
      },
      description: String,
      metadata: mongoose.Schema.Types.Mixed,
    }],
    isPublicProfile: {
      type: Boolean,
      default: false,
    },
    shareableMetrics: {
      allowStatsSharing: {
        type: Boolean,
        default: false,
      },
      allowSuccessStorySharing: {
        type: Boolean,
        default: false,
      },
      allowAnonymousDataUsage: {
        type: Boolean,
        default: true,
      },
    },
    lastSurveyDate: Date,
    nextFollowUpDate: Date,
    notes: [{
      content: String,
      category: String,
      addedBy: {
        type: String,
        enum: ["user", "system", "admin"],
        default: "user",
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

careerSuccessSchema.virtual("totalExamAttempts").get(function () {
  return this.examResults.reduce((sum, exam) => sum + exam.attempts, 0);
});

careerSuccessSchema.virtual("examPassRate").get(function () {
  if (this.examResults.length === 0) return 0;
  const passed = this.examResults.filter(exam => exam.passed).length;
  return Math.round((passed / this.examResults.length) * 100);
});

careerSuccessSchema.virtual("isCurrentlyEmployed").get(function () {
  return this.currentEmployment.isEmployed;
});

careerSuccessSchema.virtual("careerProgressionYears").get(function () {
  if (this.careerProgression.length === 0) return 0;
  const firstJob = this.careerProgression[0];
  const currentJob = this.careerProgression.find(job => job.isCurrent) || this.careerProgression[this.careerProgression.length - 1];
  
  if (!firstJob.startDate) return 0;
  const endDate = currentJob.endDate || new Date();
  const diffTime = endDate - firstJob.startDate;
  return Math.round(diffTime / (1000 * 60 * 60 * 24 * 365.25) * 10) / 10;
});

careerSuccessSchema.methods.addExamResult = function (examData) {
  this.examResults.push(examData);
  this.successMetrics.examSuccessRate = this.examPassRate / 100;
  
  if (examData.passed) {
    this.addMilestone("exam_passed", `Passed ${examData.examType} level exam with ${examData.score}% score`);
  }
  
  return this.save();
};

careerSuccessSchema.methods.updateEmployment = function (employmentData) {
  this.currentEmployment = { ...this.currentEmployment, ...employmentData };
  
  if (employmentData.isEmployed && !this.currentEmployment.isEmployed) {
    this.addMilestone("employment_started", `Started new position: ${employmentData.jobTitle}`);
    this.successMetrics.jobPlacementSuccess = true;
    
    if (this.jobSearchActivity.searchStartDate) {
      this.successMetrics.timeToEmployment = Math.floor(
        (new Date() - this.jobSearchActivity.searchStartDate) / (1000 * 60 * 60 * 24)
      );
    }
  }
  
  return this.save();
};

careerSuccessSchema.methods.addCareerProgression = function (progressionData) {
  this.careerProgression.forEach(job => job.isCurrent = false);
  
  progressionData.isCurrent = true;
  this.careerProgression.push(progressionData);
  
  if (this.careerProgression.length > 1) {
    this.addMilestone("promotion_received", `Promoted to ${progressionData.position}`);
  }
  
  return this.save();
};

careerSuccessSchema.methods.addMilestone = function (type, description, metadata = {}) {
  const existingMilestone = this.milestones.find(m => m.type === type);
  
  if (!existingMilestone) {
    this.milestones.push({
      type,
      description,
      metadata,
    });
  }
  
  return this.save();
};

careerSuccessSchema.methods.updatePlatformEngagement = function (engagementData) {
  Object.assign(this.platformEngagement, engagementData);
  this.platformEngagement.lastActiveDate = new Date();
  
  this.successMetrics.platformROI.engagementScore = this.calculateEngagementScore();
  
  return this.save();
};

careerSuccessSchema.methods.calculateEngagementScore = function () {
  const weights = {
    studyDays: 0.2,
    questionsAnswered: 0.15,
    mockExams: 0.15,
    studyStreak: 0.1,
    achievements: 0.1,
    studyHours: 0.15,
    loginDays: 0.15,
  };
  
  const normalized = {
    studyDays: Math.min(this.platformEngagement.totalStudyDays / 100, 1),
    questionsAnswered: Math.min(this.platformEngagement.totalQuestionsAnswered / 1000, 1),
    mockExams: Math.min(this.platformEngagement.totalMockExamsTaken / 10, 1),
    studyStreak: Math.min(this.platformEngagement.longestStudyStreak / 30, 1),
    achievements: Math.min(this.platformEngagement.achievementsUnlocked / 20, 1),
    studyHours: Math.min(this.platformEngagement.totalStudyHours / 100, 1),
    loginDays: Math.min(this.platformEngagement.totalLoginDays / 90, 1),
  };
  
  return Math.round(Object.entries(weights).reduce((score, [key, weight]) => {
    return score + (normalized[key] * weight * 100);
  }, 0));
};

careerSuccessSchema.methods.addFeedback = function (feedbackData) {
  this.feedback.push(feedbackData);
  return this.save();
};

careerSuccessSchema.statics.getPlatformSuccessStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        examPassedUsers: { 
          $sum: { 
            $cond: [
              { $gt: [{ $size: { $filter: { input: "$examResults", cond: { $eq: ["$$this.passed", true] } } } }, 0] }, 
              1, 
              0
            ] 
          } 
        },
        employedUsers: { 
          $sum: { $cond: ["$currentEmployment.isEmployed", 1, 0] } 
        },
        averageTimeToEmployment: { $avg: "$successMetrics.timeToEmployment" },
        averageEngagementScore: { $avg: "$successMetrics.platformROI.engagementScore" },
        totalExamsAttempted: { $sum: { $size: "$examResults" } },
        totalExamsPassed: { 
          $sum: { $size: { $filter: { input: "$examResults", cond: { $eq: ["$$this.passed", true] } } } } 
        },
        averageStudyHours: { $avg: "$platformEngagement.totalStudyHours" },
        averageQuestionsAnswered: { $avg: "$platformEngagement.totalQuestionsAnswered" },
      }
    },
    {
      $project: {
        totalUsers: 1,
        examSuccessRate: { $multiply: [{ $divide: ["$totalExamsPassed", "$totalExamsAttempted"] }, 100] },
        employmentRate: { $multiply: [{ $divide: ["$employedUsers", "$totalUsers"] }, 100] },
        averageTimeToEmployment: 1,
        averageEngagementScore: 1,
        averageStudyHours: 1,
        averageQuestionsAnswered: 1,
      }
    }
  ]);
};

careerSuccessSchema.statics.getSuccessStoriesByCategory = function (category, limit = 10) {
  const query = {
    "feedback.type": "success_story",
    "feedback.isPublic": true,
    "feedback.verificationStatus": "verified",
    isPublicProfile: true,
  };
  
  if (category === "employed") {
    query["currentEmployment.isEmployed"] = true;
  } else if (category === "exam_passed") {
    query["examResults.passed"] = true;
  }
  
  return this.find(query)
    .limit(limit)
    .sort({ "feedback.submittedAt": -1 })
    .populate("userId", "firstName lastName avatar")
    .select("feedback currentEmployment examResults platformEngagement");
};

careerSuccessSchema.statics.getUserSuccessLevel = function (userId) {
  return this.findOne({ userId })
    .then(success => {
      if (!success) return "newcomer";
      
      const hasPassedExam = success.examResults.some(exam => exam.passed);
      const isEmployed = success.currentEmployment.isEmployed;
      const engagementScore = success.successMetrics.platformROI.engagementScore;
      
      if (isEmployed && hasPassedExam && engagementScore > 80) return "champion";
      if (isEmployed && hasPassedExam) return "achiever";
      if (hasPassedExam || isEmployed) return "progressor";
      if (engagementScore > 50) return "learner";
      return "newcomer";
    });
};

careerSuccessSchema.index({ userId: 1 }, { unique: true });
careerSuccessSchema.index({ "currentEmployment.isEmployed": 1 });
careerSuccessSchema.index({ "examResults.passed": 1 });
careerSuccessSchema.index({ "feedback.type": 1, "feedback.isPublic": 1 });
careerSuccessSchema.index({ isPublicProfile: 1, "feedback.verificationStatus": 1 });

export default mongoose.model("CareerSuccess", careerSuccessSchema);
