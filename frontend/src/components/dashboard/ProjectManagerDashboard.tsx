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
import { getProjects, getIssues, getProjectMembers } from "../../services/api";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import type { Project, Issue, User } from "../../types";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"];

export function ProjectManagerDashboard() {
  const { data: projects, loading: projectsLoading } =
    useApi<Project[]>(getProjects);
  const { data: allIssues, loading: issuesLoading } =
    useApi<Issue[]>(getIssues);

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

  const projectIds = projects?.map((p) => p.id) || [];

  // Filter issues from my projects that are not closed
  const activeIssues =
    allIssues?.filter(
      (issue) =>
        projectIds.includes(issue.project.id) && issue.status !== "Closed"
    ) || [];

  // Issues by status data (only non-closed issues)
  const issuesByStatus = [];
  if (activeIssues.length > 0) {
    const statusCounts = {
      Open: 0,
      "In Progress": 0,
      "Review Ready": 0,
      Blocked: 0,
    };
    for (const issue of activeIssues) {
      statusCounts[issue.status as keyof typeof statusCounts]++;
    }
    for (const status in statusCounts) {
      if (statusCounts[status as keyof typeof statusCounts] > 0) {
        issuesByStatus.push({
          status,
          count: statusCounts[status as keyof typeof statusCounts],
        });
      }
    }
  }

  // Team workload data (issues per member, including 0)
  const teamWorkload = [];

  // Initialize all members with 0 issues
  const workloadCounts: { [key: string]: number } = {};
  for (const member of allMembers) {
    const memberName = `${member.firstname} ${member.lastname}`;
    workloadCounts[memberName] = 0;
  }

  // Count unassigned issues
  let unassignedCount = 0;

  // Count actual assigned issues
  for (const issue of activeIssues) {
    if (issue.assignee) {
      const assigneeName = `${issue.assignee.firstname} ${issue.assignee.lastname}`;
      if (workloadCounts.hasOwnProperty(assigneeName)) {
        workloadCounts[assigneeName]++;
      }
    } else {
      unassignedCount++;
    }
  }

  // Add all members to teamWorkload (even with 0 issues)
  for (const name in workloadCounts) {
    teamWorkload.push({
      member: name,
      issues: workloadCounts[name],
    });
  }

  // Add unassigned if there are any
  if (unassignedCount > 0) {
    teamWorkload.push({
      member: "Unassigned",
      issues: unassignedCount,
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Active Issues by Status
          </h3>
          {issuesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={issuesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  stroke="none"
                >
                  {issuesByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No active issues in your projects
            </div>
          )}
        </div>

        {/* Team Workload Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Team Workload
          </h3>
          {allMembers.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamWorkload}>
                <XAxis
                  dataKey="member"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Bar dataKey="issues" fill="#8884d8" stroke="none" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No team workload data available
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">My Projects</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {projects?.length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Active Issues</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {activeIssues.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Open Issues</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {activeIssues.filter((i) => i.status === "Open").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">In Progress</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {activeIssues.filter((i) => i.status === "In Progress").length}
          </p>
        </div>
      </div>
    </div>
  );
}
