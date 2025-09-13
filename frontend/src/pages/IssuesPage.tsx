import { useState, useEffect } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { generateBreadcrumbs } from "../utils/breadcrumbs";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ListCard } from "../components/ui/ListCard";
import { Button } from "../components/ui/Button";
import { IssueCreateWrapperModal } from "../components/modals/IssueCreateWrapperModal";
import { DeleteConfirmationModal } from "../components/modals/DeleteConfirmationModal";
import { DisplayErrorModal } from "../components/modals/DisplayErrorModal";
import { Toolbar, type ActiveFilters } from "../components/toolbar";
import { useApi } from "../hooks/useApi";
import { useIssueActions } from "../hooks/useIssueActions";
import { getIssues, getProjects } from "../services/api";
import type { Issue, Project } from "../types";
import {
  createIssuesPageFilterConfig,
  applyFilters,
  issueFilterFunctions,
} from "../utils/filterConfigs";
import { getAllTeamMembers } from "../utils/dashboardUtils";

interface IssuesPageProps {
  navigate: (page: string, data?: unknown) => void;
  pageData?: { filters?: ActiveFilters };
}

export function IssuesPage({ navigate, pageData }: IssuesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  const { data: issues, loading, refetch } = useApi<Issue[]>(getIssues);
  const { data: projects } = useApi<Project[]>(getProjects);
  const breadcrumbs = generateBreadcrumbs("issues-list");

  // Apply filters from navigation when the page loads
  useEffect(() => {
    if (pageData?.filters) {
      setActiveFilters(pageData.filters);
    }
  }, [pageData?.filters]);

  const {
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    isDeleting,
    showDeleteConfirmationModal,
    issueToDelete,
  } = useIssueActions({
    onUpdate: () => {}, // Not used for IssuesPage
    onError: (errorMessage) => {
      setError(errorMessage);
      setShowErrorModal(true);
    },
    navigate,
    refetch,
  });

  if (loading) {
    return (
      <Layout breadcrumbs={breadcrumbs}>
        <LoadingSpinner message="Loading issues..." />
      </Layout>
    );
  }

  // Extract unique project members (we will use a dashboard utility function we have already defined)
  const projectMembers = getAllTeamMembers(projects || []);

  // Apply search filter first
  const searchFilteredIssues =
    issues?.filter(
      (issue) =>
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.project?.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Then apply active filters
  const filteredIssues = applyFilters(
    searchFilteredIssues,
    activeFilters,
    issueFilterFunctions
  );

  // Create filter configuration
  const filterConfig = createIssuesPageFilterConfig(
    projects || undefined,
    projectMembers || undefined
  );

  return (
    <Layout navigate={navigate} breadcrumbs={breadcrumbs}>
      <div className="w-full">
        {/* Header */}
        <div className="mb-4 px-4 md:px-0">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Issues
          </h1>
        </div>

        {/* Toolbar */}
        <div className="mb-6 px-4 md:px-0">
          <Toolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search issues..."
            filterConfig={filterConfig}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            rightContent={
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center py-2.5 px-4 gap-2 w-full md:w-auto"
              >
                <Plus className="h-4 w-4" />
                New Issue
              </Button>
            }
          />
        </div>

        {/* Issues List */}
        <div className="mx-4 md:mx-0 bg-white overflow-hidden border border-gray-200 md:border-0">
          {filteredIssues.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {searchQuery ? "No issues found" : "No issues"}
              </h3>
              <p className="mt-2 text-gray-600">
                {searchQuery || Object.keys(activeFilters).length > 0
                  ? "Try adjusting your search or filters"
                  : "No issues found in your projects."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-300">
              {filteredIssues.map((issue) => (
                <ListCard
                  key={issue.id}
                  type="issue"
                  item={issue}
                  onClick={(issue) =>
                    navigate("issue-detail", {
                      issueId: issue.id,
                      fromPage: "issues-list",
                    })
                  }
                  onRemove={handleDeleteClick}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Results Summary */}
        <div className="mt-4 px-4 md:px-0 text-sm text-gray-500">
          Showing {filteredIssues.length} of {issues?.length || 0} issues
          {searchQuery && ` matching "${searchQuery}"`}
          {Object.keys(activeFilters).length > 0 && " with active filters"}
        </div>

        {/* Issue Create Wrapper Modal */}
        <IssueCreateWrapperModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          projects={projects || []}
          onIssueCreated={() => {
            refetch(); // Refresh issues list
            setShowCreateModal(false);
          }}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteConfirmationModal}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Issue"
          message={
            issueToDelete
              ? `Are you sure you want to delete "${issueToDelete.title}"?\nThis action cannot be undone.`
              : ""
          }
          confirmButtonText="Delete"
          isLoading={isDeleting}
        />

        {/* Display Error Modal */}
        <DisplayErrorModal
          isOpen={showErrorModal}
          onClose={() => {
            setShowErrorModal(false);
            setError("");
          }}
          error={error}
        />
      </div>
    </Layout>
  );
}
