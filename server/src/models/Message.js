import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studyPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyPlan",
      required: true,
    },
    weekNumber: {
      type: Number,
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    answerText: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "answered", "resolved", "archived"],
      default: "pending",
    },
    activityContext: {
      activityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DailyActivity",
      },
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuestionTemplate",
      },
    },
    attachments: [
      {
        type: String,
      },
    ],
    answeredAt: Date,
    archivedAt: Date,
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Message", messageSchema);
