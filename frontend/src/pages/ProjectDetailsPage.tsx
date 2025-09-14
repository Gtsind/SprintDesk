import { useState, useEffect, useCallback } from "react";
import type { ActiveFilters } from "../components/toolbar";
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
import {
  getProjectIssues,
  getProject,
  getActiveUsers,
  updateProject,
} from "../services/api";
import type { Issue, Project, User, ProjectUpdate, ApiError } from "../types";
import {
  createProjectDetailsIssuesFilterConfig,
  createProjectDetailsMembersFilterConfig,
} from "../utils/filterConfigs";

interface ProjectDetailsPageProps {
  navigate: (page: string, data?: unknown) => void;
  pageData: { projectId?: number; filters?: ActiveFilters };
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
  const [inlineEditError, setInlineEditError] = useState("");

  const getProjectData = useCallback(() => getProject(projectId!), [projectId]);
  const {
    data: project,
    loading: projectLoading,
    refetch: refetchProject,
    error: projectError,
  } = useApi<Project>(getProjectData);

  // Use local state to track the current project (for optimistic updates)
  const [currentProject, setCurrentProject] = useState<Project | null>(project);

  // Sync currentProject when project from API loads
  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
  }, [project]);

  // Apply filters from navigation when the page loads
  useEffect(() => {
    if (pageData?.filters) {
      setActiveFilters(pageData.filters);
    }
  }, [pageData?.filters]); // eslint-disable-line react-hooks/exhaustive-deps -- setActiveFilters is stable useState setter

  const getProjectIssuesData = useCallback(() => getProjectIssues(projectId!), [projectId]);
  const {
    data: issues,
    loading: issuesLoading,
    refetch: refetchIssues,
    error: issuesError,
  } = useApi<Issue[]>(getProjectIssuesData);

  const { data: allUsers } = useApi<User[]>(getActiveUsers);

  const {
    isDeleting,
    isAddingMember,
    isRemovingMember,
    isDeletingIssue,
    error,
    showDeleteConfirmationModal,
    deleteContext,
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
    initialName: currentProject?.name || "",
    initialDescription: currentProject?.description || "",
  });

  const handleProjectUpdate = async (updateData: ProjectUpdate) => {
    if (!projectId) return;
    try {
      const updatedProject = await updateProject(projectId, updateData);
      setCurrentProject(updatedProject);
      setInlineEditError(""); // Clear any previous errors
    } catch (error: unknown) {
      if (error && typeof error === "object" && "detail" in error) {
        setInlineEditError((error as ApiError).detail);
      } else {
        setInlineEditError("Failed to update project");
      }
      throw error;
    }
  };

  const isLoading = issuesLoading || projectLoading;
  const breadcrumbs = generateBreadcrumbs("project-details", {
    projectId,
    project: currentProject || undefined,
  });

  const members = currentProject?.members || [];
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
    members as User[],
    searchQuery,
    activeFilters
  );

  // Get unique authors from current issues (cast to User type for filter compatibility)
  const uniqueAuthors = issues
    ? issues.reduce((authors: User[], issue) => {
        if (!authors.find((author) => author.id === issue.author.id)) {
          authors.push(issue.author as User);
        }
        return authors;
      }, [])
    : [];

  // Create filter configurations based on active tab
  const issuesFilterConfig = createProjectDetailsIssuesFilterConfig(
    members as User[], // Use project members for assignee filter
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
          project={currentProject}
          onUpdate={handleProjectUpdate}
          onDelete={() =>
            currentProject && handleDeleteProjectClick(currentProject)
          }
          onError={setInlineEditError}
          isDeleting={isDeleting}
          error={
            inlineEditError || error || projectError || issuesError || undefined
          }
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
                navigate("issue-detail", {
                  issueId: issue.id,
                  fromPage: "project-details",
                })
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
          projectMembers={members as User[]}
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
