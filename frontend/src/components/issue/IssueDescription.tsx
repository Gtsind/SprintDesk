import type { KeyboardEvent } from "react";

interface IssueDescriptionProps {
  originalDescription: string | null;
  isEditing?: boolean;
  description: string;
  setDescription: (description: string) => void;
  setIsEditing: (editing: boolean) => void;
  onUpdate?: () => void;
}

export function IssueDescription({
  originalDescription,
  isEditing = false,
  description,
  setDescription,
  setIsEditing,
  onUpdate,
}: IssueDescriptionProps) {
  const handleSave = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsEditing(false);
      // Revert to original issue description instead of clearing
      setDescription(originalDescription || "");
    }
    // Shift+Enter allows new lines (default textarea behavior)
  };

  return (
    <div className="my-6">
      {isEditing ? (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-full text-gray-700 bg-transparent p-2 focus:outline-none whitespace-pre-wrap"
          placeholder="Add a description..."
          autoFocus
        />
      ) : (
        <>
          {originalDescription ? (
            <p
              className="text-gray-700 whitespace-pre-wrap cursor-pointer hover:bg-gray-50 rounded p-2"
              onClick={() => {
                setIsEditing(true);
                setDescription(originalDescription);
              }}
            >
              {originalDescription}
            </p>
          ) : (
            <p
              className="text-gray-500 italic cursor-pointer hover:bg-gray-50 rounded p-2"
              onClick={() => {
                setIsEditing(true);
                setDescription("");
              }}
            >
              Add a description...
            </p>
          )}
        </>
      )}
    </div>
  );
}
