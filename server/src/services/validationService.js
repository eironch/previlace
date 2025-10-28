import mongoose from "mongoose";
import QuestionTemplate from "../models/QuestionTemplate.js";

const ValidationService = {
  async validateQuestion(fieldValues, template) {
    const results = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      qualityScore: 100,
      complianceCheck: null,
    };

    if (!template || !template.fieldDefinitions) {
      results.isValid = false;
      results.errors.push({
        field: "template",
        type: "business",
        message: "Invalid template configuration",
        severity: "critical",
      });
      return results;
    }

    for (const fieldDef of template.fieldDefinitions) {
      const value = fieldValues.get(fieldDef.fieldId);
      const fieldResult = await this.validateField(value, fieldDef);
      
      if (fieldResult.errors.length > 0) {
        results.isValid = false;
        results.errors.push(...fieldResult.errors);
        results.qualityScore -= 10 * fieldResult.errors.length;
      }
      
      results.warnings.push(...fieldResult.warnings);
      results.suggestions.push(...fieldResult.suggestions);
    }

    results.complianceCheck = await this.checkCSECompliance(fieldValues, template);
    results.qualityScore = Math.max(0, results.qualityScore);

    return results;
  },

  async validateField(value, fieldDefinition) {
    const result = {
      errors: [],
      warnings: [],
      suggestions: [],
    };

    if (fieldDefinition.validation.required && !value) {
      result.errors.push({
        field: fieldDefinition.fieldId,
        type: "business",
        message: `${fieldDefinition.label} is required`,
        severity: "high",
      });
    }

    if (value) {
      switch (fieldDefinition.type) {
        case "text":
        case "richtext":
          if (fieldDefinition.validation.minLength && value.length < fieldDefinition.validation.minLength) {
            result.errors.push({
              field: fieldDefinition.fieldId,
              type: "business",
              message: `${fieldDefinition.label} must be at least ${fieldDefinition.validation.minLength} characters`,
              severity: "medium",
            });
          }
          if (fieldDefinition.validation.maxLength && value.length > fieldDefinition.validation.maxLength) {
            result.errors.push({
              field: fieldDefinition.fieldId,
              type: "business",
              message: `${fieldDefinition.label} must not exceed ${fieldDefinition.validation.maxLength} characters`,
              severity: "medium",
            });
          }
          break;

        case "numeric":
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            result.errors.push({
              field: fieldDefinition.fieldId,
              type: "syntax",
              message: `${fieldDefinition.label} must be a valid number`,
              severity: "high",
            });
          } else {
            if (fieldDefinition.validation.min !== undefined && numValue < fieldDefinition.validation.min) {
              result.errors.push({
                field: fieldDefinition.fieldId,
                type: "business",
                message: `${fieldDefinition.label} must be at least ${fieldDefinition.validation.min}`,
                severity: "medium",
              });
            }
            if (fieldDefinition.validation.max !== undefined && numValue > fieldDefinition.validation.max) {
              result.errors.push({
                field: fieldDefinition.fieldId,
                type: "business",
                message: `${fieldDefinition.label} must not exceed ${fieldDefinition.validation.max}`,
                severity: "medium",
              });
            }
          }
          break;

        case "math":
          const mathResult = this.validateMathExpression(value);
          if (!mathResult.isValid) {
            result.errors.push({
              field: fieldDefinition.fieldId,
              type: "syntax",
              message: `Invalid mathematical expression: ${mathResult.error}`,
              severity: "high",
              suggestion: mathResult.suggestion,
            });
          }
          break;

        case "choices":
          if (Array.isArray(value) && value.length < 2) {
            result.warnings.push("Consider adding more answer choices for better assessment");
          }
          break;
      }

      if (fieldDefinition.validation.pattern) {
        const pattern = new RegExp(fieldDefinition.validation.pattern);
        if (!pattern.test(value)) {
          result.errors.push({
            field: fieldDefinition.fieldId,
            type: "business",
            message: `${fieldDefinition.label} does not match required format`,
            severity: "medium",
          });
        }
      }
    }

    return result;
  },

  validateMathExpression(expression) {
    const result = {
      isValid: true,
      error: null,
      suggestion: null,
    };

    try {
      const unbalanced = this.checkBalancedBrackets(expression);
      if (unbalanced) {
        result.isValid = false;
        result.error = unbalanced;
        return result;
      }

      const invalidCommands = this.checkInvalidLatexCommands(expression);
      if (invalidCommands.length > 0) {
        result.isValid = false;
        result.error = `Unknown LaTeX commands: ${invalidCommands.join(", ")}`;
        result.suggestion = "Use standard LaTeX commands";
        return result;
      }
    } catch (error) {
      result.isValid = false;
      result.error = "Failed to parse expression";
    }

    return result;
  },

  checkBalancedBrackets(expression) {
    const brackets = {
      "{": "}",
      "[": "]",
      "(": ")",
    };
    const stack = [];

    for (const char of expression) {
      if (brackets[char]) {
        stack.push(char);
      } else if (Object.values(brackets).includes(char)) {
        const last = stack.pop();
        if (brackets[last] !== char) {
          return `Unbalanced brackets at position ${expression.indexOf(char)}`;
        }
      }
    }

    return stack.length > 0 ? "Unclosed brackets detected" : null;
  },

  checkInvalidLatexCommands(expression) {
    const validCommands = [
      "\\frac", "\\sqrt", "\\sin", "\\cos", "\\tan", "\\log", "\\ln",
      "\\sum", "\\int", "\\lim", "\\infty", "\\pi", "\\theta", "\\alpha",
      "\\beta", "\\gamma", "\\delta", "\\epsilon", "\\sigma", "\\mu",
      "\\times", "\\div", "\\pm", "\\leq", "\\geq", "\\neq", "\\approx",
    ];

    const commandPattern = /\\[a-zA-Z]+/g;
    const commands = expression.match(commandPattern) || [];
    return commands.filter(cmd => !validCommands.includes(cmd));
  },

  async checkCSECompliance(fieldValues, template) {
    const compliance = {
      isCompliant: true,
      issues: [],
      score: 100,
    };

    const questionText = fieldValues.get("questionText") || "";
    if (questionText.length < 10) {
      compliance.issues.push("Question text too short for CSE standards");
      compliance.score -= 20;
    }

    const options = fieldValues.get("options");
    if (template.category === "multiple_choice" && options) {
      if (options.length < 4) {
        compliance.issues.push("CSE requires at least 4 answer options");
        compliance.score -= 30;
      }

      const correctOptions = options.filter(opt => opt.isCorrect);
      if (correctOptions.length !== 1) {
        compliance.issues.push("Exactly one correct answer required for single-choice questions");
        compliance.score -= 40;
      }
    }

    compliance.isCompliant = compliance.score >= 70;
    return compliance;
  },

  async performSemanticValidation(question, template) {
    const results = {
      duplicateScore: 0,
      coherenceScore: 100,
      relevanceScore: 100,
    };

    try {
      const similarQuestions = await mongoose.model("ManualQuestion").find({
        templateId: template._id,
        workflowState: { $in: ["approved", "published"] },
      }).limit(10);

      for (const existing of similarQuestions) {
        const similarity = this.calculateSimilarity(
          question.questionText,
          existing.questionText
        );
        results.duplicateScore = Math.max(results.duplicateScore, similarity);
      }

      results.coherenceScore = this.assessCoherence(question);
      results.relevanceScore = this.assessRelevance(question, template);
    } catch (error) {
      results.error = error.message;
    }

    return results;
  },

  calculateSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;

    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return (intersection.size / union.size) * 100;
  },

  assessCoherence(question) {
    let score = 100;

    if (!question.questionText || question.questionText.length < 10) {
      score -= 30;
    }

    if (question.options) {
      const optionLengths = question.options.map(o => o.text.length);
      const avgLength = optionLengths.reduce((a, b) => a + b, 0) / optionLengths.length;
      const variance = optionLengths.reduce((a, b) => a + Math.abs(b - avgLength), 0) / optionLengths.length;
      
      if (variance > avgLength * 0.5) {
        score -= 10;
      }
    }

    if (question.explanation && question.explanation.length < question.questionText.length * 0.5) {
      score -= 10;
    }

    return Math.max(0, score);
  },

  assessRelevance(question, template) {
    let score = 100;

    if (question.category !== template.category) {
      score -= 50;
    }

    if (question.difficulty && !template.difficultyLevels.includes(question.difficulty)) {
      score -= 20;
    }

    return Math.max(0, score);
  },

  async validateBulkQuestions(questions, template) {
    const results = {
      valid: [],
      invalid: [],
      warnings: [],
      summary: {
        total: questions.length,
        valid: 0,
        invalid: 0,
        averageQuality: 0,
      },
    };

    let totalQuality = 0;

    for (const [index, question] of questions.entries()) {
      const validation = await this.validateQuestion(question.fieldValues, template);
      
      if (validation.isValid) {
        results.valid.push({ index, question, validation });
        results.summary.valid++;
      } else {
        results.invalid.push({ index, question, validation });
        results.summary.invalid++;
      }

      if (validation.warnings.length > 0) {
        results.warnings.push({ index, warnings: validation.warnings });
      }

      totalQuality += validation.qualityScore;
    }

    results.summary.averageQuality = totalQuality / questions.length;
    return results;
  },
};

export default ValidationService;