import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";

export default function RegisterForm() {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [validationErrors, setValidationErrors] = useState({});

	const { register, handleGoogleAuth, error, clearError, isLoading } = useAuthStore();
	const { setCurrentAuthForm, closeAuthModal } = useAppStore();

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
			const result = await register(registerData);
			if (result.success) {
				closeAuthModal();
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleGoogleClick = () => {
		closeAuthModal();
		handleGoogleAuth();
	};

	const disabled = isSubmitting || isLoading;

	return (
		<div className="w-full max-w-md">
			<div className="text-center mb-6">
				<h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
				<p className="text-gray-600 mt-2">Sign up to get started with your account</p>
			</div>
			
			<div className="space-y-4">
				{error && (
					<div className="p-3 text-sm border border-red-200 bg-red-50 text-red-700 rounded-md">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</label>
							<Input
								id="firstName"
								name="firstName"
								type="text"
								placeholder="John"
								value={formData.firstName}
								onChange={handleChange}
								required
								disabled={disabled}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
							/>
							{validationErrors.firstName && (
								<p className="text-xs text-red-600">{validationErrors.firstName}</p>
							)}
						</div>

						<div className="space-y-2">
							<label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</label>
							<Input
								id="lastName"
								name="lastName"
								type="text"
								placeholder="Doe"
								value={formData.lastName}
								onChange={handleChange}
								required
								disabled={disabled}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
							/>
							{validationErrors.lastName && (
								<p className="text-xs text-red-600">{validationErrors.lastName}</p>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="your@email.com"
							value={formData.email}
							onChange={handleChange}
							required
							disabled={disabled}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
						/>
						{validationErrors.email && (
							<p className="text-xs text-red-600">{validationErrors.email}</p>
						)}
					</div>

					<div className="space-y-2">
						<label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="Create a password"
							value={formData.password}
							onChange={handleChange}
							required
							disabled={disabled}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
						/>
						{validationErrors.password && (
							<p className="text-xs text-red-600">{validationErrors.password}</p>
						)}
					</div>

					<div className="space-y-2">
						<label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</label>
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							placeholder="Confirm your password"
							value={formData.confirmPassword}
							onChange={handleChange}
							required
							disabled={disabled}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
						/>
						{validationErrors.confirmPassword && (
							<p className="text-xs text-red-600">{validationErrors.confirmPassword}</p>
						)}
					</div>

					<Button 
						type="submit" 
						className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
						disabled={disabled}
					>
						{disabled ? "Creating account..." : "Create Account"}
					</Button>
				</form>

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-gray-300" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-white px-2 text-gray-500">Or continue with</span>
					</div>
				</div>

				<Button
					type="button"
					variant="outline"
					className="w-full border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
					onClick={handleGoogleClick}
					disabled={disabled}
				>
					Continue with Google
				</Button>

				<div className="text-center">
					<div className="text-sm text-gray-600">
						Already have an account?{" "}
						<button
							type="button"
							className="text-gray-900 hover:underline font-medium"
							onClick={() => setCurrentAuthForm("login")}
							disabled={disabled}
						>
							Sign in
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
