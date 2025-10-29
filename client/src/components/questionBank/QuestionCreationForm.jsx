import { useState } from "react";
import { useManualQuestionStore } from "../../store/manualQuestionStore";
import {
  ArrowLeft,
  Save,
  Eye,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
} from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import TextArea from "../ui/TextArea";
import Select from "../ui/Select";
import QuestionPreview from "./QuestionPreview";
import MathInput from "../ui/MathInput";

function QuestionCreationForm({ questionType, onBack, onSuccess }) {
  const { createQuestion, isCreating, error } = useManualQuestionStore();

  const [formData, setFormData] = useState({
    questionText: "",
    questionMath: "",
    options: [
      { text: "", math: "", isCorrect: false },
      { text: "", math: "", isCorrect: false },
    ],
    correctAnswer: "",
    explanation: "",
    explanationMath: "",
    difficulty: questionType.difficulty || "Beginner",
    subjectArea: questionType.subjectArea,
    category: questionType.name,
    examLevel:
      questionType.examLevel === "Both"
        ? "Professional"
        : questionType.examLevel,
    language: "English",
    tags: [],
    passageText: "",
    passageTitle: "",
    questionType: "multiple_choice",
    timeLimit: 60,
    points: 1,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [submitError, setSubmitError] = useState(null);

  function updateFormData(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSubmitError(null);
  }

  function updateOption(index, field, value) {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };

    if (field === "isCorrect" && value) {
      newOptions.forEach((opt, idx) => {
        if (idx !== index) opt.isCorrect = false;
      });
      updateFormData("correctAnswer", newOptions[index].text);
    }

    updateFormData("options", newOptions);
  }

  function addOption() {
    if (formData.options.length < (questionType.maxOptions || 6)) {
      updateFormData("options", [
        ...formData.options,
        { text: "", math: "", isCorrect: false },
      ]);
    }
  }

  function removeOption(index) {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, idx) => idx !== index);
      updateFormData("options", newOptions);
    }
  }

  function addTag() {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      updateFormData("tags", [...formData.tags, tagInput.trim()]);
      setTagInput("");
    }
  }

  function removeTag(tag) {
    updateFormData(
      "tags",
      formData.tags.filter((t) => t !== tag)
    );
  }

  function validateFormData() {
    const errors = [];

    if (!formData.questionText.trim()) {
      errors.push("Question text is required");
    }

    if (formData.options.length < 2) {
      errors.push("At least 2 options are required");
    }

    const hasValidOptions = formData.options.some((opt) => opt.text.trim());
    if (!hasValidOptions) {
      errors.push("At least one option must have text");
    }

    const hasCorrectAnswer = formData.options.some((opt) => opt.isCorrect);
    if (!hasCorrectAnswer) {
      errors.push("Please select a correct answer");
    }

    if (!formData.explanation.trim()) {
      errors.push("Explanation is required");
    }

    return errors;
  }

  async function handleSubmit(status = "draft") {
    const validationErrors = validateFormData();

    if (validationErrors.length > 0) {
      setSubmitError(validationErrors.join(", "));
      return;
    }

    const questionData = {
      ...formData,
      status,
    };

    const result = await createQuestion(questionData);

    if (result.success) {
      onSuccess(result.question);
    } else {
      setSubmitError(result.error || "Failed to create question");
    }
  }

  function handleKeyPress(e) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  }

  const isReadingComprehension = questionType.hasPassage;
  const isMathematical = questionType.hasMathSupport;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-black">Create Question</h1>
              <p className="text-gray-600">Type: {questionType.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              <Eye className="h-5 w-5" />
              {showPreview ? "Edit" : "Preview"}
            </Button>

            <Button
              onClick={() => handleSubmit("draft")}
              disabled={isCreating}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <Save className="h-5 w-5" />
              Save Draft
            </Button>

            <Button
              onClick={() => handleSubmit("review")}
              disabled={isCreating}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5" />
              Submit for Review
            </Button>
          </div>
        </div>

        {(error || submitError) && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              {error || submitError}
            </div>
          </div>
        )}

        {showPreview ? (
          <QuestionPreview question={formData} questionType={questionType} />
        ) : (
          <div className="space-y-8">
            {isReadingComprehension && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black">
                  Reading Passage
                </h3>

                <Input
                  placeholder="Passage Title (Optional)"
                  value={formData.passageTitle}
                  onChange={(e) =>
                    updateFormData("passageTitle", e.target.value)
                  }
                />

                <TextArea
                  placeholder="Enter the reading passage text here..."
                  value={formData.passageText}
                  onChange={(e) =>
                    updateFormData("passageText", e.target.value)
                  }
                  rows={8}
                />
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">Question</h3>

              <TextArea
                placeholder="Enter your question here..."
                value={formData.questionText}
                onChange={(e) => updateFormData("questionText", e.target.value)}
                rows={3}
              />

              {isMathematical && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Mathematical Expression (Optional)
                  </label>
                  <MathInput
                    value={formData.questionMath}
                    onChange={(value) => updateFormData("questionMath", value)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-black">
                  Answer Options
                </h3>
                {formData.options.length < (questionType.maxOptions || 6) && (
                  <Button
                    variant="ghost"
                    onClick={addOption}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Option
                  </Button>
                )}
              </div>

              {formData.options.map((option, index) => (
                <div
                  key={index}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-sm ${
                    option.isCorrect
                      ? "border-black bg-white ring-2 ring-black"
                      : "border-gray-300 bg-white"
                  }`}
                  onClick={() => updateOption(index, "isCorrect", true)}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-2 flex items-center">
                      <div
                        className={`h-4 w-4 rounded-full border-2 ${
                          option.isCorrect
                            ? "border-black bg-black"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {option.isCorrect && (
                          <div className="h-full w-full rounded-full bg-white p-0.5">
                            <div className="h-full w-full rounded-full bg-black" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) =>
                          updateOption(index, "text", e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="border-0 bg-transparent focus:border-0 focus:ring-0"
                      />

                      {isMathematical && (
                        <MathInput
                          value={option.math}
                          onChange={(value) =>
                            updateOption(index, "math", value)
                          }
                          placeholder="Mathematical expression (optional)"
                          onClick={(e) => e.stopPropagation()}
                          className="border-0 bg-transparent focus:border-0 focus:ring-0"
                        />
                      )}
                    </div>

                    {formData.options.length > 2 && (
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeOption(index);
                        }}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">Explanation</h3>

              <TextArea
                placeholder="Explain the correct answer..."
                value={formData.explanation}
                onChange={(e) => updateFormData("explanation", e.target.value)}
                rows={4}
              />

              {isMathematical && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Mathematical Explanation (Optional)
                  </label>
                  <MathInput
                    value={formData.explanationMath}
                    onChange={(value) =>
                      updateFormData("explanationMath", value)
                    }
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Select
                label="Difficulty Level"
                value={formData.difficulty}
                onChange={(value) => updateFormData("difficulty", value)}
                options={[
                  { value: "Beginner", label: "Beginner" },
                  { value: "Intermediate", label: "Intermediate" },
                  { value: "Advanced", label: "Advanced" },
                ]}
              />

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

              <Input
                type="number"
                label="Time Limit (seconds)"
                value={formData.timeLimit}
                onChange={(e) =>
                  updateFormData("timeLimit", parseInt(e.target.value))
                }
                min={30}
                max={300}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">Tags</h3>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add tags to categorize this question..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={addTag} disabled={!tagInput.trim()}>
                  Add
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionCreationForm;
