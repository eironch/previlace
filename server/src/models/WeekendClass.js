import mongoose from "mongoose";

const weekendClassSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
    },
    description: String,
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // e.g., "10:00 AM"
      required: true,
    },
    endTime: {
      type: String, // e.g., "12:00 PM"
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    meetingLink: String,
    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("WeekendClass", weekendClassSchema);
