import { useCallback } from "react";
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
import { getUserIssues, getProjects } from "../../services/api";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { getChartColor } from "../../utils/colors";
import {
  createIssueStatusChart,
  createIssuePriorityChart,
  createIssuesByProjectChart,
} from "../../utils/dashboardUtils";
import {
  createIssuesPageFilters,
  createProjectDetailsFilters,
  findProjectIdByName,
} from "../../utils/chartNavigation";
import type { Issue, Project } from "../../types";

interface ContributorDashboardProps {
  userId: number;
  navigate?: (page: string, data?: unknown) => void;
}

export function ContributorDashboard({
  userId,
  navigate,
}: ContributorDashboardProps) {
  const getUserIssuesData = useCallback(() => getUserIssues(userId), [userId]);
  const { data: issues, loading: issuesLoading } = useApi<Issue[]>(getUserIssuesData);
  const { data: projects, loading: projectsLoading } =
    useApi<Project[]>(getProjects);

  if (issuesLoading || projectsLoading)
    return <LoadingSpinner message="Loading dashboard..." />;

  // Prepare chart data using utility functions
  const issuesByStatus = createIssueStatusChart(issues || []);
  const issuesByPriority = createIssuePriorityChart(issues || []);
  const issuesByProject = createIssuesByProjectChart(
    issues || [],
    projects || []
  );

  // Get active issues count for summary stats
  const activeIssues = (issues || []).filter(
    (issue) => issue.status !== "Closed"
  );

  // Chart click handlers
  const handleStatusChartClick = (data: { name: string; value: number }) => {
    if (!navigate) return;
    const filters = createIssuesPageFilters({
      status: data.name,
      assignee: userId,
    });
    navigate("issues-list", { filters });
  };

  const handlePriorityChartClick = (data: { name: string; value: number }) => {
    if (!navigate) return;
    const filters = createIssuesPageFilters({
      priority: data.name,
      assignee: userId,
    });
    navigate("issues-list", { filters });
  };

  const handleProjectChartClick = (data: { name: string; value: number }) => {
    if (!navigate || !projects) return;
    const projectId = findProjectIdByName(data.name, projects);
    if (projectId) {
      const filters = createProjectDetailsFilters({
        assignee: userId,
      });
      navigate("project-details", { projectId, filters });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* Row 1: Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Issues by Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            My Issues by Status
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
                  dataKey="value"
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
              No assigned issues
            </div>
          )}
        </div>

        {/* Workload by Priority */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Workload by Priority
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
              No assigned issues
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Bar Chart + Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Project */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            My Issues by Project
          </h3>
          {issuesByProject.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={issuesByProject}>
                <XAxis
                  angle={-30}
                  textAnchor="end"
                  height={60}
                  dataKey="name"
                />
                <YAxis />
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                  stroke="none"
                  style={{ cursor: navigate ? "pointer" : "default" }}
                  onClick={(data) => {
                    if (data?.payload) {
                      handleProjectChartClick({
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
              No assigned issues across active projects
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500">
              Total Assigned
            </h4>
            <p className="text-2xl font-semibold text-gray-900">
              {activeIssues.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500">High Priority</h4>
            <p className="text-2xl font-semibold text-red-600">
              {
                activeIssues.filter(
                  (i) => i.priority === "High" || i.priority === "Critical"
                ).length
              }
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500">In Progress</h4>
            <p className="text-2xl font-semibold text-blue-600">
              {activeIssues.filter((i) => i.status === "In Progress").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-500">My Projects</h4>
            <p className="text-2xl font-semibold text-gray-900">
              {projects?.length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
