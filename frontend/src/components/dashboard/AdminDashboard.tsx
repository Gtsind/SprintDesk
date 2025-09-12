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
import { getAllUsers, getProjects } from "../../services/api";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import type { User, Project } from "../../types";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"];

export function AdminDashboard() {
  const { data: users, loading: usersLoading } = useApi<User[]>(getAllUsers);
  const { data: projects, loading: projectsLoading } =
    useApi<Project[]>(getProjects);

  if (usersLoading || projectsLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  // Users by role data
  const usersByRole = [];
  if (users) {
    const roleCounts = { Admin: 0, "Project Manager": 0, Contributor: 0 };
    for (const user of users) {
      roleCounts[user.role]++;
    }
    for (const role in roleCounts) {
      if (roleCounts[role as keyof typeof roleCounts] > 0) {
        usersByRole.push({
          role,
          count: roleCounts[role as keyof typeof roleCounts],
        });
      }
    }
  }

  // Projects by status data
  const projectsByStatus = [];
  if (projects) {
    const statusCounts = {
      Active: 0,
      Completed: 0,
      "On Hold": 0,
      Cancelled: 0,
    };
    for (const project of projects) {
      statusCounts[project.status]++;
    }
    for (const status in statusCounts) {
      if (statusCounts[status as keyof typeof statusCounts] > 0) {
        projectsByStatus.push({
          status,
          count: statusCounts[status as keyof typeof statusCounts],
        });
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Users by Role
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={usersByRole}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ role, count }) => `${role}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                stroke="none"
              >
                {usersByRole.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="none"
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectsByStatus}>
              <XAxis dataKey="status" />
              <YAxis />
              <Bar dataKey="count" fill="#8884d8" stroke="none" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Total Users</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {users?.length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Total Projects</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {projects?.length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Active Projects</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {projects?.filter((p) => p.status === "Active").length || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
