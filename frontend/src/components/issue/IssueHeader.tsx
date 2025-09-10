import { StatusBadge } from "../ui/StatusBadge";
import { ActionButtons } from "../ui/ActionButtons";
import type { Issue } from "../../types";

interface IssueHeaderProps {
  issue: Issue;
  isEditingTitle: boolean;
  title: string;
  setTitle: (title: string) => void;
  setIsEditingTitle: (editing: boolean) => void;
  onTitleUpdate: () => Promise<void>;
  onClose: () => Promise<void>;
  onDelete: () => Promise<void>;
  isClosing: boolean;
  isDeleting: boolean;
}

export function IssueHeader({ 
  issue, 
  isEditingTitle,
  title,
  setTitle,
  setIsEditingTitle,
  onTitleUpdate, 
  onClose, 
  onDelete, 
  isClosing, 
  isDeleting 
}: IssueHeaderProps) {
  
  return (
    <div className="flex justify-between items-start">
      <div className="flex-1">
        {isEditingTitle ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onTitleUpdate();
              } else if (e.key === "Escape") {
                setIsEditingTitle(false);
                // Revert to original issue title instead of clearing
                setTitle(issue.title);
              }
            }}
            onBlur={onTitleUpdate}
            className="text-2xl font-semibold text-gray-900 bg-transparent border-none px-2 py-1 w-full lg:w-4/5 focus:outline-none mb-3 "
            placeholder="Issue title"
            autoFocus
          />
        ) : (
          <h1
            className="text-2xl font-semibold text-gray-900 mb-3 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 "
            onClick={() => {
              setIsEditingTitle(true);
              setTitle(issue.title);
            }}
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
