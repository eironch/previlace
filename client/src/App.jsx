import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import HomePage from "@/pages/HomePage";
import DashboardPage from "@/pages/DashboardPage";
import AuthPage from "@/pages/AuthPage";
import AuthCallback from "@/components/auth/AuthCallback";
import OnboardingPage from './pages/OnboardingPage';

function App() {
	return (
		<AuthProvider>
			<Routes>
				<Route path="/auth" element={<AuthPage />} />
				<Route path="/auth/callback" element={<AuthCallback />} />
				<Route path="/" element={<HomePage />} />
				<Route path="onboarding" element={<OnboardingPage />} />
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<DashboardPage />
						</ProtectedRoute>
					}
				/>
				<Route path="*" element={<div className="min-h-screen bg-background flex items-center justify-center"><p>Page not found</p></div>} />
			</Routes>
		</AuthProvider>
	);
}

export default App;
