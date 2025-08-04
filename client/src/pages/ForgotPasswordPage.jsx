import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setMessage("");

		try {
			const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (response.ok) {
				setMessage(data.message);
			} else {
				setError(data.error);
			}
		} catch (error) {
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-white flex items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader className="text-center space-y-1">
					<CardTitle className="text-2xl font-semibold">Reset Password</CardTitle>
					<CardDescription>
						Enter your email address and we'll send you a link to reset your password
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{error && (
						<div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
							{error}
						</div>
					)}
					
					{message && (
						<div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
							{message}
						</div>
					)}
					
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="email" className="text-sm font-medium">
								Email
							</label>
							<Input
								id="email"
								type="email"
								placeholder="your@email.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={loading}
							/>
						</div>
						
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? <Spinner className="h-4 w-4" /> : "Send Reset Link"}
						</Button>
					</form>
					
					<div className="text-center text-sm">
						Remember your password?{" "}
						<Link to="/login" className="text-black hover:underline font-medium">
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
