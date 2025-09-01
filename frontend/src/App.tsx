import { useEffect, type ReactNode } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import {
  NavigationProvider,
  useNavigation,
} from "./contexts/NavigationContext";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectIssuesPage } from "./pages/ProjectIssuesPage";
import { IssueDetailPage } from "./pages/IssueDetailPage";

function ProtectedPage({ children }: { children: ReactNode }) {
  const { state } = useAuth();
  const { navigateTo } = useNavigation();

  useEffect(() => {
    if (!state.token) {
      navigateTo("login");
    }
  }, [state.token, navigateTo]);

  if (!state.token) return null;

  return <>{children}</>;
}

function AppRouter() {
  const { state } = useAuth();
  const { navigation, navigateTo } = useNavigation();

  useEffect(() => {
    if (state.token && navigation.currentPage === "login") {
      navigateTo("dashboard");
    }
  }, [state.token, navigation.currentPage, navigateTo]);

  const renderCurrentPage = () => {
    switch (navigation.currentPage) {
      case "login":
        return <LoginPage />;
      case "dashboard":
        return (
          <ProtectedPage>
            <DashboardPage />
          </ProtectedPage>
        );
      case "project-issues":
        return (
          <ProtectedPage>
            <ProjectIssuesPage />
          </ProtectedPage>
        );
      case "issue-detail":
        return (
          <ProtectedPage>
            <IssueDetailPage />
          </ProtectedPage>
        );
      default:
        return <LoginPage />;
    }
  };

  return renderCurrentPage();
}

export default function App() {
  return (
    <NavigationProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </NavigationProvider>
  );
}
