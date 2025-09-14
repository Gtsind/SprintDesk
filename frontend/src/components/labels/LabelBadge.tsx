import { useState, useRef, useEffect } from "react";
import { X, Edit3, Trash2 } from "lucide-react";
import { getLabelColor } from "../../utils/colors";
import { extractErrorMessage } from "../../utils/errorHandling";
import type { Label } from "../../types";

interface LabelBadgeProps {
  label: Label;
  onUpdate?: (labelId: number, name: string) => void;
  onRemoveFromIssue?: (labelId: number) => void;
  onDelete?: (labelId: number) => void;
  isUpdating?: boolean;
}

export function LabelBadge({
  label,
  onUpdate,
  onRemoveFromIssue,
  onDelete,
  isUpdating = false,
}: LabelBadgeProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(label.name);
  const [error, setError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const colorClasses = getLabelColor(label.color_hash);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setIsEditing(false);
        setError("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdateSubmit = async () => {
    const trimmedName = editName.trim();
    
    if (!trimmedName) {
      setError("Label name cannot be empty");
      return;
    }

    if (trimmedName === label.name) {
      setIsEditing(false);
      setError("");
      return;
    }

    try {
      await onUpdate?.(label.id, trimmedName);
      setIsEditing(false);
      setShowMenu(false);
      setError("");
    } catch (err: unknown) {
      setError(extractErrorMessage(err) || "Failed to update label");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUpdateSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditName(label.name);
      setError("");
    }
  };

  if (isEditing) {
    return (
      <div ref={menuRef} className="relative inline-block">
        <div className="flex flex-col">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleUpdateSubmit}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-gray-400"
            autoFocus
            disabled={isUpdating}
          />
          {error && (
            <span className="text-xs text-red-600 mt-1">{error}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isUpdating}
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md cursor-pointer hover:opacity-80 disabled:opacity-50 ${colorClasses}`}
      >
        {label.name}
      </button>

      {showMenu && (
        <div className="absolute left-0 mt-1 w-32 bg-white rounded-md shadow-lg z-20 border border-gray-200">
          <button
            onClick={() => setIsEditing(true)}
            disabled={isUpdating}
            className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
          >
            <Edit3 className="h-3 w-3" />
            Edit
          </button>
          <button
            onClick={() => {
              onRemoveFromIssue?.(label.id);
              setShowMenu(false);
            }}
            disabled={isUpdating}
            className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
          >
            <X className="h-3 w-3" />
            Remove
          </button>
          <button
            onClick={() => {
              onDelete?.(label.id);
              setShowMenu(false);
            }}
            disabled={isUpdating}
            className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}