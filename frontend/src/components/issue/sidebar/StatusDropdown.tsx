import { ChevronDown } from "lucide-react";
import { useDropdown } from "../../../hooks/useDropdown";
import { getStatusIcon } from "../../../utils/icons";
import { closeIssue, reopenIssue, updateIssue } from "../../../services/api";
import type { IssueStatus } from "../../../types";

interface StatusDropdownProps {
  issueId: number;
  currentStatus: IssueStatus;
  onUpdate: (updateData: { status: IssueStatus }) => Promise<void>;
  disabled?: boolean;
}

const STATUS_OPTIONS: IssueStatus[] = [
  "Open",
  "In Progress",
  "Review Ready",
  "Closed",
  "Blocked",
];

export function StatusDropdown({
  issueId,
  currentStatus,
  onUpdate,
  disabled,
}: StatusDropdownProps) {
  const { isOpen, toggle, close, dropdownRef } = useDropdown();

  const handleStatusSelect = async (status: IssueStatus) => {
    if (status === currentStatus) {
      close();
      return;
    }

    try {
      if (status === "Closed" && currentStatus !== "Closed") {
        // Closing issue - use dedicated closeIssue API
        await closeIssue(issueId);
      } else if (status !== "Closed" && currentStatus === "Closed") {
        // Reopening issue - use dedicated reopenIssue API
        await reopenIssue(issueId);
        // Then update to the specific status if not "Open"
        if (status !== "Open") {
          await updateIssue(issueId, { status });
        }
      } else {
        // Regular status change - use generic updateIssue API
        await updateIssue(issueId, { status });
      }

      // Call the callback to trigger refetch or state update
      await onUpdate({ status });
      close();
    } catch (error) {
      // Error handling is done by parent
      throw error;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggle}
        disabled={disabled}
        className="group w-full text-left px-3 py-2 text-sm bg-white rounded-md hover:bg-gray-50 focus:outline-none disabled:opacity-50 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {getStatusIcon(currentStatus)}
          <span>{currentStatus}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-full bg-white rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusSelect(status)}
              disabled={disabled}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
            >
              {getStatusIcon(status)}
              <span>{status}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
