import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";

export default function LoginForm() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { login, handleGoogleAuth, error, clearError, isLoading } = useAuthStore();
	const { setCurrentAuthForm, closeAuthModal } = useAppStore();

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
			const result = await login(formData);
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
				<h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
				<p className="text-gray-600 mt-2">Enter your credentials to access your account</p>
			</div>
			
			<div className="space-y-4">
				{error && (
					<div className="p-3 text-sm border border-red-200 bg-red-50 text-red-700 rounded-md">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
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
					</div>

					<div className="space-y-2">
						<label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="Enter your password"
							value={formData.password}
							onChange={handleChange}
							required
							disabled={disabled}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
						/>
					</div>

					<Button 
						type="submit" 
						className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
						disabled={disabled}
					>
						{disabled ? "Signing in..." : "Sign In"}
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

				<div className="text-center space-y-2">
					<button
						type="button"
						className="text-sm text-gray-500 hover:text-gray-700 underline"
						onClick={() => setCurrentAuthForm("forgot")}
						disabled={disabled}
					>
						Forgot your password?
					</button>
					<div className="text-sm text-gray-600">
						Don't have an account?{" "}
						<button
							type="button"
							className="text-gray-900 hover:underline font-medium"
							onClick={() => setCurrentAuthForm("register")}
							disabled={disabled}
						>
							Sign up
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
