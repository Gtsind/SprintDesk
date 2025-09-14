import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useApi } from "../../hooks/useApi";
import { getAllUsers, getProjects, getIssues } from "../../services/api";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { getChartColor } from "../../utils/colors";
import {
  createUserRoleChart,
  createProjectStatusChart,
  createOpenIssuesByProjectChart,
} from "../../utils/dashboardUtils";
import {
  createUsersPageFilters,
  createProjectsPageFilters,
  createProjectDetailsFilters,
  findProjectIdByName,
} from "../../utils/chartNavigation";
import type { User, Project, Issue } from "../../types";

interface AdminDashboardProps {
  navigate?: (page: string, data?: unknown) => void;
}

export function AdminDashboard({ navigate }: AdminDashboardProps) {
  const { data: users, loading: usersLoading } = useApi<User[]>(getAllUsers);
  const { data: projects, loading: projectsLoading } =
    useApi<Project[]>(getProjects);
  const { data: issues, loading: issuesLoading } = useApi<Issue[]>(getIssues);

  if (usersLoading || projectsLoading || issuesLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  // Prepare chart data using utility functions
  const usersByRole = createUserRoleChart(users || []);
  const projectsByStatus = createProjectStatusChart(projects || []);
  const openIssuesByProject = createOpenIssuesByProjectChart(
    issues || [],
    projects || []
  );

  // Chart click handlers
  const handleUserRoleClick = (data: { name: string; value: number }) => {
    if (!navigate) return;
    // Map display name back to actual role name for filtering
    const actualRole = data.name === "Manager" ? "Project Manager" : data.name;
    const filters = createUsersPageFilters({
      role: actualRole,
    });
    navigate("users-list", { filters });
  };

  const handleProjectStatusClick = (data: { name: string; value: number }) => {
    if (!navigate) return;
    const filters = createProjectsPageFilters({
      status: data.name,
    });
    navigate("projects-list", { filters });
  };

  const handleOpenIssuesProjectClick = (data: {
    name: string;
    value: number;
  }) => {
    if (!navigate || !projects) return;
    const projectId = findProjectIdByName(data.name, projects);
    if (projectId) {
      const filters = createProjectDetailsFilters({});
      navigate("project-details", { projectId, filters });
    }
  };

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
                    style={{
                      outline: "none",
                      cursor: navigate ? "pointer" : "default",
                    }}
                    onClick={() => handleUserRoleClick(entry)}
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
          {projectsByStatus.length > 0 ? (
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
                      style={{
                        outline: "none",
                        cursor: navigate ? "pointer" : "default",
                      }}
                      onClick={() => handleProjectStatusClick(entry)}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              No projects available
            </div>
          )}
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
                <XAxis dataKey="name" tick={false} axisLine={true} />
                <YAxis />
                <Tooltip
                  formatter={(value) => [value, "Open Issues"]}
                  labelFormatter={(label) => `Project: ${label}`}
                />
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                  stroke="none"
                  style={{ cursor: navigate ? "pointer" : "default" }}
                  onClick={(data) => {
                    if (data?.payload) {
                      handleOpenIssuesProjectClick({
                        name: data.payload.name as string,
                        value: data.payload.value as number,
                      });
                    }
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              {(projects || []).filter((p) => p.status === "Active").length === 0
                ? "There are no active projects"
                : "No open issues in active projects"}
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
              {(projects || []).filter((p) => p.status === "Active").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500">Open Issues</h4>
            <p className="text-2xl font-semibold text-blue-600">
              {(issues || []).filter((i) => i.status !== "Closed").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
