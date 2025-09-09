import { StatusBadge } from "./ui/StatusBadge";
import type { Project, Issue, User } from "../types";

interface CardProps {
  item: Project | Issue | User;
  onClick: (item: Project | Issue | User) => void;
}

export function Card({ item, onClick }: CardProps) {
  const isProject = (item: Project | Issue | User): item is Project => {
    return (
      "name" in item &&
      "status" in item &&
      !("priority" in item) &&
      !("username" in item)
    );
  };

  const isUser = (item: Project | Issue | User): item is User => {
    return "username" in item && "firstname" in item;
  };

  if (isUser(item)) {
    // Render user card
    return (
      <button
        onClick={() => onClick(item)}
        className="block w-full text-left border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {item.firstname} {item.lastname}
            </h3>
            <p className="text-sm text-gray-600 mt-1">@{item.username}</p>
          </div>
          <span className="text-xs text-gray-500">{item.role}</span>
        </div>
      </button>
    );
  } else if (isProject(item)) {
    // Render project card
    return (
      <button
        onClick={() => onClick(item)}
        className="block w-full text-left border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            )}
          </div>
          <StatusBadge status={item.status} type="project-status" />
        </div>
      </button>
    );
  } else {
    // Render issue card
    const issue = item as Issue;
    return (
      <button
        onClick={() => onClick(issue)}
        className="block w-full text-left border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <div className="flex justify-between items-start overflow-auto">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">{issue.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{issue.project.name}</p>
          </div>
          <div className="flex space-x-2 ml-4 overflow-auto">
            <StatusBadge status={issue.priority} type="priority" />
            <StatusBadge status={issue.status} type="status" />
          </div>
        </div>
      </button>
    );
  }
}
