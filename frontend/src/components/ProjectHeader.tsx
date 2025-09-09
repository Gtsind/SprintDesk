import { StatusBadge } from "./StatusBadge";
import { Button } from "./Button";
import { ActionButtons } from "./ActionButtons";
import type { Project } from "../types";

interface ProjectHeaderProps {
  project: Project | null;
  isEditing: boolean;
  editData: { name: string; description: string };
  onEditData: (data: { name: string; description: string }) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onComplete: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  isCompleting: boolean;
  error?: string;
}

export function ProjectHeader({
  project,
  isEditing,
  editData,
  onEditData,
  onSave,
  onCancel,
  onEdit,
  onComplete,
  onDelete,
  isDeleting,
  isCompleting,
  error,
}: ProjectHeaderProps) {
  if (isEditing) {
    return (
      <div className="mb-8 flex justify-between items-start">
        <div className="flex-1">
          <div className="space-y-4">
            <input
              type="text"
              value={editData.name}
              onChange={(e) => onEditData({ ...editData, name: e.target.value })}
              className="text-2xl text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:border-gray-400"
              placeholder="Project name"
            />
            <textarea
              value={editData.description}
              onChange={(e) => onEditData({ ...editData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 text-lg"
              placeholder="Project description"
            />
            <div className="flex gap-2">
              <Button onClick={onSave} className="px-4 py-2">
                Save Changes
              </Button>
              <Button onClick={onCancel} variant="secondary" className="px-4 py-2">
                Cancel
              </Button>
            </div>
          </div>
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 flex justify-between items-start">
      <div className="flex-1">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          {project?.name || "Project"}
        </h1>
        {project?.description && (
          <p className="text-gray-700 whitespace-pre-wrap text-lg mb-3">
            {project.description}
          </p>
        )}
        {project?.status && (
          <StatusBadge status={project.status} type="project-status" />
        )}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
      <ActionButtons
        entityType="project"
        isEditing={isEditing}
        isDeleting={isDeleting}
        isClosing={isCompleting}
        onEdit={onEdit}
        onClose={onComplete}
        onDelete={onDelete}
      />
    </div>
  );
}