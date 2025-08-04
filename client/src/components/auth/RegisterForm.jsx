import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterForm({ onToggleForm }) {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [validationErrors, setValidationErrors] = useState({});

	const { register, openGoogleAuth, error, clearError } = useAuth();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		
		if (validationErrors[name]) {
			setValidationErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
		
		if (error) clearError();
	};

	const validateForm = () => {
		const errors = {};

		if (!formData.firstName.trim()) errors.firstName = "First name is required";
		if (!formData.lastName.trim()) errors.lastName = "Last name is required";
		if (!formData.email.trim()) errors.email = "Email is required";
		if (!formData.password) errors.password = "Password is required";
		else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";
		
		if (formData.password !== formData.confirmPassword) {
			errors.confirmPassword = "Passwords do not match";
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (!validateForm()) return;
		
		setIsSubmitting(true);

		try {
			const { confirmPassword, ...registerData } = formData;
			await register(registerData);
		} catch (error) {
			console.error("Registration failed:", error);
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
				<CardTitle>Create Account</CardTitle>
				<CardDescription>Sign up to get started with your account</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{error && (
					<div className="p-3 text-sm border border-red-200 bg-red-50 text-red-700">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-2">
						<div className="space-y-2">
							<Label htmlFor="firstName">First Name</Label>
							<Input
								id="firstName"
								name="firstName"
								type="text"
								placeholder="John"
								value={formData.firstName}
								onChange={handleChange}
								required
							/>
							{validationErrors.firstName && (
								<p className="text-xs text-red-600">{validationErrors.firstName}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="lastName">Last Name</Label>
							<Input
								id="lastName"
								name="lastName"
								type="text"
								placeholder="Doe"
								value={formData.lastName}
								onChange={handleChange}
								required
							/>
							{validationErrors.lastName && (
								<p className="text-xs text-red-600">{validationErrors.lastName}</p>
							)}
						</div>
					</div>

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
						{validationErrors.email && (
							<p className="text-xs text-red-600">{validationErrors.email}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="Create a password"
							value={formData.password}
							onChange={handleChange}
							required
						/>
						{validationErrors.password && (
							<p className="text-xs text-red-600">{validationErrors.password}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Confirm Password</Label>
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							placeholder="Confirm your password"
							value={formData.confirmPassword}
							onChange={handleChange}
							required
						/>
						{validationErrors.confirmPassword && (
							<p className="text-xs text-red-600">{validationErrors.confirmPassword}</p>
						)}
					</div>

					<Button type="submit" className="w-full" disabled={isSubmitting}>
						{isSubmitting ? "Creating account..." : "Create Account"}
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

				<div className="text-center">
					<div className="text-sm text-muted-foreground">
						Already have an account?{" "}
						<button
							type="button"
							className="text-foreground hover:underline"
							onClick={() => onToggleForm("login")}
						>
							Sign in
						</button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
