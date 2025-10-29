import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/button";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, handleGoogleAuth, error, clearError, isLoading } =
    useAuthStore();
  const navigate = useNavigate();
  const { setCurrentAuthForm, closeAuthModal } = useAppStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await login(formData);
      if (result.success) {
        closeAuthModal();
        // navigate based on the updated user state stored in localStorage
        try {
          const stored = localStorage.getItem("user_data");
          if (stored) {
            const user = JSON.parse(stored);
            if (!user.isProfileComplete) {
              navigate("/onboarding");
            } else if (user.role === "admin") {
              navigate("/admin");
            } else {
              navigate("/dashboard");
            }
          } else {
            navigate("/");
          }
        } catch {
          navigate("/");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = () => {
    closeAuthModal();
    handleGoogleAuth();
  };

  const disabled = isSubmitting || isLoading;

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
        <p className="mt-2 text-gray-600">
          Enter your credentials to access your account
        </p>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={disabled}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={disabled}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-md bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
          >
            {disabled ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full rounded-md border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
          onClick={handleGoogleClick}
          disabled={disabled}
        >
          Continue with Google
        </Button>

        <div className="space-y-2 text-center">
          <button
            type="button"
            className="text-sm text-gray-500 underline hover:text-gray-700"
            onClick={() => setCurrentAuthForm("forgot")}
            disabled={disabled}
          >
            Forgot your password?
          </button>
          <div className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              className="font-medium text-gray-900 hover:underline"
              onClick={() => setCurrentAuthForm("register")}
              disabled={disabled}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
