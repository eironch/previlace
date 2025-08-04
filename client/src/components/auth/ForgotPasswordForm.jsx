import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPasswordForm({ onToggleForm }) {
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [error, setError] = useState("");

	const { forgotPassword } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError("");

		try {
			await forgotPassword(email);
			setIsSubmitted(true);
		} catch (err) {
			setError(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isSubmitted) {
		return (
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle>Check Your Email</CardTitle>
					<CardDescription>
						We've sent a password reset link to {email}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="p-4 text-sm border border-green-200 bg-green-50 text-green-700">
						If an account with that email exists, you'll receive a password reset link shortly.
					</div>

					<Button
						type="button"
						variant="outline"
						className="w-full"
						onClick={() => onToggleForm("login")}
					>
						Back to Sign In
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="text-center">
				<CardTitle>Reset Password</CardTitle>
				<CardDescription>
					Enter your email address and we'll send you a reset link
				</CardDescription>
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
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<Button type="submit" className="w-full" disabled={isSubmitting}>
						{isSubmitting ? "Sending..." : "Send Reset Link"}
					</Button>
				</form>

				<div className="text-center">
					<button
						type="button"
						className="text-sm text-muted-foreground hover:text-foreground underline"
						onClick={() => onToggleForm("login")}
					>
						Back to Sign In
					</button>
				</div>
			</CardContent>
		</Card>
	);
}
