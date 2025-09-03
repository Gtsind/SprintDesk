import { Layout } from "../components/Layout";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { CardContainer } from "../components/CardContainer";
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
          <CardContainer
            title="Your Projects"
            items={projects}
            emptyMessage="No projects found."
            onItemClick={(item) => {
              const project = item as Project;
              navigate("project-details", { projectId: project.id });
            }}
          />

          <CardContainer
            title="Your Assigned Issues"
            items={userIssues}
            emptyMessage="No assigned issues found."
            onItemClick={(item) => {
              const issue = item as Issue;
              navigate("issue-detail", { issueId: issue.id });
            }}
            limit={5}
            showViewAll={true}
            onViewAllClick={() => navigate("dashboard")}
          />
        </div>
      </div>
    </Layout>
  );
}
