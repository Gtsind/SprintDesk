import { ChevronDown, User as UserIcon } from "lucide-react";
import { useDropdown } from "../../../hooks/useDropdown";
import type { IssueUpdate, User, UserSummary } from "../../../types";

interface AssigneeDropdownProps {
  currentAssignee: UserSummary | null;
  projectMembers: User[];
  onUpdate: (updateData: IssueUpdate) => Promise<void>;
  disabled?: boolean;
}

export function AssigneeDropdown({
  currentAssignee,
  projectMembers,
  onUpdate,
  disabled,
}: AssigneeDropdownProps) {
  const { isOpen, toggle, close, dropdownRef } = useDropdown();

  const handleAssigneeSelect = async (assigneeId: number | null) => {
    if (assigneeId === currentAssignee?.id) {
      close();
      return;
    }

    try {
      await onUpdate({ assignee_id: assigneeId ?? undefined });
      close();
    } catch (error) {
      // Error handling is done by parent
    }
  };

  const displayText = currentAssignee
    ? `${currentAssignee.firstname} ${currentAssignee.lastname}`
    : "Unassigned";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggle}
        disabled={disabled}
        className="group w-full text-left px-3 py-2 text-sm bg-white rounded-md hover:bg-gray-50 focus:outline-none disabled:opacity-50 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4" />
          <span>{displayText}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-full bg-white rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
          {/* Unassigned option */}
          <button
            onClick={() => handleAssigneeSelect(null)}
            disabled={disabled}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50"
          >
            <span className="text-gray-500">Unassigned</span>
          </button>

          {/* Project members */}
          {projectMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => handleAssigneeSelect(member.id)}
              disabled={disabled}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
            >
              <div>
                {member.firstname} {member.lastname}
                {member.title && (
                  <div className="text-xs text-gray-500">
                    @{member.username}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
