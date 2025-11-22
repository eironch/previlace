import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a job title"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Please provide a company name"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Please provide a location"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
      default: "Full-time",
    },
    description: {
      type: String,
      required: [true, "Please provide a job description"],
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: "PHP",
      },
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicationLink: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "closed", "draft"],
      default: "active",
    },
    tags: [String],
    deadline: Date,
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ title: "text", company: "text", description: "text" });
jobSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Job", jobSchema);
