import { useState, useEffect, useRef } from "react";
import { Calculator, Type, X, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import katex from "katex";
import "katex/dist/katex.min.css";

function EnhancedMathInput({
  value = "",
  onChange,
  placeholder = "Enter mathematical expression",
  keypadLayout = "basic",
  className = "",
}) {
  const [inputValue, setInputValue] = useState(value);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showKeypad, setShowKeypad] = useState(false);
  const [inputMode, setInputMode] = useState("keypad");
  const [renderedMath, setRenderedMath] = useState("");
  const [parseError, setParseError] = useState("");
  const inputRef = useRef(null);
  const keypadRef = useRef(null);

  const keypadLayouts = {
    basic: [
      ["7", "8", "9", "÷", "C"],
      ["4", "5", "6", "×", "("],
      ["1", "2", "3", "-", ")"],
      ["0", ".", "=", "+", "←"],
    ],
    algebra: [
      ["x", "y", "z", "^", "√", "∛"],
      ["sin", "cos", "tan", "π", "e", "ln"],
      ["log", "exp", "|", "±", "!", "∞"],
      ["(", ")", "[", "]", "{", "}"],
      ["7", "8", "9", "÷", "frac", "C"],
      ["4", "5", "6", "×", "^2", "←"],
      ["1", "2", "3", "-", "^3", "→"],
      ["0", ".", ",", "+", "=", "↵"],
    ],
    calculus: [
      ["∫", "∂", "∑", "∏", "lim", "∞"],
      ["dx", "dy", "dt", "→", "∇", "Δ"],
      ["sin", "cos", "tan", "sec", "csc", "cot"],
      ["arcsin", "arccos", "arctan", "ln", "log", "exp"],
      ["(", ")", "[", "]", "{", "}"],
      ["x", "y", "z", "t", "n", "i"],
      ["0", "1", "2", "π", "e", "C"],
    ],
    geometry: [
      ["∠", "△", "□", "○", "∥", "⊥"],
      ["≅", "∼", "≈", "≠", "≤", "≥"],
      ["°", "′", "″", "rad", "π", "τ"],
      ["sin", "cos", "tan", "cot", "sec", "csc"],
      ["A", "B", "C", "P", "Q", "R"],
      ["a", "b", "c", "h", "r", "d"],
    ],
    statistics: [
      ["Σ", "μ", "σ", "σ²", "x̄", "s²"],
      ["P(", "C(", "n", "r", "!", "nCr"],
      ["nPr", "∩", "∪", "⊂", "⊃", "∈"],
      ["%", "‰", "±", "≤", "≥", "≈"],
      ["E[", "Var", "Cov", "ρ", "β", "α"],
    ],
  };

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    renderMathExpression(inputValue);
  }, [inputValue]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        keypadRef.current &&
        !keypadRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowKeypad(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function renderMathExpression(expression) {
    if (!expression) {
      setRenderedMath("");
      setParseError("");
      return;
    }

    try {
      const html = katex.renderToString(expression, {
        throwOnError: false,
        displayMode: false,
      });
      setRenderedMath(html);
      setParseError("");
    } catch (error) {
      setParseError("Invalid expression");
    }
  }

  function handleInputChange(e) {
    const newValue = e.target.value;
    setInputValue(newValue);
    setCursorPosition(e.target.selectionStart);
    onChange?.(newValue);
  }

  function insertAtCursor(text) {
    const before = inputValue.slice(0, cursorPosition);
    const after = inputValue.slice(cursorPosition);
    const newValue = before + text + after;
    const newCursorPosition = cursorPosition + text.length;

    setInputValue(newValue);
    setCursorPosition(newCursorPosition);
    onChange?.(newValue);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  }

  function handleKeypadButton(button) {
    switch (button) {
      case "C":
        setInputValue("");
        setCursorPosition(0);
        onChange?.("");
        break;
      case "←":
        if (cursorPosition > 0) {
          const before = inputValue.slice(0, cursorPosition - 1);
          const after = inputValue.slice(cursorPosition);
          const newValue = before + after;
          setInputValue(newValue);
          setCursorPosition(cursorPosition - 1);
          onChange?.(newValue);
        }
        break;
      case "→":
        if (cursorPosition < inputValue.length) {
          setCursorPosition(cursorPosition + 1);
        }
        break;
      case "↵":
        setShowKeypad(false);
        break;
      case "÷":
        insertAtCursor("\\div ");
        break;
      case "×":
        insertAtCursor("\\times ");
        break;
      case "√":
        insertAtCursor("\\sqrt{");
        break;
      case "∛":
        insertAtCursor("\\sqrt[3]{");
        break;
      case "^":
        insertAtCursor("^{");
        break;
      case "^2":
        insertAtCursor("^{2}");
        break;
      case "^3":
        insertAtCursor("^{3}");
        break;
      case "frac":
        insertAtCursor("\\frac{}{");
        break;
      case "π":
        insertAtCursor("\\pi ");
        break;
      case "∞":
        insertAtCursor("\\infty ");
        break;
      case "sin":
        insertAtCursor("\\sin ");
        break;
      case "cos":
        insertAtCursor("\\cos ");
        break;
      case "tan":
        insertAtCursor("\\tan ");
        break;
      case "log":
        insertAtCursor("\\log ");
        break;
      case "ln":
        insertAtCursor("\\ln ");
        break;
      case "exp":
        insertAtCursor("\\exp ");
        break;
      case "∫":
        insertAtCursor("\\int ");
        break;
      case "∂":
        insertAtCursor("\\partial ");
        break;
      case "∑":
        insertAtCursor("\\sum ");
        break;
      case "∏":
        insertAtCursor("\\prod ");
        break;
      case "lim":
        insertAtCursor("\\lim_{");
        break;
      case "Σ":
        insertAtCursor("\\sum ");
        break;
      case "μ":
        insertAtCursor("\\mu ");
        break;
      case "σ":
        insertAtCursor("\\sigma ");
        break;
      case "σ²":
        insertAtCursor("\\sigma^{2}");
        break;
      case "x̄":
        insertAtCursor("\\bar{x}");
        break;
      default:
        insertAtCursor(button);
    }
  }

  const currentLayout = keypadLayouts[keypadLayout] || keypadLayouts.basic;

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex gap-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowKeypad(true)}
            onSelect={(e) => setCursorPosition(e.target.selectionStart)}
            placeholder={placeholder}
            className={`flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setInputMode(inputMode === "text" ? "keypad" : "text")}
            className="px-3"
          >
            {inputMode === "text" ? <Calculator className="h-4 w-4" /> : <Type className="h-4 w-4" />}
          </Button>
        </div>

        {renderedMath && (
          <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-3">
            <div className="text-sm text-gray-600 mb-1">Preview:</div>
            <div
              className="math-preview text-lg"
              dangerouslySetInnerHTML={{ __html: renderedMath }}
            />
          </div>
        )}

        {parseError && (
          <div className="mt-1 text-sm text-red-600">{parseError}</div>
        )}

        {showKeypad && inputMode === "keypad" && (
          <Card
            ref={keypadRef}
            className="absolute z-10 mt-2 w-full bg-white p-3 shadow-lg"
          >
            <div className="mb-2 flex items-center justify-between">
              <select
                value={keypadLayout}
                onChange={(e) => onChange?.(e.target.value)}
                className="rounded border border-gray-300 px-2 py-1 text-sm"
              >
                <option value="basic">Basic</option>
                <option value="algebra">Algebra</option>
                <option value="calculus">Calculus</option>
                <option value="geometry">Geometry</option>
                <option value="statistics">Statistics</option>
              </select>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowKeypad(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-1">
              {currentLayout.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1">
                  {row.map((button, buttonIndex) => (
                    <Button
                      key={buttonIndex}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleKeypadButton(button)}
                      className="flex-1 px-2 py-2 text-sm"
                    >
                      {button}
                    </Button>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Use LaTeX syntax for advanced expressions
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default EnhancedMathInput;