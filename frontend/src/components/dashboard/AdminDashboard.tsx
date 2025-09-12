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
import { getAllUsers, getProjects, getIssues } from "../../services/api";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { getChartColor } from "../../utils/colors";
import type { User, Project, Issue, ChartData } from "../../types";

export function AdminDashboard() {
  const { data: users, loading: usersLoading } = useApi<User[]>(getAllUsers);
  const { data: projects, loading: projectsLoading } =
    useApi<Project[]>(getProjects);
  const { data: issues, loading: issuesLoading } = useApi<Issue[]>(getIssues);

  if (usersLoading || projectsLoading || issuesLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  // Users by role data
  const usersByRole: ChartData[] = [];
  if (users && users.length > 0) {
    const roleCounts: Record<string, number> = {
      Admin: 0,
      "Project Manager": 0,
      Contributor: 0,
    };
    for (const user of users) roleCounts[user.role]++;
    for (const role in roleCounts) {
      if (roleCounts[role] > 0) {
        usersByRole.push({
          name: role,
          value: roleCounts[role],
        });
      }
    }
  }

  // Projects by status data
  const projectsByStatus: ChartData[] = [];
  if (projects && projects.length > 0) {
    const statusCounts: Record<string, number> = {
      Active: 0,
      Completed: 0,
      "On Hold": 0,
      Cancelled: 0,
    };
    for (const project of projects) statusCounts[project.status]++;
    for (const status in statusCounts) {
      if (statusCounts[status] > 0) {
        projectsByStatus.push({
          name: status,
          value: statusCounts[status],
        });
      }
    }
  }

  // Open Issues by Active Project data
  const openIssuesByProject: ChartData[] = [];
  if (issues && issues.length > 0 && projects && projects.length > 0) {
    // Get active projects and open issues
    const activeProjects = projects.filter((p) => p.status === "Active");
    const openIssues = issues.filter((issue) => issue.status !== "Closed");

    // Count issues per active project
    const projectCounts: Record<string, number> = {};
    for (const project of activeProjects) projectCounts[project.name] = 0;

    for (const issue of openIssues) {
      const projectName = issue.project.name;
      // Only count if project is active
      if (projectName in projectCounts) projectCounts[projectName]++;
    }

    // Create chart data
    for (const projectName in projectCounts) {
      openIssuesByProject.push({
        name: projectName,
        value: projectCounts[projectName],
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* Row 1: Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Users by Role
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={usersByRole}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                stroke="none"
              >
                {usersByRole.map((entry, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={getChartColor("role", entry.name)}
                    stroke="none"
                    style={{ outline: "none" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Projects by Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Projects by Status
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={projectsByStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#82ca9d"
                stroke="none"
              >
                {projectsByStatus.map((entry, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={getChartColor("projectStatus", entry.name)}
                    stroke="none"
                    style={{ outline: "none" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Bar Chart + Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Issues by Project */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Open Issues by Project
          </h3>
          {openIssuesByProject.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={openIssuesByProject}>
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
              No open issues in active projects
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500">Total Users</h4>
            <p className="text-2xl font-semibold text-gray-900">
              {users?.length || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500">
              Total Projects
            </h4>
            <p className="text-2xl font-semibold text-gray-900">
              {projects?.length || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500">
              Active Projects
            </h4>
            <p className="text-2xl font-semibold text-gray-900">
              {projects?.filter((p) => p.status === "Active").length || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500">Open Issues</h4>
            <p className="text-2xl font-semibold text-blue-600">
              {issues?.filter((i) => i.status !== "Closed").length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
