import katex from "katex";

let isKatexLoaded = false;

export const mathService = {
  initialize() {
    if (!isKatexLoaded) {
      this.loadKatexCSS();
      isKatexLoaded = true;
    }
    return true;
  },

  loadKatexCSS() {
    if (document.getElementById("katex-css")) return;

    const link = document.createElement("link");
    link.id = "katex-css";
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(link);
  },

  renderToString(latex, options = {}) {
    if (!latex) return "";

    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: options.displayMode || false,
        output: options.output || "html",
        strict: false,
        ...options,
      });
    } catch (error) {
      return `<span class="text-red-500 text-sm">Invalid LaTeX: ${latex}</span>`;
    }
  },

  renderToHTMLElement(element, latex, options = {}) {
    if (!element || !latex) return;

    try {
      katex.render(latex, element, {
        throwOnError: false,
        displayMode: options.displayMode || false,
        output: options.output || "html",
        strict: false,
        ...options,
      });
    } catch (error) {
      element.innerHTML = `<span class="text-red-500 text-sm">Invalid LaTeX: ${latex}</span>`;
    }
  },

  validateLatex(latex) {
    if (!latex) return { valid: true, error: null };

    try {
      katex.renderToString(latex, { throwOnError: true });
      return { valid: true, error: null };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  },

  isLoaded() {
    return isKatexLoaded;
  },
};
