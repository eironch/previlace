import { useEffect } from "react";

const AuthCallback = () => {
	useEffect(() => {
		const handleCallback = () => {
			try {
				if (window.opener && !window.opener.closed) {
					setTimeout(() => {
						window.close();
					}, 3000);
				} else {
					window.location.href = '/';
				}
			} catch (error) {
				window.location.href = '/?error=auth_callback_failed';
			}
		};

		handleCallback();
	}, []);

	return (
		<div className="flex items-center justify-center min-h-screen bg-background">
			<div className="text-center space-y-4 bg-card p-8 rounded-lg shadow-lg max-w-md mx-auto">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
				<h2 className="text-xl font-semibold text-foreground">Authentication Successful</h2>
				<p className="text-muted-foreground">Completing your login process...</p>
				<p className="text-sm text-muted-foreground">This window will close automatically.</p>
			</div>
		</div>
	);
};

export default AuthCallback;
