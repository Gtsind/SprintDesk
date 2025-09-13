import { useState } from "react";
import { Modal } from "./Modal";
import { IssueCreateModal } from "./IssueCreateModal";
import type { Project, Issue, User } from "../../types";

interface IssueCreateWrapperModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onIssueCreated?: (issue: Issue) => void;
}

function getProjectMembers(projects: Project[], projectId: number): User[] {
  const selectedProject = projects.find(p => p.id === projectId);
  return (selectedProject?.members ?? []) as User[];
}

export function IssueCreateWrapperModal({
  isOpen,
  onClose,
  projects,
  onIssueCreated,
}: IssueCreateWrapperModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const handleIssueCreated = (issue: Issue) => {
    onIssueCreated?.(issue);
    handleClose();
  };

  const handleClose = () => {
    setSelectedProjectId(null);
    onClose();
  };

  // If project is selected, render IssueCreateModal
  if (selectedProjectId) {
    const projectMembers = getProjectMembers(projects, selectedProjectId);
    
    return (
      <IssueCreateModal
        isOpen={isOpen}
        onClose={handleClose}
        onIssueCreated={handleIssueCreated}
        projectId={selectedProjectId}
        projectMembers={projectMembers}
      />
    );
  }

  // Otherwise show project selection
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Issue">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="project-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Project
          </label>
          <select
            id="project-select"
            value={selectedProjectId || ""}
            onChange={(e) => {
              const projectId = e.target.value ? parseInt(e.target.value) : null;
              setSelectedProjectId(projectId);
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">Choose a project...</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

      </div>
    </Modal>
  );
}