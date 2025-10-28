import katex from "katex";

const MathService = {
  renderLatex(expression, options = {}) {
    try {
      return katex.renderToString(expression, {
        throwOnError: false,
        displayMode: options.displayMode || false,
        output: options.output || "htmlAndMathml",
        macros: {
          "\\RR": "\\mathbb{R}",
          "\\NN": "\\mathbb{N}",
          "\\ZZ": "\\mathbb{Z}",
          "\\QQ": "\\mathbb{Q}",
          "\\CC": "\\mathbb{C}",
        },
      });
    } catch (error) {
      return {
        error: true,
        message: error.message,
        original: expression,
      };
    }
  },

  parseExpression(expression) {
    const result = {
      isValid: true,
      normalized: null,
      format: null,
      components: [],
    };

    try {
      result.normalized = this.normalizeExpression(expression);
      result.format = this.detectFormat(expression);
      result.components = this.extractComponents(expression);
    } catch (error) {
      result.isValid = false;
      result.error = error.message;
    }

    return result;
  },

  normalizeExpression(expression) {
    let normalized = expression.trim();
    
    normalized = normalized.replace(/\s+/g, " ");
    normalized = normalized.replace(/\*\*/g, "^");
    normalized = normalized.replace(/sqrt\(/g, "\\sqrt{");
    normalized = normalized.replace(/sin\(/g, "\\sin(");
    normalized = normalized.replace(/cos\(/g, "\\cos(");
    normalized = normalized.replace(/tan\(/g, "\\tan(");
    normalized = normalized.replace(/log\(/g, "\\log(");
    normalized = normalized.replace(/ln\(/g, "\\ln(");
    
    return normalized;
  },

  detectFormat(expression) {
    if (expression.includes("\\frac")) return "latex";
    if (expression.includes("sqrt(")) return "calculator";
    if (expression.includes("**")) return "programming";
    if (expression.match(/^\d+\/\d+$/)) return "fraction";
    if (expression.match(/^\d+\.?\d*%$/)) return "percentage";
    if (expression.match(/^\d+\.?\d*$/)) return "decimal";
    return "standard";
  },

  extractComponents(expression) {
    const components = [];
    
    const numberPattern = /\d+\.?\d*/g;
    const numbers = expression.match(numberPattern);
    if (numbers) {
      components.push(...numbers.map(n => ({ type: "number", value: n })));
    }

    const operatorPattern = /[+\-*/^=]/g;
    const operators = expression.match(operatorPattern);
    if (operators) {
      components.push(...operators.map(o => ({ type: "operator", value: o })));
    }

    const functionPattern = /(sin|cos|tan|log|ln|sqrt|sum|int|lim)/g;
    const functions = expression.match(functionPattern);
    if (functions) {
      components.push(...functions.map(f => ({ type: "function", value: f })));
    }

    return components;
  },

  checkEquivalence(expr1, expr2, tolerance = 0.001) {
    try {
      const norm1 = this.normalizeExpression(expr1);
      const norm2 = this.normalizeExpression(expr2);
      
      if (norm1 === norm2) return true;

      const value1 = this.evaluateExpression(expr1);
      const value2 = this.evaluateExpression(expr2);
      
      if (typeof value1 === "number" && typeof value2 === "number") {
        return Math.abs(value1 - value2) < tolerance;
      }

      return this.checkSymbolicEquivalence(expr1, expr2);
    } catch {
      return false;
    }
  },

  evaluateExpression(expression) {
    try {
      const sanitized = expression
        .replace(/sin/g, "Math.sin")
        .replace(/cos/g, "Math.cos")
        .replace(/tan/g, "Math.tan")
        .replace(/log/g, "Math.log10")
        .replace(/ln/g, "Math.log")
        .replace(/sqrt/g, "Math.sqrt")
        .replace(/\^/g, "**")
        .replace(/pi/gi, "Math.PI")
        .replace(/e(?!\w)/gi, "Math.E");

      const func = new Function("return " + sanitized);
      return func();
    } catch {
      return null;
    }
  },

  checkSymbolicEquivalence(expr1, expr2) {
    const transformations = [
      { from: /a\+b/, to: "b+a" },
      { from: /a\*b/, to: "b*a" },
      { from: /\(a\+b\)\+c/, to: "a+(b+c)" },
      { from: /\(a\*b\)\*c/, to: "a*(b*c)" },
      { from: /a\*\(b\+c\)/, to: "a*b+a*c" },
    ];

    let transformed1 = expr1;
    let transformed2 = expr2;

    for (const rule of transformations) {
      transformed1 = transformed1.replace(rule.from, rule.to);
      transformed2 = transformed2.replace(rule.from, rule.to);
    }

    return transformed1 === transformed2;
  },

  generateKeypadLayout(type = "basic") {
    const layouts = {
      basic: [
        [
          { label: "7", value: "7", type: "number" },
          { label: "8", value: "8", type: "number" },
          { label: "9", value: "9", type: "number" },
          { label: "÷", value: "\\div", type: "operator" },
        ],
        [
          { label: "4", value: "4", type: "number" },
          { label: "5", value: "5", type: "number" },
          { label: "6", value: "6", type: "number" },
          { label: "×", value: "\\times", type: "operator" },
        ],
        [
          { label: "1", value: "1", type: "number" },
          { label: "2", value: "2", type: "number" },
          { label: "3", value: "3", type: "number" },
          { label: "-", value: "-", type: "operator" },
        ],
        [
          { label: "0", value: "0", type: "number" },
          { label: ".", value: ".", type: "decimal" },
          { label: "=", value: "=", type: "equals" },
          { label: "+", value: "+", type: "operator" },
        ],
      ],
      algebra: [
        [
          { label: "x", value: "x", type: "variable" },
          { label: "y", value: "y", type: "variable" },
          { label: "z", value: "z", type: "variable" },
          { label: "^", value: "^", type: "operator" },
        ],
        [
          { label: "√", value: "\\sqrt{}", type: "function" },
          { label: "(", value: "(", type: "bracket" },
          { label: ")", value: ")", type: "bracket" },
          { label: "frac", value: "\\frac{}{}", type: "function" },
        ],
        [
          { label: "sin", value: "\\sin", type: "function" },
          { label: "cos", value: "\\cos", type: "function" },
          { label: "tan", value: "\\tan", type: "function" },
          { label: "log", value: "\\log", type: "function" },
        ],
        [
          { label: "π", value: "\\pi", type: "constant" },
          { label: "e", value: "e", type: "constant" },
          { label: "∞", value: "\\infty", type: "constant" },
          { label: "±", value: "\\pm", type: "operator" },
        ],
      ],
      geometry: [
        [
          { label: "∠", value: "\\angle", type: "symbol" },
          { label: "△", value: "\\triangle", type: "symbol" },
          { label: "□", value: "\\square", type: "symbol" },
          { label: "○", value: "\\circ", type: "symbol" },
        ],
        [
          { label: "∥", value: "\\parallel", type: "symbol" },
          { label: "⊥", value: "\\perp", type: "symbol" },
          { label: "≅", value: "\\cong", type: "symbol" },
          { label: "∼", value: "\\sim", type: "symbol" },
        ],
        [
          { label: "°", value: "°", type: "unit" },
          { label: "′", value: "'", type: "unit" },
          { label: "″", value: "''", type: "unit" },
          { label: "rad", value: "rad", type: "unit" },
        ],
      ],
    };

    return layouts[type] || layouts.basic;
  },

  convertFormat(expression, fromFormat, toFormat) {
    const conversions = {
      "fraction-decimal": (expr) => {
        const [num, den] = expr.split("/").map(Number);
        return (num / den).toString();
      },
      "decimal-percentage": (expr) => {
        return `${(parseFloat(expr) * 100).toFixed(2)}%`;
      },
      "percentage-decimal": (expr) => {
        return (parseFloat(expr.replace("%", "")) / 100).toString();
      },
      "calculator-latex": (expr) => {
        return expr
          .replace(/sqrt\(/g, "\\sqrt{")
          .replace(/\)/g, "}")
          .replace(/\*/g, " \\cdot ")
          .replace(/\//g, " \\div ");
      },
    };

    const key = `${fromFormat}-${toFormat}`;
    const converter = conversions[key];
    
    return converter ? converter(expression) : expression;
  },

  generateStepByStepSolution(expression, answer) {
    const steps = [];
    
    steps.push({
      description: "Original expression",
      expression: expression,
      latex: this.renderLatex(expression),
    });

    const simplified = this.simplifyExpression(expression);
    if (simplified !== expression) {
      steps.push({
        description: "Simplified form",
        expression: simplified,
        latex: this.renderLatex(simplified),
      });
    }

    steps.push({
      description: "Final answer",
      expression: answer,
      latex: this.renderLatex(answer),
    });

    return steps;
  },

  simplifyExpression(expression) {
    let simplified = expression;
    
    simplified = simplified.replace(/0\+(\w+)/g, "$1");
    simplified = simplified.replace(/(\w+)\+0/g, "$1");
    simplified = simplified.replace(/1\*(\w+)/g, "$1");
    simplified = simplified.replace(/(\w+)\*1/g, "$1");
    simplified = simplified.replace(/(\w+)\/1/g, "$1");
    
    return simplified;
  },

  validateAnswerFormat(answer, expectedFormat) {
    const formatValidators = {
      numeric: (ans) => !isNaN(parseFloat(ans)),
      fraction: (ans) => /^\d+\/\d+$/.test(ans),
      percentage: (ans) => /^\d+\.?\d*%$/.test(ans),
      latex: (ans) => ans.includes("\\"),
      expression: (ans) => /[+\-*/^=]/.test(ans),
    };

    const validator = formatValidators[expectedFormat];
    return validator ? validator(answer) : true;
  },

  calculatePartialCredit(userAnswer, correctAnswer, rules) {
    let credit = 0;
    
    if (userAnswer === correctAnswer) {
      return 100;
    }

    for (const rule of rules) {
      if (this.matchesRule(userAnswer, rule.condition)) {
        credit = Math.max(credit, rule.points);
      }
    }

    if (this.checkEquivalence(userAnswer, correctAnswer, 0.1)) {
      credit = Math.max(credit, 90);
    }

    const userComponents = this.extractComponents(userAnswer);
    const correctComponents = this.extractComponents(correctAnswer);
    const componentMatch = this.calculateComponentMatch(userComponents, correctComponents);
    credit = Math.max(credit, componentMatch * 50);

    return Math.round(credit);
  },

  matchesRule(answer, condition) {
    try {
      const func = new Function("answer", `return ${condition}`);
      return func(answer);
    } catch {
      return false;
    }
  },

  calculateComponentMatch(components1, components2) {
    if (!components1.length || !components2.length) return 0;
    
    const matches = components1.filter(c1 =>
      components2.some(c2 => c1.type === c2.type && c1.value === c2.value)
    );
    
    return matches.length / Math.max(components1.length, components2.length);
  },
};

export default MathService;