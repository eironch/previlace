import { useState } from "react";
import {
  Search,
  Filter,
  BookOpen,
  FileText,
  Calculator,
  Brain,
  Users,
  Book,
  Target,
  ArrowLeft,
} from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";

const QUESTION_CATEGORIES = [
  {
    id: "vocabulary",
    name: "Vocabulary",
    subjectArea: "Verbal Reasoning",
    description: "Word definitions, synonyms, antonyms, and usage",
    icon: BookOpen,
    examLevel: "Both",
    difficulty: "Beginner",
    hasOptions: true,
    maxOptions: 4,
    hasPassage: false,
    hasMathSupport: false,
    questionTypes: ["multiple_choice"],
  },
  {
    id: "grammar",
    name: "Grammar",
    subjectArea: "Verbal Reasoning",
    description: "Sentence structure, parts of speech, and language rules",
    icon: FileText,
    examLevel: "Both",
    difficulty: "Beginner",
    hasOptions: true,
    maxOptions: 4,
    hasPassage: false,
    hasMathSupport: false,
    questionTypes: ["multiple_choice"],
  },
  {
    id: "reading-comprehension",
    name: "Reading Comprehension",
    subjectArea: "Verbal Reasoning",
    description: "Understanding and analyzing written passages",
    icon: Book,
    examLevel: "Both",
    difficulty: "Intermediate",
    hasOptions: true,
    maxOptions: 4,
    hasPassage: true,
    hasMathSupport: false,
    questionTypes: ["multiple_choice"],
  },
  {
    id: "mathematics",
    name: "Mathematics",
    subjectArea: "Numerical Reasoning",
    description: "Arithmetic, algebra, geometry, and problem solving",
    icon: Calculator,
    examLevel: "Both",
    difficulty: "Intermediate",
    hasOptions: true,
    maxOptions: 4,
    hasPassage: false,
    hasMathSupport: true,
    questionTypes: ["multiple_choice"],
  },
  {
    id: "general-information",
    name: "General Information",
    subjectArea: "General Information",
    description: "Current events, history, science, and general knowledge",
    icon: Users,
    examLevel: "Both",
    difficulty: "Beginner",
    hasOptions: true,
    maxOptions: 4,
    hasPassage: false,
    hasMathSupport: false,
    questionTypes: ["multiple_choice"],
  },
  {
    id: "clerical",
    name: "Clerical",
    subjectArea: "Clerical Operations",
    description: "Data organization, filing, and administrative tasks",
    icon: Target,
    examLevel: "Subprofessional",
    difficulty: "Beginner",
    hasOptions: true,
    maxOptions: 4,
    hasPassage: false,
    hasMathSupport: false,
    questionTypes: ["multiple_choice"],
  },
  {
    id: "analytical-reasoning",
    name: "Analytical Reasoning",
    subjectArea: "Analytical Reasoning",
    description: "Logical thinking, pattern recognition, and problem solving",
    icon: Brain,
    examLevel: "Professional",
    difficulty: "Advanced",
    hasOptions: true,
    maxOptions: 4,
    hasPassage: false,
    hasMathSupport: false,
    questionTypes: ["multiple_choice"],
  },
];

function QuestionTypeSelection({ onSelectType, onBack }) {
  const [search, setSearch] = useState("");
  const [examLevel, setExamLevel] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredCategories = QUESTION_CATEGORIES.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(search.toLowerCase()) ||
      category.description.toLowerCase().includes(search.toLowerCase());
    const matchesLevel =
      !examLevel ||
      category.examLevel === examLevel ||
      category.examLevel === "Both";
    const matchesCategory =
      !selectedCategory || category.id === selectedCategory;

    return matchesSearch && matchesLevel && matchesCategory;
  });

  function resetFilters() {
    setSearch("");
    setExamLevel("");
    setSelectedCategory("");
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-black">Create Question</h1>
            <p className="text-gray-600">
              Choose a question type to get started
            </p>
          </div>
        </div>

        <div className="mb-8 flex gap-6">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search question types..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select
            value={examLevel}
            onChange={setExamLevel}
            placeholder="Exam Level"
            options={[
              { value: "", label: "All Levels" },
              { value: "Professional", label: "Professional" },
              { value: "Subprofessional", label: "Sub-Professional" },
              { value: "Both", label: "Both Levels" },
            ]}
          />
        </div>

        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">Question Types</h2>
            {(search || examLevel || selectedCategory) && (
              <Button
                variant="ghost"
                onClick={resetFilters}
                className="text-gray-600"
              >
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => onSelectType(category)}
                  className="group rounded-lg border border-gray-300 p-6 text-left transition-colors hover:border-black"
                >
                  <div className="mb-3 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 transition-colors group-hover:border-black">
                      <IconComponent className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {category.subjectArea}
                      </p>
                    </div>
                  </div>
                  <p className="mb-2 text-sm text-gray-600">
                    {category.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-600">
                      {category.examLevel}
                    </span>
                    <span className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-600">
                      {category.difficulty}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="py-12 text-center">
              <div className="mb-2 text-gray-400">No question types found</div>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionTypeSelection;
