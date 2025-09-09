import {
  User,
  Calendar,
  FolderOpen,
  Users,
  AlertCircle,
  Mail,
  Trash2,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { Issue, Project, User as Member } from "../../types";

interface IssueListCardProps {
  type: "issue";
  item: Issue;
  onClick: (item: Issue) => void;
  onRemove?: (item: Issue) => void;
}

interface ProjectListCardProps {
  type: "project";
  item: Project;
  onClick: (item: Project) => void;
  onRemove?: (item: Project) => void;
}

interface MemberListCardProps {
  type: "member";
  item: Member;
  onClick: (item: Member) => void;
  onRemove?: (item: Member) => void;
}

type ListCardProps =
  | IssueListCardProps
  | ProjectListCardProps
  | MemberListCardProps;

export function ListCard({ type, item, onClick, onRemove }: ListCardProps) {
  if (type === "issue") {
    return (
      <li className="group relative">
        <button
          onClick={() => onClick(item)}
          className="w-full hover:bg-gray-100 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {item.title}
                </h3>
                <div className="ml-4 flex space-x-2">
                  <StatusBadge status={item.priority} type="priority" />
                  <StatusBadge status={item.status} type="status" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <User className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span className="truncate">
                  Created by {item.author.firstname} {item.author.lastname}
                </span>
                <span className="mx-2">•</span>
                <span className="truncate">
                  {item.assignee
                    ? `Assigned to ${item.assignee.firstname} ${item.assignee.lastname}`
                    : "Unassigned"}
                </span>
                <span className="mx-2">•</span>
                <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </button>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item);
            }}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600"
            title={`Delete issue: ${item.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </li>
    );
  }

  if (type === "project") {
    return (
      <li className="group relative">
        <button
          onClick={() => onClick(item)}
          className="w-full hover:bg-gray-100 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <FolderOpen className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </h3>
                <div className="ml-4">
                  <StatusBadge status={item.status} type="project-status" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <AlertCircle className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span>
                  {item.issues?.filter(
                    (issue) =>
                      issue.status === "Open" ||
                      issue.status === "In Progress" ||
                      issue.status === "Review Ready"
                  ).length ?? 0}{" "}
                  open issues
                </span>
                <span className="mx-2">•</span>
                <Users className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span>{item.members?.length ?? 0} members</span>
                <span className="mx-2">•</span>
                <User className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span className="truncate">
                  Created by {item.creator.firstname} {item.creator.lastname}
                </span>
                <span className="mx-2">•</span>
                <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </button>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item);
            }}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600"
            title={`Delete project: ${item.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </li>
    );
  }

  if (type === "member") {
    const member = item as Member;
    return (
      <li className="group relative">
        <button
          onClick={() => onClick(member)}
          className="w-full text-left hover:bg-gray-50 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <User className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-900">
                  {member.firstname} {member.lastname}
                </h3>
                <div className="ml-4">
                  <StatusBadge status={member.role} type="role" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Mail className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span className="truncate">{member.email}</span>
                {member.title && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="truncate">{member.title}</span>
                  </>
                )}
                <span className="mx-2">•</span>
                <span className="truncate">@{member.username}</span>
              </div>
            </div>
          </div>
        </button>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(member);
            }}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600"
            title={`Remove ${member.firstname} ${member.lastname} from project`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </li>
    );
  }

  return null;
}
