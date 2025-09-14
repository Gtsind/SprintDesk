import type { BreadCrumb } from "../components/layout/Header";
import type { Project, Issue, User } from "../types";

export function generateBreadcrumbs(
  page: string,
  data?: {
    projectId?: number;
    issueId?: number;
    userId?: number;
    project?: Project;
    issue?: Issue;
    user?: User;
    isOwnProfile?: boolean;
    fromPage?: string;
  }
): BreadCrumb[] {
  switch (page) {
    case "login":
    case "register":
    case "dashboard":
      return [];

    case "issues-list":
      return [
        { label: "My work", page: "dashboard" },
        { label: "Issues", page: "issues-list" },
      ];

    case "projects-list":
      return [
        { label: "My work", page: "dashboard" },
        { label: "Projects", page: "projects-list" },
      ];

    case "users-list":
      return [
        { label: "My work", page: "dashboard" },
        { label: "Users", page: "users-list" },
      ];

    case "user-detail":
      // For own profile, show "My work > Profile" instead of going through Users
      if (data?.isOwnProfile) {
        return [
          { label: "My work", page: "dashboard" },
          {
            label: "Profile",
            page: "user-detail",
            data: { userId: data?.userId },
          },
        ];
      }
      // For admins viewing other users, show full path through Users
      return [
        { label: "My work", page: "dashboard" },
        { label: "Users", page: "users-list" },
        {
          label: data?.user
            ? `${data.user.firstname} ${data.user.lastname}`
            : "User",
          page: "user-detail",
          data: { userId: data?.userId },
        },
      ];

    case "project-details":
      return [
        { label: "My work", page: "dashboard" },
        { label: "Projects", page: "projects-list" },
        {
          label: data?.project?.name || "Project",
          page: "project-details",
          data: { projectId: data?.projectId },
        },
      ];

    case "issue-detail":
      // If coming from issues-list, show Issues path
      if (data?.fromPage === "issues-list") {
        return [
          { label: "My work", page: "dashboard" },
          { label: "Issues", page: "issues-list" },
          {
            label: `Issue #${data?.issue?.id || data?.issueId}`,
            page: "issue-detail",
            data: { issueId: data?.issueId },
          },
        ];
      }
      // Default to Projects path (for project-details navigation)
      return [
        { label: "My work", page: "dashboard" },
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
