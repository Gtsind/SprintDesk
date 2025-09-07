import { useState, useEffect } from "react";
import { Button } from "./Button";

interface IssueDescriptionProps {
  description: string | null;
  isEditing?: boolean;
  onUpdate?: (description: string) => void;
  onCancel?: () => void;
}

export function IssueDescription({
  description,
  isEditing = false,
  onUpdate,
  onCancel,
}: IssueDescriptionProps) {
  const [editValue, setEditValue] = useState(description || "");

  useEffect(() => {
    if (isEditing) {
      setEditValue(description || "");
    }
  }, [isEditing, description]);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editValue.trim());
    }
  };

  return (
    <div className="my-6">
      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
            rows={6}
            placeholder="Add a description..."
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              className="px-6 py-2.5 text-sm font-medium rounded-lg bg-indigo-200 hover:bg-indigo-400 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              Save Changes
            </Button>
            <Button
              onClick={onCancel}
              variant="secondary"
              className="px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          {description ? (
            <p className="text-gray-700 whitespace-pre-wrap h-[100px]">
              {description}
            </p>
          ) : (
            <p className="text-gray-500 italic h-[100px]">
              Add a description...
            </p>
          )}
        </>
      )}
    </div>
  );
}
