import { useState, useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage";
import { IssuesPage } from "./pages/IssuesPage";
import { IssueDetailPage } from "./pages/IssueDetailPage";
import { UsersPage } from "./pages/UsersPage";
import { UserDetailsPage } from "./pages/UserDetailsPage";

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
  "projects-list": Record<string, never>;
  "project-details": { projectId: number };
  "issues-list": Record<string, never>;
  "issue-detail": { issueId: number };
  "users-list": Record<string, never>;
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
        return <ProjectsPage navigate={navigateWrapper} />;
      case "project-details":
        return (
          <ProjectDetailsPage
            navigate={navigateWrapper}
            pageData={pageData as PageDataMap["project-details"]}
          />
        );
      case "issues-list":
        return <IssuesPage navigate={navigateWrapper} />;
      case "issue-detail":
        return (
          <IssueDetailPage
            navigate={navigateWrapper}
            pageData={pageData as PageDataMap["issue-detail"]}
          />
        );
      case "users-list":
        return <UsersPage navigate={navigateWrapper} />;
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
