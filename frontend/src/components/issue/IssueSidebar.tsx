import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Plus,
  Circle,
  Loader,
  Eye,
  CheckCircle,
  Ban,
  Signal,
  SignalMedium,
  SignalHigh,
  CircleAlert,
  User as UserIcon,
} from "lucide-react";
import { LabelsSection } from "../labels/LabelsSection";
import type { Issue, IssueUpdate, User } from "../../types";

interface IssueSidebarProps {
  issue: Issue;
  projectMembers: User[];
  onUpdate: (updateData: IssueUpdate) => Promise<void>;
  onError?: (error: string) => void;
}

type DropdownType = "status" | "priority" | "assignee" | null;

export function IssueSidebar({
  issue,
  projectMembers,
  onUpdate,
  onError,
}: IssueSidebarProps) {
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingTimeEstimate, setEditingTimeEstimate] = useState(false);
  const [timeEstimateValue, setTimeEstimateValue] = useState<string>(
    issue.time_estimate?.toString() || ""
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statusOptions = [
    "Open",
    "In Progress",
    "Review Ready",
    "Closed",
    "Blocked",
  ];
  const priorityOptions = ["Low", "Medium", "High", "Critical"];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open":
        return <Circle className="h-4 w-4" />;
      case "In Progress":
        return <Loader className="h-4 w-4 text-yellow-500" />;
      case "Review Ready":
        return <Eye className="h-4 w-4 text-purple-500" />;
      case "Closed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Blocked":
        return <Ban className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "Low":
        return <SignalMedium className="h-4 w-4" />;
      case "Medium":
        return <SignalHigh className="h-4 w-4" />;
      case "High":
        return <Signal className="h-4 w-4" />;
      case "Critical":
        return <CircleAlert className="h-4 w-4 text-red-600" />;
      default:
        return <SignalMedium className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
        setEditingTimeEstimate(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdateIssue = async (updateData: IssueUpdate) => {
    try {
      setIsUpdating(true);
      await onUpdate(updateData); // Use the optimized handler from parent
      setActiveDropdown(null);
    } catch (err: any) {
      onError?.(err?.detail || "Failed to update issue");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTimeEstimateUpdate = async () => {
    const numValue =
      timeEstimateValue.trim() === "" ? null : parseInt(timeEstimateValue, 10);
    if (numValue !== null && (isNaN(numValue) || numValue < 0)) {
      onError?.("Time estimate must be a positive number");
      return;
    }
    await handleUpdateIssue({ time_estimate: numValue ?? undefined });
    setEditingTimeEstimate(false);
  };

  const renderDropdown = (type: DropdownType, options: string[] | User[]) => {
    if (activeDropdown !== type) return null;

    return (
      <div className="absolute left-0 mt-1 w-full bg-white rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
        {type === "assignee" && (
          <button
            onClick={() => handleUpdateIssue({ assignee_id: undefined })}
            disabled={isUpdating}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50"
          >
            <span className="text-gray-500">Unassigned</span>
          </button>
        )}
        {options.map((option) => {
          const isUser = typeof option === "object" && "id" in option;
          const displayText = isUser
            ? `${(option as User).firstname} ${(option as User).lastname}`
            : (option as string);
          const value = isUser ? (option as User).id : (option as string);

          return (
            <button
              key={isUser ? (option as User).id : (option as string)}
              onClick={() => {
                const updateData: IssueUpdate = {};
                if (type === "status") updateData.status = value as any;
                if (type === "priority") updateData.priority = value as any;
                if (type === "assignee")
                  updateData.assignee_id = value as number;
                handleUpdateIssue(updateData);
              }}
              disabled={isUpdating}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
            >
              {type === "status" && getStatusIcon(option as string)}
              {type === "priority" && getPriorityIcon(option as string)}
              <div>
                {displayText}
                {isUser && (option as User).title && (
                  <div className="text-xs text-gray-500">
                    @{(option as User).username}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  };
  return (
    <div className="p-4" ref={dropdownRef}>
      <dl className="space-y-4">
        {/* Status */}
        <div className="relative">
          <button
            onClick={() =>
              setActiveDropdown(activeDropdown === "status" ? null : "status")
            }
            disabled={isUpdating}
            className="group w-full text-left px-3 py-2 text-sm bg-white rounded-md hover:bg-gray-50 focus:outline-none disabled:opacity-50 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {getStatusIcon(issue.status)}
              <span>{issue.status}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          {renderDropdown("status", statusOptions)}
        </div>

        {/* Priority */}
        <div className="relative">
          <button
            onClick={() =>
              setActiveDropdown(
                activeDropdown === "priority" ? null : "priority"
              )
            }
            disabled={isUpdating}
            className="group w-full text-left px-3 py-2 text-sm bg-white rounded-md hover:bg-gray-50 focus:outline-none disabled:opacity-50 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {getPriorityIcon(issue.priority)}
              <span>{issue.priority}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          {renderDropdown("priority", priorityOptions)}
        </div>

        {/* Assignee */}
        <div className="relative">
          <button
            onClick={() =>
              setActiveDropdown(
                activeDropdown === "assignee" ? null : "assignee"
              )
            }
            disabled={isUpdating}
            className="group w-full text-left px-3 py-2 text-sm bg-white rounded-md hover:bg-gray-50 focus:outline-none disabled:opacity-50 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span>
                {issue.assignee
                  ? `${issue.assignee.firstname} ${issue.assignee.lastname}`
                  : "Unassigned"}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          {renderDropdown("assignee", projectMembers)}
        </div>

        {/* Labels */}
        <LabelsSection issueId={issue.id} onError={onError} />

        {/* Time Estimate */}
        <div>
          <dt className="ml-3.5 text-sm font-medium text-gray-500">
            Time Estimate
          </dt>
          <dd className="mt-1 ml-3.5">
            {editingTimeEstimate ? (
              <input
                type="number"
                min="0"
                value={timeEstimateValue}
                onChange={(e) => setTimeEstimateValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTimeEstimateUpdate();
                  if (e.key === "Escape") {
                    setEditingTimeEstimate(false);
                    setTimeEstimateValue(issue.time_estimate?.toString() || "");
                  }
                }}
                onBlur={handleTimeEstimateUpdate}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                placeholder="Hours"
                autoFocus
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">
                  {issue.time_estimate
                    ? `${issue.time_estimate} hours`
                    : "Not set"}
                </span>
                <button
                  onClick={() => {
                    setEditingTimeEstimate(true);
                    setTimeEstimateValue(issue.time_estimate?.toString() || "");
                  }}
                  disabled={isUpdating}
                  className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </dd>
        </div>

        {/* Project */}
        <div>
          <dt className="ml-3.5 text-sm font-medium text-gray-500">Project</dt>
          <dd className="ml-3.5 text-sm text-gray-900 mt-1">
            {issue.project.name}
          </dd>
        </div>

        {/* Metadata */}
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
        <div>
          <dt className="ml-3.5 text-sm font-medium text-gray-500">
            Created at
          </dt>
          <dd className="ml-3.5 text-sm text-gray-900 mt-1">
            {new Date(issue.created_at).toLocaleDateString()}
          </dd>
        </div>
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
        {issue.closed_at && (
          <div>
            <dt className="ml-3.5 text-sm font-medium text-gray-500">Closed</dt>
            <dd className="ml-3.5 text-sm text-gray-900 mt-1">
              {new Date(issue.closed_at).toLocaleString()}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
