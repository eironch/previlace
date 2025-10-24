import ManualQuestion from "../models/ManualQuestion.js";
import QuestionTemplate from "../models/QuestionTemplate.js";
import ValidationService from "../services/validationService.js";
import TemplateEngine from "../services/templateEngine.js";
import MathService from "../services/mathService.js";

const QuestionController = {
  async createQuestion(req, res) {
    try {
      const template = await QuestionTemplate.findById(req.body.templateId);
      if (!template) {
        return res.status(404).json({ success: false, error: "Template not found" });
      }

      const fieldValues = new Map(Object.entries(req.body.fieldValues));
      const validation = await ValidationService.validateQuestion(fieldValues, template);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors,
          warnings: validation.warnings,
        });
      }

      const rendered = await TemplateEngine.renderTemplate(template, fieldValues);
      const question = new ManualQuestion({
        ...req.body,
        fieldValues,
        renderedContent: rendered,
        validationResults: validation,
        createdBy: req.user._id,
      });

      await question.save();
      res.status(201).json({ success: true, data: question });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getQuestions(req, res) {
    try {
      const {
        category,
        subjectArea,
        difficulty,
        examLevel,
        workflowState,
        page = 1,
        limit = 20,
      } = req.query;

      const filters = {};
      if (category) filters.category = category;
      if (subjectArea) filters.subjectArea = subjectArea;
      if (difficulty) filters.difficulty = difficulty;
      if (examLevel) filters.examLevel = examLevel;
      if (workflowState) filters.workflowState = workflowState;

      const questions = await ManualQuestion.getByFilters(filters)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await ManualQuestion.countDocuments(filters);

      res.json({
        success: true,
        data: questions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getQuestionById(req, res) {
    try {
      const question = await ManualQuestion.findById(req.params.id)
        .populate("templateId", "name category")
        .populate("createdBy", "firstName lastName")
        .populate("reviewHistory.reviewerId", "firstName lastName");

      if (!question) {
        return res.status(404).json({ success: false, error: "Question not found" });
      }

      res.json({ success: true, data: question });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async updateQuestion(req, res) {
    try {
      const question = await ManualQuestion.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ success: false, error: "Question not found" });
      }

      if (question.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      const template = await QuestionTemplate.findById(question.templateId);
      const fieldValues = new Map(Object.entries(req.body.fieldValues || {}));
      const validation = await ValidationService.validateQuestion(fieldValues, template);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors,
        });
      }

      await question.createVersion("Manual update", req.user._id);
      Object.assign(question, req.body);
      question.validationResults = validation;
      await question.save();

      res.json({ success: true, data: question });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async deleteQuestion(req, res) {
    try {
      const question = await ManualQuestion.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ success: false, error: "Question not found" });
      }

      if (question.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      await question.archive("Deleted by user");
      res.json({ success: true, message: "Question archived successfully" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async bulkCreateQuestions(req, res) {
    try {
      const { templateId, questions } = req.body;
      const template = await QuestionTemplate.findById(templateId);
      
      if (!template) {
        return res.status(404).json({ success: false, error: "Template not found" });
      }

      const validation = await ValidationService.validateBulkQuestions(questions, template);
      
      if (validation.summary.invalid > 0) {
        return res.status(400).json({
          success: false,
          validation,
        });
      }

      const results = await ManualQuestion.bulkCreate(
        validation.valid.map(v => v.question),
        req.user._id
      );

      res.status(201).json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async submitForReview(req, res) {
    try {
      const question = await ManualQuestion.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ success: false, error: "Question not found" });
      }

      if (question.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      await question.submitForReview();
      res.json({ success: true, data: question });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async reviewQuestion(req, res) {
    try {
      const { action, notes, checklistScores } = req.body;
      const question = await ManualQuestion.findById(req.params.id);
      
      if (!question) {
        return res.status(404).json({ success: false, error: "Question not found" });
      }

      if (action === "approve") {
        await question.approve(req.user._id, notes, checklistScores);
      } else if (action === "reject") {
        await question.reject(req.user._id, notes, checklistScores);
      } else {
        return res.status(400).json({ success: false, error: "Invalid action" });
      }

      res.json({ success: true, data: question });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async publishQuestion(req, res) {
    try {
      const question = await ManualQuestion.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ success: false, error: "Question not found" });
      }

      await question.publish();
      res.json({ success: true, data: question });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getRandomQuestions(req, res) {
    try {
      const filters = req.query;
      const limit = parseInt(req.query.limit) || 10;
      const questions = await ManualQuestion.getRandomQuestions(filters, limit);
      res.json({ success: true, data: questions });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async renderQuestion(req, res) {
    try {
      const question = await ManualQuestion.findById(req.params.id)
        .populate("templateId");

      if (!question) {
        return res.status(404).json({ success: false, error: "Question not found" });
      }

      const rendered = await TemplateEngine.renderTemplate(
        question.templateId,
        question.fieldValues
      );

      res.json({ success: true, data: rendered });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async checkAnswer(req, res) {
    try {
      const question = await ManualQuestion.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ success: false, error: "Question not found" });
      }

      const { userAnswer, responseTime } = req.body;
      let isCorrect = false;
      let partialCredit = 0;

      for (const correctAnswer of question.answerConfiguration.correctAnswers) {
        if (MathService.checkEquivalence(
          userAnswer,
          correctAnswer.value,
          question.answerConfiguration.tolerance.numeric
        )) {
          isCorrect = true;
          break;
        }
      }

      if (!isCorrect && question.answerConfiguration.partialCreditRules) {
        partialCredit = MathService.calculatePartialCredit(
          userAnswer,
          question.answerConfiguration.correctAnswers[0].value,
          question.answerConfiguration.partialCreditRules
        );
      }

      await question.incrementUsage(isCorrect, responseTime);

      res.json({
        success: true,
        data: {
          isCorrect,
          partialCredit,
          explanation: question.explanation,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async cloneQuestion(req, res) {
    try {
      const question = await ManualQuestion.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ success: false, error: "Question not found" });
      }

      const cloned = await question.clone(req.user._id);
      res.status(201).json({ success: true, data: cloned });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getQuestionStatistics(req, res) {
    try {
      const stats = await ManualQuestion.getQuestionStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async searchQuestions(req, res) {
    try {
      const { q: searchQuery, ...filters } = req.query;
      if (!searchQuery) {
        return res.status(400).json({ success: false, error: "Search query required" });
      }

      const questions = await ManualQuestion.searchQuestions(searchQuery, filters);
      res.json({ success: true, data: questions });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

export default QuestionController;