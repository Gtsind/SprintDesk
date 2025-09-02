import { useState, useEffect } from "react";
import { Button } from "./Button";

interface IssueDescriptionProps {
  description: string | null;
  isEditing?: boolean;
  onUpdate?: (description: string) => void;
  onCancel?: () => void;
}

export function IssueDescription({ description, isEditing = false, onUpdate, onCancel }: IssueDescriptionProps) {
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
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Description
      </h2>
      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows={6}
            placeholder="Enter issue description..."
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              variant="primary"
            >
              Save
            </Button>
            <Button
              onClick={onCancel}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          {description ? (
            <p className="text-gray-700 whitespace-pre-wrap">
              {description}
            </p>
          ) : (
            <p className="text-gray-500 italic">No description provided.</p>
          )}
        </>
      )}
    </div>
  );
}