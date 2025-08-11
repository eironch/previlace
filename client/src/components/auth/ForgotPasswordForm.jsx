import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";

export default function ForgotPasswordForm() {
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [error, setError] = useState("");

	const { forgotPassword } = useAuthStore();
	const { setCurrentAuthForm } = useAppStore();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError("");

		try {
			const result = await forgotPassword(email);
			if (result.success) {
				setIsSubmitted(true);
			} else {
				setError(result.error);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isSubmitted) {
		return (
			<div className="w-full max-w-md">
				<div className="text-center mb-6">
					<h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
					<p className="text-gray-600 mt-2">
						We've sent a password reset link to {email}
					</p>
				</div>
				
				<div className="space-y-4">
					<div className="p-4 text-sm border border-green-200 bg-green-50 text-green-700 rounded-md">
						If an account with that email exists, you'll receive a password reset link shortly.
					</div>

					<Button
						type="button"
						variant="outline"
						className="w-full border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
						onClick={() => setCurrentAuthForm("login")}
					>
						Back to Sign In
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full max-w-md">
			<div className="text-center mb-6">
				<h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
				<p className="text-gray-600 mt-2">
					Enter your email address and we'll send you a reset link
				</p>
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
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={isSubmitting}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
						/>
					</div>

					<Button 
						type="submit" 
						className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
						disabled={isSubmitting}
					>
						{isSubmitting ? "Sending..." : "Send Reset Link"}
					</Button>
				</form>

				<div className="text-center">
					<button
						type="button"
						className="text-sm text-gray-500 hover:text-gray-700 underline"
						onClick={() => setCurrentAuthForm("login")}
						disabled={isSubmitting}
					>
						Back to Sign In
					</button>
				</div>
			</div>
		</div>
	);
}
