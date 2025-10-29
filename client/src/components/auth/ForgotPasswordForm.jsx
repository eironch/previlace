import { useState } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/Input";

import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const { forgotPassword } = useAuthStore();
  const { setCurrentAuthForm } = useAppStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
          <p className="mt-2 text-gray-600">
            We've sent a password reset link to {email}
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            If an account with that email exists, you'll receive a password
            reset link shortly.
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-md border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
            onClick={() => setCurrentAuthForm("login")}
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
        <p className="mt-2 text-gray-600">
          Enter your email address and we'll send you a reset link
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-md bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            className="text-sm text-gray-500 underline hover:text-gray-700"
            onClick={() => setCurrentAuthForm("login")}
            disabled={isSubmitting}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
