import type { FilterConfig, FilterOptionType } from "../components/toolbar";
import type { Project, Issue, User } from "../types";

// Static filter options for common filter types
export const PROJECT_STATUS_OPTIONS: FilterOptionType[] = [
  { value: "Active", label: "Active" },
  { value: "Completed", label: "Completed" },
  { value: "On Hold", label: "On Hold" },
  { value: "Cancelled", label: "Cancelled" },
];

export const ISSUE_STATUS_OPTIONS: FilterOptionType[] = [
  { value: "Open", label: "Open" },
  { value: "In Progress", label: "In Progress" },
  { value: "Review Ready", label: "Review Ready" },
  { value: "Closed", label: "Closed" },
  { value: "Blocked", label: "Blocked" },
];

export const ISSUE_PRIORITY_OPTIONS: FilterOptionType[] = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
];

export const USER_ROLE_OPTIONS: FilterOptionType[] = [
  { value: "Admin", label: "Admin" },
  { value: "Project Manager", label: "Project Manager" },
  { value: "Contributor", label: "Contributor" },
];

// Helper functions to create dynamic filter options
export function createProjectOptions(projects: Project[]): FilterOptionType[] {
  return projects.map((project) => ({
    value: project.id,
    label: project.name,
  }));
}

export function createUserOptions(users: User[]): FilterOptionType[] {
  return users.map((user) => ({
    value: user.id,
    label: `${user.firstname} ${user.lastname}`,
  }));
}

export function createCreatorOptions(projects: Project[]): FilterOptionType[] {
  // Get unique creators from projects
  const creatorsMap = new Map();
  projects.forEach((project) => {
    const creator = project.creator;
    if (!creatorsMap.has(creator.id)) {
      creatorsMap.set(creator.id, {
        value: creator.id,
        label: `${creator.firstname} ${creator.lastname}`,
      });
    }
  });
  return Array.from(creatorsMap.values());
}

// Pre-configured filter configs for different pages
export function createProjectsPageFilterConfig(
  projects?: Project[]
): FilterConfig {
  return {
    filters: [
      {
        key: "status",
        label: "Status",
        type: "multi" as const,
        options: PROJECT_STATUS_OPTIONS,
      },
      ...(projects
        ? [
            {
              key: "creator",
              label: "Created By",
              type: "multi" as const,
              options: createCreatorOptions(projects),
            },
          ]
        : []),
    ],
  };
}

export function createIssuesPageFilterConfig(
  projects?: Project[],
  users?: User[]
): FilterConfig {
  return {
    filters: [
      ...(projects
        ? [
            {
              key: "project",
              label: "Project",
              type: "multi" as const,
              options: createProjectOptions(projects),
            },
          ]
        : []),
      {
        key: "status",
        label: "Status",
        type: "multi" as const,
        options: ISSUE_STATUS_OPTIONS,
      },
      {
        key: "priority",
        label: "Priority",
        type: "multi" as const,
        options: ISSUE_PRIORITY_OPTIONS,
      },
      ...(users
        ? [
            {
              key: "assignee",
              label: "Assignee",
              type: "multi" as const,
              options: [
                { value: "unassigned", label: "Unassigned" },
                ...createUserOptions(users)
              ],
            },
          ]
        : []),
      ...(users
        ? [
            {
              key: "author",
              label: "Author",
              type: "multi" as const,
              options: createUserOptions(users),
            },
          ]
        : []),
    ],
  };
}

export function createProjectDetailsIssuesFilterConfig(
  assignees?: User[],
  authors?: User[]
): FilterConfig {
  return {
    filters: [
      {
        key: "status",
        label: "Status",
        type: "multi" as const,
        options: ISSUE_STATUS_OPTIONS,
      },
      {
        key: "priority",
        label: "Priority",
        type: "multi" as const,
        options: ISSUE_PRIORITY_OPTIONS,
      },
      ...(assignees
        ? [
            {
              key: "assignee",
              label: "Assignee",
              type: "multi" as const,
              options: [
                { value: "unassigned", label: "Unassigned" },
                ...createUserOptions(assignees)
              ],
            },
          ]
        : []),
      ...(authors
        ? [
            {
              key: "author",
              label: "Author",
              type: "multi" as const,
              options: createUserOptions(authors),
            },
          ]
        : []),
    ],
  };
}

export function createProjectDetailsMembersFilterConfig(): FilterConfig {
  return {
    filters: [
      {
        key: "role",
        label: "Role",
        type: "multi" as const,
        options: USER_ROLE_OPTIONS,
      },
    ],
  };
}

// Helper function to apply filters to data arrays
export function applyFilters<T>(
  items: T[],
  activeFilters: Record<string, string | number | (string | number)[]>,
  filterFunctions: Record<
    string,
    (item: T, filterValue: string | number) => boolean
  >
): T[] {
  return items.filter((item) => {
    return Object.entries(activeFilters).every(([filterKey, filterValue]) => {
      const filterFunction = filterFunctions[filterKey];
      if (!filterFunction) return true;

      // Handle multi-select filters (array values)
      if (Array.isArray(filterValue)) {
        return filterValue.some((value) => filterFunction(item, value));
      }

      // Handle single-select filters
      return filterFunction(item, filterValue);
    });
  });
}

// Common filter functions for different data types
export const projectFilterFunctions = {
  status: (project: Project, statusValue: string | number) =>
    project.status === statusValue,
  creator: (project: Project, creatorId: string | number) =>
    project.creator.id === Number(creatorId),
};

export const issueFilterFunctions = {
  project: (issue: Issue, projectId: string | number) =>
    issue.project_id === Number(projectId),
  status: (issue: Issue, statusValue: string | number) =>
    issue.status === statusValue,
  priority: (issue: Issue, priorityValue: string | number) =>
    issue.priority === priorityValue,
  assignee: (issue: Issue, assigneeId: string | number) =>
    assigneeId === "unassigned" ? issue.assignee_id === null : issue.assignee_id === Number(assigneeId),
  author: (issue: Issue, authorId: string | number) =>
    issue.author_id === Number(authorId),
};

export const userFilterFunctions = {
  role: (user: User, roleValue: string | number) => user.role === roleValue,
};
