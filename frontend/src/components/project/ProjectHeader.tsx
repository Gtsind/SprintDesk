import { ActionButtons } from "../ui/ActionButtons";
import { ProjectStatusDropdown } from "./ProjectStatusDropdown";
import { useInlineEdit } from "../../hooks/useInlineEdit";
import type { Project, ProjectUpdate } from "../../types";

interface ProjectHeaderProps {
  project: Project | null;
  onUpdate: (updateData: ProjectUpdate) => Promise<void>;
  onDelete: () => void;
  onError: (message: string) => void;
  isDeleting: boolean;
  error?: string;
}

export function ProjectHeader({
  project,
  onUpdate,
  onDelete,
  onError,
  isDeleting,
  error,
}: ProjectHeaderProps) {
  const titleEditor = useInlineEdit({
    initialValue: project?.name || "",
    onSave: async (newName: string) => {
      await onUpdate({ name: newName });
    },
    onError,
    validate: (value: string) => {
      if (!value.trim()) {
        return "Project name cannot be empty. The title has been reverted to its previous value.";
      }
      return null;
    },
  });

  const descriptionEditor = useInlineEdit({
    initialValue: project?.description || "",
    onSave: async (newDescription: string) => {
      await onUpdate({ description: newDescription });
    },
    onError,
    placeholder: "Add a project description...",
  });

  const handleStatusChange = async (status: ProjectUpdate["status"]) => {
    if (status) {
      await onUpdate({ status });
    }
  };

  return (
    <div className="mb-8 flex justify-between items-start">
      <div className="flex-1">
        {titleEditor.isEditing ? (
          <input
            type="text"
            value={titleEditor.value}
            onChange={(e) => titleEditor.setValue(e.target.value)}
            onKeyDown={(e) => titleEditor.handleKeyDown(e)}
            onBlur={titleEditor.handleSave}
            className="text-3xl font-semibold text-gray-900 bg-transparent border-none px-2 py-1 w-full focus:outline-none mb-2"
            placeholder="Project name"
            autoFocus
            disabled={titleEditor.isSaving}
          />
        ) : (
          <h1
            className="text-3xl font-semibold text-gray-900 mb-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
            onClick={titleEditor.startEditing}
          >
            {project?.name || "Project"}
          </h1>
        )}

        {descriptionEditor.isEditing ? (
          <textarea
            value={descriptionEditor.value}
            onChange={(e) => descriptionEditor.setValue(e.target.value)}
            onKeyDown={(e) => descriptionEditor.handleKeyDown(e, true)}
            onBlur={descriptionEditor.handleSave}
            className="w-full text-gray-700 bg-transparent p-2 focus:outline-none whitespace-pre-wrap text-lg mb-3 rounded-md"
            placeholder="Add a project description..."
            autoFocus
            disabled={descriptionEditor.isSaving}
            rows={3}
          />
        ) : project?.description ? (
          <p
            className="text-gray-700 whitespace-pre-wrap text-lg mb-3 cursor-pointer hover:bg-gray-50 rounded p-2"
            onClick={descriptionEditor.startEditing}
          >
            {project.description}
          </p>
        ) : (
          <p
            className="text-gray-500 italic text-lg mb-3 cursor-pointer hover:bg-gray-50 rounded p-2"
            onClick={descriptionEditor.startEditing}
          >
            Add a project description...
          </p>
        )}

        <div className="mb-3">
          {project && (
            <ProjectStatusDropdown
              currentStatus={project.status}
              onUpdate={async ({ status }) => {
                await handleStatusChange(status);
              }}
            />
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
      <ActionButtons
        entityType="project"
        showEditButton={false}
        isDeleting={isDeleting}
        onDelete={onDelete}
      />
    </div>
  );
}
