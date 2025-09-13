import { useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import { FormInput } from "../ui/FormInput";
import { Button } from "../ui/Button";
import { LoadingIcon } from "../ui/LoadingIcon";
import { createUser } from "../../services/api";
import type { User, UserCreate, ApiError } from "../../types";

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: User) => void;
}

export function UserCreateModal({
  isOpen,
  onClose,
  onUserCreated,
}: UserCreateModalProps) {
  const [formData, setFormData] = useState<UserCreate>({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    title: "",
    role: "Contributor",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError("");

    try {
      const userData: UserCreate = {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        title: formData.title.trim(),
        role: formData.role,
        password: formData.password,
      };

      // Create user using the extended data, but call it with UserRegistration interface
      const newUser = await createUser(userData);

      onUserCreated(newUser);
      handleClose();
    } catch (error: unknown) {
      if (error && typeof error === "object" && "detail" in error) {
        setError((error as ApiError).detail);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstname: "",
      lastname: "",
      username: "",
      email: "",
      title: "",
      role: "Contributor",
      password: "",
    });
    setError("");
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: keyof UserCreate, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    formData.firstname.trim() &&
    formData.lastname.trim() &&
    formData.username.trim() &&
    formData.email.trim() &&
    formData.title.trim() &&
    formData.password.length >= 8;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New User">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            id="firstname"
            label="First Name"
            type="text"
            value={formData.firstname}
            onChange={(e) => handleInputChange("firstname", e.target.value)}
            required
            placeholder="Enter first name"
          />

          <FormInput
            id="lastname"
            label="Last Name"
            type="text"
            value={formData.lastname}
            onChange={(e) => handleInputChange("lastname", e.target.value)}
            required
            placeholder="Enter last name"
          />
        </div>

        <FormInput
          id="username"
          label="Username"
          type="text"
          value={formData.username}
          onChange={(e) => handleInputChange("username", e.target.value)}
          required
          placeholder="Enter username"
        />

        <FormInput
          id="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          required
          placeholder="Enter email address"
        />

        <FormInput
          id="title"
          label="Title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          required
          placeholder="Enter job title"
        />

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Role
          </label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => handleInputChange("role", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
            required
          >
            <option value="Contributor">Contributor</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <FormInput
          id="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          required
          placeholder="Enter password (min. 8 characters)"
        />

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="px-6 py-2.5 text-sm font-medium rounded-lg hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <LoadingIcon className="-ml-1 mr-2 h-4 w-4 text-white" />
                Creating...
              </span>
            ) : (
              "Create User"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
