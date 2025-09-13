import { ChevronDown } from "lucide-react";
import { useDropdown } from "../../hooks/useDropdown";
import { getProjectStatusIcon } from "../../utils/icons";
import type { ProjectStatus } from "../../types";

interface ProjectStatusDropdownProps {
  currentStatus: ProjectStatus;
  onUpdate: (updateData: { status: ProjectStatus }) => Promise<void>;
  disabled?: boolean;
}

const STATUS_OPTIONS: ProjectStatus[] = [
  "Active",
  "Completed",
  "On Hold",
  "Cancelled",
];

export function ProjectStatusDropdown({
  currentStatus,
  onUpdate,
  disabled,
}: ProjectStatusDropdownProps) {
  const { isOpen, toggle, close, dropdownRef } = useDropdown();

  const handleStatusSelect = async (status: ProjectStatus) => {
    if (status === currentStatus) {
      close();
      return;
    }

    try {
      await onUpdate({ status });
      close();
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggle}
        disabled={disabled}
        className="group text-left px-3 py-2 text-sm bg-white rounded-md hover:bg-gray-50 focus:outline-none disabled:opacity-50 flex items-center justify-between border border-gray-200"
      >
        <div className="flex items-center gap-2">
          {getProjectStatusIcon(currentStatus)}
          <span>{currentStatus}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-full bg-white rounded-md shadow-lg z-10 max-h-48 overflow-y-auto border border-gray-200">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusSelect(status)}
              disabled={disabled}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
            >
              {getProjectStatusIcon(status)}
              <span>{status}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
