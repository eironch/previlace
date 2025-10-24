import React, { useState, useEffect } from "react";
import MathInputField from "./MathInputField";
import { FiInfo, FiEye, FiEyeOff } from "react-icons/fi";

function DynamicFormRenderer({ template, initialValues, onChange, errors }) {
  const [formData, setFormData] = useState(initialValues || {});
  const [visibleFields, setVisibleFields] = useState(new Set());
  const [requiredFields, setRequiredFields] = useState(new Set());

  useEffect(() => {
    if (template?.fieldDefinitions) {
      const visible = new Set(template.fieldDefinitions.map((f) => f.fieldId));
      setVisibleFields(visible);
      processConditionalLogic();
    }
  }, [template, formData]);

  function processConditionalLogic() {
    if (!template.conditionalLogicRules) return;

    const newVisible = new Set(template.fieldDefinitions.map((f) => f.fieldId));
    const newRequired = new Set();

    template.conditionalLogicRules.forEach((rule) => {
      const conditionsMet = rule.conditions.every((condition) => {
        const value = formData[condition.field];
        return evaluateCondition(value, condition.operator, condition.value);
      });

      if (conditionsMet) {
        rule.actions.forEach((action) => {
          switch (action.type) {
            case "show":
              newVisible.add(action.target);
              break;
            case "hide":
              newVisible.delete(action.target);
              break;
            case "require":
              newRequired.add(action.target);
              break;
            case "optional":
              newRequired.delete(action.target);
              break;
          }
        });
      }
    });

    setVisibleFields(newVisible);
    setRequiredFields(newRequired);
  }

  function evaluateCondition(fieldValue, operator, targetValue) {
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
  }

  function handleFieldChange(fieldId, value) {
    const newData = { ...formData, [fieldId]: value };
    setFormData(newData);
    if (onChange) onChange(newData);
  }

  function renderField(fieldDef) {
    if (!visibleFields.has(fieldDef.fieldId)) return null;

    const value = formData[fieldDef.fieldId] || fieldDef.defaultValue || "";
    const isRequired =
      fieldDef.validation?.required || requiredFields.has(fieldDef.fieldId);
    const fieldError = errors?.[fieldDef.fieldId];

    return (
      <div key={fieldDef.fieldId} className="mb-6">
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          {fieldDef.label}
          {isRequired && <span className="text-red-500">*</span>}
          {fieldDef.uiConfig?.helpText && (
            <div className="group relative">
              <FiInfo className="h-4 w-4 text-gray-400" />
              <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg group-hover:block">
                {fieldDef.uiConfig.helpText}
                <div className="absolute left-1/2 top-full -mt-1 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )}
        </label>

        {renderFieldInput(fieldDef, value, isRequired)}

        {fieldError && (
          <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
        )}
      </div>
    );
  }

  function renderFieldInput(fieldDef, value, isRequired) {
    const commonProps = {
      value,
      onChange: (e) => handleFieldChange(fieldDef.fieldId, e.target ? e.target.value : e),
      placeholder: fieldDef.uiConfig?.placeholder,
      required: isRequired,
      className:
        "w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
    };

    switch (fieldDef.type) {
      case "text":
        return (
          <input
            type="text"
            {...commonProps}
            minLength={fieldDef.validation?.minLength}
            maxLength={fieldDef.validation?.maxLength}
          />
        );

      case "richtext":
        return (
          <textarea
            {...commonProps}
            rows={fieldDef.uiConfig?.rows || 4}
            minLength={fieldDef.validation?.minLength}
            maxLength={fieldDef.validation?.maxLength}
          />
        );

      case "numeric":
        return (
          <input
            type="number"
            {...commonProps}
            min={fieldDef.validation?.min}
            max={fieldDef.validation?.max}
            step="any"
          />
        );

      case "math":
        return (
          <MathInputField
            value={value}
            onChange={(val) => handleFieldChange(fieldDef.fieldId, val)}
            keypadLayout={fieldDef.mathConfig?.keypadLayout || "basic"}
            placeholder={fieldDef.uiConfig?.placeholder}
          />
        );

      case "choices":
        return (
          <ChoiceInput
            value={value}
            onChange={(val) => handleFieldChange(fieldDef.fieldId, val)}
            multiple={fieldDef.validation?.multiple}
          />
        );

      case "passage":
        return (
          <textarea
            {...commonProps}
            rows={8}
            className="w-full rounded-lg border border-gray-300 p-4 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );

      default:
        return <input type="text" {...commonProps} />;
    }
  }

  return (
    <div className="space-y-6">
      {template?.fieldDefinitions?.map(renderField)}
    </div>
  );
}

function ChoiceInput({ value = [], onChange, multiple }) {
  const [choices, setChoices] = useState(
    value.length > 0 ? value : [{ text: "", isCorrect: false }]
  );

  function handleChoiceChange(index, field, fieldValue) {
    const newChoices = [...choices];
    newChoices[index] = { ...newChoices[index], [field]: fieldValue };
    setChoices(newChoices);
    onChange(newChoices);
  }

  function addChoice() {
    const newChoices = [...choices, { text: "", isCorrect: false }];
    setChoices(newChoices);
    onChange(newChoices);
  }

  function removeChoice(index) {
    if (choices.length <= 1) return;
    const newChoices = choices.filter((_, i) => i !== index);
    setChoices(newChoices);
    onChange(newChoices);
  }

  return (
    <div className="space-y-3">
      {choices.map((choice, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">
            {String.fromCharCode(65 + index)}.
          </span>
          <input
            type="text"
            value={choice.text}
            onChange={(e) => handleChoiceChange(index, "text", e.target.value)}
            placeholder="Enter choice text"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type={multiple ? "checkbox" : "radio"}
              name="correctAnswer"
              checked={choice.isCorrect}
              onChange={(e) => {
                if (multiple) {
                  handleChoiceChange(index, "isCorrect", e.target.checked);
                } else {
                  const newChoices = choices.map((c, i) => ({
                    ...c,
                    isCorrect: i === index,
                  }));
                  setChoices(newChoices);
                  onChange(newChoices);
                }
              }}
              className="h-4 w-4"
            />
            Correct
          </label>
          {choices.length > 1 && (
            <button
              onClick={() => removeChoice(index)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addChoice}
        className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
      >
        Add Choice
      </button>
    </div>
  );
}

export default DynamicFormRenderer;