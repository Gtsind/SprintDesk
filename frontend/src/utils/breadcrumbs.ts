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

    case "issues-list":
      return [
        { label: "Your work", page: "dashboard" },
        { label: "Issues", page: "issues-list" },
      ];

    case "projects-list":
      return [
        { label: "Your work", page: "dashboard" },
        { label: "Projects", page: "projects-list" },
      ];

    case "project-details":
      return [
        { label: "Your work", page: "dashboard" },
        { label: "Projects", page: "projects-list" },
        {
          label: data?.project?.name || "Project",
          page: "project-details",
          data: { projectId: data?.projectId },
        },
      ];

    case "issue-detail":
      return [
        { label: "Your work", page: "dashboard" },
        { label: "Projects", page: "projects-list" },
        {
          label: data?.issue?.project?.name || "Project",
          page: "project-details",
          data: { projectId: data?.issue?.project_id },
        },
        {
          label: `Issue #${data?.issue?.id || data?.issueId}`,
          page: "issue-detail",
          data: { issueId: data?.issueId },
        },
      ];

    default:
      return [];
  }
}
