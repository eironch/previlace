import Resume from "../models/Resume.js";
import { AppError } from "../utils/AppError.js";

async function getMyResume(req, res, next) {
  try {
    let resume = await Resume.findOne({ user: req.user.id });

    if (!resume) {
      // Initialize empty resume if not exists
      resume = await Resume.create({
        user: req.user.id,
        personalInfo: {
          name: `${req.user.firstName} ${req.user.lastName}`,
          email: req.user.email,
        },
      });
    }

    res.json(resume);
  } catch (error) {
    next(error);
  }
}

async function updateResume(req, res, next) {
  try {
    const resume = await Resume.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );

    res.json(resume);
  } catch (error) {
    next(error);
  }
}

async function generatePDF(req, res, next) {
  // Placeholder for PDF generation logic
  // In a real implementation, we would use puppeteer or pdfkit here
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) {
      throw new AppError("Resume not found", 404);
    }

    // For now, just return success message
    res.json({ message: "PDF generation not implemented yet" });
  } catch (error) {
    next(error);
  }
}

export { getMyResume, updateResume, generatePDF };
