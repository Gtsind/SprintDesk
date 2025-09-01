import { User, Calendar, AlertCircle } from "lucide-react";
import { Layout } from "../components/Layout";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StatusBadge } from "../components/StatusBadge";
import { useApi } from "../hooks/useApi";
import { getProjectIssues, getProjects } from "../services/api";
import type { Issue, Project } from "../types";

interface ProjectIssuesPageProps {
  navigate: (page: string, data?: any) => void;
  pageData: { projectId?: number };
}

export function ProjectIssuesPage({ navigate, pageData }: ProjectIssuesPageProps) {
  const projectId = pageData.projectId;
  
  const { data: issues, loading: issuesLoading } = useApi<Issue[]>(
    () => projectId ? getProjectIssues(projectId) : Promise.resolve([]),
    [projectId]
  );
  
  const { data: projects, loading: projectsLoading } = useApi<Project[]>(getProjects);
  
  const project = projects?.find(p => p.id === projectId) || null;
  const isLoading = issuesLoading || projectsLoading;

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading issues..." />
      </Layout>
    );
  }

  return (
    <Layout navigate={navigate}>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {project ? `${project.name} Issues` : "Project Issues"}
            </h1>
            <p className="text-gray-600 mt-1">{issues?.length || 0} total issues</p>
          </div>
          <button
            onClick={() => navigate("dashboard")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {!issues || issues.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No issues found
              </h3>
              <p className="mt-2 text-gray-600">
                This project doesn't have any issues yet.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {issues.map((issue) => (
                <li key={issue.id}>
                  <button
                    onClick={() => navigate("issue-detail", { issueId: issue.id })}
                    className="block w-full text-left hover:bg-gray-50 px-6 py-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {issue.title}
                          </h3>
                          <div className="ml-4 flex space-x-2">
                            <StatusBadge
                              status={issue.priority}
                              type="priority"
                            />
                            <StatusBadge status={issue.status} type="status" />
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <User className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <span className="truncate">
                            Created by {issue.author.firstname}{" "}
                            {issue.author.lastname}
                          </span>
                          {issue.assignee && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="truncate">
                                Assigned to {issue.assignee.firstname}{" "}
                                {issue.assignee.lastname}
                              </span>
                            </>
                          )}
                          <span className="mx-2">•</span>
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <span>
                            {new Date(issue.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {issue.description && (
                          <p className="mt-2 text-sm text-gray-600 truncate">
                            {issue.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}
