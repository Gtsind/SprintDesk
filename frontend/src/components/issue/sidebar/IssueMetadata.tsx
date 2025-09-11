import { User as UserIcon } from "lucide-react";
import type { Issue } from "../../../types";

interface IssueMetadataProps {
  issue: Issue;
}

export function IssueMetadata({ issue }: IssueMetadataProps) {
  return (
    <>
      {/* Project */}
      <div>
        <dt className="ml-3.5 text-sm font-medium text-gray-500">Project</dt>
        <dd className="ml-3.5 text-sm text-gray-900 mt-1">
          {issue.project.name}
        </dd>
      </div>

      {/* Created by */}
      <div>
        <dt className="ml-3.5 text-sm font-medium text-gray-500">
          Created by
        </dt>
        <dd className="ml-3.5 text-sm text-gray-900 mt-1">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>
              {issue.author.firstname} {issue.author.lastname}
            </span>
          </div>
        </dd>
      </div>

      {/* Created at */}
      <div>
        <dt className="ml-3.5 text-sm font-medium text-gray-500">
          Created at
        </dt>
        <dd className="ml-3.5 text-sm text-gray-900 mt-1">
          {new Date(issue.created_at).toLocaleDateString()}
        </dd>
      </div>

      {/* Last Updated */}
      {issue.updated_at && (
        <div>
          <dt className="ml-3.5 text-sm font-medium text-gray-500">
            Last Updated
          </dt>
          <dd className="ml-3.5 text-sm text-gray-900 mt-1">
            {new Date(issue.updated_at).toLocaleString()}
          </dd>
        </div>
      )}

      {/* Closed at */}
      {issue.closed_at && (
        <div>
          <dt className="ml-3.5 text-sm font-medium text-gray-500">Closed</dt>
          <dd className="ml-3.5 text-sm text-gray-900 mt-1">
            {new Date(issue.closed_at).toLocaleString()}
          </dd>
        </div>
      )}
    </>
  );
}