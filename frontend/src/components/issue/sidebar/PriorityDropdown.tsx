import { ChevronDown } from "lucide-react";
import { useDropdown } from "../../../hooks/useDropdown";
import { getPriorityIcon } from "../../../utils/icons";
import type { IssueUpdate, IssuePriority } from "../../../types";

interface PriorityDropdownProps {
  currentPriority: string;
  onUpdate: (updateData: IssueUpdate) => Promise<void>;
  disabled?: boolean;
}

const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];

export function PriorityDropdown({
  currentPriority,
  onUpdate,
  disabled,
}: PriorityDropdownProps) {
  const { isOpen, toggle, close, dropdownRef } = useDropdown();

  const handlePrioritySelect = async (priority: string) => {
    if (priority === currentPriority) {
      close();
      return;
    }

    try {
      await onUpdate({ priority: priority as IssuePriority });
      close();
    } catch (error) {
      // Error handling is done by parent
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
          {getPriorityIcon(currentPriority)}
          <span>{currentPriority}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-full bg-white rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
          {PRIORITY_OPTIONS.map((priority) => (
            <button
              key={priority}
              onClick={() => handlePrioritySelect(priority)}
              disabled={disabled}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
            >
              {getPriorityIcon(priority)}
              <span>{priority}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
