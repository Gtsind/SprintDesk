import { useState, useEffect, useRef } from "react";
import { AlertCircle, Users, FileCode, Plus } from "lucide-react";
import { Layout } from "../components/Layout";
import { generateBreadcrumbs } from "../utils/breadcrumbs";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ListCard } from "../components/ListCard";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/Button";
import { ActionButtons } from "../components/ActionButtons";
import { IssueCreateModal } from "../components/IssueCreateModal";
import { DeleteConfirmationModal } from "../components/DeleteConfirmationModal";
import { useApi } from "../hooks/useApi";
import { useProjectActions } from "../hooks/useProjectActions";
import { getProjectIssues, getProject, getActiveUsers } from "../services/api";
import type { Issue, Project, User } from "../types";

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
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    data: issues,
    loading: issuesLoading,
    refetch: refetchIssues,
    error: issuesError,
  } = useApi<Issue[]>(
    () => (projectId ? getProjectIssues(projectId) : Promise.resolve([])),
    [projectId]
  );

  const { data: allUsers, loading: usersLoading } =
    useApi<User[]>(getActiveUsers);

  const {
    data: project,
    loading: projectLoading,
    refetch: refetchProject,
    error: projectError,
  } = useApi<Project | null>(
    () => (projectId ? getProject(projectId) : Promise.resolve(null)),
    [projectId]
  );

  const {
    isEditing,
    isDeleting,
    isCompleting,
    isAddingMember,
    isRemovingMember,
    isDeletingIssue,
    editData,
    error,
    showDeleteConfirmationModal,
    deleteContext,
    setEditData,
    handleEditProject,
    handleSaveProject,
    handleCancelEdit,
    handleCompleteProject,
    handleIssueCreated,
    handleAddMember,
    handleDeleteProjectClick,
    handleRemoveMemberClick,
    handleDeleteIssueClick,
    handleConfirmDelete,
    handleCancelDelete,
  } = useProjectActions({
    projectId,
    refetchProject,
    refetchIssues,
    navigate,
    initialName: project?.name || "",
    initialDescription: project?.description || "",
  });

  const isLoading = issuesLoading || projectLoading;
  const breadcrumbs = generateBreadcrumbs("project-details", {
    projectId,
    project: project || undefined,
  });

  const members = project?.members || [];

  // Filter out users who are already members and only include Contributors
  const availableUsers =
    allUsers?.filter(
      (user) =>
        user.role === "Contributor" &&
        !members.some((member) => member.id === user.id)
    ) || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper function to get modal props based on delete context
  const getModalProps = () => {
    const { type, item } = deleteContext;

    switch (type) {
      case "project":
        const project = item as Project;
        return {
          title: "Delete Project",
          message: `Are you sure you want to delete "${project?.name}"?\nThis action cannot be undone.`,
          confirmButtonText: "Delete",
          isLoading: isDeleting,
        };
      case "member":
        const member = item as User;
        return {
          title: "Remove Member",
          message: `Remove ${member?.firstname} ${member?.lastname} from this project?`,
          confirmButtonText: "Remove",
          isLoading: isRemovingMember,
        };
      case "issue":
        const issue = item as Issue;
        return {
          title: "Delete Issue",
          message: `Are you sure you want to delete "${issue?.title}"?\nThis action cannot be undone.`,
          confirmButtonText: "Delete",
          isLoading: isDeletingIssue,
        };
      default:
        return {
          title: "Confirm Delete",
          message: "Are you sure you want to proceed?",
          confirmButtonText: "Delete",
          isLoading: false,
        };
    }
  };

  if (isLoading) {
    return (
      <Layout breadcrumbs={breadcrumbs}>
        <LoadingSpinner message="Loading issues..." />
      </Layout>
    );
  }

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
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="text-2xl text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:border-gray-400"
                  placeholder="Project name"
                />
                <textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 text-lg"
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
                  <p className="text-gray-700 whitespace-pre-wrap text-lg mb-3">
                    {project.description}
                  </p>
                )}
                {project?.status && (
                  <StatusBadge status={project.status} type="project-status" />
                )}
              </>
            )}

            {(error || projectError || issuesError) && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error || projectError || issuesError}
              </div>
            )}
          </div>
          <ActionButtons
            entityType="project"
            isEditing={isEditing}
            isDeleting={isDeleting}
            isClosing={isCompleting}
            onEdit={() =>
              handleEditProject(project?.name || "", project?.description || "")
            }
            onClose={handleCompleteProject}
            onDelete={() => project && handleDeleteProjectClick(project)}
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 flex justify-between items-center">
          <nav className="flex space-x-8">
            {["issues", "members"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "issues" | "members")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab === "issues" ? (
                  <FileCode className="inline h-4 w-4 mr-1" />
                ) : (
                  <Users className="inline h-4 w-4 mr-1" />
                )}
                {tab === "issues"
                  ? `Issues (${issues?.length || 0})`
                  : `Members (${members.length})`}
              </button>
            ))}
          </nav>
          {activeTab === "issues" && (
            <Button
              onClick={() => setIsIssueModalOpen(true)}
              className="flex items-center gap-2 py-1.5 px-3"
            >
              <Plus className="h-4 w-4" /> New Issue
            </Button>
          )}
          {activeTab === "members" && (
            <div className="relative" ref={dropdownRef}>
              <Button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                disabled={
                  isAddingMember || usersLoading || availableUsers.length === 0
                }
                className="flex items-center gap-2 py-1.5 px-3"
              >
                <Plus className="h-4 w-4" />
                {isAddingMember ? "Adding..." : "Add Member"}
              </Button>

              {showUserDropdown && availableUsers.length > 0 && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="py-1 max-h-60 overflow-y-auto">
                    {availableUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          handleAddMember(user.id);
                          setShowUserDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      >
                        <div className="font-medium">
                          {user.firstname} {user.lastname}
                        </div>
                        {user.title && (
                          <div className="text-gray-600 text-xs">
                            {user.title}
                          </div>
                        )}
                        <div className="text-gray-500 text-xs">
                          @{user.username}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
                      onRemove={handleDeleteIssueClick}
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
                      onRemove={handleRemoveMemberClick}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmationModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        {...getModalProps()}
      />
    </Layout>
  );
}
