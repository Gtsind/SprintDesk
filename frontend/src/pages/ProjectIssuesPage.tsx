import { AlertCircle } from "lucide-react";
import { Layout } from "../components/Layout";
import { generateBreadcrumbs } from "../utils/breadcrumbs";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ListCard } from "../components/ListCard";
import { useApi } from "../hooks/useApi";
import { getProjectIssues, getProjects } from "../services/api";
import type { Issue, Project } from "../types";

interface ProjectIssuesPageProps {
  navigate: (page: string, data?: unknown) => void;
  pageData: { projectId?: number };
}

export function ProjectIssuesPage({
  navigate,
  pageData,
}: ProjectIssuesPageProps) {
  const projectId = pageData.projectId;

  const { data: issues, loading: issuesLoading } = useApi<Issue[]>(
    () => (projectId ? getProjectIssues(projectId) : Promise.resolve([])),
    [projectId]
  );

  const { data: projects, loading: projectsLoading } =
    useApi<Project[]>(getProjects);

  const project = projects?.find((p) => p.id === projectId) || null;
  const isLoading = issuesLoading || projectsLoading;
  const breadcrumbs = generateBreadcrumbs("project-issues", { projectId, project: project || undefined });

  if (isLoading) {
    return (
      <Layout breadcrumbs={breadcrumbs}>
        <LoadingSpinner message="Loading issues..." />
      </Layout>
    );
  }

  return (
    <Layout navigate={navigate} breadcrumbs={breadcrumbs}>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {project ? `${project.name} Issues` : "Project Issues"}
          </h1>
          <p className="text-gray-600 mt-3">
            {issues?.length || 0} total issues
          </p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
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
        </div>
      </div>
    </Layout>
  );
}
