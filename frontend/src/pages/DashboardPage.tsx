import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "../contexts/NavigationContext";
import { getProjects, getUserIssues } from "../services/api";
import {
  getPriorityColor,
  getStatusColor,
  getProjectStatusColor,
} from "../utils/colors";
import type { Project, Issue } from "../types";

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [userIssues, setUserIssues] = useState<Issue[]>([]);
  const [isloading, setIsLoading] = useState(true);
  const { state } = useAuth();
  const { navigateTo } = useNavigation();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, issuesData] = await Promise.all([
          getProjects(),
          state.user ? getUserIssues(state.user.id) : [],
        ]);
        setProjects(projectsData);
        setUserIssues(issuesData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [state.user]);

  if (isloading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Your Projects
            </h2>
            <div className="space-y-3">
              {projects.length === 0 ? (
                <p className="text-gray-500">No projects found.</p>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() =>
                      navigateTo("project-issues", {
                        projectId: project.id.toString(),
                      })
                    }
                    className="block w-full text-left border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProjectStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Assigned Issues Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Your Assigned Issues
            </h2>
            <div className="space-y-3">
              {userIssues.length === 0 ? (
                <p className="text-gray-500">No assigned issues found.</p>
              ) : (
                userIssues.slice(0, 5).map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() =>
                      navigateTo("issue-detail", {
                        issueId: issue.id.toString(),
                      })
                    }
                    className="block w-full text-left border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {issue.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {issue.project.name}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            issue.priority
                          )}`}
                        >
                          {issue.priority}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            issue.status
                          )}`}
                        >
                          {issue.status}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            {userIssues.length > 5 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigateTo("dashboard")}
                  className="text-indigo-600 hover:text-indigo-500 text-sm"
                >
                  View all assigned issues
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
