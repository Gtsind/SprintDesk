import type { ActiveFilters } from "../components/toolbar";

// Helper functions to build filter objects for chart click navigation

/**
 * Creates filters for navigating to IssuesPage from chart clicks
 * Always excludes closed issues
 */
export function createIssuesPageFilters(params: {
  status?: string;
  priority?: string;
  assignee?: number | "unassigned";
}): ActiveFilters {
  const filters: ActiveFilters = {};

  if (params.status) {
    // Include the clicked status but exclude closed
    if (params.status === "Closed") {
      filters.status = [params.status];
    } else {
      filters.status = [params.status];
    }
  } else {
    // When no specific status, exclude closed
    filters.status = ["Open", "In Progress", "Review Ready", "Blocked"];
  }

  if (params.priority) {
    filters.priority = [params.priority];
    // Also exclude closed when filtering by priority
    if (!params.status) {
      filters.status = ["Open", "In Progress", "Review Ready", "Blocked"];
    }
  }

  if (params.assignee !== undefined) {
    filters.assignee = [params.assignee];
    // Also exclude closed when filtering by assignee
    if (!params.status) {
      filters.status = ["Open", "In Progress", "Review Ready", "Blocked"];
    }
  }

  return filters;
}

/**
 * Creates filters for navigating to ProjectDetailsPage from chart clicks
 * Always excludes closed issues
 */
export function createProjectDetailsFilters(params: {
  assignee?: number;
  status?: string;
}): ActiveFilters {
  const filters: ActiveFilters = {};

  if (params.assignee) {
    filters.assignee = [params.assignee];
  }

  if (params.status) {
    filters.status = [params.status];
  }

  // Always exclude closed issues
  if (!params.status) {
    filters.status = ["Open", "In Progress", "Review Ready", "Blocked"];
  }

  return filters;
}

/**
 * Creates filters for navigating to UsersPage from chart clicks
 */
export function createUsersPageFilters(params: {
  role?: string;
}): ActiveFilters {
  const filters: ActiveFilters = {};

  if (params.role) {
    filters.role = [params.role];
  }

  return filters;
}

/**
 * Creates filters for navigating to ProjectsPage from chart clicks
 */
export function createProjectsPageFilters(params: {
  status?: string;
}): ActiveFilters {
  const filters: ActiveFilters = {};

  if (params.status) {
    filters.status = [params.status];
  }

  return filters;
}

/**
 * Helper function to find project ID by name from chart data
 */
export function findProjectIdByName(projectName: string, projects: Array<{id: number, name: string}>): number | null {
  const project = projects.find(p => p.name === projectName);
  return project ? project.id : null;
}

/**
 * Helper function to find user ID by username from chart data
 */
export function findUserIdByUsername(username: string, users: Array<{id: number, username: string}>): number | null {
  // Remove @ prefix if present
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
  const user = users.find(u => u.username === cleanUsername);
  return user ? user.id : null;
}