import { StatusBadge } from "./StatusBadge";
import type { Project, Issue } from "../types";

interface CardProps {
  item: Project | Issue;
  onClick: (item: Project | Issue) => void;
}

export function Card({ item, onClick }: CardProps) {
  const isProject = (item: Project | Issue): item is Project => {
    return 'status' in item && !('priority' in item);
  };

  if (isProject(item)) {
    // Render project card
    return (
      <button
        onClick={() => onClick(item)}
        className="block w-full text-left border rounded-lg p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-sm text-gray-600 mt-1">
                {item.description}
              </p>
            )}
          </div>
          <StatusBadge
            status={item.status}
            type="project-status"
          />
        </div>
      </button>
    );
  } else {
    // Render issue card
    const issue = item as Issue;
    return (
      <button
        onClick={() => onClick(issue)}
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
            <StatusBadge status={issue.priority} type="priority" />
            <StatusBadge status={issue.status} type="status" />
          </div>
        </div>
      </button>
    );
  }
}