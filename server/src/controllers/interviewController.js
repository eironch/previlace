import Interview from "../models/Interview.js";
import { AppError } from "../utils/AppError.js";

// Mock questions for now - in a real app, these would come from a database or AI
const MOCK_QUESTIONS = {
  behavioral: [
    "Tell me about a time you faced a conflict at work.",
    "What is your greatest strength?",
    "Describe a challenging project you worked on.",
  ],
  technical: [
    "Explain the difference between stress and strain.",
    "How do you calculate the bending moment of a beam?",
    "What are the different types of foundations?",
  ],
  mixed: [
    "Tell me about yourself.",
    "Explain a complex engineering concept to a non-engineer.",
    "Where do you see yourself in 5 years?",
  ],
};

async function startInterview(req, res, next) {
  try {
    const { type = "mixed", title } = req.body;

    const questions = MOCK_QUESTIONS[type].map((q) => ({
      question: q,
    }));

    const interview = await Interview.create({
      user: req.user.id,
      title: title || `${type.charAt(0).toUpperCase() + type.slice(1)} Interview Practice`,
      type,
      questions,
    });

    res.status(201).json(interview);
  } catch (error) {
    next(error);
  }
}

async function getInterviews(req, res, next) {
  try {
    const interviews = await Interview.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(interviews);
  } catch (error) {
    next(error);
  }
}

async function getInterview(req, res, next) {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!interview) {
      throw new AppError("Interview not found", 404);
    }

    res.json(interview);
  } catch (error) {
    next(error);
  }
}

async function submitAnswer(req, res, next) {
  try {
    const { questionId, answer } = req.body;
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!interview) {
      throw new AppError("Interview not found", 404);
    }

    const question = interview.questions.id(questionId);
    if (!question) {
      throw new AppError("Question not found", 404);
    }

    question.answer = answer;
    
    // Mock AI Feedback
    question.feedback = "Good answer! Try to be more specific about your role.";
    question.rating = 4;

    await interview.save();

    res.json(interview);
  } catch (error) {
    next(error);
  }
}

async function completeInterview(req, res, next) {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!interview) {
      throw new AppError("Interview not found", 404);
    }

    interview.status = "completed";
    // Calculate average score
    const ratedQuestions = interview.questions.filter((q) => q.rating);
    if (ratedQuestions.length > 0) {
      const totalScore = ratedQuestions.reduce((acc, q) => acc + q.rating, 0);
      interview.score = (totalScore / ratedQuestions.length).toFixed(1);
    }

    await interview.save();

    res.json(interview);
  } catch (error) {
    next(error);
  }
}

export {
  startInterview,
  getInterviews,
  getInterview,
  submitAnswer,
  completeInterview,
};
