import katex from "katex";
import "katex/dist/katex.min.css";

export function renderLatex(expression, displayMode = false) {
  try {
    const html = katex.renderToString(expression, {
      displayMode,
      throwOnError: false,
      trust: true,
      strict: false,
    });
    return { success: true, html };
  } catch (error) {
    return { success: false, html: expression };
  }
}

export function validateLatexSyntax(expression) {
  try {
    katex.renderToString(expression, { throwOnError: true });
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
}

export function preprocessLatex(text) {
  const inlinePattern = /\$([^$]+)\$/g;
  const blockPattern = /\$\$([^$]+)\$\$/g;

  let processed = text.replace(blockPattern, (match, expr) => {
    const result = renderLatex(expr, true);
    return result.success ? result.html : match;
  });

  processed = processed.replace(inlinePattern, (match, expr) => {
    const result = renderLatex(expr, false);
    return result.success ? result.html : match;
  });

  return processed;
}

export function extractMathExpressions(text) {
  const expressions = [];
  const inlinePattern = /\$([^$]+)\$/g;
  const blockPattern = /\$\$([^$]+)\$\$/g;

  let match;
  while ((match = blockPattern.exec(text)) !== null) {
    expressions.push({ type: "block", content: match[1], index: match.index });
  }

  while ((match = inlinePattern.exec(text)) !== null) {
    expressions.push({ type: "inline", content: match[1], index: match.index });
  }

  return expressions;
}

export function checkMathEquivalence(expr1, expr2) {
  const normalize = (expr) =>
    expr
      .replace(/\s+/g, "")
      .replace(/\\left|\\right/g, "")
      .replace(/\{|\}/g, "");

  return normalize(expr1) === normalize(expr2);
}
