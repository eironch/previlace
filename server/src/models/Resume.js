import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  duration: String, // Changed from startDate/endDate to match frontend
  description: String,
});

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true }, // Changed from school
  degree: { type: String, required: true },
  year: String, // Changed from startDate/endDate
  details: String, // Added to match frontend
});

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    personalInfo: {
      name: { type: String, default: "" }, // Changed from firstName/lastName
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      summary: { type: String, default: "" },
    },
    experience: [experienceSchema],
    education: [educationSchema],
    skills: [String],
    // Kept for potential future use but not currently in frontend
    certifications: [
      {
        name: String,
        issuer: String,
        date: Date,
        url: String,
      },
    ],
    projects: [
      {
        name: String,
        description: String,
        url: String,
        technologies: [String],
      },
    ],
    template: {
      type: String,
      default: "modern",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Resume", resumeSchema);
