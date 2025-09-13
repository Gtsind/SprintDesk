import { Layout } from "../components/layout/Layout";
import { useAuth } from "../contexts/AuthContext";
import { AdminDashboard } from "../components/dashboard/AdminDashboard";
import { ProjectManagerDashboard } from "../components/dashboard/ProjectManagerDashboard";
import { ContributorDashboard } from "../components/dashboard/ContributorDashboard";

interface DashboardPageProps {
  navigate: (page: string, data?: unknown) => void;
}

export function DashboardPage({ navigate }: DashboardPageProps) {
  const { user } = useAuth();

  const renderDashboardContent = () => {
    switch (user?.role) {
      case "Admin":
        return <AdminDashboard navigate={navigate} />;
      case "Project Manager":
        return <ProjectManagerDashboard navigate={navigate} />;
      case "Contributor":
        return <ContributorDashboard userId={user.id} navigate={navigate} />;
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <Layout navigate={navigate}>
      <div>
        <h1 className="text-2xl text-center font-semibold text-gray-900 mb-6">
          Welcome, {user?.firstname}
        </h1>
        {renderDashboardContent()}
      </div>
    </Layout>
  );
}
