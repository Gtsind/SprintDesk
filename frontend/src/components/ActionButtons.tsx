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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCloseClick = () => {
    onClose?.();
    setIsDropdownOpen(false);
  };

  const handleDeleteClick = () => {
    onDelete?.();
    setIsDropdownOpen(false);
  };

  const getEntityLabel = (action: string) => {
    switch (entityType) {
      case "issue":
        return action === "close" ? "Close issue" : "Delete issue";
      case "project":
        return action === "close" ? "Complete project" : "Delete project";
      case "member":
        return action === "close" ? "Remove member" : "Remove member";
      default:
        return action === "close" ? "Close" : "Delete";
    }
  };

  const getLoadingLabel = (action: string) => {
    switch (entityType) {
      case "issue":
        return action === "close" ? "Closing Issue..." : "Deleting Issue...";
      case "project":
        return action === "close"
          ? "Completing Project..."
          : "Deleting Project...";
      case "member":
        return action === "close" ? "Removing Member..." : "Removing Member...";
      default:
        return action === "close" ? "Processing..." : "Deleting...";
    }
  };

  return (
    <div className="flex gap-2 ml-4">
      {showEditButton && !isEditing && onEdit && (
        <Button onClick={onEdit} variant="secondary" className="px-4 py-2">
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
                  {isClosing
                    ? getLoadingLabel("close")
                    : getEntityLabel("close")}
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting
                    ? getLoadingLabel("delete")
                    : getEntityLabel("delete")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
