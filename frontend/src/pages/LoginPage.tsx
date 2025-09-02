import { useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FormInput } from "../components/FormInput";
import { Button } from "../components/Button";

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

    const success = await login(username, password);
    if (success) {
      navigate("dashboard");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to SprintDesk
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
              className="w-full justify-center"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("register")}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
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
