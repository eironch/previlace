import mongoose from "mongoose";

const dailyActivitySchema = new mongoose.Schema(
  {
    studyPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyPlan",
      required: true,
    },
    weekNumber: {
      type: Number,
      required: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    activityDate: {
      type: Date,
      required: true,
    },
    activityType: {
      type: String,
      enum: ["lesson", "practice", "assessment", "review", "challenge", "class"],
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    topicIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],
    title: {
      type: String,
      required: true,
    },
    description: String,
    estimatedDuration: {
      type: Number,
      required: true,
    },
    questionCount: Number,
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "mixed"],
      default: "mixed",
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      required: true,
    },
    prerequisiteActivities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DailyActivity",
      },
    ],
    xpReward: {
      type: Number,
      default: 10,
    },
    content: {
      questions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "QuestionTemplate",
        },
      ],
      instructions: String,
      materials: [String],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("DailyActivity", dailyActivitySchema);
