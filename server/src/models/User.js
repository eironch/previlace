import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: 6,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    examType: {
      type: String,
      enum: ["Professional", "Sub-Professional", ""],
      default: "",
    },
    targetExamDate: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      enum: ["High School Graduate", "Some College", "College Graduate", "Post Graduate", ""],
      default: "",
    },
    hasTakenExam: {
      type: String,
      enum: ["Yes", "No", ""],
      default: "",
    },
    previousScore: {
      type: String,
      default: "",
    },
    previousAttempts: {
      type: String,
      default: "",
    },
    currentEmployment: {
      type: String,
      enum: ["Student", "Unemployed", "Private Sector", "Government Employee", "Self-Employed", ""],
      default: "",
    },
    workExperience: {
      type: String,
      enum: ["0-1 years", "2-5 years", "6-10 years", "10+ years", ""],
      default: "",
    },
    targetPositions: [{
      type: String,
      enum: [
        "Administrative Officer",
        "Legal Officer", 
        "Human Resource Officer",
        "Information Officer",
        "Budget Officer",
        "Planning Officer",
        "Research Specialist",
        "Program Coordinator"
      ]
    }],
    preferredDepartments: [{
      type: String,
      enum: [
        "Department of Education",
        "Department of Health",
        "Local Government Unit",
        "Department of Finance",
        "Department of Justice",
        "Department of Agriculture",
        "DILG",
        "Other National Agencies"
      ]
    }],
    preferredWorkLocations: [{
      type: String,
      enum: [
        "Metro Manila",
        "Cavite",
        "Laguna", 
        "Batangas",
        "Rizal",
        "Quezon",
        "Bulacan",
        "Anywhere in Philippines"
      ]
    }],
    careerTimeline: {
      type: String,
      enum: ["Within 6 months", "6-12 months", "1-2 years", "2+ years", ""],
      default: "",
    },
    weakSubjects: [{
      type: String,
      enum: [
        "Numerical Ability",
        "Verbal Ability", 
        "General Information",
        "Clerical Ability",
        "Logic & Reasoning",
        "Reading Comprehension",
        "Grammar & Language",
        "Philippine Constitution"
      ]
    }],
    studyModes: [{
      type: String,
      enum: [
        "Video Lessons",
        "Text-based Modules",
        "Practice Quizzes", 
        "Interactive Flashcards",
        "Mock Exams",
        "Study Groups"
      ]
    }],
    preferredStudyTime: {
      type: String,
      enum: [
        "Early Morning (5-8 AM)",
        "Morning (8-12 PM)",
        "Afternoon (12-6 PM)",
        "Evening (6-10 PM)",
        "Night (10 PM-12 AM)",
        "Flexible",
        ""
      ],
      default: "",
    },
    dailyStudyHours: {
      type: String,
      enum: ["1-2 hours", "3-4 hours", "5-6 hours", "6+ hours", ""],
      default: "",
    },
    studySchedule: [{
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }],
    enableJobMatching: {
      type: Boolean,
      default: false,
    },
    wantsResumeHelp: {
      type: Boolean,
      default: false,
    },
    needsInterviewPrep: {
      type: Boolean,
      default: false,
    },
    allowSuccessTracking: {
      type: Boolean,
      default: false,
    },
    studyReminders: {
      type: Boolean,
      default: false,
    },
    jobAlerts: {
      type: Boolean,
      default: false,
    },
    progressNotifications: {
      type: Boolean,
      default: false,
    },
    motivationalMessages: {
      type: Boolean,
      default: false,
    },
    reviewExperience: {
      type: String,
      enum: ["Self-study", "Review center (in person)", "None", ""],
      default: "",
    },
    studyTime: {
      type: String,
      enum: ["Morning", "Afternoon", "Evening", "Flexible", ""],
      default: "",
    },
    hoursPerWeek: {
      type: String,
      default: "",
    },
    targetDate: {
      type: String,
      default: "",
    },
    reason: {
      type: String,
      enum: ["Government Job", "Career Advancement", "Personal Development", "Other", ""],
      default: "",
    },
    targetScore: {
      type: String,
      default: "",
    },
    showLeaderboard: {
      type: Boolean,
      default: false,
    },
    receiveReminders: {
      type: Boolean,
      default: false,
    },
    studyBuddy: {
      type: Boolean,
      default: false,
    },
    struggles: [{
      type: String,
      enum: ["Numerical Ability", "Verbal Ability", "General Information", "Clerical Ability", "Logic", "Grammar"]
    }],
    studyMode: [{
      type: String,
      enum: ["Video Lessons", "Text Modules", "Practice Quizzes", "Live Sessions"]
    }],
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspendedAt: {
      type: Date,
    },
    suspensionReason: {
      type: String,
    },
    studyPlan: {
      targetExamDate: Date,
      startDate: Date,
      totalDays: Number,
      dailyStudyTime: Number,
      currentReadinessScore: Number,
      weeklySchedule: [{
        week: Number,
        focus: String,
        dailyTargets: {
          type: Map,
          of: {
            studyTime: Number,
            activities: [String],
            primaryFocus: String,
            questionsTarget: Number
          }
        },
        goals: [String]
      }],
      milestones: [{
        week: Number,
        day: Number,
        targetReadinessScore: Number,
        description: String,
        assessmentType: String,
        completed: {
          type: Boolean,
          default: false
        },
        actualScore: Number
      }],
      recommendations: [{
        type: String,
        priority: String,
        message: String,
        actions: [String]
      }],
      adherenceLog: [{
        week: Number,
        day: String,
        actualStudyTime: Number,
        questionsCompleted: Number,
        accuracy: Number,
        category: String,
        completedAt: Date
      }],
      adherenceRate: {
        type: Number,
        default: 0
      },
      lastUpdated: Date
    },
    performanceMetrics: {
      overallAccuracy: {
        type: Number,
        default: 0
      },
      totalQuestionsAnswered: {
        type: Number,
        default: 0
      },
      totalStudyTime: {
        type: Number,
        default: 0
      },
      currentStreak: {
        type: Number,
        default: 0
      },
      longestStreak: {
        type: Number,
        default: 0
      },
      lastActivityDate: Date,
      categoryStrengths: [String],
      categoryWeaknesses: [String],
      examReadinessScore: {
        type: Number,
        default: 0
      }
    },
    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: Date,
        userAgent: String,
        ipAddress: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        return ret;
      },
    },
  }
);

userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual("displayName").get(function () {
  if (this.fullName) return this.fullName;
  return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateProfile = function (profileData) {
  Object.keys(profileData).forEach(key => {
    if (profileData[key] !== undefined && this.schema.paths[key]) {
      this[key] = profileData[key];
    }
  });
  return this.save();
};

userSchema.methods.getCareerPreferences = function () {
  return {
    targetPositions: this.targetPositions,
    preferredDepartments: this.preferredDepartments,
    preferredWorkLocations: this.preferredWorkLocations,
    careerTimeline: this.careerTimeline,
    enableJobMatching: this.enableJobMatching,
    jobAlerts: this.jobAlerts,
  };
};

userSchema.methods.getStudyPreferences = function () {
  return {
    examType: this.examType,
    weakSubjects: this.weakSubjects,
    studyModes: this.studyModes,
    preferredStudyTime: this.preferredStudyTime,
    dailyStudyHours: this.dailyStudyHours,
    studySchedule: this.studySchedule,
    studyReminders: this.studyReminders,
    progressNotifications: this.progressNotifications,
  };
};

userSchema.methods.getNotificationPreferences = function () {
  return {
    studyReminders: this.studyReminders,
    jobAlerts: this.jobAlerts,
    progressNotifications: this.progressNotifications,
    motivationalMessages: this.motivationalMessages,
  };
};

userSchema.methods.isEligibleForJobMatching = function () {
  return this.enableJobMatching && this.isProfileComplete && this.targetPositions.length > 0;
};

userSchema.methods.needsCareerServices = function () {
  return this.wantsResumeHelp || this.needsInterviewPrep || this.enableJobMatching;
};

userSchema.methods.incLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        loginAttempts: 1,
        lockUntil: 1,
      },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000,
    };
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1,
    },
  });
};

userSchema.methods.addRefreshToken = function (token, userAgent, ipAddress) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  this.refreshTokens.push({
    token,
    expiresAt,
    userAgent,
    ipAddress,
  });

  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }

  return this.save();
};

userSchema.methods.removeRefreshToken = function (token) {
  this.refreshTokens = this.refreshTokens.filter((rt) => rt.token !== token);
  return this.save();
};

userSchema.statics.findOrCreate = async function (criteria) {
  const user = await this.findOne({ $or: [{ googleId: criteria.googleId }, { email: criteria.email }] });

  if (user) {
    return user;
  }

  return this.create({
    email: criteria.email,
    googleId: criteria.googleId,
    avatar: criteria.avatar,
    firstName: criteria.firstName,
    lastName: criteria.lastName,
    isEmailVerified: true,
    isProfileComplete: false,
  });
};

userSchema.statics.findUsersForJobMatching = function (criteria) {
  const query = {
    enableJobMatching: true,
    isProfileComplete: true,
    targetPositions: { $in: criteria.positions },
  };

  if (criteria.locations?.length) {
    query.preferredWorkLocations = { $in: criteria.locations };
  }

  if (criteria.departments?.length) {
    query.preferredDepartments = { $in: criteria.departments };
  }

  return this.find(query);
};

userSchema.statics.getCareerAnalytics = function () {
  return this.aggregate([
    {
      $match: { isProfileComplete: true }
    },
    {
      $group: {
        _id: "$examType",
        count: { $sum: 1 },
        avgExperience: { $avg: "$workExperience" },
        topPositions: { $push: "$targetPositions" },
        topDepartments: { $push: "$preferredDepartments" },
      }
    }
  ]);
};

userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ enableJobMatching: 1, isProfileComplete: 1 });
userSchema.index({ targetPositions: 1 });
userSchema.index({ preferredWorkLocations: 1 });

export default mongoose.model("User", userSchema);