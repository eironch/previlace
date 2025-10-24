import { useEffect, useState } from "react";
import { useQuestionTemplateStore } from "../../store/questionTemplateStore";
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
} from "lucide-react";
import TemplateCard from "./TemplateCard";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";

const categoryIcons = {
  Vocabulary: BookOpen,
  Grammar: FileText,
  "Reading Comprehension": Book,
  Mathematics: Calculator,
  "General Information": Users,
  Clerical: Target,
  "Analytical Reasoning": Brain,
};

function TemplateSelection({ onSelectTemplate }) {
  const {
    templates,
    categories,
    popularTemplates,
    isLoading,
    filters,
    fetchTemplates,
    fetchCategories,
    fetchPopularTemplates,
    setFilters,
    clearError,
  } = useQuestionTemplateStore();

  const [selectedCategory, setSelectedCategory] = useState("");

  const safeTemplates = templates || [];
  const safeCategories = categories || [];
  const safePopularTemplates = popularTemplates || [];

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
    fetchPopularTemplates();
    clearError();
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [filters]);

  function handleCategorySelect(category) {
    setSelectedCategory(category.name);
    setFilters({ category: category.name });
  }

  function handleSearch(value) {
    setFilters({ search: value });
  }

  function handleExamLevelChange(examLevel) {
    setFilters({ examLevel });
  }

  function resetFilters() {
    setSelectedCategory("");
    setFilters({
      category: "",
      examLevel: "",
      search: "",
    });
  }

  const filteredTemplates = selectedCategory
    ? safeTemplates.filter((template) => template.category === selectedCategory)
    : safeTemplates;

  if (isLoading && safeTemplates.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
          <div className="text-black">Loading templates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-black">
            Question Templates
          </h1>
          <p className="text-gray-600">
            Choose a template to create your question
          </p>
        </div>

        <div className="mb-8 flex gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search templates..."
              className="pl-10"
              value={filters?.search || ""}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <Select
            value={filters?.examLevel || ""}
            onChange={handleExamLevelChange}
            placeholder="Exam Level"
            options={[
              { value: "", label: "All Levels" },
              { value: "Professional", label: "Professional" },
              { value: "Subprofessional", label: "Sub-Professional" },
            ]}
          />
        </div>

        {safePopularTemplates.length > 0 &&
          !selectedCategory &&
          !filters?.search && (
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-black">
                Popular Templates
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {safePopularTemplates.map((template) => (
                  <TemplateCard
                    key={template._id}
                    template={template}
                    onClick={() => onSelectTemplate(template)}
                  />
                ))}
              </div>
            </div>
          )}

        {!selectedCategory && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Categories</h2>
              {(filters?.category || filters?.search || filters?.examLevel) && (
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
              {safeCategories.map((category) => {
                const IconComponent = categoryIcons[category.name] || BookOpen;
                return (
                  <button
                    key={category.name}
                    onClick={() => handleCategorySelect(category)}
                    className="group rounded-lg border border-gray-200 p-6 text-left transition-colors hover:border-black"
                  >
                    <div className="mb-3 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 transition-colors group-hover:border-black">
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
                    <p className="text-xs text-gray-500">
                      {category.templates?.length || 0} templates available
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedCategory && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-black">
                  {selectedCategory} Templates
                </h2>
                <p className="text-gray-600">
                  {filteredTemplates.length} templates found
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={resetFilters}
                className="text-gray-600"
              >
                Back to Categories
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template._id}
                  template={template}
                  onClick={() => onSelectTemplate(template)}
                />
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="py-12 text-center">
                <div className="mb-2 text-gray-400">No templates found</div>
                <p className="text-gray-500">Try adjusting your filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplateSelection;