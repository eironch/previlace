import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [googleLoading, setGoogleLoading] = useState(false);
	
	const { login, loginWithGoogle, user } = useAuth();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	useEffect(() => {
		if (user) {
			navigate("/dashboard");
		}
	}, [user, navigate]);

	useEffect(() => {
		const error = searchParams.get("error");
		if (error === "google_auth_failed") {
			setError("Google authentication failed. Please try again.");
		} else if (error === "auth_failed") {
			setError("Authentication failed. Please try again.");
		}
	}, [searchParams]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		const result = await login(email, password);
		
		if (result.success) {
			navigate("/dashboard");
		} else {
			setError(result.error);
		}
		
		setLoading(false);
	};

	const handleGoogleLogin = async () => {
		setGoogleLoading(true);
		setError("");
		
		try {
			const result = await loginWithGoogle();
			if (result.success) {
				navigate("/dashboard");
			}
		} catch (error) {
			setError(error.message);
		} finally {
			setGoogleLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-white flex items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader className="text-center space-y-1">
					<CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
					<CardDescription>Enter your credentials to continue</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{error && (
						<div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
							{error}
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
						
						<div className="space-y-2">
							<label htmlFor="password" className="text-sm font-medium">
								Password
							</label>
							<Input
								id="password"
								type="password"
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={loading}
							/>
						</div>
						
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? <Spinner className="h-4 w-4" /> : "Sign In"}
						</Button>
					</form>
					
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-white px-2 text-gray-500">Or</span>
						</div>
					</div>
					
					<Button
						type="button"
						variant="outline"
						className="w-full"
						onClick={handleGoogleLogin}
						disabled={googleLoading}
					>
						{googleLoading ? <Spinner className="h-4 w-4" /> : "Continue with Google"}
					</Button>
					
					<div className="text-center text-sm space-y-2">
						<Link to="/forgot-password" className="text-black hover:underline">
							Forgot your password?
						</Link>
						<div>
							Don't have an account?{" "}
							<Link to="/register" className="text-black hover:underline font-medium">
								Sign up
							</Link>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
