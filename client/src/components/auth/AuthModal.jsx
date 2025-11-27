import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function AuthModal() {
	const { currentAuthForm, closeAuthModal } = useAppStore();

	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "unset";
		};
	}, []);

	const renderForm = () => {
		switch (currentAuthForm) {
			case "register":
				return <RegisterForm />;
			case "forgot":
				return <ForgotPasswordForm />;
			default:
				return <LoginForm />;
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			<div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
				<button
					onClick={closeAuthModal}
					className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10"
				>
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				<div className="p-8">
					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold tracking-tight">Previlace</h1>
						<p className="text-gray-500 mt-2">Welcome</p>
					</div>
					{renderForm()}
				</div>
			</div>
		</div>
	);
}
