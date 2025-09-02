import { useState, useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectIssuesPage } from "./pages/ProjectIssuesPage";
import { IssueDetailPage } from "./pages/IssueDetailPage";

export function AppRouter() {
  const [currentPage, setCurrentPage] = useState("login");
  const [pageData, setPageData] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    if (user && (currentPage === "login" || currentPage === "register")) {
      setCurrentPage("dashboard");
    } else if (!user && currentPage !== "login" && currentPage !== "register") {
      setCurrentPage("login");
    }
  }, [user, currentPage]);

  const navigate = (page: string, data = {}) => {
    setCurrentPage(page);
    setPageData(data);
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
      case "project-issues":
        return <ProjectIssuesPage navigate={navigate} pageData={pageData} />;
      case "issue-detail":
        return <IssueDetailPage navigate={navigate} pageData={pageData} />;
      default:
        return <LoginPage navigate={navigate} />;
    }
  };

  return renderCurrentPage();
}