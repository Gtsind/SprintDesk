import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Layout } from "../components/Layout";
import { generateBreadcrumbs } from "../utils/breadcrumbs";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/Button";
import { ActionButtons } from "../components/ActionButtons";
import { IssueDescription } from "../components/IssueDescription";
import { CommentSection } from "../components/CommentSection";
import { IssueSidebar } from "../components/IssueSidebar";
import { useApi } from "../hooks/useApi";
import {
  getIssue,
  updateIssue,
  deleteIssue,
  closeIssue,
} from "../services/api";
import type { Issue, IssueUpdate, ApiError } from "../types";
import { StatusBadge } from "../components/StatusBadge";

interface IssueDetailPageProps {
  navigate: (page: string, data?: unknown) => void;
  pageData: { issueId?: number };
}

export function IssueDetailPage({ navigate, pageData }: IssueDetailPageProps) {
  const issueId = pageData.issueId;
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState("");
  const {
    data: issue,
    loading: isLoading,
    refetch,
  } = useApi<Issue>(
    () =>
      issueId ? getIssue(issueId) : Promise.reject(new Error("No issue ID")),
    [issueId]
  );

  const breadcrumbs = generateBreadcrumbs("issue-detail", {
    issueId,
    issue: issue || undefined,
  });

  const handleDescriptionUpdate = async (newDescription: string) => {
    await handleUpdateIssue({ description: newDescription || undefined });
  };

  const handleTitleUpdate = async () => {
    if (editTitle.trim() && editTitle !== issue?.title) {
      await handleUpdateIssue({ title: editTitle.trim() });
      setIsEditing(false);
      setEditTitle("");
    }
  };

  const handleUpdateIssue = async (updateData: IssueUpdate) => {
    if (!issueId) return;

    try {
      setError("");
      await updateIssue(issueId, updateData);
      refetch();
      setIsEditing(false);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "detail" in error) {
        setError((error as ApiError).detail);
      } else {
        setError("An unexpected error occurred");
      }
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
      {/* {Header} */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTitleUpdate();
                } else if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditTitle("");
                }
              }}
              className="text-lg text-gray-900 bg-white border border-gray-300 rounded-md px-2 py-1 w-full lg:w-4/5 focus:outline-none focus:border-gray-400 mb-1.5"
              placeholder="Issue title"
              autoFocus
            />
          ) : (
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              {issue.title}
            </h1>
          )}
          <div className="flex space-x-2 mb-3">
            <StatusBadge status={issue.priority} type="priority" />
            <StatusBadge status={issue.status} type="status" />
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
        {/* {Action buttons} */}
        <ActionButtons
          onEdit={() => {
            setIsEditing(true);
            setEditTitle(issue?.title || "");
          }}
          onClose={handleCloseIssue}
          onDelete={handleDeleteIssue}
          isEditing={isEditing}
          isClosing={isClosing}
          isDeleting={isDeleting}
          entityType="issue"
        />
      </div>
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-4">
          <IssueDescription
            description={issue.description}
            isEditing={isEditing}
            onUpdate={handleDescriptionUpdate}
            onCancel={() => {
              setIsEditing(false);
              setEditTitle("");
            }}
          />
          <CommentSection issueId={issue.id} />
        </div>
        <div className="col-span-1">
          <IssueSidebar issue={issue} />
        </div>
      </div>
    </Layout>
  );
}
