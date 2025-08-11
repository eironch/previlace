import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import HomePage from "@/pages/HomePage";
import DashboardPage from "@/pages/DashboardPage";
import OnboardingPage from "@/pages/OnboardingPage";
import AuthModal from "@/components/auth/AuthModal";

function App() {
	const { isAuthenticated, user, initializeAuth } = useAuthStore();
	const { showAuthModal } = useAppStore();

	useEffect(() => {
		initializeAuth();
	}, [initializeAuth]);

	const renderMainContent = () => {
		if (!isAuthenticated) {
			return <HomePage />;
		}

		if (!user?.isProfileComplete) {
			return <OnboardingPage />;
		}

		return <DashboardPage />;
	};

	return (
		<>
			<div className="min-h-screen bg-white">
				{renderMainContent()}
			</div>

			{showAuthModal && <AuthModal />}
		</>
	);
}

export default App;
