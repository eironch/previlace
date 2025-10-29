import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await logout();
  }

  function handleStartPractice() {
    navigate("/dashboard/quiz");
  }

  function handleBrowseMaterials() {
    navigate("/dashboard/study-plan");
  }

  function handleViewProgress() {
    navigate("/dashboard/analytics");
  }

  function handleFindJobs() {
    navigate("/dashboard/jobs");
  }

  function handleBuildResume() {
    navigate("/dashboard/resume");
  }

  function handleStartPrep() {
    navigate("/dashboard/interview-prep");
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Previlace</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-semibold">
            Welcome back, {user?.firstName}
          </h2>
          <p className="text-gray-600">
            Ready to continue your Civil Service Exam preparation?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Practice Tests</CardTitle>
              <CardDescription>
                Take practice exams to test your knowledge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleStartPractice}>
                Start Practice
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Study Materials</CardTitle>
              <CardDescription>
                Access comprehensive study resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleBrowseMaterials}>
                Browse Materials
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress Tracking</CardTitle>
              <CardDescription>Monitor your learning progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleViewProgress}>
                View Progress
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Opportunities</CardTitle>
              <CardDescription>Explore government job openings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleFindJobs}>
                Find Jobs
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resume Builder</CardTitle>
              <CardDescription>Create professional resumes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleBuildResume}>
                Build Resume
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interview Prep</CardTitle>
              <CardDescription>
                Prepare for government interviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleStartPrep}>
                Start Prep
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
