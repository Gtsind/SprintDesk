import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { getLabelColor } from "../../utils/colors";
import { CreateLabelForm } from "./CreateLabelForm";
import type { Label } from "../../types";

interface LabelMenuProps {
  availableLabels: Label[];
  allLabels: Label[];
  onAddLabel: (labelId: number) => void;
  onCreateLabel: (name: string, colorIndex: number) => void;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export function LabelMenu({
  availableLabels,
  allLabels,
  onAddLabel,
  onCreateLabel,
  isOpen,
  onClose,
  isLoading = false,
}: LabelMenuProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
        setShowCreateForm(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreateSubmit = async (name: string, colorIndex: number) => {
    try {
      await onCreateLabel(name, colorIndex);
      setShowCreateForm(false);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const existingNames = allLabels.map((label) => label.name);

  return (
    <div
      ref={menuRef}
      className="absolute right-full top-0 mr-2 w-64 bg-white rounded-md shadow-lg z-30 border border-gray-200 max-h-96 overflow-y-auto"
    >
      {/* Available Labels */}
      {availableLabels.length > 0 && (
        <div className="p-3 max-h-48 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {availableLabels.map((label) => {
              const colorClasses = getLabelColor(label.color_hash);

              return (
                <button
                  key={label.id}
                  onClick={() => {
                    onAddLabel(label.id);
                    onClose();
                  }}
                  disabled={isLoading}
                  className="hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 rounded-md transition-opacity"
                >
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${colorClasses}`}
                  >
                    {label.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Separator */}
      {availableLabels.length > 0 && !showCreateForm && (
        <div className="border-t border-gray-200" />
      )}

      {/* Create New Label */}
      {!showCreateForm ? (
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={isLoading}
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
        >
          <Plus className="h-4 w-4 text-gray-400" />
          Create new label...
        </button>
      ) : (
        <CreateLabelForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateForm(false)}
          isLoading={isLoading}
          existingNames={existingNames}
        />
      )}
    </div>
  );
}