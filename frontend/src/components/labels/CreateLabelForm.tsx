import { useState } from "react";
import { Check, X } from "lucide-react";
import { getLabelColors } from "../../utils/colors";

interface CreateLabelFormProps {
  onSubmit: (name: string, colorIndex: number) => void;
  onCancel: () => void;
  isLoading?: boolean;
  existingNames?: string[];
}

export function CreateLabelForm({
  onSubmit,
  onCancel,
  isLoading = false,
  existingNames = [],
}: CreateLabelFormProps) {
  const [name, setName] = useState("");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [error, setError] = useState("");

  const colors = getLabelColors();

  const handleSubmit = () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError("Label name cannot be empty");
      return;
    }

    // Check for duplicate names (case insensitive)
    const nameExists = existingNames.some(
      (existingName) => existingName.toLowerCase() === trimmedName.toLowerCase()
    );

    if (nameExists) {
      setError("A label with this name already exists");
      return;
    }

    onSubmit(trimmedName, selectedColorIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="p-3 border-t border-gray-200">
      {/* Name Input */}
      <div className="mb-3">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder="Label name..."
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-gray-400"
          autoFocus
          disabled={isLoading}
        />
        {error && (
          <span className="text-xs text-red-600 mt-1 block">{error}</span>
        )}
      </div>

      {/* Color Picker */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-2">Choose color:</div>
        <div className="grid grid-cols-5 gap-1">
          {colors.map((colorClass, index) => (
            <button
              key={index}
              onClick={() => setSelectedColorIndex(index)}
              disabled={isLoading}
              className={`w-6 h-6 rounded-full border-2 focus:outline-none disabled:opacity-50 ${
                selectedColorIndex === index
                  ? "border-gray-400 ring-1 ring-gray-300"
                  : "border-gray-200 hover:border-gray-300"
              } ${colorClass.split(" ")[0]}`}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Preview:</div>
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${colors[selectedColorIndex]}`}
        >
          {name.trim() || "Label name"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 focus:outline-none disabled:opacity-50"
        >
          <X className="h-3 w-3" />
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !name.trim()}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 focus:outline-none disabled:opacity-50"
        >
          <Check className="h-3 w-3" />
          Create
        </button>
      </div>
    </div>
  );
}