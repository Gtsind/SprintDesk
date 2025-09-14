import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage";
import { IssuesPage } from "./pages/IssuesPage";
import { IssueDetailPage } from "./pages/IssueDetailPage";
import { UsersPage } from "./pages/UsersPage";
import { UserDetailsPage } from "./pages/UserDetailsPage";
import type { ActiveFilters } from "./components/toolbar";

type PageType =
  | "login"
  | "register"
  | "dashboard"
  | "projects-list"
  | "project-details"
  | "issues-list"
  | "issue-detail"
  | "users-list"
  | "user-detail";

type PageDataMap = {
  login: Record<string, never>;
  register: Record<string, never>;
  dashboard: Record<string, never>;
  "projects-list": { filters?: ActiveFilters };
  "project-details": { projectId: number; filters?: ActiveFilters };
  "issues-list": { filters?: ActiveFilters };
  "issue-detail": { issueId: number; fromPage?: string };
  "users-list": { filters?: ActiveFilters };
  "user-detail": { userId: number };
};

export function AppRouter() {
  const [currentPage, setCurrentPage] = useState<PageType>("login");
  const [pageData, setPageData] = useState<PageDataMap[PageType]>({});
  const { user } = useAuth();

  useEffect(() => {
    if (user && (currentPage === "login" || currentPage === "register")) {
      setCurrentPage("dashboard");
    } else if (!user && currentPage !== "login" && currentPage !== "register") {
      setCurrentPage("login");
    }
  }, [user, currentPage]);

  const navigate = (page: PageType, data?: unknown) => {
    setCurrentPage(page);
    setPageData((data || {}) as PageDataMap[PageType]);
  };

  const navigateWrapper = (page: string, data?: unknown) => {
    navigate(page as PageType, data);
  };

  const renderCurrentPage = () => {
    if (!user && currentPage !== "login" && currentPage !== "register") {
      return <LoginPage navigate={navigateWrapper} />;
    }

    switch (currentPage) {
      case "login":
        return <LoginPage navigate={navigateWrapper} />;
      case "register":
        return <RegisterPage navigate={navigateWrapper} />;
      case "dashboard":
        return <DashboardPage navigate={navigateWrapper} />;
      case "projects-list":
        return <ProjectsPage navigate={navigateWrapper} pageData={pageData as PageDataMap["projects-list"]} />;
      case "project-details":
        return (
          <ProjectDetailsPage
            navigate={navigateWrapper}
            pageData={pageData as PageDataMap["project-details"]}
          />
        );
      case "issues-list":
        return <IssuesPage navigate={navigateWrapper} pageData={pageData as PageDataMap["issues-list"]} />;
      case "issue-detail":
        return (
          <IssueDetailPage
            navigate={navigateWrapper}
            pageData={pageData as PageDataMap["issue-detail"]}
          />
        );
      case "users-list":
        return <UsersPage navigate={navigateWrapper} pageData={pageData as PageDataMap["users-list"]} />;
      case "user-detail":
        return (
          <UserDetailsPage
            navigate={navigateWrapper}
            pageData={pageData as PageDataMap["user-detail"]}
          />
        );
      default:
        return <LoginPage navigate={navigateWrapper} />;
    }
  };

  return renderCurrentPage();
}
