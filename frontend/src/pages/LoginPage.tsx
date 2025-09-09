import { useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FormInput } from "../components/ui/FormInput";
import { Button } from "../components/ui/Button";
import type { ApiError } from "../types";

interface LoginPageProps {
  navigate: (page: string) => void;
}

export function LoginPage({ navigate }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const success = await login(username, password);
      if (success) navigate("dashboard");
    } catch (error: unknown) {
      const apiError = error as ApiError | undefined;
      if (apiError?.detail) {
        setError(apiError.detail);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            Welcome to SprintDesk
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <form
          className="mt-6 sm:mt-8 space-y-4 sm:space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="rounded-md space-y-4">
            <FormInput
              id="username"
              type="text"
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <FormInput
              id="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full justify-center py-3 text-base sm:text-sm"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="mt-4 sm:mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("register")}
                className="text-indigo-600 hover:text-indigo-500 font-medium underline-offset-2 hover:underline"
              >
                Sign up
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
