import { useState, useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage";
import { ProjectIssuesPage } from "./pages/ProjectIssuesPage";
import { IssueDetailPage } from "./pages/IssueDetailPage";

type PageType = "login" | "register" | "dashboard" | "project-details" | "project-issues" | "issue-detail";

type PageDataMap = {
  "login": {};
  "register": {};
  "dashboard": {};
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

  const navigate = (page: PageType, data?: any) => {
    setCurrentPage(page);
    setPageData(data || {});
  };

  const renderCurrentPage = () => {
    if (!user && currentPage !== "login" && currentPage !== "register") {
      return <LoginPage navigate={navigate} />;
    }

    switch (currentPage) {
      case "login":
        return <LoginPage navigate={navigate} />;
      case "register":
        return <RegisterPage navigate={navigate} />;
      case "dashboard":
        return <DashboardPage navigate={navigate} />;
      case "project-details":
        return <ProjectDetailsPage navigate={navigate} pageData={pageData as PageDataMap["project-details"]} />;
      case "project-issues":
        return <ProjectIssuesPage navigate={navigate} pageData={pageData as PageDataMap["project-issues"]} />;
      case "issue-detail":
        return <IssueDetailPage navigate={navigate} pageData={pageData as PageDataMap["issue-detail"]} />;
      default:
        return <LoginPage navigate={navigate} />;
    }
  };

  return renderCurrentPage();
}