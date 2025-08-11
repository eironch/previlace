import { useAppStore } from "@/store/appStore";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function AuthModal() {
	const { currentAuthForm, closeAuthModal } = useAppStore();

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
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-md relative">
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
