import type {
  Issue,
  Project,
  User,
  ChartData,
  IssueStatus,
  IssuePriority,
  UserRole,
  ProjectStatus,
} from "../types";

// Simple filtering functions
export function getActiveIssues(issues: Issue[]): Issue[] {
  return issues.filter((issue) => issue.status !== "Closed");
}

export function getActiveProjects(projects: Project[]): Project[] {
  return projects.filter((project) => project.status === "Active");
}

// Issue status chart data
export function createIssueStatusChart(issues: Issue[]): ChartData[] {
  const activeIssues = getActiveIssues(issues);
  const statusCounts: Record<IssueStatus, number> = {
    Open: 0,
    "In Progress": 0,
    "Review Ready": 0,
    Blocked: 0,
    Closed: 0,
  };

  for (const issue of activeIssues) {
    statusCounts[issue.status]++;
  }

  const chartData: ChartData[] = [];
  for (const status in statusCounts) {
    const key = status as IssueStatus;
    if (statusCounts[key] > 0) {
      chartData.push({ name: key, value: statusCounts[key] });
    }
  }

  return chartData;
}

// Issue priority chart data
export function createIssuePriorityChart(issues: Issue[]): ChartData[] {
  const activeIssues = getActiveIssues(issues);
  const priorityCounts: Record<IssuePriority, number> = {
    Low: 0,
    Medium: 0,
    High: 0,
    Critical: 0,
  };

  for (const issue of activeIssues) {
    priorityCounts[issue.priority]++;
  }

  const chartData: ChartData[] = [];
  for (const priority in priorityCounts) {
    const key = priority as IssuePriority;
    if (priorityCounts[key] > 0) {
      chartData.push({ name: key, value: priorityCounts[key] });
    }
  }

  return chartData;
}

// User role chart data
export function createUserRoleChart(users: User[]): ChartData[] {
  const roleCounts: Record<UserRole, number> = {
    Admin: 0,
    "Project Manager": 0,
    Contributor: 0,
  };

  for (const user of users) {
    roleCounts[user.role]++;
  }

  const chartData: ChartData[] = [];
  for (const role in roleCounts) {
    const key = role as UserRole;
    if (roleCounts[key] > 0) {
      chartData.push({ name: key, value: roleCounts[key] });
    }
  }

  return chartData;
}

// Project status chart data
export function createProjectStatusChart(projects: Project[]): ChartData[] {
  const statusCounts: Record<ProjectStatus, number> = {
    Active: 0,
    Completed: 0,
    "On Hold": 0,
    Cancelled: 0,
  };

  for (const project of projects) {
    statusCounts[project.status]++;
  }

  const chartData: ChartData[] = [];
  for (const status in statusCounts) {
    const key = status as ProjectStatus;
    if (statusCounts[key] > 0) {
      chartData.push({ name: key, value: statusCounts[key] });
    }
  }

  return chartData;
}

// Issues by project chart data
export function createIssuesByProjectChart(
  issues: Issue[],
  projects: Project[]
): ChartData[] {
  const activeProjects = getActiveProjects(projects);
  const activeIssues = getActiveIssues(issues);

  const projectCounts: Record<string, number> = {};
  for (const project of activeProjects) {
    projectCounts[project.name] = 0;
  }

  for (const issue of activeIssues) {
    const projectName = issue.project.name;
    if (projectName in projectCounts) {
      projectCounts[projectName]++;
    }
  }

  const chartData: ChartData[] = [];
  for (const projectName in projectCounts) {
    chartData.push({ name: projectName, value: projectCounts[projectName] });
  }

  return chartData;
}

// Get all unique team members from projects
export function getAllTeamMembers(projects: Project[]): User[] {
  const allMembers: User[] = [];

  for (const project of projects) {
    if (project.members) {
      for (const member of project.members) {
        const alreadyExists = allMembers.find((m) => m.id === member.id);
        if (!alreadyExists) {
          allMembers.push(member as User);
        }
      }
    }
  }

  return allMembers;
}

// Team workload chart data
export function createTeamWorkloadChart(
  issues: Issue[],
  members: User[]
): ChartData[] {
  const activeIssues = getActiveIssues(issues);

  const memberCounts: Record<string, number> = {};
  for (const member of members) {
    const username = `@${member.username}`;
    memberCounts[username] = 0;
  }

  let unassignedCount = 0;
  for (const issue of activeIssues) {
    if (issue.assignee) {
      const username = `@${issue.assignee.username}`;
      if (username in memberCounts) {
        memberCounts[username]++;
      }
    } else {
      unassignedCount++;
    }
  }

  const chartData: ChartData[] = [];
  for (const username in memberCounts) {
    chartData.push({ name: username, value: memberCounts[username] });
  }

  if (unassignedCount > 0) {
    chartData.push({ name: "Unassigned", value: unassignedCount });
  }

  return chartData;
}

// Open issues by active project (Admin dashboard specific)
export function createOpenIssuesByProjectChart(
  issues: Issue[],
  projects: Project[]
): ChartData[] {
  const activeProjects = getActiveProjects(projects);
  const openIssues = issues.filter((issue) => issue.status !== "Closed");

  const projectCounts: Record<string, number> = {};
  for (const project of activeProjects) {
    projectCounts[project.name] = 0;
  }

  for (const issue of openIssues) {
    const projectName = issue.project.name;
    if (projectName in projectCounts) {
      projectCounts[projectName]++;
    }
  }

  const chartData: ChartData[] = [];
  for (const projectName in projectCounts) {
    chartData.push({ name: projectName, value: projectCounts[projectName] });
  }

  return chartData;
}
