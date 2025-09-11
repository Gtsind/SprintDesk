import { Plus } from "lucide-react";
import { useInlineEdit } from "../../../hooks/useInlineEdit";
import type { IssueUpdate } from "../../../types";

interface TimeEstimateEditorProps {
  currentEstimate: number | null;
  onUpdate: (updateData: IssueUpdate) => Promise<void>;
  onError?: (message: string) => void;
  disabled?: boolean;
}

export function TimeEstimateEditor({ 
  currentEstimate, 
  onUpdate, 
  onError, 
  disabled 
}: TimeEstimateEditorProps) {
  const timeEstimateEditor = useInlineEdit({
    initialValue: currentEstimate?.toString() || "",
    onSave: async (value: string) => {
      const numValue = value.trim() === "" ? null : parseInt(value, 10);
      
      if (numValue !== null && (isNaN(numValue) || numValue < 0)) {
        throw new Error("Time estimate must be a positive number");
      }
      
      await onUpdate({ time_estimate: numValue ?? undefined });
    },
    onError,
    validate: (value: string) => {
      if (value.trim() !== "") {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 0) {
          return "Time estimate must be a positive number";
        }
      }
      return null;
    },
  });

  const displayValue = currentEstimate ? `${currentEstimate} hours` : "Not set";

  return (
    <div>
      <dt className="ml-3.5 text-sm font-medium text-gray-500">Time Estimate</dt>
      <dd className="mt-1 ml-3.5">
        {timeEstimateEditor.isEditing ? (
          <input
            type="number"
            min="0"
            value={timeEstimateEditor.value}
            onChange={(e) => timeEstimateEditor.setValue(e.target.value)}
            onKeyDown={(e) => timeEstimateEditor.handleKeyDown(e)}
            onBlur={timeEstimateEditor.handleSave}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-400"
            placeholder="Hours"
            autoFocus
            disabled={timeEstimateEditor.isSaving || disabled}
          />
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">{displayValue}</span>
            <button
              onClick={timeEstimateEditor.startEditing}
              disabled={disabled}
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </dd>
    </div>
  );
}