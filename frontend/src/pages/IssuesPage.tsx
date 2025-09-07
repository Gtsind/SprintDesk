import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Layout } from "../components/Layout";
import { generateBreadcrumbs } from "../utils/breadcrumbs";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ListCard } from "../components/ListCard";
import { SearchBar } from "../components/SearchBar";
import { useApi } from "../hooks/useApi";
import { getIssues } from "../services/api";
import type { Issue } from "../types";

interface IssuesPageProps {
  navigate: (page: string, data?: unknown) => void;
}

export function IssuesPage({ navigate }: IssuesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: issues, loading } = useApi<Issue[]>(getIssues);
  const breadcrumbs = generateBreadcrumbs("issues-list");

  if (loading) {
    return (
      <Layout breadcrumbs={breadcrumbs}>
        <LoadingSpinner message="Loading issues..." />
      </Layout>
    );
  }

  const filteredIssues =
    issues?.filter(
      (issue) =>
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.project?.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

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
          <div className="w-full md:max-w-md">
            <SearchBar
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search issues..."
            />
          </div>
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
                {searchQuery
                  ? `No issues match "${searchQuery}"`
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
        </div>
      </div>
    </Layout>
  );
}
