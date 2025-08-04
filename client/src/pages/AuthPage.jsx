import { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function AuthPage() {
	const [currentForm, setCurrentForm] = useState("login");

	const renderForm = () => {
		switch (currentForm) {
			case "register":
				return <RegisterForm onToggleForm={setCurrentForm} />;
			case "forgot":
				return <ForgotPasswordForm onToggleForm={setCurrentForm} />;
			default:
				return <LoginForm onToggleForm={setCurrentForm} />;
		}
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold tracking-tight">Previlace</h1>
					<p className="text-muted-foreground mt-2">Welcome</p>
				</div>
				{renderForm()}
			</div>
		</div>
	);
}
