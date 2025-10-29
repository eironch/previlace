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

function ResumeBuilderPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  function handleBack() {
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
              <h1 className="text-xl font-semibold">Resume Builder</h1>
            </div>
            <span className="text-sm text-gray-600">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Professional Resume Builder</CardTitle>
            <CardDescription>
              Create government-standard resumes for your applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <h3 className="mb-2 text-lg font-medium">Coming Soon</h3>
                <p className="text-gray-600">
                  Resume building tools will be available soon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default ResumeBuilderPage;
