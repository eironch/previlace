import { useEffect } from "react";

export default function AuthCallback() {
	useEffect(() => {
		const handleAuthCallback = async () => {
			try {
				const urlParams = new URLSearchParams(window.location.search);
				const success = urlParams.get('success');
				const error = urlParams.get('error');
				const userData = urlParams.get('user');

				if (success === 'true' && userData) {
					const user = JSON.parse(decodeURIComponent(userData));
					
					if (window.opener) {
						window.opener.postMessage({
							type: 'GOOGLE_AUTH_SUCCESS',
							user: user
						}, window.location.origin);
					}
				} else {
					const errorMessage = error || 'Authentication failed';
					
					if (window.opener) {
						window.opener.postMessage({
							type: 'GOOGLE_AUTH_ERROR',
							error: errorMessage
						}, window.location.origin);
					}
				}
			} catch (err) {
				if (window.opener) {
					window.opener.postMessage({
						type: 'GOOGLE_AUTH_ERROR',
						error: 'Failed to process authentication response'
					}, window.location.origin);
				}
			}

			window.close();
		};

		handleAuthCallback();
	}, []);

	return (
		<div className="min-h-screen flex items-center justify-center bg-white">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
				<h2 className="text-lg font-medium text-gray-900 mb-2">
					Completing authentication...
				</h2>
				<p className="text-sm text-gray-500">
					This window will close automatically
				</p>
			</div>
		</div>
	);
}
