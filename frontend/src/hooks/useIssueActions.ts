import { useState } from "react";
import { updateIssue, deleteIssue, closeIssue, reopenIssue } from "../services/api";
import type { Issue, IssueUpdate, ApiError } from "../types";

interface UseIssueActionsProps {
  issue?: Issue; // Make optional for IssuesPage usage
  onUpdate: (updatedIssue?: Issue) => void;
  onError: (message: string) => void;
  navigate: (page: string, data?: unknown) => void;
  refetch?: () => void; // Add refetch for IssuesPage usage
}

export function useIssueActions({
  issue,
  onUpdate,
  onError,
  navigate,
  refetch,
}: UseIssueActionsProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<Issue | null>(null);

  // Utility function to format errors
  const extractErrorMessage = (err: unknown) => {
    return err && typeof err === "object" && "detail" in err
      ? (err as ApiError).detail
      : "An unexpected error occurred.";
  };

  const handleUpdate = async (updateData: IssueUpdate): Promise<void> => {
    if (!issue) return;
    try {
      let updatedIssue: Issue;
      
      // Handle status changes with special logic for close/reopen
      if (updateData.status && updateData.status !== issue.status) {
        const newStatus = updateData.status;
        const currentStatus = issue.status;
        
        if (newStatus === "Closed" && currentStatus !== "Closed") {
          // Closing issue - use dedicated closeIssue API
          updatedIssue = await closeIssue(issue.id);
        } else if (newStatus !== "Closed" && currentStatus === "Closed") {
          // Reopening issue - use dedicated reopenIssue API
          updatedIssue = await reopenIssue(issue.id);
          // Then update to the specific status if not "Open"
          if (newStatus !== "Open") {
            updatedIssue = await updateIssue(issue.id, { status: newStatus });
          }
        } else {
          // Regular status change - use generic updateIssue API
          updatedIssue = await updateIssue(issue.id, updateData);
        }
      } else {
        // Non-status updates or regular updates
        updatedIssue = await updateIssue(issue.id, updateData);
      }
      
      onUpdate(updatedIssue); // Pass the updated issue instead of refetching
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      onError(errorMessage);
      throw err; // Re-throw so calling component can handle reversion
    }
  };

  const handleClose = async (): Promise<void> => {
    if (isClosing || !issue) return;

    try {
      setIsClosing(true);
      const updatedIssue = await closeIssue(issue.id);
      onUpdate(updatedIssue);
    } catch (err: any) {
      onError(extractErrorMessage(err));
    } finally {
      setIsClosing(false);
    }
  };

  const handleDelete = async (targetIssue?: Issue): Promise<void> => {
    if (isDeleting) return;
    
    const issueToProcess = targetIssue || issue;
    if (!issueToProcess) return;

    try {
      setIsDeleting(true);
      await deleteIssue(issueToProcess.id);
      
      // If we have refetch (IssuesPage usage), call it
      if (refetch) {
        refetch();
      } else {
        // Otherwise navigate to project details (IssueDetailPage usage)
        navigate("project-details", { projectId: issueToProcess.project.id });
      }
    } catch (err: any) {
      onError(extractErrorMessage(err));
      setIsDeleting(false);
    }
  };

  // Delete confirmation helpers
  const handleDeleteClick = (targetIssue: Issue) => {
    setIssueToDelete(targetIssue);
    setShowDeleteConfirmationModal(true);
  };

  const handleConfirmDelete = async () => {
    if (issueToDelete) {
      await handleDelete(issueToDelete);
      setShowDeleteConfirmationModal(false);
      setIssueToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmationModal(false);
    setIssueToDelete(null);
  };

  return {
    // Operations
    handleUpdate,
    handleClose,
    handleDelete,
    
    // Delete confirmation
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,

    // Loading states
    isClosing,
    isDeleting,
    
    // Modal states
    showDeleteConfirmationModal,
    issueToDelete,
  };
}
