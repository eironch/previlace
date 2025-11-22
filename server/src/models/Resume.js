import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  current: { type: Boolean, default: false },
  description: String,
});

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  current: { type: Boolean, default: false },
  description: String,
});

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One resume per user for now
    },
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      address: String,
      linkedin: String,
      website: String,
      summary: String,
    },
    experience: [experienceSchema],
    education: [educationSchema],
    skills: [String],
    certifications: [
      {
        name: { type: String, required: true },
        issuer: String,
        date: Date,
        url: String,
      },
    ],
    projects: [
      {
        name: { type: String, required: true },
        description: String,
        url: String,
        technologies: [String],
      },
    ],
    template: {
      type: String,
      default: "modern", // modern, classic, minimal
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Resume", resumeSchema);
