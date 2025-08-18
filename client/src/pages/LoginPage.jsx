import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth";
import { useAppStore } from "@/store/appStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { login, loginWithGoogle, user, clearError } = useAuth();
  const { setShowAuthModal } = useAppStore();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    if (error === "google_auth_failed") {
      setError("Google authentication failed. Please try again.");
    } else if (error === "auth_failed") {
      setError("Authentication failed. Please try again.");
    }
  }, []);

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password, clearError, error]);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    login(email, password).then((result) => {
      if (!result.success) {
        setError(result.error);
      }
      setLoading(false);
    });
  }

  function handleGoogleLogin() {
    setGoogleLoading(true);
    setError("");
    
    loginWithGoogle().catch((error) => {
      setError(error.message);
    }).finally(() => {
      setGoogleLoading(false);
    });
  }

  function handleShowRegister() {
    setShowAuthModal(true);
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner className="h-4 w-4" /> : "Sign In"}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? <Spinner className="h-4 w-4" /> : "Continue with Google"}
          </Button>
          
          <div className="text-center text-sm space-y-2">
            <button 
              type="button"
              className="text-black hover:underline"
              onClick={() => setError("Password reset functionality will be available soon.")}
            >
              Forgot your password?
            </button>
            <div>
              Don't have an account?{" "}
              <button 
                type="button"
                onClick={handleShowRegister}
                className="text-black hover:underline font-medium"
              >
                Sign up
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
