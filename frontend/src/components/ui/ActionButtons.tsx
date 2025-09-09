import { useState, useEffect, useRef } from "react";
import { EllipsisVertical } from "lucide-react";
import { Button } from "./Button";

interface ActionButtonsProps {
  onEdit?: () => void;
  onClose?: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
  isClosing?: boolean;
  isDeleting?: boolean;
  showEditButton?: boolean;
  entityType?: "issue" | "project" | "member";
}

export function ActionButtons({
  onEdit,
  onClose,
  onDelete,
  isEditing = false,
  isClosing = false,
  isDeleting = false,
  showEditButton = true,
  entityType = "issue",
}: ActionButtonsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCloseClick = () => {
    onClose?.();
    setIsDropdownOpen(false);
  };

  const handleDeleteClick = () => {
    onDelete?.();
    setIsDropdownOpen(false);
  };

  // Simple label configuration
  const labels = {
    issue: { close: "Close issue", delete: "Delete issue", closingText: "Closing Issue...", deletingText: "Deleting Issue..." },
    project: { close: "Complete project", delete: "Delete project", closingText: "Completing Project...", deletingText: "Deleting Project..." },
    member: { close: "Remove member", delete: "Remove member", closingText: "Removing Member...", deletingText: "Removing Member..." },
  };

  const currentLabels = labels[entityType] || {
    close: "Close", delete: "Delete", closingText: "Processing...", deletingText: "Deleting..."
  };

  return (
    <div className="flex gap-2 ml-4">
      {showEditButton && !isEditing && onEdit && (
        <Button onClick={onEdit} variant="secondary" className="px-4 py-2 ">
          Edit
        </Button>
      )}
      <div className="relative" ref={dropdownRef}>
        <Button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          variant="secondary"
          className="px-2 py-2 h-10 flex items-center justify-center"
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
            <div className="py-1">
              {onClose && (
                <button
                  onClick={handleCloseClick}
                  disabled={isClosing}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClosing ? currentLabels.closingText : currentLabels.close}
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? currentLabels.deletingText : currentLabels.delete}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
