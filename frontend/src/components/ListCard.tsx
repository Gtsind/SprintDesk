import { User, Calendar } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { Issue } from "../types";

interface ListCardProps {
  issue: Issue;
  onClick: (issue: Issue) => void;
}

export function ListCard({ issue, onClick }: ListCardProps) {
  return (
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
  );
}
