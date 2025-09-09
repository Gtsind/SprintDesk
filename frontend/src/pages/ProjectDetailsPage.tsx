import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { generateBreadcrumbs } from "../utils/breadcrumbs";
import { getModalProps } from "../utils/getModalProps";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { IssueCreateModal } from "../components/modals/IssueCreateModal";
import { DeleteConfirmationModal } from "../components/modals/DeleteConfirmationModal";
import { Toolbar } from "../components/toolbar";
import { ProjectHeader } from "../components/project/ProjectHeader";
import { TabNavigation } from "../components/project/TabNavigation";
import { IssuesTab } from "../components/project/IssuesTab";
import { MembersTab } from "../components/project/MembersTab";
import { MemberDropdown } from "../components/project/MemberDropdown";
import { useApi } from "../hooks/useApi";
import { useProjectActions } from "../hooks/useProjectActions";
import { useTabManagement } from "../hooks/useTabManagement";
import { useProjectFiltering } from "../hooks/useProjectFiltering";
import { getProjectIssues, getProject, getActiveUsers } from "../services/api";
import type { Issue, Project, User } from "../types";
import {
  createProjectDetailsIssuesFilterConfig,
  createProjectDetailsMembersFilterConfig,
} from "../utils/filterConfigs";

interface ProjectDetailsPageProps {
  navigate: (page: string, data?: unknown) => void;
  pageData: { projectId?: number };
}

export function ProjectDetailsPage({
  navigate,
  pageData,
}: ProjectDetailsPageProps) {
  const projectId = pageData.projectId;
  const {
    activeTab,
    searchQuery,
    activeFilters,
    setSearchQuery,
    setActiveFilters,
    switchTab,
  } = useTabManagement();
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

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
    data: issues,
    loading: issuesLoading,
    refetch: refetchIssues,
    error: issuesError,
  } = useApi<Issue[]>(
    () => (projectId ? getProjectIssues(projectId) : Promise.resolve([])),
    [projectId]
  );

  const { data: allUsers } = useApi<User[]>(getActiveUsers);

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
  const modalProps = getModalProps({
    type: deleteContext.type,
    item: deleteContext.item,
    isDeleting,
    isRemovingMember,
    isDeletingIssue,
  });

  // Filter data using the custom hook
  const { filteredIssues, filteredMembers } = useProjectFiltering(
    issues || [],
    members,
    searchQuery,
    activeFilters
  );

  // Get unique authors from current issues (cast to User type for filter compatibility)
  const uniqueAuthors = issues
    ? issues.reduce((authors: User[], issue) => {
        if (!authors.find(author => author.id === issue.author.id)) {
          authors.push(issue.author as User);
        }
        return authors;
      }, [])
    : [];

  // Create filter configurations based on active tab
  const issuesFilterConfig = createProjectDetailsIssuesFilterConfig(
    members, // Use project members for assignee filter
    uniqueAuthors // Use unique issue authors for author filter
  );
  const membersFilterConfig = createProjectDetailsMembersFilterConfig();
  const currentFilterConfig =
    activeTab === "issues" ? issuesFilterConfig : membersFilterConfig;

  // Filter out users who are already members and only include Contributors
  const availableUsers =
    allUsers?.filter(
      (user) =>
        user.role === "Contributor" &&
        !members.some((member) => member.id === user.id)
    ) || [];

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
        <ProjectHeader
          project={project}
          isEditing={isEditing}
          editData={editData}
          onEditData={setEditData}
          onSave={handleSaveProject}
          onCancel={handleCancelEdit}
          onEdit={() =>
            handleEditProject(project?.name || "", project?.description || "")
          }
          onComplete={handleCompleteProject}
          onDelete={() => project && handleDeleteProjectClick(project)}
          isDeleting={isDeleting}
          isCompleting={isCompleting}
          error={error || projectError || issuesError || undefined}
        />

        <TabNavigation
          activeTab={activeTab}
          onTabChange={switchTab}
          issueCount={filteredIssues.length}
          memberCount={filteredMembers.length}
          onNewIssue={() => setIsIssueModalOpen(true)}
          onAddMember={() => setShowMemberDropdown(true)}
        />

        {/* Member Dropdown positioned under Members tab */}
        <div className="relative mb-4">
          <MemberDropdown
            availableUsers={availableUsers}
            onAddMember={handleAddMember}
            isAddingMember={isAddingMember}
            isOpen={showMemberDropdown}
            onClose={() => setShowMemberDropdown(false)}
          />
        </div>

        {/* Toolbar for filtering current tab */}
        <div className="mb-6">
          <Toolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={`Search ${activeTab}...`}
            filterConfig={currentFilterConfig}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
          />
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {activeTab === "issues" && (
            <IssuesTab
              issues={filteredIssues}
              searchQuery={searchQuery}
              activeFilters={activeFilters}
              onIssueClick={(issue) =>
                navigate("issue-detail", { issueId: issue.id })
              }
              onIssueDelete={handleDeleteIssueClick}
            />
          )}

          {activeTab === "members" && (
            <MembersTab
              members={filteredMembers}
              searchQuery={searchQuery}
              activeFilters={activeFilters}
              onMemberClick={() => {}}
              onMemberRemove={handleRemoveMemberClick}
            />
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
        {...modalProps}
      />
    </Layout>
  );
}
