import { useState } from "react";
import { updateIssue, deleteIssue } from "../services/api";
import type { Issue, IssueUpdate } from "../types";

interface UseIssueOperationsProps {
  issue: Issue;
  onUpdate: (updatedIssue?: Issue) => void;
  onError: (message: string) => void;
  navigate: (page: string, data?: unknown) => void;
}

export function useIssueOperations({
  issue,
  onUpdate,
  onError,
  navigate,
}: UseIssueOperationsProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = async (updateData: IssueUpdate): Promise<void> => {
    try {
      const updatedIssue = await updateIssue(issue.id, updateData);
      onUpdate(updatedIssue); // Pass the updated issue instead of refetching
    } catch (err: any) {
      const errorMessage = err?.detail || "Failed to update issue";
      onError(errorMessage);
      throw err; // Re-throw so calling component can handle reversion
    }
  };

  const handleClose = async (): Promise<void> => {
    if (isClosing) return;
    
    try {
      setIsClosing(true);
      await handleUpdate({ status: "Closed" });
    } catch (err: any) {
      onError(err?.detail || "Failed to close issue");
    } finally {
      setIsClosing(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      await deleteIssue(issue.id);
      navigate("project-details", { projectId: issue.project.id });
    } catch (err: any) {
      onError(err?.detail || "Failed to delete issue");
      setIsDeleting(false);
    }
  };

  return {
    // Operations
    handleUpdate,
    handleClose,
    handleDelete,
    
    // Loading states
    isClosing,
    isDeleting,
  };
}