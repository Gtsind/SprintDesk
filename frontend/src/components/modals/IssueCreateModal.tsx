import { useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import { FormInput } from "../ui/FormInput";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";
import { LoadingIcon } from "../ui/LoadingIcon";
import { createIssue } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import type { IssueCreate, Issue, ApiError, User } from "../../types";

interface IssueCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIssueCreated: (issue: Issue) => void;
  projectId: number;
  projectMembers: User[];
}

type Priority = "Low" | "Medium" | "High" | "Critical";
const priorities: Priority[] = ["Low", "Medium", "High", "Critical"];

export function IssueCreateModal({
  isOpen,
  onClose,
  onIssueCreated,
  projectId,
  projectMembers,
}: IssueCreateModalProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as Priority,
    assignee_id: undefined as number | undefined,
    time_estimate: undefined as number | undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Issue title is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const issueData: IssueCreate = {
        project_id: projectId,
        title: formData.title.trim(),
        description: formData.description?.trim()
          ? formData.description.trim()
          : undefined,
        priority: formData.priority,
        assignee_id: formData.assignee_id || undefined,
        time_estimate: formData.time_estimate || undefined,
      };

      const newIssue = await createIssue(issueData);
      onIssueCreated(newIssue);
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
      title: "",
      description: "",
      priority: "Medium" as Priority,
      assignee_id: undefined as number | undefined,
      time_estimate: undefined as number | undefined,
    });
    setError("");
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (
    field: string,
    value: string | number | undefined | Priority
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAssignToMe = () => {
    if (user) {
      setFormData((prev) => ({ ...prev, assignee_id: user.id }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Issue">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Title */}
        <FormInput
          id="title"
          label="Title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          required
          placeholder="Enter issue title (required)"
        />

        {/* Description */}
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
            placeholder="Enter issue description (optional)"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Priority */}
        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Priority
          </label>
          <div className="flex items-center space-x-3">
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) =>
                handleInputChange("priority", e.target.value as Priority)
              }
              className="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            <StatusBadge status={formData.priority} type="priority" />
          </div>
        </div>

        {/* Time Estimate */}
        <div>
          <label
            htmlFor="time_estimate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Time Estimate (hours)
          </label>
          <input
            id="time_estimate"
            type="number"
            min="0"
            value={formData.time_estimate?.toString() || ""}
            onChange={(e) => {
              const value = e.target.value
                ? parseInt(e.target.value)
                : undefined;
              handleInputChange("time_estimate", value);
            }}
            placeholder="Enter estimated hours (optional)"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Assignee */}
        <div>
          <label
            htmlFor="assignee"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Assignee
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
            <select
              id="assignee"
              value={formData.assignee_id || ""}
              onChange={(e) => {
                const value = e.target.value
                  ? parseInt(e.target.value)
                  : undefined;
                handleInputChange("assignee_id", value);
              }}
              className="block flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">Unassigned</option>
              {projectMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstname} {member.lastname} (@{member.username})
                </option>
              ))}
            </select>
            {user && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleAssignToMe}
                disabled={isSubmitting}
                className="whitespace-nowrap px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-150 sm:flex-shrink-0"
              >
                Assign to me
              </Button>
            )}
          </div>
        </div>

        {/* Form Actions */}
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
            disabled={isSubmitting || !formData.title.trim()}
            className="px-6 py-2.5 text-sm font-medium rounded-lg hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <LoadingIcon className="-ml-1 mr-2 h-4 w-4 text-white" />
                Creating...
              </span>
            ) : (
              "Create Issue"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
