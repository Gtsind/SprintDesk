import { Layout } from "../components/Layout";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../contexts/AuthContext";
import { useApi } from "../hooks/useApi";
import { getProjects, getUserIssues } from "../services/api";
import type { Project, Issue } from "../types";

interface DashboardPageProps {
  navigate: (page: string, data?: any) => void;
}

export function DashboardPage({ navigate }: DashboardPageProps) {
  const { user } = useAuth();
  const { data: projects, loading: projectsLoading } = useApi<Project[]>(getProjects);
  const { data: userIssues, loading: issuesLoading } = useApi<Issue[]>(
    () => user ? getUserIssues(user.id) : Promise.resolve([]),
    [user]
  );

  const isLoading = projectsLoading || issuesLoading;

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading dashboard..." />
      </Layout>
    );
  }

  return (
    <Layout navigate={navigate}>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Your Projects
            </h2>
            <div className="space-y-3">
              {!projects || projects.length === 0 ? (
                <p className="text-gray-500">No projects found.</p>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => navigate("project-issues", { projectId: project.id })}
                    className="block w-full text-left border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <StatusBadge
                        status={project.status}
                        type="project-status"
                      />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Assigned Issues Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Your Assigned Issues
            </h2>
            <div className="space-y-3">
              {!userIssues || userIssues.length === 0 ? (
                <p className="text-gray-500">No assigned issues found.</p>
              ) : (
                userIssues.slice(0, 5).map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => navigate("issue-detail", { issueId: issue.id })}
                    className="block w-full text-left border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {issue.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {issue.project.name}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <StatusBadge status={issue.priority} type="priority" />
                        <StatusBadge status={issue.status} type="status" />
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            {userIssues && userIssues.length > 5 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate("dashboard")}
                  className="text-indigo-600 hover:text-indigo-500 text-sm"
                >
                  View all assigned issues
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
