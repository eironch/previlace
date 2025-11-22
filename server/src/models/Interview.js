import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["behavioral", "technical", "mixed"],
      default: "mixed",
    },
    questions: [
      {
        question: { type: String, required: true },
        answer: { type: String }, // User's answer
        feedback: { type: String }, // AI or Instructor feedback
        rating: { type: Number, min: 1, max: 5 },
      },
    ],
    status: {
      type: String,
      enum: ["in_progress", "completed", "reviewed"],
      default: "in_progress",
    },
    score: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Interview", interviewSchema);
