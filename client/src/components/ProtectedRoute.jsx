import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";

export function ProtectedRoute({ children }) {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return children;
}

export function PublicRoute({ children }) {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (user) {
		return <Navigate to="/dashboard" replace />;
	}

	return children;
}
