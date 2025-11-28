import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubjectStore } from "@/store/subjectStore";
import { useAuthStore } from "@/store/authStore";
import { BookOpen, Target, TrendingUp, Eye, EyeOff } from "lucide-react";
import StandardHeader from "@/components/ui/StandardHeader";
import SkeletonLoader from "@/components/ui/SkeletonLoader";

function SubjectsPage() {
  const navigate = useNavigate();
  const { subjects, loading, fetchSubjects, toggleSubjectPublish } = useSubjectStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchSubjects(user?.examLevel);
  }, [fetchSubjects, user?.examLevel]);

  function handleSubjectClick(subjectId) {
    navigate(`/dashboard/subjects/${subjectId}`);
  }

  async function handleTogglePublish(e, subjectId) {
    e.stopPropagation();
    try {
      await toggleSubjectPublish(subjectId);
    } catch (error) {
      console.error("Failed to toggle publish:", error);
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <StandardHeader 
        title="Subjects" 
        description="Choose a subject to view topics and start learning"
        onRefresh={() => fetchSubjects(user?.examLevel)}
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-lg border border-gray-300 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <SkeletonLoader variant="circle" className="h-12 w-12" />
                  <SkeletonLoader className="h-4 w-16" />
                </div>
                <SkeletonLoader variant="title" className="mb-2 h-6" />
                <SkeletonLoader className="mb-2" />
                <SkeletonLoader className="w-3/4" />
                <div className="mt-4 flex items-center gap-4">
                  <SkeletonLoader className="h-3 w-20" />
                  <SkeletonLoader className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <button
                key={subject._id}
                onClick={() => handleSubjectClick(subject._id)}
                className="group overflow-hidden rounded-lg border border-gray-300 bg-white p-6 text-left transition-all hover:border-black hover:shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 transition-colors group-hover:bg-black">
                    <BookOpen className="h-6 w-6 text-gray-900 transition-colors group-hover:text-white" />
                  </div>
                  {subject.progress && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Progress</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {subject.progress.completedTopics || 0}/
                        {subject.totalTopics || 0}
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {subject.name}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                  {subject.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>{subject.totalTopics || 0} topics</span>
                  </div>
                  {subject.progress && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{Math.round(subject.progress.averageScore || 0)}%</span>
                    </div>
                  )}
                </div>

                {subject.progress && subject.progress.completedTopics > 0 && (
                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-black transition-all"
                        style={{
                          width: `${(subject.progress.completedTopics / subject.totalTopics) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default SubjectsPage;
