import type { BreadCrumb } from "../components/Header";
import type { Project, Issue } from "../types";

export function generateBreadcrumbs(
  page: string, 
  data?: { 
    projectId?: number; 
    issueId?: number; 
    project?: Project; 
    issue?: Issue; 
  }
): BreadCrumb[] {
  switch (page) {
    case "login":
    case "register":
    case "dashboard":
      return [];

    case "all-issues":
      return [
        { label: "Dashboard", page: "dashboard" },
        { label: "Issues", page: "all-issues" }
      ];

    case "projects-list":
      return [
        { label: "Dashboard", page: "dashboard" },
        { label: "Projects", page: "projects-list" }
      ];

    case "project-details":
      return [
        { label: "Dashboard", page: "dashboard" },
        { label: "Projects", page: "projects-list" },
        { label: data?.project?.name || "Project", page: "project-details", data: { projectId: data?.projectId } }
      ];

    case "project-issues":
      return [
        { label: "Dashboard", page: "dashboard" },
        { label: "Projects", page: "projects-list" },
        { label: data?.project?.name || "Project", page: "project-details", data: { projectId: data?.projectId } },
        { label: "Issues", page: "project-issues", data: { projectId: data?.projectId } }
      ];

    case "issue-detail":
      return [
        { label: "Dashboard", page: "dashboard" },
        { label: "Projects", page: "projects-list" },
        { label: data?.issue?.project?.name || "Project", page: "project-details", data: { projectId: data?.issue?.project_id } },
        { label: "Issues", page: "project-issues", data: { projectId: data?.issue?.project_id } },
        { label: data?.issue?.title || `Issue #${data?.issueId}`, page: "issue-detail", data: { issueId: data?.issueId } }
      ];

    default:
      return [];
  }
}