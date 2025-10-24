import React, { useState, useEffect } from "react";
import { useQuestionTemplateStore } from "../../store/questionTemplateStore";
import { FiSearch, FiFilter, FiPlus, FiGrid, FiList } from "react-icons/fi";
import { MdCategory, MdSchool, MdTrendingUp } from "react-icons/md";

function TemplateBrowser() {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  
  const {
    templates,
    isLoading: loading,
    fetchTemplates,
  } = useQuestionTemplateStore();

  useEffect(() => {
    fetchTemplates({
      category: selectedCategory,
      examLevel: selectedLevel,
      search: searchQuery,
      sortBy,
    });
  }, [selectedCategory, selectedLevel, searchQuery, sortBy, fetchTemplates]);

  function handleSearch(e) {
    setSearchQuery(e.target.value);
  }

  function handleCategoryChange(category) {
    setSelectedCategory(category);
  }

  function handleLevelChange(level) {
    setSelectedLevel(level);
  }

  function renderTemplateCard(template) {
    return (
      <div
        key={template._id}
        className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg"
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MdCategory className="text-blue-500" />
            <span className="text-sm font-medium text-gray-600">
              {template.category?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            {template.examLevel?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>

        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          {template.name}
        </h3>
        
        <p className="mb-4 line-clamp-2 text-sm text-gray-600">
          {template.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MdSchool />
              {template.usageStats?.totalQuestions || 0} questions
            </span>
            <span className="flex items-center gap-1">
              <MdTrendingUp />
              {template.performanceMetrics?.userRating?.toFixed(1) || "0.0"} rating
            </span>
          </div>
          
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            Use Template
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
            {template.difficultyLevel?.replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600">
            {template.subjectArea}
          </span>
        </div>
      </div>
    );
  }

  function renderListView(template) {
    return (
      <div
        key={template._id}
        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md"
      >
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-3">
            <h3 className="text-base font-semibold text-gray-900">
              {template.name}
            </h3>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
              {template.examLevel?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <span className="text-xs text-gray-500">
              {template.category?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          <p className="text-sm text-gray-600">{template.description}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {template.usageStats?.totalQuestions || 0} questions
            </div>
            <div className="text-xs text-gray-500">
              Rating: {template.performanceMetrics?.userRating?.toFixed(1) || "0.0"}
            </div>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            Use
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Question Templates
          </h1>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            <FiPlus />
            Create Template
          </button>
        </div>

        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search templates..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="grammar">Grammar</option>
                <option value="mathematics">Mathematics</option>
                <option value="general-information">General Information</option>
                <option value="clerical">Clerical</option>
                <option value="analytical-reasoning">Analytical Reasoning</option>
                <option value="reading-comprehension">Reading Comprehension</option>
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => handleLevelChange(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                <option value="professional">Professional</option>
                <option value="sub-professional">Sub-professional</option>
                <option value="both">Both</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Recently Added</option>
                <option value="rating">Highest Rated</option>
              </select>

              <div className="flex rounded-lg border border-gray-300">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-l-lg p-2 ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600"
                  }`}
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-r-lg p-2 ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600"
                  }`}
                >
                  <FiList />
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                : "flex flex-col gap-4"
            }
          >
            {templates.map((template) =>
              viewMode === "grid"
                ? renderTemplateCard(template)
                : renderListView(template)
            )}
          </div>
        )}

        {templates.length === 0 && !loading && (
          <div className="flex h-64 flex-col items-center justify-center text-gray-500">
            <FiFilter className="mb-4 text-4xl" />
            <p className="text-lg font-medium">No templates found</p>
            <p className="text-sm">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplateBrowser;