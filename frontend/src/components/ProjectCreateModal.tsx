import { useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import { FormInput } from "./FormInput";
import { Button } from "./Button";
import { LoadingIcon } from "./LoadingIcon";
import { createProject } from "../services/api";
import type { ProjectCreate, Project, ApiError } from "../types";

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export function ProjectCreateModal({
  isOpen,
  onClose,
  onProjectCreated,
}: ProjectCreateModalProps) {
  const [formData, setFormData] = useState<ProjectCreate>({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Project name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const newProject = await createProject({
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
      });

      onProjectCreated(newProject);
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
    setFormData({ name: "", description: "" });
    setError("");
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: keyof ProjectCreate, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <FormInput
          id="name"
          label="Project Name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          required
          placeholder="Enter project name (required)"
        />

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Enter project description (optional)"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

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
            disabled={isSubmitting || !formData.name.trim()}
            className="px-6 py-2.5 text-sm font-medium rounded-lg hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <LoadingIcon className="-ml-1 mr-2 h-4 w-4 text-white" />
                Creating...
              </span>
            ) : (
              "Create Project"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
