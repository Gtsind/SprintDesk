import { useState } from "react";
import { AlertCircle, Users, FileCode } from "lucide-react";
import { Layout } from "../components/Layout";
import { generateBreadcrumbs } from "../utils/breadcrumbs";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ListCard } from "../components/ListCard";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/Button";
import { IssueCreateModal } from "../components/IssueCreateModal";
import { useApi } from "../hooks/useApi";
import { getProjectIssues, getProjects } from "../services/api";
import type { Issue, Project } from "../types";

interface ProjectDetailsPageProps {
  navigate: (page: string, data?: unknown) => void;
  pageData: { projectId?: number };
}

export function ProjectDetails({
  navigate,
  pageData,
}: ProjectDetailsPageProps) {
  const projectId = pageData.projectId;
  const [activeTab, setActiveTab] = useState<"issues" | "members">("issues");
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  const { data: issues, loading: issuesLoading, refetch: refetchIssues } = useApi<Issue[]>(
    () => (projectId ? getProjectIssues(projectId) : Promise.resolve([])),
    [projectId]
  );

  const { data: projects, loading: projectsLoading } =
    useApi<Project[]>(getProjects);

  const project = projects?.find((p) => p.id === projectId) || null;
  const isLoading = issuesLoading || projectsLoading;
  const breadcrumbs = generateBreadcrumbs("project-details", {
    projectId,
    project: project || undefined,
  });

  if (isLoading) {
    return (
      <Layout breadcrumbs={breadcrumbs}>
        <LoadingSpinner message="Loading issues..." />
      </Layout>
    );
  }

  const members = project?.members || [];

  const handleIssueCreated = () => {
    refetchIssues();
    setActiveTab("issues"); // Switch to issues tab to see the new issue
  };

  return (
    <Layout navigate={navigate} breadcrumbs={breadcrumbs}>
      <div className="px-4 py-6 sm:px-0">
        {/* Project Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {project?.name || "Project"}
          </h1>
          {project?.description && (
            <p className="text-gray-600 text-lg mb-3">{project.description}</p>
          )}
          {project?.status && (
            <StatusBadge status={project.status} type="project-status" />
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <div className="flex justify-between items-center">
              <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("issues")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "issues"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FileCode className="inline h-4 w-4 mr-1" />
                Issues ({issues?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "members"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Users className="inline h-4 w-4 mr-1" />
                Members ({members.length})
              </button>
              </nav>
              {activeTab === "issues" && (
                <Button
                  onClick={() => setIsIssueModalOpen(true)}
                  className="mb-2"
                >
                  New Issue
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {activeTab === "issues" && (
            <>
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
                    <ListCard
                      key={issue.id}
                      type="issue"
                      item={issue}
                      onClick={(issue) =>
                        navigate("issue-detail", { issueId: issue.id })
                      }
                    />
                  ))}
                </ul>
              )}
            </>
          )}

          {activeTab === "members" && (
            <>
              {members.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No members found
                  </h3>
                  <p className="mt-2 text-gray-600">
                    This project doesn't have any members yet.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {members.map((member) => (
                    <ListCard
                      key={member.id}
                      type="member"
                      item={member}
                      onClick={() => {}}
                    />
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>

      {/* Issue Create Modal */}
      {projectId && (
        <IssueCreateModal
          isOpen={isIssueModalOpen}
          onClose={() => setIsIssueModalOpen(false)}
          onIssueCreated={handleIssueCreated}
          projectId={projectId}
          projectMembers={members}
        />
      )}
    </Layout>
  );
}
