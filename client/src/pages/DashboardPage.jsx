import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
	const { user, logout } = useAuth();

	const handleLogout = async () => {
		await logout();
	};

	return (
		<div className="min-h-screen bg-white">
			<header className="border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
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

			<main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h2 className="text-2xl font-semibold mb-2">
						Welcome back, {user?.firstName}
					</h2>
					<p className="text-gray-600">
						Ready to continue your Civil Service Exam preparation?
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Practice Tests</CardTitle>
							<CardDescription>
								Take practice exams to test your knowledge
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button className="w-full">Start Practice</Button>
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
							<Button className="w-full">Browse Materials</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Progress Tracking</CardTitle>
							<CardDescription>
								Monitor your learning progress
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button className="w-full">View Progress</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Job Opportunities</CardTitle>
							<CardDescription>
								Explore government job openings
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button className="w-full">Find Jobs</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Resume Builder</CardTitle>
							<CardDescription>
								Create professional resumes
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button className="w-full">Build Resume</Button>
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
							<Button className="w-full">Start Prep</Button>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}
