import QuestionTemplate from "../models/QuestionTemplate.js";
import ValidationService from "../services/validationService.js";
import TemplateEngine from "../services/templateEngine.js";

const TemplateController = {
  async createTemplate(req, res) {
    try {
      const validation = await TemplateEngine.validateTemplateStructure(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors,
          warnings: validation.warnings,
        });
      }

      const compiled = await TemplateEngine.compileTemplate(req.body);
      const template = new QuestionTemplate({
        ...compiled,
        createdBy: req.user._id,
      });

      await template.save();
      res.status(201).json({ success: true, data: template });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getTemplates(req, res) {
    try {
      const {
        category,
        examLevel,
        search,
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        order = "desc",
      } = req.query;

      const query = { isActive: true, isPublished: true };
      if (category) query.category = category;
      if (examLevel) query.$or = [{ examLevel }, { examLevel: "Both" }];
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const templates = await QuestionTemplate.find(query)
        .populate("createdBy", "firstName lastName")
        .sort({ [sortBy]: order === "desc" ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await QuestionTemplate.countDocuments(query);

      res.json({
        success: true,
        data: templates,
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

  async getTemplateById(req, res) {
    try {
      const template = await QuestionTemplate.findById(req.params.id)
        .populate("createdBy", "firstName lastName")
        .populate("collaborators.user", "firstName lastName");

      if (!template) {
        return res.status(404).json({ success: false, error: "Template not found" });
      }

      res.json({ success: true, data: template });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async updateTemplate(req, res) {
    try {
      const template = await QuestionTemplate.findById(req.params.id);
      if (!template) {
        return res.status(404).json({ success: false, error: "Template not found" });
      }

      if (
        template.createdBy.toString() !== req.user._id.toString() &&
        !template.collaborators.some(
          (c) => c.user.toString() === req.user._id.toString() && c.role === "editor"
        )
      ) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      const validation = await TemplateEngine.validateTemplateStructure(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors,
          warnings: validation.warnings,
        });
      }

      template.versionHistory.push({
        version: template.version,
        changes: "Template updated",
        modifiedBy: req.user._id,
        modifiedAt: new Date(),
      });
      template.version += 1;

      Object.assign(template, req.body);
      await template.save();

      res.json({ success: true, data: template });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async deleteTemplate(req, res) {
    try {
      const template = await QuestionTemplate.findById(req.params.id);
      if (!template) {
        return res.status(404).json({ success: false, error: "Template not found" });
      }

      if (template.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      template.isActive = false;
      await template.save();

      res.json({ success: true, message: "Template deactivated successfully" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async publishTemplate(req, res) {
    try {
      const template = await QuestionTemplate.findById(req.params.id);
      if (!template) {
        return res.status(404).json({ success: false, error: "Template not found" });
      }

      if (template.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      await template.publish();
      res.json({ success: true, data: template });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async cloneTemplate(req, res) {
    try {
      const cloned = await TemplateEngine.cloneTemplate(
        req.params.id,
        req.user._id,
        req.body
      );
      res.status(201).json({ success: true, data: cloned });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getPopularTemplates(req, res) {
    try {
      const templates = await QuestionTemplate.getPopularTemplates(
        parseInt(req.query.limit) || 10
      );
      res.json({ success: true, data: templates });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getRecommendedTemplates(req, res) {
    try {
      const templates = await QuestionTemplate.getRecommendedTemplates(
        req.user._id,
        parseInt(req.query.limit) || 5
      );
      res.json({ success: true, data: templates });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async addCollaborator(req, res) {
    try {
      const template = await QuestionTemplate.findById(req.params.id);
      if (!template) {
        return res.status(404).json({ success: false, error: "Template not found" });
      }

      if (template.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      await template.addCollaborator(req.body.userId, req.body.role);
      res.json({ success: true, data: template });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async removeCollaborator(req, res) {
    try {
      const template = await QuestionTemplate.findById(req.params.id);
      if (!template) {
        return res.status(404).json({ success: false, error: "Template not found" });
      }

      if (template.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      await template.removeCollaborator(req.body.userId);
      res.json({ success: true, data: template });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getTemplateStatistics(req, res) {
    try {
      const stats = await TemplateEngine.getTemplateUsageStatistics(req.params.id);
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

export default TemplateController;