import { StatusBadge } from "./StatusBadge";
import type { Issue } from "../types";

interface IssueHeaderProps {
  issue: Issue;
  navigate: (page: string, data?: any) => void;
}

export function IssueHeader({ issue, navigate }: IssueHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <button
          onClick={() =>
            navigate("project-issues", { projectId: issue.project_id })
          }
          className="text-indigo-600 hover:text-indigo-500 text-sm"
        >
          ← Back to {issue.project.name}
        </button>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        {issue.title}
      </h1>
      <div className="flex space-x-2 mb-3">
        <StatusBadge status={issue.priority} type="priority" />
        <StatusBadge status={issue.status} type="status" />
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span>#{issue.id}</span>
        <span>
          Created by {issue.author.firstname} {issue.author.lastname}
        </span>
        <span>{new Date(issue.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}