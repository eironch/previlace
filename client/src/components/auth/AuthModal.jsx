import { useAppStore } from "@/store/appStore";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import Modal from "@/components/ui/Modal";

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
		<Modal
			isOpen={true}
			onClose={closeAuthModal}
			maxWidth="max-w-md"
		>
			<div className="p-2">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold tracking-tight">Previlace</h1>
					<p className="text-gray-500 mt-2">Welcome</p>
				</div>
				{renderForm()}
			</div>
		</Modal>
	);
}
