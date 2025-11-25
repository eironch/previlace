import mongoose from "mongoose";

const instructorAvailabilitySchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // General weekly preference (fallback)
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
    // Specific availability for upcoming weekends
    weekendAvailability: [
      {
        date: {
          type: Date,
          required: true,
        },
        isAvailable: {
          type: Boolean,
          default: true,
        },
        mode: {
          type: String,
          enum: ["Online", "Offline", "Both"],
          default: "Online",
        },
        preferredSubjects: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
          },
        ],
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
