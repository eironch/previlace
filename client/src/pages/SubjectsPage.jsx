import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubjectStore } from "@/store/subjectStore";
import { useAuthStore } from "@/store/authStore";
import { BookOpen, Target, TrendingUp, ArrowLeft, LogOut } from "lucide-react";

function SubjectsPage() {
  const navigate = useNavigate();
  const { subjects, loading, fetchSubjects } = useSubjectStore();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    fetchSubjects(user?.examLevel);
  }, [fetchSubjects, user?.examLevel]);

  function handleSubjectClick(subjectId) {
    navigate(`/dashboard/subjects/${subjectId}`);
  }

  async function handleLogout() {
    await logout();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 text-gray-600 transition-colors hover:text-black"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-black">Subjects</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Subjects</h2>
          <p className="mt-2 text-gray-600">
            Choose a subject to view topics and start learning
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <button
              key={subject._id}
              onClick={() => handleSubjectClick(subject._id)}
              className="group overflow-hidden rounded-lg border border-gray-200 bg-white p-6 text-left transition-all hover:border-black hover:shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-black">
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
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
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
      </main>
    </div>
  );
}

export default SubjectsPage;
