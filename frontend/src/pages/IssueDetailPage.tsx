import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { generateBreadcrumbs } from "../utils/breadcrumbs";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Button } from "../components/ui/Button";
import { IssueHeader } from "../components/issue/IssueHeader";
import { IssueDescription } from "../components/issue/IssueDescription";
import { CommentSection } from "../components/issue/CommentSection";
import { IssueSidebar } from "../components/issue/IssueSidebar";
import { useApi } from "../hooks/useApi";
import {
  getIssue,
  updateIssue,
  deleteIssue,
  closeIssue,
  getProjectMembers,
} from "../services/api";
import type { Issue, IssueUpdate, ApiError, User } from "../types";
import { DisplayErrorModal } from "../components/modals/DisplayErrorModal";

interface IssueDetailPageProps {
  navigate: (page: string, data?: unknown) => void;
  pageData: { issueId?: number };
}

export function IssueDetailPage({ navigate, pageData }: IssueDetailPageProps) {
  const issueId = pageData.issueId;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const {
    data: issue,
    loading: isLoading,
    refetch,
  } = useApi<Issue>(
    () =>
      issueId ? getIssue(issueId) : Promise.reject(new Error("No issue ID")),
    [issueId]
  );

  const { data: projectMembers = [] } = useApi<User[]>(
    () =>
      issue?.project.id
        ? getProjectMembers(issue.project.id)
        : Promise.resolve([]),
    [issue?.project.id]
  );

  // Sync drafts with issue data when it loads, but don't overwrite active edits
  useEffect(() => {
    if (issue && !isEditingTitle && !isEditingDescription) {
      setTitle(issue.title || "");
      setDescription(issue.description || "");
    }
  }, [issue, isEditingTitle, isEditingDescription]);

  const breadcrumbs = generateBreadcrumbs("issue-detail", {
    issueId,
    issue: issue || undefined,
  });

  const handleDescriptionUpdate = async () => {
    const currentDescription = issue?.description || "";

    // Only update if description actually changed
    if (description !== currentDescription) {
      try {
        await handleUpdateIssue({ description: description });
      } catch {
        setDescription(currentDescription); // Revert on error
      }
    }

    // Set editing to false AFTER processing the update to prevent useEffect interference
    setIsEditingDescription(false);
  };

  const handleTitleUpdate = async () => {
    const trimmedTitle = title.trim();
    setIsEditingTitle(false);

    // Validate empty title
    if (!trimmedTitle) {
      setTitle(issue?.title || "");
      setError(
        "Title cannot be empty. The title has been reverted to its previous value."
      );
      setShowErrorModal(true);
      return;
    }

    if (trimmedTitle !== issue?.title) {
      try {
        await handleUpdateIssue({ title: trimmedTitle });
      } catch {
        // Error already handled in handleUpdateIssue
      }
    }
    // Revert to original issue value instead of clearing
    setTitle(issue?.title || "");
  };

  const handleUpdateIssue = async (updateData: IssueUpdate) => {
    if (!issueId) return;

    try {
      await updateIssue(issueId, updateData);
      refetch();
    } catch (error: unknown) {
      if (error && typeof error === "object" && "detail" in error) {
        setError((error as ApiError).detail);
      } else {
        setError("An unexpected error occurred");
      }
      setShowErrorModal(true);
    }
  };

  const handleCloseIssue = async () => {
    if (!issueId) return;

    try {
      setError("");
      setIsClosing(true);
      await closeIssue(issueId);
      refetch();
    } catch (error: unknown) {
      if (error && typeof error === "object" && "detail" in error) {
        setError((error as ApiError).detail);
      } else {
        setError("An unexpected error occurred");
      }
      setShowErrorModal(true);
    } finally {
      setIsClosing(false);
    }
  };

  const handleDeleteIssue = async () => {
    if (!issueId || !issue) return;

    try {
      setError("");
      setIsDeleting(true);
      await deleteIssue(issueId);
      navigate("project-details", { projectId: issue.project.id });
    } catch (error: unknown) {
      if (error && typeof error === "object" && "detail" in error) {
        setError((error as ApiError).detail);
      } else {
        setError("An unexpected error occurred");
      }
      setShowErrorModal(true);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout navigate={navigate} breadcrumbs={breadcrumbs}>
        <LoadingSpinner message="Loading issue..." />
      </Layout>
    );
  }

  if (!issue) {
    return (
      <Layout navigate={navigate} breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Issue not found
          </h3>
          <p className="mt-2 text-gray-600">
            The issue you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout navigate={navigate} breadcrumbs={breadcrumbs}>
      <IssueHeader
        issue={issue}
        isEditingTitle={isEditingTitle}
        title={title}
        setTitle={setTitle}
        setIsEditingTitle={setIsEditingTitle}
        onTitleUpdate={handleTitleUpdate}
        onClose={handleCloseIssue}
        onDelete={handleDeleteIssue}
        isClosing={isClosing}
        isDeleting={isDeleting}
      />
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-4">
          <IssueDescription
            originalDescription={issue.description}
            isEditing={isEditingDescription}
            description={description}
            setDescription={setDescription}
            setIsEditing={setIsEditingDescription}
            onUpdate={handleDescriptionUpdate}
          />

          <CommentSection issueId={issue.id} />
        </div>
        <div className="col-span-1">
          <IssueSidebar
            issue={issue}
            projectMembers={projectMembers || []}
            onIssueUpdate={refetch}
            onError={(errorMessage) => {
              setError(errorMessage);
              setShowErrorModal(true);
            }}
          />
        </div>
      </div>

      <DisplayErrorModal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setError("");
        }}
        error={error}
      />
    </Layout>
  );
}
