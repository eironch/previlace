import { useState } from "react";
import { useQuestionTemplateStore } from "../../store/questionTemplateStore";
import { X, Save } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import TextArea from "../ui/TextArea";
import Select from "../ui/Select";

function CreateTemplateModal({ onClose, onSuccess }) {
  const { createTemplate, isLoading } = useQuestionTemplateStore();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subjectArea: "",
    examLevel: "Both",
    difficultyLevel: "Beginner",
    description: "",
    sampleQuestion: "",
    formStructure: {
      hasOptions: true,
      maxOptions: 4,
      hasPassage: false,
      hasMathSupport: false,
      questionTypes: ["multiple_choice"],
    },
  });

  const [errors, setErrors] = useState({});

  function updateFormData(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }

  function updateFormStructure(field, value) {
    setFormData((prev) => ({
      ...prev,
      formStructure: { ...prev.formStructure, [field]: value },
    }));
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Template name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.subjectArea) {
      newErrors.subjectArea = "Subject area is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await createTemplate(formData);

    if (result.success) {
      onSuccess(result.template);
    }
  }

  function handleCategoryChange(category) {
    updateFormData("category", category);

    const categorySubjectMap = {
      Vocabulary: "Verbal Ability",
      Grammar: "Verbal Ability",
      "Reading Comprehension": "Verbal Ability",
      Mathematics: "Numerical Ability",
      "General Information": "General Information",
      Clerical: "Clerical Ability",
      "Analytical Reasoning": "Logic",
    };

    const subjectArea = categorySubjectMap[category];
    if (subjectArea) {
      updateFormData("subjectArea", subjectArea);
    }

    updateFormStructure("hasMathSupport", category === "Mathematics");
    updateFormStructure("hasPassage", category === "Reading Comprehension");
  }

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black">Create Template</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <Input
            label="Template Name"
            value={formData.name}
            onChange={(e) => updateFormData("name", e.target.value)}
            error={errors.name}
            placeholder="Enter template name..."
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Category"
              value={formData.category}
              onChange={handleCategoryChange}
              error={errors.category}
              placeholder="Select category"
              options={[
                { value: "Vocabulary", label: "Vocabulary" },
                { value: "Grammar", label: "Grammar" },
                {
                  value: "Reading Comprehension",
                  label: "Reading Comprehension",
                },
                { value: "Mathematics", label: "Mathematics" },
                { value: "General Information", label: "General Information" },
                { value: "Clerical", label: "Clerical" },
                {
                  value: "Analytical Reasoning",
                  label: "Analytical Reasoning",
                },
              ]}
            />

            <Select
              label="Subject Area"
              value={formData.subjectArea}
              onChange={(value) => updateFormData("subjectArea", value)}
              error={errors.subjectArea}
              placeholder="Select subject area"
              options={[
                { value: "Verbal Ability", label: "Verbal Ability" },
                { value: "Numerical Ability", label: "Numerical Ability" },
                { value: "General Information", label: "General Information" },
                { value: "Clerical Ability", label: "Clerical Ability" },
                { value: "Logic", label: "Logic" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Exam Level"
              value={formData.examLevel}
              onChange={(value) => updateFormData("examLevel", value)}
              options={[
                { value: "Professional", label: "Professional" },
                { value: "Subprofessional", label: "Sub-Professional" },
                { value: "Both", label: "Both Levels" },
              ]}
            />

            <Select
              label="Difficulty Level"
              value={formData.difficultyLevel}
              onChange={(value) => updateFormData("difficultyLevel", value)}
              options={[
                { value: "Beginner", label: "Beginner" },
                { value: "Intermediate", label: "Intermediate" },
                { value: "Advanced", label: "Advanced" },
              ]}
            />
          </div>

          <TextArea
            label="Description"
            value={formData.description}
            onChange={(e) => updateFormData("description", e.target.value)}
            error={errors.description}
            placeholder="Describe what this template is used for..."
            rows={3}
          />

          <TextArea
            label="Sample Question (Optional)"
            value={formData.sampleQuestion}
            onChange={(e) => updateFormData("sampleQuestion", e.target.value)}
            placeholder="Provide a sample question that demonstrates this template..."
            rows={3}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">
              Template Configuration
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.formStructure.hasOptions}
                    onChange={(e) =>
                      updateFormStructure("hasOptions", e.target.checked)
                    }
                  />
                  <span className="text-sm font-medium text-black">
                    Multiple Choice Options
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.formStructure.hasPassage}
                    onChange={(e) =>
                      updateFormStructure("hasPassage", e.target.checked)
                    }
                  />
                  <span className="text-sm font-medium text-black">
                    Reading Passage
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.formStructure.hasMathSupport}
                    onChange={(e) =>
                      updateFormStructure("hasMathSupport", e.target.checked)
                    }
                  />
                  <span className="text-sm font-medium text-black">
                    Mathematical Expressions
                  </span>
                </label>
              </div>

              {formData.formStructure.hasOptions && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Maximum Options
                  </label>
                  <select
                    value={formData.formStructure.maxOptions}
                    onChange={(e) =>
                      updateFormStructure(
                        "maxOptions",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none"
                  >
                    <option value={2}>2 Options</option>
                    <option value={3}>3 Options</option>
                    <option value={4}>4 Options</option>
                    <option value={5}>5 Options</option>
                    <option value={6}>6 Options</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTemplateModal;
