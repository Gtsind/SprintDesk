import { useState } from "react";
import { AlertCircle, Users, FileCode, Plus } from "lucide-react";
import { Layout } from "../components/Layout";
import { generateBreadcrumbs } from "../utils/breadcrumbs";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ListCard } from "../components/ListCard";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/Button";
import { ActionButtons } from "../components/ActionButtons";
import { IssueCreateModal } from "../components/IssueCreateModal";
import { useApi } from "../hooks/useApi";
import { getProjectIssues, getProjects, updateProject, deleteProject } from "../services/api";
import type { Issue, Project, ProjectUpdate, ApiError } from "../types";

interface ProjectDetailsPageProps {
  navigate: (page: string, data?: unknown) => void;
  pageData: { projectId?: number };
}

export function ProjectDetailsPage({
  navigate,
  pageData,
}: ProjectDetailsPageProps) {
  const projectId = pageData.projectId;
  const [activeTab, setActiveTab] = useState<"issues" | "members">("issues");
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState("");

  const {
    data: issues,
    loading: issuesLoading,
    refetch: refetchIssues,
  } = useApi<Issue[]>(
    () => (projectId ? getProjectIssues(projectId) : Promise.resolve([])),
    [projectId]
  );

  const {
    data: projects,
    loading: projectsLoading,
    refetch: refetchProjects,
  } = useApi<Project[]>(getProjects);

  const project = projects?.find((p) => p.id === projectId) || null;
  const isLoading = issuesLoading || projectsLoading;
  const breadcrumbs = generateBreadcrumbs("project-details", {
    projectId,
    project: project || undefined,
  });

  if (isLoading) {
    return (
      <Layout breadcrumbs={breadcrumbs}>
        <LoadingSpinner message="Loading issues..." />
      </Layout>
    );
  }

  const members = project?.members || [];

  const handleIssueCreated = () => {
    refetchIssues();
    setActiveTab("issues");
  };

  const handleUpdateProject = async (updateData: ProjectUpdate) => {
    if (!projectId) return;

    try {
      setError("");
      await updateProject(projectId, updateData);
      refetchProjects();
    } catch (error: unknown) {
      if (error && typeof error === "object" && "detail" in error) {
        setError((error as ApiError).detail);
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  const handleEditProject = () => {
    setIsEditing(true);
    setEditName(project?.name || "");
    setEditDescription(project?.description || "");
  };

  const handleSaveProject = async () => {
    if (!editName.trim()) return;

    await handleUpdateProject({
      name: editName.trim(),
      description: editDescription.trim() || null,
    });
    setIsEditing(false);
    setEditName("");
    setEditDescription("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName("");
    setEditDescription("");
  };

  const handleCompleteProject = async () => {
    if (!projectId) return;

    try {
      setError("");
      setIsCompleting(true);
      await handleUpdateProject({ status: "Completed" });
    } catch (error: unknown) {
      if (error && typeof error === "object" && "detail" in error) {
        setError((error as ApiError).detail);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;

    try {
      setError("");
      setIsDeleting(true);
      await deleteProject(projectId);
      navigate("projects-list");
    } catch (error: unknown) {
      if (error && typeof error === "object" && "detail" in error) {
        setError((error as ApiError).detail);
      } else {
        setError("An unexpected error occurred");
      }
      setIsDeleting(false);
    }
  };

  return (
    <Layout navigate={navigate} breadcrumbs={breadcrumbs}>
      <div>
        {/* Project Info */}
        <div className="mb-8 flex justify-between items-start">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-3xl font-semibold text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:border-indigo-500"
                  placeholder="Project name"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 text-lg"
                  placeholder="Project description"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveProject} className="px-4 py-2">
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="secondary"
                    className="px-4 py-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                  {project?.name || "Project"}
                </h1>
                {project?.description && (
                  <p className="text-gray-600 text-lg mb-3">
                    {project.description}
                  </p>
                )}
                {project?.status && (
                  <StatusBadge status={project.status} type="project-status" />
                )}
              </>
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
            onEdit={handleEditProject}
            onClose={handleCompleteProject}
            onDelete={handleDeleteProject}
          />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <div className="flex justify-between items-center">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("issues")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "issues"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <FileCode className="inline h-4 w-4 mr-1" />
                  Issues ({issues?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("members")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "members"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Users className="inline h-4 w-4 mr-1" />
                  Members ({members.length})
                </button>
              </nav>
              {activeTab === "issues" && (
                <Button
                  onClick={() => setIsIssueModalOpen(true)}
                  className="flex items-center justify-center py-2 px-4 gap-2 sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  New Issue
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {activeTab === "issues" && (
            <>
              {!issues || issues.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No issues found
                  </h3>
                  <p className="mt-2 text-gray-600">
                    This project doesn't have any issues yet.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {issues.map((issue) => (
                    <ListCard
                      key={issue.id}
                      type="issue"
                      item={issue}
                      onClick={(issue) =>
                        navigate("issue-detail", { issueId: issue.id })
                      }
                    />
                  ))}
                </ul>
              )}
            </>
          )}

          {activeTab === "members" && (
            <>
              {members.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No members found
                  </h3>
                  <p className="mt-2 text-gray-600">
                    This project doesn't have any members yet.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {members.map((member) => (
                    <ListCard
                      key={member.id}
                      type="member"
                      item={member}
                      onClick={() => {}}
                    />
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>

      {/* Issue Create Modal */}
      {projectId && (
        <IssueCreateModal
          isOpen={isIssueModalOpen}
          onClose={() => setIsIssueModalOpen(false)}
          onIssueCreated={handleIssueCreated}
          projectId={projectId}
          projectMembers={members}
        />
      )}
    </Layout>
  );
}
