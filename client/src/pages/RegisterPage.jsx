import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		firstName: "",
		lastName: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [googleLoading, setGoogleLoading] = useState(false);

	const { register, loginWithGoogle, user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (user) {
			navigate("/dashboard");
		}
	}, [user, navigate]);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		const result = await register(formData);
		
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
					<CardTitle className="text-2xl font-semibold">Create Account</CardTitle>
					<CardDescription>Sign up to get started</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{error && (
						<div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
							{error}
						</div>
					)}
					
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-2">
								<label htmlFor="firstName" className="text-sm font-medium">
									First Name
								</label>
								<Input
									id="firstName"
									name="firstName"
									type="text"
									placeholder="John"
									value={formData.firstName}
									onChange={handleChange}
									required
									disabled={loading}
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="lastName" className="text-sm font-medium">
									Last Name
								</label>
								<Input
									id="lastName"
									name="lastName"
									type="text"
									placeholder="Doe"
									value={formData.lastName}
									onChange={handleChange}
									required
									disabled={loading}
								/>
							</div>
						</div>
						
						<div className="space-y-2">
							<label htmlFor="email" className="text-sm font-medium">
								Email
							</label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="your@email.com"
								value={formData.email}
								onChange={handleChange}
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
								name="password"
								type="password"
								placeholder="At least 6 characters"
								value={formData.password}
								onChange={handleChange}
								required
								disabled={loading}
								minLength={6}
							/>
						</div>
						
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? <Spinner className="h-4 w-4" /> : "Create Account"}
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
					
					<div className="text-center text-sm">
						Already have an account?{" "}
						<Link to="/login" className="text-black hover:underline font-medium">
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
