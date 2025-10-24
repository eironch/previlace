import { User, TrendingUp } from "lucide-react";

function TemplateCard({ template, onClick }) {
  const difficultyColors = {
    Beginner: "bg-green-50 text-green-700 border-green-200",
    Intermediate: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Advanced: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <button
      onClick={onClick}
      className="group w-full rounded-lg border border-gray-200 p-6 text-left transition-colors hover:border-black"
    >
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-black group-hover:text-gray-900">
            {template.name}
          </h3>
          <div
            className={`rounded-md border px-2 py-1 text-xs font-medium ${difficultyColors[template.difficultyLevel] || "bg-gray-50 text-gray-700 border-gray-200"}`}
          >
            {template.difficultyLevel}
          </div>
        </div>

        <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
          <span className="rounded bg-gray-100 px-2 py-1 text-xs">
            {template.category}
          </span>
          <span className="rounded bg-gray-100 px-2 py-1 text-xs">
            {template.examLevel}
          </span>
        </div>
      </div>

      <p className="line-clamp-2 mb-4 text-sm text-gray-600">
        {template.description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {template.createdBy?.firstName} {template.createdBy?.lastName}
        </div>

        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          {template.usageCount || 0} uses
        </div>
      </div>
    </button>
  );
}

export default TemplateCard;