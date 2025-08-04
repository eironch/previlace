import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
	const { user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (user) {
			navigate("/dashboard");
		}
	}, [user, navigate]);

	return (
		<div className="min-h-screen bg-white">
			<header className="border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div className="flex items-center">
							<h1 className="text-xl font-semibold">Previlace</h1>
						</div>
						<div className="flex items-center space-x-3">
							<Link to="/login">
								<Button variant="outline" size="sm">Sign In</Button>
							</Link>
							<Link to="/register">
								<Button size="sm">Get Started</Button>
							</Link>
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<section className="py-16 text-center">
					<h1 className="text-4xl font-semibold mb-4">
						Master the Civil Service Exam
					</h1>
					<p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
						AI-enhanced preparation platform with adaptive testing, job matching, 
						and comprehensive career support for government service.
					</p>
					<div className="flex justify-center space-x-3">
						<Link to="/register">
							<Button size="lg">Start Learning</Button>
						</Link>
						<Link to="/login">
							<Button variant="outline" size="lg">Sign In</Button>
						</Link>
					</div>
				</section>

				<section className="py-12">
					<h2 className="text-2xl font-semibold text-center mb-8">
						Everything You Need to Succeed
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">AI-Enhanced Learning</CardTitle>
								<CardDescription>
									Personalized questions and adaptive testing powered by artificial intelligence
								</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Progress Tracking</CardTitle>
								<CardDescription>
									Monitor your progress with detailed analytics and performance insights
								</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Job Matching</CardTitle>
								<CardDescription>
									Find relevant government positions that match your qualifications
								</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Resume Builder</CardTitle>
								<CardDescription>
									Create professional resumes optimized for government applications
								</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Interview Prep</CardTitle>
								<CardDescription>
									Practice with government-specific interview questions and feedback
								</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Success Tracking</CardTitle>
								<CardDescription>
									Follow your journey from exam preparation to career placement
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</section>

				<section className="py-12 text-center">
					<div className="bg-gray-50 rounded-lg p-8">
						<h2 className="text-2xl font-semibold mb-3">
							Ready to Start Your Journey?
						</h2>
						<p className="text-gray-600 mb-6">
							Join thousands of successful Civil Service Exam takers
						</p>
						<Link to="/register">
							<Button size="lg">Create Your Free Account</Button>
						</Link>
					</div>
				</section>
			</main>

			<footer className="border-t mt-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="text-center text-gray-500 text-sm">
						<p>&copy; 2025 Previlace. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
