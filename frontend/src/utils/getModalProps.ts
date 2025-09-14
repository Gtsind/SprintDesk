import type { Project, User, Issue } from "../types";

interface GetModalPropsParams {
  type: "project" | "member" | "issue";
  item: Project | User | Issue | null;
  isDeleting: boolean;
  isRemovingMember: boolean;
  isDeletingIssue: boolean;
}

export function getModalProps({
  type,
  item,
  isDeleting,
  isRemovingMember,
  isDeletingIssue,
}: GetModalPropsParams) {
  switch (type) {
    case "project": {
      const project = item as Project;
      return {
        title: "Delete Project",
        message: `Are you sure you want to delete "${project?.name}"?\nThis action cannot be undone.`,
        confirmButtonText: "Delete",
        isLoading: isDeleting,
      };
    }

    case "member": {
      const member = item as User;
      return {
        title: "Remove Member",
        message: `Remove ${member?.firstname} ${member?.lastname} from this project?`,
        confirmButtonText: "Remove",
        isLoading: isRemovingMember,
      };
    }

    case "issue": {
      const issue = item as Issue;
      return {
        title: "Delete Issue",
        message: `Are you sure you want to delete "${issue?.title}"?\nThis action cannot be undone.`,
        confirmButtonText: "Delete",
        isLoading: isDeletingIssue,
      };
    }

    default:
      return {
        title: "Confirm Delete",
        message: "Are you sure you want to proceed?",
        confirmButtonText: "Delete",
        isLoading: false,
      };
  }
}
