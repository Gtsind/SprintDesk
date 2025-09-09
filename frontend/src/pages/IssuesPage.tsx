import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { generateBreadcrumbs } from "../utils/breadcrumbs";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ListCard } from "../components/ui/ListCard";
import { Toolbar, type ActiveFilters } from "../components/toolbar";
import { useApi } from "../hooks/useApi";
import { getIssues, getProjects, getActiveUsers } from "../services/api";
import type { Issue, Project, User } from "../types";
import {
  createIssuesPageFilterConfig,
  applyFilters,
  issueFilterFunctions,
} from "../utils/filterConfigs";

interface IssuesPageProps {
  navigate: (page: string, data?: unknown) => void;
}

export function IssuesPage({ navigate }: IssuesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const { data: issues, loading } = useApi<Issue[]>(getIssues);
  const { data: projects } = useApi<Project[]>(getProjects);
  const { data: users } = useApi<User[]>(getActiveUsers);
  const breadcrumbs = generateBreadcrumbs("issues-list");

  if (loading) {
    return (
      <Layout breadcrumbs={breadcrumbs}>
        <LoadingSpinner message="Loading issues..." />
      </Layout>
    );
  }

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
    users || undefined
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
                    navigate("issue-detail", { issueId: issue.id })
                  }
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
      </div>
    </Layout>
  );
}
