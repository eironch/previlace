import { useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/pages/AuthPage";

export default function ProtectedRoute({ children }) {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <AuthPage />;
	}

	return children;
}
