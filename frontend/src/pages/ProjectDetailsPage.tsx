import { Layout } from "../components/Layout";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { CardContainer } from "../components/CardContainer";
import { useApi } from "../hooks/useApi";
import { getProject, getProjectIssues } from "../services/api";
import type { Project, Issue, User } from "../types";

interface ProjectDetailsPageProps {
  navigate: (page: string, data?: any) => void;
  pageData: { projectId: number };
}

export function ProjectDetailsPage({
  navigate,
  pageData,
}: ProjectDetailsPageProps) {
  const { projectId } = pageData;

  const { data: project, loading: projectLoading } = useApi<Project>(
    () => getProject(projectId),
    [projectId]
  );

  const { data: issues, loading: issuesLoading } = useApi<Issue[]>(
    () => getProjectIssues(projectId),
    [projectId]
  );

  const isLoading = projectLoading || issuesLoading;

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading project details..." />
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout navigate={navigate}>
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-center text-2xl font-bold text-gray-900 mb-4">
              Project Not Found
            </h1>
            <button
              onClick={() => navigate("dashboard")}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout navigate={navigate}>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-center text-2xl font-bold text-gray-900">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-center text-gray-600 mt-2">
              {project.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardContainer
            title="Project Members"
            items={project.members || []}
            emptyMessage="No members found."
            onItemClick={() => {}}
          />

          <CardContainer
            title="Project Issues"
            items={issues || []}
            emptyMessage="No issues found."
            onItemClick={() => {
              navigate("project-issues", { projectId });
            }}
          />
        </div>
      </div>
    </Layout>
  );
}
