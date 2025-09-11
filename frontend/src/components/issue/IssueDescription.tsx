import { useInlineEdit } from "../../hooks/useInlineEdit";
import type { Issue, IssueUpdate } from "../../types";

interface IssueDescriptionProps {
  issue: Issue;
  onUpdate: (updateData: IssueUpdate) => Promise<void>;
  onError: (message: string) => void;
}

export function IssueDescription({
  issue,
  onUpdate,
  onError,
}: IssueDescriptionProps) {
  
  const descriptionEditor = useInlineEdit({
    initialValue: issue.description,
    onSave: async (newDescription: string) => {
      await onUpdate({ description: newDescription });
    },
    onError,
    placeholder: "Add a description...",
  });

  return (
    <div className="my-6">
      {descriptionEditor.isEditing ? (
        <textarea
          value={descriptionEditor.value}
          onChange={(e) => descriptionEditor.setValue(e.target.value)}
          onKeyDown={(e) => descriptionEditor.handleKeyDown(e, true)}
          onBlur={descriptionEditor.handleSave}
          className="w-full text-gray-700 bg-transparent p-2 focus:outline-none whitespace-pre-wrap"
          placeholder="Add a description..."
          autoFocus
          disabled={descriptionEditor.isSaving}
        />
      ) : (
        <>
          {issue.description ? (
            <p
              className="text-gray-700 whitespace-pre-wrap cursor-pointer hover:bg-gray-50 rounded p-2"
              onClick={descriptionEditor.startEditing}
            >
              {issue.description}
            </p>
          ) : (
            <p
              className="text-gray-500 italic cursor-pointer hover:bg-gray-50 rounded p-2"
              onClick={descriptionEditor.startEditing}
            >
              Add a description...
            </p>
          )}
        </>
      )}
    </div>
  );
}
