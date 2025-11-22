import mongoose from "mongoose";

const studyPlanSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    examDate: {
      type: Date,
      required: true,
    },
    targetLevel: {
      type: String,
      enum: ["Professional", "Sub-Professional"],
      required: true,
    },
    totalWeeks: {
      type: Number,
      required: true,
      default: 10,
    },
    status: {
      type: String,
      enum: ["draft", "published", "active", "completed", "archived"],
      default: "draft",
    },
    weeks: [
      {
        weekNumber: {
          type: Number,
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
        saturdaySession: {
          subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
          },
          instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          startTime: String,
          endTime: String,
          topics: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Topic",
            },
          ],
        },
        sundaySession: {
          subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
          },
          instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          startTime: String,
          endTime: String,
          topics: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Topic",
            },
          ],
        },
        focusAreas: [String],
      },
    ],
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    publishedAt: Date,
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

studyPlanSchema.methods.addWeek = function(weekData) {
  const weekNumber = this.weeks.length + 1;
  const lastWeek = this.weeks[this.weeks.length - 1];
  const startDate = lastWeek ? new Date(lastWeek.endDate.getTime() + 24 * 60 * 60 * 1000) : new Date(this.startDate);
  const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);

  this.weeks.push({
    weekNumber,
    startDate,
    endDate,
    saturdaySession: weekData.saturdaySession || {},
    sundaySession: weekData.sundaySession || {},
    focusAreas: weekData.focusAreas || [],
  });

  this.totalWeeks = this.weeks.length;
  return this.save();
};

studyPlanSchema.methods.updateWeek = function(weekNumber, updates) {
  const week = this.weeks.find(w => w.weekNumber === weekNumber);
  if (!week) {
    throw new Error(`Week ${weekNumber} not found`);
  }

  Object.assign(week, updates);
  return this.save();
};

studyPlanSchema.methods.updateSession = function(weekNumber, day, sessionData) {
  const week = this.weeks.find(w => w.weekNumber === weekNumber);
  if (!week) {
    throw new Error(`Week ${weekNumber} not found`);
  }

  const sessionKey = day === 'saturday' ? 'saturdaySession' : 'sundaySession';
  week[sessionKey] = { ...week[sessionKey], ...sessionData };
  return this.save();
};

studyPlanSchema.methods.removeWeek = function(weekNumber) {
  this.weeks = this.weeks.filter(w => w.weekNumber !== weekNumber);
  this.weeks.forEach((week, index) => {
    week.weekNumber = index + 1;
  });
  this.totalWeeks = this.weeks.length;
  return this.save();
};

studyPlanSchema.methods.enrollStudents = function(studentIds) {
  studentIds.forEach(id => {
    if (!this.enrolledStudents.includes(id)) {
      this.enrolledStudents.push(id);
    }
  });
  return this.save();
};

studyPlanSchema.methods.unenrollStudent = function(studentId) {
  this.enrolledStudents = this.enrolledStudents.filter(
    id => id.toString() !== studentId.toString()
  );
  return this.save();
};

studyPlanSchema.statics.getActiveStudyPlan = function() {
  return this.findOne({ isActive: true, status: 'active' })
    .populate('weeks.saturdaySession.subjectId weeks.saturdaySession.instructorId')
    .populate('weeks.sundaySession.subjectId weeks.sundaySession.instructorId')
    .populate('enrolledStudents', 'firstName lastName email');
};

export default mongoose.model("StudyPlan", studyPlanSchema);
