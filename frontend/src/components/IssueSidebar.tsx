import type { Issue } from "../types";

interface IssueSidebarProps {
  issue: Issue;
}

export function IssueSidebar({ issue }: IssueSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Assignee</dt>
            <dd className="text-sm text-gray-900">
              {issue.assignee
                ? `${issue.assignee.firstname} ${issue.assignee.lastname}`
                : "Unassigned"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Project</dt>
            <dd className="text-sm text-gray-900">{issue.project.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Time Estimate</dt>
            <dd className="text-sm text-gray-900">
              {issue.time_estimate ? `${issue.time_estimate} hours` : "Not set"}
            </dd>
          </div>
          {issue.updated_at && (
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Last Updated
              </dt>
              <dd className="text-sm text-gray-900">
                {new Date(issue.updated_at).toLocaleString()}
              </dd>
            </div>
          )}
          {issue.closed_at && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Closed</dt>
              <dd className="text-sm text-gray-900">
                {new Date(issue.closed_at).toLocaleString()}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
