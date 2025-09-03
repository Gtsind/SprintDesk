import { User, Calendar, FolderOpen, Users, AlertCircle } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { Issue, Project } from "../types";

interface IssueListCardProps {
  type: "issue";
  item: Issue;
  onClick: (item: Issue) => void;
}

interface ProjectListCardProps {
  type: "project";
  item: Project & { openIssuesCount?: number };
  onClick: (item: Project) => void;
}

type ListCardProps = IssueListCardProps | ProjectListCardProps;

export function ListCard({ type, item, onClick }: ListCardProps) {
  if (type === "issue") {
    const issue = item as Issue;
    return (
      <li>
        <button
          onClick={() => onClick(issue)}
          className="block w-full text-left hover:bg-gray-50 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {issue.title}
                </h3>
                <div className="ml-4 flex space-x-2">
                  <StatusBadge status={issue.priority} type="priority" />
                  <StatusBadge status={issue.status} type="status" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <User className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span className="truncate">
                  Created by {issue.author.firstname} {issue.author.lastname}
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
                <span>{new Date(issue.created_at).toLocaleDateString()}</span>
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
    );
  }

  if (type === "project") {
    const project = item as Project & { openIssuesCount?: number };
    return (
      <li>
        <button
          onClick={() => onClick(project)}
          className="block w-full text-left hover:bg-gray-50 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <FolderOpen className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {project.name}
                </h3>
                <div className="ml-4">
                  <StatusBadge status={project.status} type="project-status" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <AlertCircle className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span>
                  {project.issues?.filter(issue => 
                    issue.status === "Open" || issue.status === "In Progress" || issue.status === "Review Ready"
                  ).length ?? 0} open issues
                </span>
                <span className="mx-2">•</span>
                <Users className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span>
                  {project.members?.length ?? 0} members
                </span>
                <span className="mx-2">•</span>
                <User className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span className="truncate">
                  Created by {project.creator.firstname} {project.creator.lastname}
                </span>
                <span className="mx-2">•</span>
                <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
              {project.description && (
                <p className="mt-2 text-sm text-gray-600 truncate">
                  {project.description}
                </p>
              )}
            </div>
          </div>
        </button>
      </li>
    );
  }

  return null;
}
