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
import type { Issue, Project } from "../../types";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"];

interface ContributorDashboardProps {
  userId: number;
}

export function ContributorDashboard({ userId }: ContributorDashboardProps) {
  const { data: issues, loading: issuesLoading } = useApi<Issue[]>(() =>
    getUserIssues(userId)
  );
  const { data: projects, loading: projectsLoading } =
    useApi<Project[]>(getProjects);

  if (issuesLoading || projectsLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  // Filter out closed issues
  const activeIssues =
    issues?.filter((issue) => issue.status !== "Closed") || [];

  // Issues by status
  const issuesByStatus: { name: string; value: number }[] = [];
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
        name: status,
        value: statusCounts[status as keyof typeof statusCounts],
      });
    }
  }

  // Issues by priority
  const workloadByPriority: { name: string; value: number }[] = [];
  const priorityCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  for (const issue of activeIssues) {
    priorityCounts[issue.priority]++;
  }
  for (const priority in priorityCounts) {
    if (priorityCounts[priority as keyof typeof priorityCounts] > 0) {
      workloadByPriority.push({
        name: priority,
        value: priorityCounts[priority as keyof typeof priorityCounts],
      });
    }
  }

  // Issues by project
  const issuesByProject: { project: string; issues: number }[] = [];
  const projectCounts: { [key: string]: number } = {};
  for (const issue of activeIssues) {
    const projectName = issue.project.name;
    projectCounts[projectName] = (projectCounts[projectName] || 0) + 1;
  }
  for (const projectName in projectCounts) {
    issuesByProject.push({
      project: projectName,
      issues: projectCounts[projectName],
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Issues by Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            My Issues by Status
          </h3>
          {issuesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={issuesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="none"
                >
                  {issuesByStatus.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No assigned issues
            </div>
          )}
        </div>

        {/* Workload by Priority */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Workload by Priority
          </h3>
          {workloadByPriority.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={workloadByPriority}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#82ca9d"
                  dataKey="value"
                >
                  {workloadByPriority.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="none"
                      style={{ outline: "none" }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No assigned issues
            </div>
          )}
        </div>
      </div>

      {/* Issues by Project */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          My Issues by Project
        </h3>
        {issuesByProject.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={issuesByProject}>
              <XAxis
                dataKey="project"
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
            No assigned issues across projects
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Total Assigned</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {activeIssues.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">High Priority</h4>
          <p className="text-2xl font-semibold text-red-600">
            {
              activeIssues.filter(
                (i) => i.priority === "High" || i.priority === "Critical"
              ).length
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">In Progress</h4>
          <p className="text-2xl font-semibold text-blue-600">
            {activeIssues.filter((i) => i.status === "In Progress").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">My Projects</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {projects?.length || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
