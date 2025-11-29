import { CheckCircle, AlertTriangle, XCircle, TrendingUp } from "lucide-react";

function ReadinessBreakdown({ subjects, atRiskTopics }) {
  function getStatusIcon(retention) {
    if (retention >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (retention >= 60) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  }

  function getStatusColor(retention) {
    if (retention >= 80) return "bg-green-50 border-green-200";
    if (retention >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  }

  return (
    <div className="space-y-6">
      {subjects && subjects.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-900">Subject Readiness</h4>
          <div className="space-y-2">
            {subjects.map((subject) => (
              <div
                key={subject.subjectId}
                className={`flex items-center justify-between rounded-lg border p-3 ${getStatusColor(subject.retention)}`}
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(subject.retention)}
                  <span className="text-sm font-medium text-gray-900">{subject.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-gray-900 transition-all"
                      style={{ width: `${Math.min(subject.retention, 100)}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-semibold text-gray-900">
                    {Math.round(subject.retention)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {atRiskTopics && atRiskTopics.length > 0 && (
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            Topics Needing Attention
          </h4>
          <div className="space-y-2">
            {atRiskTopics.slice(0, 5).map((topic) => (
              <div
                key={topic.topicId}
                className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-3"
              >
                <div>
                  <span className="text-sm font-medium text-gray-900">{topic.name}</span>
                  {topic.subjectName && (
                    <span className="ml-2 text-xs text-gray-500">{topic.subjectName}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-700">
                    {Math.round(topic.avgRetention)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!subjects || subjects.length === 0) && (!atRiskTopics || atRiskTopics.length === 0) && (
        <div className="flex items-center justify-center py-8 text-gray-500">
          No readiness data available. Start practicing to see your breakdown.
        </div>
      )}
    </div>
  );
}

export default ReadinessBreakdown;
