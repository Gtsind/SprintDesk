import { StatusBadge } from "../ui/StatusBadge";
import { ActionButtons } from "../ui/ActionButtons";
import { useInlineEdit } from "../../hooks/useInlineEdit";
import type { Issue, IssueUpdate } from "../../types";

interface IssueHeaderProps {
  issue: Issue;
  onUpdate: (updateData: IssueUpdate) => Promise<void>;
  onClose: () => Promise<void>;
  onDelete: () => Promise<void>;
  onError: (message: string) => void;
  isClosing: boolean;
  isDeleting: boolean;
}

export function IssueHeader({ 
  issue, 
  onUpdate,
  onClose, 
  onDelete,
  onError,
  isClosing, 
  isDeleting 
}: IssueHeaderProps) {
  
  const titleEditor = useInlineEdit({
    initialValue: issue.title,
    onSave: async (newTitle: string) => {
      await onUpdate({ title: newTitle });
    },
    onError,
    validate: (value: string) => {
      if (!value.trim()) {
        return "Title cannot be empty. The title has been reverted to its previous value.";
      }
      return null;
    },
  });
  
  return (
    <div className="flex justify-between items-start">
      <div className="flex-1">
        {titleEditor.isEditing ? (
          <input
            type="text"
            value={titleEditor.value}
            onChange={(e) => titleEditor.setValue(e.target.value)}
            onKeyDown={(e) => titleEditor.handleKeyDown(e)}
            onBlur={titleEditor.handleSave}
            className="text-2xl font-semibold text-gray-900 bg-transparent border-none px-2 py-1 w-full lg:w-4/5 focus:outline-none mb-3"
            placeholder="Issue title"
            autoFocus
            disabled={titleEditor.isSaving}
          />
        ) : (
          <h1
            className="text-2xl font-semibold text-gray-900 mb-3 cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
            onClick={titleEditor.startEditing}
          >
            {issue.title}
          </h1>
        )}
        <div className="flex space-x-2 mb-3">
          <StatusBadge status={issue.priority} type="priority" />
          <StatusBadge status={issue.status} type="status" />
        </div>
      </div>
      
      <ActionButtons
        onClose={onClose}
        onDelete={onDelete}
        showEditButton={false}
        isClosing={isClosing}
        isDeleting={isDeleting}
        entityType="issue"
      />
    </div>
  );
}
