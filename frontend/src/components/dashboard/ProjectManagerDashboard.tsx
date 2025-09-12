import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { useApi } from "../../hooks/useApi";
import { getProjects, getIssues } from "../../services/api";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { getChartColor } from "../../utils/colors";
import type { Project, Issue, User, ChartData } from "../../types";

export function ProjectManagerDashboard() {
  const { data: projects, loading: projectsLoading } =
    useApi<Project[]>(getProjects);
  const { data: issues, loading: issuesLoading } = useApi<Issue[]>(getIssues);

  // Get all members from all my projects
  const allMembers: User[] = [];
  if (projects) {
    for (const project of projects) {
      if (project.members) {
        for (const member of project.members) {
          // Add member if not already in the list
          if (!allMembers.find((m) => m.id === member.id)) {
            allMembers.push(member);
          }
        }
      }
    }
  }

  if (projectsLoading || issuesLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  // Filter issues from my projects that are not closed
  const activeIssues =
    issues?.filter((issue) => issue.status !== "Closed") || [];

  // Issues by status data (only non-closed issues)
  const issuesByStatus: ChartData[] = [];
  if (activeIssues.length > 0) {
    const statusCounts: Record<string, number> = {
      Open: 0,
      "In Progress": 0,
      "Review Ready": 0,
      Blocked: 0,
    };
    for (const issue of activeIssues) statusCounts[issue.status]++;
    for (const status in statusCounts) {
      if (statusCounts[status] > 0) {
        issuesByStatus.push({
          name: status,
          value: statusCounts[status],
        });
      }
    }
  }

  // Issues by priority data (only non-closed issues)
  const issuesByPriority: ChartData[] = [];
  if (activeIssues.length > 0) {
    const priorityCounts: Record<string, number> = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0,
    };
    for (const issue of activeIssues) priorityCounts[issue.priority]++;
    for (const priority in priorityCounts) {
      if (priorityCounts[priority] > 0) {
        issuesByPriority.push({
          name: priority,
          value: priorityCounts[priority],
        });
      }
    }
  }

  // Team workload data (issues per member, including 0)
  const teamWorkload: ChartData[] = [];

  // Initialize all members with 0 issues
  const workloadCounts: Record<string, number> = {};
  for (const member of allMembers) {
    const memberUsername = `@${member.username}`;
    workloadCounts[memberUsername] = 0;
  }

  // Count unassigned issues
  let unassignedCount = 0;

  // Count actual assigned issues
  for (const issue of activeIssues) {
    if (issue.assignee) {
      const assigneeUsername = `@${issue.assignee.username}`;
      if (assigneeUsername in workloadCounts)
        workloadCounts[assigneeUsername]++;
    } else {
      unassignedCount++;
    }
  }

  // Add all members to teamWorkload (even with 0 issues)
  for (const username in workloadCounts) {
    teamWorkload.push({
      name: username,
      value: workloadCounts[username],
    });
  }

  // Add unassigned if there are any
  if (unassignedCount > 0) {
    teamWorkload.push({
      name: "Unassigned",
      value: unassignedCount,
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* Row 1: Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Active Issues by Status
          </h3>
          {issuesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={issuesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  stroke="none"
                >
                  {issuesByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getChartColor("status", entry.name)}
                      stroke="none"
                      style={{ outline: "none" }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              No active issues in your projects
            </div>
          )}
        </div>

        {/* Active Issues by Priority Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Active Issues by Priority
          </h3>
          {issuesByPriority.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={issuesByPriority}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#82ca9d"
                  dataKey="value"
                  stroke="none"
                >
                  {issuesByPriority.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getChartColor("priority", entry.name)}
                      stroke="none"
                      style={{ outline: "none" }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              No active issues by priority
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Team Workload + Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Workload Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Team Workload
          </h3>
          {allMembers.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={teamWorkload}>
                <XAxis
                  dataKey="name"
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Bar dataKey="value" fill="#8884d8" stroke="none" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              No team workload data available
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500">My Projects</h4>
            <p className="text-2xl font-semibold text-gray-900">
              {projects?.length || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500">Active Issues</h4>
            <p className="text-2xl font-semibold text-gray-900">
              {activeIssues.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500">Open Issues</h4>
            <p className="text-2xl font-semibold text-red-600">
              {activeIssues.filter((i) => i.status === "Open").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500">In Progress</h4>
            <p className="text-2xl font-semibold text-blue-600">
              {activeIssues.filter((i) => i.status === "In Progress").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
