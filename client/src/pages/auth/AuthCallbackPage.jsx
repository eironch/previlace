import { useEffect } from "react";

function AuthCallbackPage() {
  useEffect(() => {
    handleAuthCallback();
  }, []);

  async function handleAuthCallback() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get("success");
      const error = urlParams.get("error");
      const userData = urlParams.get("user");

      if (success === "true" && userData) {
        const user = JSON.parse(decodeURIComponent(userData));

        if (window.opener) {
          window.opener.postMessage(
            {
              type: "GOOGLE_AUTH_SUCCESS",
              user: user,
            },
            window.location.origin
          );
        }
      } else {
        const errorMessage = error || "Authentication failed";

        if (window.opener) {
          window.opener.postMessage(
            {
              type: "GOOGLE_AUTH_ERROR",
              error: errorMessage,
            },
            window.location.origin
          );
        }
      }
    } catch (err) {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "GOOGLE_AUTH_ERROR",
            error: "Failed to process authentication response",
          },
          window.location.origin
        );
      }
    }

    window.close();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <h2 className="mb-2 text-lg font-medium text-gray-900">
          Completing authentication...
        </h2>
        <p className="text-sm text-gray-500">
          This window will close automatically
        </p>
      </div>
    </div>
  );
}

export default AuthCallbackPage;
