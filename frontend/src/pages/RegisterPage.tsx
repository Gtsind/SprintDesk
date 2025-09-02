import { useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FormInput } from "../components/FormInput";
import { Button } from "../components/Button";
import { register } from "../services/api";
import type { UserRegistration, ApiError } from "../types";

interface RegisterPageProps {
  navigate: (page: string) => void;
}

export function RegisterPage({ navigate }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstname: "",
    lastname: "",
    email: "",
    title: "",
  });
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const { login } = useAuth();

  const handleInputChange =
    (field: keyof typeof formData) => (e: ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !formData.username ||
      !formData.password ||
      !formData.firstname ||
      !formData.lastname ||
      !formData.email
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setIsRegistering(true);

    try {
      const userData: UserRegistration = {
        ...formData,
        title: formData.title || null,
      };

      await register(userData);

      // Auto-login after successful registration, or go to login page if registration was successful but login was not
      const loginSuccess = await login(formData.username, formData.password);
      navigate(loginSuccess ? "dashboard" : "login");
    } catch (error: unknown) {
      const apiError = error as ApiError | undefined;
      if (apiError?.detail) {
        setError(
          apiError.detail.includes("String")
            ? "Password must have at least 8 characters."
            : apiError.detail
        );
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join SprintDesk
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                id="firstname"
                type="text"
                label="First Name"
                placeholder="Enter your first name"
                value={formData.firstname}
                onChange={handleInputChange("firstname")}
                required
              />
              <FormInput
                id="lastname"
                type="text"
                label="Last Name"
                placeholder="Enter your last name"
                value={formData.lastname}
                onChange={handleInputChange("lastname")}
                required
              />
            </div>

            <FormInput
              id="username"
              type="text"
              label="Username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleInputChange("username")}
              required
            />

            <FormInput
              id="email"
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange("email")}
              required
            />

            <FormInput
              id="title"
              type="text"
              label="Job Title (Optional)"
              placeholder="e.g. Software Developer"
              value={formData.title}
              onChange={handleInputChange("title")}
            />

            <FormInput
              id="password"
              type="password"
              label="Password"
              placeholder="Choose a password (Must be at least 8 characters long)"
              value={formData.password}
              onChange={handleInputChange("password")}
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <Button
              type="submit"
              disabled={isRegistering}
              className="w-full justify-center"
            >
              {isRegistering ? "Creating account..." : "Create account"}
            </Button>

            <div className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("login")}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Sign in
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
