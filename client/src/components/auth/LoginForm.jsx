import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginForm({ onToggleForm }) {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { login, openGoogleAuth, error, clearError } = useAuth();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		if (error) clearError();
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await login(formData);
		} catch (error) {
			console.error("Login failed:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleGoogleAuth = async () => {
		try {
			await openGoogleAuth();
		} catch (error) {
			console.error("Google auth failed:", error);
		}
	};

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="text-center">
				<CardTitle>Sign In</CardTitle>
				<CardDescription>Enter your credentials to access your account</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{error && (
					<div className="p-3 text-sm border border-red-200 bg-red-50 text-red-700">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="your@email.com"
							value={formData.email}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="Enter your password"
							value={formData.password}
							onChange={handleChange}
							required
						/>
					</div>

					<Button type="submit" className="w-full" disabled={isSubmitting}>
						{isSubmitting ? "Signing in..." : "Sign In"}
					</Button>
				</form>

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-border" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">Or continue with</span>
					</div>
				</div>

				<Button
					type="button"
					variant="outline"
					className="w-full"
					onClick={handleGoogleAuth}
				>
					Continue with Google
				</Button>

				<div className="text-center space-y-2">
					<button
						type="button"
						className="text-sm text-muted-foreground hover:text-foreground underline"
						onClick={() => onToggleForm("forgot")}
					>
						Forgot your password?
					</button>
					<div className="text-sm text-muted-foreground">
						Don't have an account?{" "}
						<button
							type="button"
							className="text-foreground hover:underline"
							onClick={() => onToggleForm("register")}
						>
							Sign up
						</button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
