import { useState, useEffect } from "react";
import MathRenderer from "../ui/MathRenderer";
import { mathService } from "../../services/mathService";
import { cn } from "../../lib/utils";

function MathInput({ 
  value = "", 
  onChange, 
  placeholder = "Enter LaTeX expression...",
  className = "",
  showPreview = true,
  displayMode = false 
}) {
  const [latex, setLatex] = useState(value);
  const [validation, setValidation] = useState({ valid: true, error: null });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeMath();
  }, []);

  useEffect(() => {
    if (value !== latex) {
      setLatex(value);
    }
  }, [value]);

  useEffect(() => {
    if (isInitialized) {
      validateInput(latex);
    }
  }, [latex, isInitialized]);

  async function initializeMath() {
    await mathService.initialize();
    setIsInitialized(true);
    validateInput(latex);
  }

  function validateInput(input) {
    const result = mathService.validateLatex(input);
    setValidation(result);
  }

  function handleInputChange(e) {
    const newValue = e.target.value;
    setLatex(newValue);
    if (onChange) {
      onChange(newValue);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          className={cn(
            "w-full px-3 py-2 border rounded-lg resize-vertical transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent",
            validation.valid 
              ? "border-gray-200" 
              : "border-red-200 bg-red-50",
            className
          )}
          placeholder={placeholder}
          value={latex}
          onChange={handleInputChange}
          rows={2}
          spellCheck={false}
        />
        {!validation.valid && (
          <div className="mt-1 text-xs text-red-600">
            {validation.error}
          </div>
        )}
      </div>

      {showPreview && latex && validation.valid && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-600 mb-2 font-medium">
            Preview:
          </div>
          <MathRenderer 
            latex={latex} 
            displayMode={displayMode}
            className="text-lg"
          />
        </div>
      )}

      {latex && (
        <div className="text-xs text-gray-500">
          <span className="font-medium">LaTeX:</span>{" "}
          <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">
            {latex}
          </code>
        </div>
      )}
    </div>
  );
}

export default MathInput;
