import mongoose from "mongoose";

const weekendClassSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
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
      required: true,
    },
    mode: {
      type: String,
      enum: ["Online", "Offline"],
      default: "Online",
      required: true,
    },
    meetingLink: {
      type: String,
      required: function () {
        return this.mode === "Online";
      },
    },
    location: {
      type: String, // For offline classes
      required: function () {
        return this.mode === "Offline";
      },
    },
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
