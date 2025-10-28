import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPosting",
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
    },
    status: {
      type: String,
      enum: [
        "draft",
        "submitted", 
        "under_review",
        "shortlisted",
        "interview_scheduled",
        "interview_completed",
        "assessment_scheduled",
        "assessment_completed",
        "reference_check",
        "job_offered",
        "accepted",
        "rejected",
        "withdrawn",
        "hired"
      ],
      default: "draft",
      index: true,
    },
    applicationData: {
      personalInfo: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        address: String,
      },
      coverLetter: {
        type: String,
        maxlength: 2000,
      },
      customResponses: [{
        question: String,
        answer: String,
      }],
      documents: [{
        name: String,
        type: {
          type: String,
          enum: ["resume", "cover_letter", "transcript", "certificate", "other"],
        },
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      }],
    },
    timeline: [{
      status: String,
      date: {
        type: Date,
        default: Date.now,
      },
      notes: String,
      updatedBy: String,
    }],
    interviewDetails: {
      scheduledDate: Date,
      type: {
        type: String,
        enum: ["phone", "video", "in_person", "panel", "technical"],
      },
      location: String,
      notes: String,
      feedback: String,
      score: Number,
      interviewers: [String],
    },
    assessmentDetails: {
      type: {
        type: String,
        enum: ["written", "practical", "presentation", "group_exercise"],
      },
      scheduledDate: Date,
      score: Number,
      feedback: String,
      passingScore: Number,
    },
    references: [{
      name: String,
      position: String,
      organization: String,
      email: String,
      phone: String,
      relationship: String,
      contacted: {
        type: Boolean,
        default: false,
      },
      contactedAt: Date,
      response: String,
    }],
    rejectionReason: String,
    withdrawalReason: String,
    submittedAt: Date,
    lastStatusUpdate: {
      type: Date,
      default: Date.now,
    },
    notes: [{
      content: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      isPrivate: {
        type: Boolean,
        default: true,
      },
    }],
    applicationMethod: {
      type: String,
      enum: ["platform", "external", "email", "walk_in"],
      default: "platform",
    },
    externalApplicationUrl: String,
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    followUpDate: Date,
    source: {
      type: String,
      default: "civilearn_platform",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

jobApplicationSchema.virtual("currentStage").get(function () {
  const stageOrder = [
    "draft", "submitted", "under_review", "shortlisted", 
    "interview_scheduled", "interview_completed", "assessment_scheduled", 
    "assessment_completed", "reference_check", "job_offered", 
    "accepted", "hired"
  ];
  
  return stageOrder.indexOf(this.status) + 1;
});

jobApplicationSchema.virtual("daysInCurrentStatus").get(function () {
  const now = new Date();
  const lastUpdate = new Date(this.lastStatusUpdate);
  const diffTime = now - lastUpdate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

jobApplicationSchema.virtual("isActive").get(function () {
  return !["rejected", "withdrawn", "hired", "accepted"].includes(this.status);
});

jobApplicationSchema.methods.updateStatus = function (newStatus, notes = "", updatedBy = "system") {
  this.timeline.push({
    status: newStatus,
    notes,
    updatedBy,
  });
  
  this.status = newStatus;
  this.lastStatusUpdate = new Date();
  
  if (newStatus === "submitted" && !this.submittedAt) {
    this.submittedAt = new Date();
  }
  
  return this.save();
};

jobApplicationSchema.methods.addNote = function (content, isPrivate = true) {
  this.notes.push({
    content,
    isPrivate,
  });
  return this.save();
};

jobApplicationSchema.methods.scheduleInterview = function (details) {
  this.interviewDetails = {
    ...this.interviewDetails,
    ...details,
  };
  return this.updateStatus("interview_scheduled", "Interview scheduled");
};

jobApplicationSchema.methods.completeInterview = function (feedback, score) {
  this.interviewDetails.feedback = feedback;
  this.interviewDetails.score = score;
  return this.updateStatus("interview_completed", "Interview completed");
};

jobApplicationSchema.methods.scheduleAssessment = function (details) {
  this.assessmentDetails = {
    ...this.assessmentDetails,
    ...details,
  };
  return this.updateStatus("assessment_scheduled", "Assessment scheduled");
};

jobApplicationSchema.methods.completeAssessment = function (score, feedback) {
  this.assessmentDetails.score = score;
  this.assessmentDetails.feedback = feedback;
  
  const passed = this.assessmentDetails.passingScore 
    ? score >= this.assessmentDetails.passingScore 
    : true;
  
  const nextStatus = passed ? "assessment_completed" : "rejected";
  const notes = passed 
    ? "Assessment completed successfully" 
    : "Assessment not passed";
    
  return this.updateStatus(nextStatus, notes);
};

jobApplicationSchema.statics.getUserApplications = function (userId, filters = {}) {
  const query = { userId };
  
  if (filters.status) query.status = filters.status;
  if (filters.isActive !== undefined) {
    if (filters.isActive) {
      query.status = { $nin: ["rejected", "withdrawn", "hired", "accepted"] };
    } else {
      query.status = { $in: ["rejected", "withdrawn", "hired", "accepted"] };
    }
  }
  
  return this.find(query)
    .populate("jobId", "title department agency location applicationDeadline salaryRange")
    .sort({ lastStatusUpdate: -1 });
};

jobApplicationSchema.statics.getApplicationStats = function (userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalApplications: { $sum: 1 },
        submitted: {
          $sum: { $cond: [{ $ne: ["$status", "draft"] }, 1, 0] }
        },
        inProgress: {
          $sum: { 
            $cond: [
              { 
                $and: [
                  { $ne: ["$status", "draft"] },
                  { $nin: ["$status", ["rejected", "withdrawn", "hired", "accepted"]] }
                ]
              }, 
              1, 
              0
            ] 
          }
        },
        interviews: {
          $sum: { 
            $cond: [
              { $in: ["$status", ["interview_scheduled", "interview_completed"]] }, 
              1, 
              0
            ] 
          }
        },
        offers: {
          $sum: { $cond: [{ $eq: ["$status", "job_offered"] }, 1, 0] }
        },
        hired: {
          $sum: { $cond: [{ $eq: ["$status", "hired"] }, 1, 0] }
        },
        rejected: {
          $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
        },
      }
    }
  ]);
};

jobApplicationSchema.statics.getRecentActivity = function (userId, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  return this.find({
    userId,
    lastStatusUpdate: { $gte: since },
  })
    .populate("jobId", "title department agency")
    .sort({ lastStatusUpdate: -1 })
    .limit(10);
};

jobApplicationSchema.statics.getUpcomingInterviews = function (userId) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  
  return this.find({
    userId,
    status: "interview_scheduled",
    "interviewDetails.scheduledDate": { $gte: now, $lte: futureDate },
  })
    .populate("jobId", "title department agency location")
    .sort({ "interviewDetails.scheduledDate": 1 });
};

jobApplicationSchema.index({ userId: 1, status: 1 });
jobApplicationSchema.index({ userId: 1, lastStatusUpdate: -1 });
jobApplicationSchema.index({ jobId: 1, status: 1 });
jobApplicationSchema.index({ submittedAt: -1 });
jobApplicationSchema.index({ "interviewDetails.scheduledDate": 1 });

export default mongoose.model("JobApplication", jobApplicationSchema);
