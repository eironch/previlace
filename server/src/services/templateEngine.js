import Mustache from "mustache";
import QuestionTemplate from "../models/QuestionTemplate.js";
import ManualQuestion from "../models/ManualQuestion.js";

const TemplateEngine = {
  async renderTemplate(template, fieldValues) {
    const context = this.buildContext(fieldValues, template);
    const rendered = {
      html: null,
      latex: null,
      plainText: null,
    };

    try {
      rendered.html = Mustache.render(template.previewTemplate, context);
      rendered.latex = this.extractLatex(rendered.html);
      rendered.plainText = this.stripFormatting(rendered.html);
    } catch (error) {
      throw new Error(`Template rendering failed: ${error.message}`);
    }

    return rendered;
  },

  buildContext(fieldValues, template) {
    const context = {};

    for (const fieldDef of template.fieldDefinitions) {
      const value = fieldValues.get(fieldDef.fieldId);
      context[fieldDef.fieldId] = this.formatFieldValue(value, fieldDef.type);
    }

    context.metadata = {
      category: template.category,
      examLevel: template.examLevel,
      difficulty: fieldValues.get("difficulty") || "Intermediate",
      timestamp: new Date().toISOString(),
    };

    return context;
  },

  formatFieldValue(value, type) {
    if (!value) return "";

    switch (type) {
      case "choices":
        return Array.isArray(value)
          ? value.map((choice, idx) => ({
              index: idx + 1,
              letter: String.fromCharCode(65 + idx),
              text: choice.text,
              isCorrect: choice.isCorrect,
            }))
          : [];

      case "numeric":
        return parseFloat(value);

      case "math":
        return {
          raw: value,
          rendered: this.renderMath(value),
        };

      case "richtext":
        return this.sanitizeHtml(value);

      default:
        return value;
    }
  },

  renderMath(expression) {
    try {
      return `<span class="math-inline">${expression}</span>`;
    } catch {
      return expression;
    }
  },

  sanitizeHtml(html) {
    const allowedTags = ["b", "i", "u", "em", "strong", "p", "br", "span"];
    const tagPattern = /<\/?([a-z]+)[^>]*>/gi;
    
    return html.replace(tagPattern, (match, tag) => {
      return allowedTags.includes(tag.toLowerCase()) ? match : "";
    });
  },

  stripFormatting(html) {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .trim();
  },

  extractLatex(html) {
    const mathPattern = /<span class="math-inline">([^<]+)<\/span>/g;
    const matches = [];
    let match;

    while ((match = mathPattern.exec(html)) !== null) {
      matches.push(match[1]);
    }

    return matches.join(" ");
  },

  async processConditionalLogic(fieldValues, template) {
    const visibleFields = new Set(template.fieldDefinitions.map(f => f.fieldId));
    const requiredFields = new Set();

    for (const rule of template.conditionalLogicRules || []) {
      const conditionsMet = this.evaluateConditions(rule.conditions, fieldValues);
      
      if (conditionsMet) {
        for (const action of rule.actions) {
          this.applyAction(action, visibleFields, requiredFields, fieldValues);
        }
      }
    }

    return { visibleFields, requiredFields };
  },

  evaluateConditions(conditions, fieldValues) {
    return conditions.every(condition => {
      const fieldValue = fieldValues.get(condition.field);
      return this.evaluateCondition(fieldValue, condition.operator, condition.value);
    });
  },

  evaluateCondition(fieldValue, operator, targetValue) {
    switch (operator) {
      case "equals":
        return fieldValue === targetValue;
      case "not_equals":
        return fieldValue !== targetValue;
      case "contains":
        return fieldValue && fieldValue.includes(targetValue);
      case "greater_than":
        return parseFloat(fieldValue) > parseFloat(targetValue);
      case "less_than":
        return parseFloat(fieldValue) < parseFloat(targetValue);
      case "is_empty":
        return !fieldValue || fieldValue.length === 0;
      case "is_not_empty":
        return fieldValue && fieldValue.length > 0;
      default:
        return false;
    }
  },

  applyAction(action, visibleFields, requiredFields, fieldValues) {
    switch (action.type) {
      case "show":
        visibleFields.add(action.target);
        break;
      case "hide":
        visibleFields.delete(action.target);
        break;
      case "require":
        requiredFields.add(action.target);
        break;
      case "optional":
        requiredFields.delete(action.target);
        break;
      case "set_value":
        fieldValues.set(action.target, action.value);
        break;
    }
  },

  async compileTemplate(templateData) {
    const compiled = {
      ...templateData,
      compiledAt: new Date(),
      checksum: this.calculateChecksum(templateData),
    };

    try {
      Mustache.parse(templateData.previewTemplate);
      compiled.isValid = true;
    } catch (error) {
      compiled.isValid = false;
      compiled.compilationError = error.message;
    }

    return compiled;
  },

  calculateChecksum(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return hash.toString(16);
  },

  async generateQuestionFromTemplate(template, overrides = {}) {
    const question = {
      templateId: template._id,
      templateVersion: template.version,
      category: template.category,
      examLevel: template.examLevel,
      fieldValues: new Map(),
      ...overrides,
    };

    for (const fieldDef of template.fieldDefinitions) {
      if (fieldDef.defaultValue) {
        question.fieldValues.set(fieldDef.fieldId, fieldDef.defaultValue);
      }
    }

    return question;
  },

  async cloneTemplate(templateId, userId, modifications = {}) {
    const original = await QuestionTemplate.findById(templateId);
    if (!original) throw new Error("Template not found");

    const cloned = await original.clone(userId);
    
    if (modifications.name) cloned.name = modifications.name;
    if (modifications.category) cloned.category = modifications.category;
    if (modifications.fieldDefinitions) {
      cloned.fieldDefinitions = modifications.fieldDefinitions;
    }

    await cloned.save();
    return cloned;
  },

  async mergeTemplates(template1Id, template2Id, userId) {
    const [t1, t2] = await Promise.all([
      QuestionTemplate.findById(template1Id),
      QuestionTemplate.findById(template2Id),
    ]);

    if (!t1 || !t2) throw new Error("Template(s) not found");

    const merged = {
      name: `${t1.name} + ${t2.name}`,
      category: t1.category,
      examLevel: t1.examLevel === t2.examLevel ? t1.examLevel : "Both",
      fieldDefinitions: [...t1.fieldDefinitions],
      createdBy: userId,
    };

    const existingFieldIds = new Set(t1.fieldDefinitions.map(f => f.fieldId));
    for (const field of t2.fieldDefinitions) {
      if (!existingFieldIds.has(field.fieldId)) {
        merged.fieldDefinitions.push(field);
      }
    }

    merged.previewTemplate = this.mergePreviewTemplates(
      t1.previewTemplate,
      t2.previewTemplate
    );

    return await QuestionTemplate.create(merged);
  },

  mergePreviewTemplates(template1, template2) {
    return `${template1}\n<hr/>\n${template2}`;
  },

  async validateTemplateStructure(templateData) {
    const errors = [];
    const warnings = [];

    if (!templateData.name || templateData.name.length < 3) {
      errors.push("Template name must be at least 3 characters");
    }

    if (!templateData.category) {
      errors.push("Template category is required");
    }

    if (!templateData.fieldDefinitions || templateData.fieldDefinitions.length === 0) {
      errors.push("Template must have at least one field");
    } else {
      const fieldIds = new Set();
      for (const field of templateData.fieldDefinitions) {
        if (fieldIds.has(field.fieldId)) {
          errors.push(`Duplicate field ID: ${field.fieldId}`);
        }
        fieldIds.add(field.fieldId);

        if (!field.label) {
          errors.push(`Field ${field.fieldId} must have a label`);
        }

        if (!field.type) {
          errors.push(`Field ${field.fieldId} must have a type`);
        }
      }
    }

    if (!templateData.previewTemplate) {
      errors.push("Preview template is required");
    } else {
      try {
        Mustache.parse(templateData.previewTemplate);
      } catch (error) {
        errors.push(`Invalid preview template: ${error.message}`);
      }
    }

    if (templateData.conditionalLogicRules) {
      for (const rule of templateData.conditionalLogicRules) {
        if (!rule.conditions || rule.conditions.length === 0) {
          warnings.push(`Rule ${rule.id} has no conditions`);
        }
        if (!rule.actions || rule.actions.length === 0) {
          warnings.push(`Rule ${rule.id} has no actions`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  async getTemplateUsageStatistics(templateId) {
    const template = await QuestionTemplate.findById(templateId);
    if (!template) throw new Error("Template not found");

    const questions = await ManualQuestion.countDocuments({ templateId });
    const published = await ManualQuestion.countDocuments({
      templateId,
      workflowState: "published",
    });

    const aggregation = await ManualQuestion.aggregate([
      { $match: { templateId: template._id } },
      {
        $group: {
          _id: null,
          avgQuality: { $avg: "$qualityMetrics.overallScore" },
          avgAttempts: { $avg: "$usageStats.totalAttempts" },
          avgCorrectRate: {
            $avg: {
              $divide: ["$usageStats.correctAttempts", "$usageStats.totalAttempts"],
            },
          },
        },
      },
    ]);

    return {
      templateId,
      totalQuestions: questions,
      publishedQuestions: published,
      averageQuality: aggregation[0]?.avgQuality || 0,
      averageAttempts: aggregation[0]?.avgAttempts || 0,
      averageCorrectRate: (aggregation[0]?.avgCorrectRate || 0) * 100,
      lastUsed: template.usageStats.lastUsed,
    };
  },
};

export default TemplateEngine;