import { useState, useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectsListPage } from "./pages/ProjectsListPage";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage";
import { ProjectIssuesPage } from "./pages/ProjectIssuesPage";
import { IssueDetailPage } from "./pages/IssueDetailPage";

type PageType = "login" | "register" | "dashboard" | "projects-list" | "project-details" | "project-issues" | "issue-detail";

type PageDataMap = {
  "login": Record<string, never>;
  "register": Record<string, never>;
  "dashboard": Record<string, never>;
  "projects-list": Record<string, never>;
  "project-details": { projectId: number };
  "project-issues": { projectId: number };
  "issue-detail": { issueId: number };
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
        return <ProjectsListPage navigate={navigateWrapper} />;
      case "project-details":
        return <ProjectDetailsPage navigate={navigateWrapper} pageData={pageData as PageDataMap["project-details"]} />;
      case "project-issues":
        return <ProjectIssuesPage navigate={navigateWrapper} pageData={pageData as PageDataMap["project-issues"]} />;
      case "issue-detail":
        return <IssueDetailPage navigate={navigateWrapper} pageData={pageData as PageDataMap["issue-detail"]} />;
      default:
        return <LoginPage navigate={navigateWrapper} />;
    }
  };

  return renderCurrentPage();
}