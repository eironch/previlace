import mongoose from "mongoose";

const userJourneySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    studyPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyPlan",
      required: true,
    },
    currentWeek: {
      type: Number,
      default: 1,
    },
    journeyType: {
      type: String,
      enum: ["linear", "flexible"],
      default: "linear",
    },
    totalXP: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    completedActivities: [
      {
        activityId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "DailyActivity",
        },
        completedAt: Date,
        score: Number,
        timeSpent: Number,
        xpEarned: Number,
        isPerfect: Boolean,
      },
    ],
    unlockedActivities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DailyActivity",
      },
    ],
    currentActivity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyActivity",
    },
    weeklyProgress: [
      {
        weekNumber: Number,
        activitiesCompleted: Number,
        totalActivities: Number,
        saturdayAttendance: Boolean,
        sundayAttendance: Boolean,
        xpEarned: Number,
      },
    ],
    dailyGoal: {
      type: Number,
      default: 30,
    },
    dailyGoalsMetCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userJourneySchema.methods.addCompletedActivity = function(activityData) {
  const existing = this.completedActivities.findIndex(
    ca => ca.activityId.toString() === activityData.activityId.toString()
  );

  if (existing > -1) {
    this.completedActivities[existing] = activityData;
  } else {
    this.completedActivities.push(activityData);
  }

  this.totalXP += activityData.xpEarned || 0;
  const newLevel = Math.floor(this.totalXP / 100) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
  }

  return this.save();
};

userJourneySchema.methods.unlockActivity = function(activityId) {
  if (!this.unlockedActivities.includes(activityId)) {
    this.unlockedActivities.push(activityId);
  }
  return this.save();
};

userJourneySchema.methods.updateWeekProgress = function(weekNumber, updates) {
  let weekProgress = this.weeklyProgress.find(w => w.weekNumber === weekNumber);

  if (!weekProgress) {
    weekProgress = {
      weekNumber,
      activitiesCompleted: 0,
      totalActivities: 0,
      saturdayAttendance: false,
      sundayAttendance: false,
      xpEarned: 0,
    };
    this.weeklyProgress.push(weekProgress);
  }

  Object.assign(weekProgress, updates);
  return this.save();
};

userJourneySchema.methods.markAttendance = function(weekNumber, day) {
  let weekProgress = this.weeklyProgress.find(w => w.weekNumber === weekNumber);

  if (!weekProgress) {
    weekProgress = {
      weekNumber,
      activitiesCompleted: 0,
      totalActivities: 0,
      saturdayAttendance: false,
      sundayAttendance: false,
      xpEarned: 0,
    };
    this.weeklyProgress.push(weekProgress);
  }

  if (day === 'saturday' || day === 6) {
    weekProgress.saturdayAttendance = true;
  } else if (day === 'sunday' || day === 7) {
    weekProgress.sundayAttendance = true;
  }

  return this.save();
};

userJourneySchema.methods.incrementDailyGoalsMetCount = function() {
  this.dailyGoalsMetCount += 1;
  return this.save();
};

userJourneySchema.methods.getCompletionRate = function() {
  const total = this.weeklyProgress.reduce((sum, w) => sum + w.totalActivities, 0);
  const completed = this.completedActivities.length;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

userJourneySchema.methods.getCurrentWeekProgress = function() {
  return this.weeklyProgress.find(w => w.weekNumber === this.currentWeek);
};

userJourneySchema.statics.getUsersByStudyPlan = function(studyPlanId) {
  return this.find({ studyPlanId })
    .populate('userId', 'firstName lastName email')
    .sort({ totalXP: -1 });
};

userJourneySchema.statics.getTopPerformers = function(studyPlanId, limit = 10) {
  return this.find({ studyPlanId })
    .populate('userId', 'firstName lastName email avatar')
    .sort({ totalXP: -1 })
    .limit(limit);
};

export default mongoose.model("UserJourney", userJourneySchema);
