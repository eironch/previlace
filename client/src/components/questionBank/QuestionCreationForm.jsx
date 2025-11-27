import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useManualQuestionStore } from "../../store/manualQuestionStore";
import { useSubjectStore } from "../../store/subjectStore";
import { useTopicStore } from "../../store/topicStore";
import {
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Circle,
  AlertCircle,
} from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import TextArea from "../ui/TextArea";
import Select from "../ui/Select";
import QuestionPreview from "./QuestionPreview";
import MathInput from "../ui/MathInput";

const QuestionCreationForm = forwardRef(({ questionType = {}, onBack, onSuccess, showPreview }, ref) => {
  const { createQuestion, isCreating, error } = useManualQuestionStore();
  const { subjects, fetchSubjects, loading: subjectsLoading } = useSubjectStore();
  const { topics, fetchTopicsBySubject, loading: topicsLoading } = useTopicStore();

  const [formData, setFormData] = useState({
    subjectId: "",
    topicId: "",
    questionText: "",
    questionMath: "",
    options: [
      { text: "", math: "", isCorrect: false },
      { text: "", math: "", isCorrect: false },
    ],
    correctAnswer: "",
    explanation: "",
    explanationMath: "",
    difficulty: questionType?.difficulty || "Beginner",
    subjectArea: questionType?.subjectArea || "",
    category: questionType?.name || "",
    examLevel:
      questionType?.examLevel === "Both"
        ? "Professional"
        : questionType?.examLevel || "Professional",
    language: "English",
    tags: [],
    passageText: "",
    passageTitle: "",
    questionType: "multiple_choice",
    timeLimit: 60,
    points: 1,
  });

  const [tagInput, setTagInput] = useState("");
  const [submitError, setSubmitError] = useState(null);

  useImperativeHandle(ref, () => ({
    submit: (status) => handleSubmit(status)
  }));

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (formData.subjectId) {
      fetchTopicsBySubject(formData.subjectId);
      setFormData((prev) => ({ ...prev, topicId: "" }));
    }
  }, [formData.subjectId]);

  useEffect(() => {
    if (questionType?.name) {
      setFormData(prev => ({ 
        ...prev, 
        category: questionType.name,
        difficulty: questionType.difficulty || prev.difficulty,
        subjectArea: questionType.subjectArea || prev.subjectArea
      }));

      // Auto-select subject if it matches the subjectArea
      if (subjects.length > 0 && questionType.subjectArea) {
        const matchingSubject = subjects.find(s => 
          s.name.toLowerCase() === questionType.subjectArea.toLowerCase() ||
          s.name.toLowerCase().includes(questionType.subjectArea.toLowerCase())
        );
        
        if (matchingSubject) {
          setFormData(prev => ({
            ...prev,
            subjectId: matchingSubject._id
          }));
        }
      }
    }
  }, [questionType, subjects]);

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

    if (!formData.subjectId) {
      errors.push("Subject selection is required");
    }

    if (!formData.topicId) {
      errors.push("Topic selection is required");
    }

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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">Classification</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Question Type
                  </label>
                  <select
                    value={formData.questionType}
                    onChange={(e) => {
                      const type = e.target.value;
                      updateFormData("questionType", type);
                      // Reset options if switching between types that might have different structures
                      // For now, most are multiple choice based, but good to keep in mind
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="identification">Identification</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Subject
                  </label>
                  {subjectsLoading ? (
                    <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-500">
                      Loading subjects...
                    </div>
                  ) : (
                    <select
                      value={formData.subjectId}
                      onChange={(e) => {
                        const selectedSubject = subjects.find(s => s._id === e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          subjectId: e.target.value,
                          subjectArea: selectedSubject?.name || prev.subjectArea,
                        }));
                      }}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Topic
                  </label>
                  {topicsLoading ? (
                    <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-500">
                      Loading topics...
                    </div>
                  ) : !formData.subjectId ? (
                    <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-500">
                      Select a subject first
                    </div>
                  ) : (
                    <select
                      value={formData.topicId}
                      onChange={(e) => updateFormData("topicId", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
                    >
                      <option value="">Select Topic</option>
                      {topics.map((topic) => (
                        <option key={topic._id} value={topic._id}>
                          {topic.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

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

              {!formData.options.some((opt) => opt.isCorrect) && (
                <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Please select a correct answer by clicking on an option</span>
                </div>
              )}

              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => updateOption(index, "isCorrect", true)}
                    className={`flex w-full items-start gap-3 rounded-lg border-2 p-3 text-left transition-all cursor-pointer sm:p-4 ${
                      option.isCorrect
                        ? "border-black bg-white hover:border-black hover:bg-gray-50"
                        : "border-gray-300 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {option.isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-black" />
                    ) : (
                      <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                    )}

                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                            option.isCorrect
                              ? "bg-black text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>

                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) =>
                          updateOption(index, "text", e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="border-0 bg-transparent p-0 text-sm leading-relaxed focus:border-0 focus:ring-0 sm:text-base"
                      />

                      {isMathematical && (
                        <MathInput
                          value={option.math}
                          onChange={(value) =>
                            updateOption(index, "math", value)
                          }
                          placeholder="Mathematical expression (optional)"
                          onClick={(e) => e.stopPropagation()}
                          className="border-0 bg-transparent p-0 focus:border-0 focus:ring-0"
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
                ))}
              </div>
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
                  { value: "Sub-Professional", label: "Sub-Professional" },
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
                      className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700"
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
});

export default QuestionCreationForm;
