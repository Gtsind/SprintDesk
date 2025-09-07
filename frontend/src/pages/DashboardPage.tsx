import { Layout } from "../components/Layout";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { CardContainer } from "../components/CardContainer";
import { useAuth } from "../contexts/AuthContext";
import { useApi } from "../hooks/useApi";
import { getProjects } from "../services/api";
import type { Project } from "../types";

interface DashboardPageProps {
  navigate: (page: string, data?: unknown) => void;
}

export function DashboardPage({ navigate }: DashboardPageProps) {
  const { user } = useAuth();
  const { data: projects, loading: projectsLoading } =
    useApi<Project[]>(getProjects);

  if (projectsLoading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading dashboard..." />
      </Layout>
    );
  }

  return (
    <Layout navigate={navigate}>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-10">
          Welcome, {user?.firstname}
        </h1>
        <CardContainer
          title="Projects"
          items={projects}
          emptyMessage="No projects found."
          onItemClick={(item) => {
            navigate("project-details", { projectId: item.id });
          }}
        />
      </div>
    </Layout>
  );
}
