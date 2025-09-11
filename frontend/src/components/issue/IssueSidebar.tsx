import { useState } from "react";
import { StatusDropdown } from "./sidebar/StatusDropdown";
import { PriorityDropdown } from "./sidebar/PriorityDropdown";
import { AssigneeDropdown } from "./sidebar/AssigneeDropdown";
import { TimeEstimateEditor } from "./sidebar/TimeEstimateEditor";
import { IssueMetadata } from "./sidebar/IssueMetadata";
import { LabelsSection } from "../labels/LabelsSection";
import type { Issue, IssueUpdate, User } from "../../types";

interface IssueSidebarProps {
  issue: Issue;
  projectMembers: User[];
  onUpdate: (updateData: IssueUpdate) => Promise<void>;
  onError?: (error: string) => void;
}

export function IssueSidebar({
  issue,
  projectMembers,
  onUpdate,
  onError,
}: IssueSidebarProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Wrapper to handle loading state and error handling
  const handleUpdate = async (updateData: IssueUpdate) => {
    try {
      setIsUpdating(true);
      await onUpdate(updateData);
    } catch (err: any) {
      onError?.(err?.detail || "Failed to update issue");
      throw err; // Re-throw for component-specific handling
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4">
      <dl className="space-y-4">
        {/* Status */}
        <div>
          <StatusDropdown
            issueId={issue.id}
            currentStatus={issue.status}
            onUpdate={handleUpdate}
            disabled={isUpdating}
          />
        </div>

        {/* Priority */}
        <div>
          <PriorityDropdown
            currentPriority={issue.priority}
            onUpdate={handleUpdate}
            disabled={isUpdating}
          />
        </div>

        {/* Assignee */}
        <div>
          <AssigneeDropdown
            currentAssignee={issue.assignee}
            projectMembers={projectMembers}
            onUpdate={handleUpdate}
            disabled={isUpdating}
          />
        </div>

        {/* Labels */}
        <LabelsSection issueId={issue.id} onError={onError} />

        {/* Time Estimate */}
        <TimeEstimateEditor
          currentEstimate={issue.time_estimate}
          onUpdate={handleUpdate}
          onError={onError}
          disabled={isUpdating}
        />

        {/* Metadata (read-only) */}
        <IssueMetadata issue={issue} />
      </dl>
    </div>
  );
}