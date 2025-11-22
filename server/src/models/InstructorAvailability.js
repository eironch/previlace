import mongoose from "mongoose";

const instructorAvailabilitySchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    weeklySlots: [
      {
        dayOfWeek: {
          type: Number,
          required: true,
          min: 0,
          max: 6,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],
    specificDates: [
      {
        date: {
          type: Date,
          required: true,
        },
        startTime: String,
        endTime: String,
        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    maxSessionsPerWeek: {
      type: Number,
      default: 4,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("InstructorAvailability", instructorAvailabilitySchema);
