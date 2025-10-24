import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { register, handleGoogleAuth, error, clearError, isLoading } =
    useAuthStore();
  const { setCurrentAuthForm, closeAuthModal } = useAppStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (error) clearError();
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6)
      errors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { registerData } = formData;
      const result = await register(registerData);
      if (result.success) {
        closeAuthModal();
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
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="mt-2 text-gray-600">
          Sign up to get started with your account
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
            {validationErrors.email && (
              <p className="text-xs text-red-600">{validationErrors.email}</p>
            )}
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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={disabled}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none"
            />
            {validationErrors.password && (
              <p className="text-xs text-red-600">
                {validationErrors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={disabled}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none"
            />
            {validationErrors.confirmPassword && (
              <p className="text-xs text-red-600">
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full rounded-md bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
          >
            {disabled ? "Creating account..." : "Create Account"}
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

        <div className="text-center">
          <div className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              className="font-medium text-gray-900 hover:underline"
              onClick={() => setCurrentAuthForm("login")}
              disabled={disabled}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
