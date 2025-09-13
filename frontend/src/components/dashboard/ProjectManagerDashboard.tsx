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
import {
  createIssueStatusChart,
  createIssuePriorityChart,
  getAllTeamMembers,
  createTeamWorkloadChart,
} from "../../utils/dashboardUtils";
import {
  createIssuesPageFilters,
  findUserIdByUsername,
} from "../../utils/chartNavigation";
import type { Project, Issue } from "../../types";

interface ProjectManagerDashboardProps {
  navigate?: (page: string, data?: unknown) => void;
}

export function ProjectManagerDashboard({
  navigate,
}: ProjectManagerDashboardProps) {
  const { data: projects, loading: projectsLoading } =
    useApi<Project[]>(getProjects);
  const { data: issues, loading: issuesLoading } = useApi<Issue[]>(getIssues);

  if (projectsLoading || issuesLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  // Get all team members and prepare chart data using utility functions
  const allMembers = getAllTeamMembers(projects || []);
  const issuesByStatus = createIssueStatusChart(issues || []);
  const issuesByPriority = createIssuePriorityChart(issues || []);
  const teamWorkload = createTeamWorkloadChart(issues || [], allMembers);

  // Get active issues count for summary stats
  const activeIssues = (issues || []).filter(
    (issue) => issue.status !== "Closed"
  );

  // Chart click handlers
  const handleStatusChartClick = (data: { name: string; value: number }) => {
    if (!navigate) return;
    const filters = createIssuesPageFilters({
      status: data.name,
    });
    navigate("issues-list", { filters });
  };

  const handlePriorityChartClick = (data: { name: string; value: number }) => {
    if (!navigate) return;
    const filters = createIssuesPageFilters({
      priority: data.name,
    });
    navigate("issues-list", { filters });
  };

  const handleTeamWorkloadClick = (data: { name: string; value: number }) => {
    if (!navigate) return;

    // Handle "Unassigned" special case
    if (data.name === "Unassigned") {
      const filters = createIssuesPageFilters({
        assignee: "unassigned",
      });
      navigate("issues-list", { filters });
      return;
    }

    // Handle regular users
    if (!allMembers) return;
    const userId = findUserIdByUsername(data.name, allMembers);
    if (userId) {
      const filters = createIssuesPageFilters({
        assignee: userId,
      });
      navigate("issues-list", { filters });
    }
  };

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
                      style={{
                        outline: "none",
                        cursor: navigate ? "pointer" : "default",
                      }}
                      onClick={() => handleStatusChartClick(entry)}
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
                      style={{
                        outline: "none",
                        cursor: navigate ? "pointer" : "default",
                      }}
                      onClick={() => handlePriorityChartClick(entry)}
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
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                  stroke="none"
                  style={{ cursor: navigate ? "pointer" : "default" }}
                  onClick={(data) => {
                    if (data?.payload) {
                      handleTeamWorkloadClick({
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
