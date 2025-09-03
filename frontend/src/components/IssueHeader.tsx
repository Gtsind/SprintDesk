import { StatusBadge } from "./StatusBadge";
import type { Issue } from "../types";

interface IssueHeaderProps {
  issue: Issue;
}

export function IssueHeader({ issue }: IssueHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-3">{issue.title}</h1>
      <div className="flex space-x-2 mb-3">
        <StatusBadge status={issue.priority} type="priority" />
        <StatusBadge status={issue.status} type="status" />
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span>#{issue.id}</span>
        <span>
          Created by {issue.author.firstname} {issue.author.lastname} at
        </span>
        <span className="">
          {new Date(issue.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
