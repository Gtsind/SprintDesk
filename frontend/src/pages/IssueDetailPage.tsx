import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Layout } from "../components/Layout";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/Button";
import { IssueHeader } from "../components/IssueHeader";
import { IssueDescription } from "../components/IssueDescription";
import { CommentSection } from "../components/CommentSection";
import { IssueSidebar } from "../components/IssueSidebar";
import { useApi } from "../hooks/useApi";
import { getIssue, updateIssue, deleteIssue } from "../services/api";
import type { Issue, IssueUpdate, ApiError } from "../types";

interface IssueDetailPageProps {
  navigate: (page: string, data?: any) => void;
  pageData: { issueId?: number };
}

export function IssueDetailPage({ navigate, pageData }: IssueDetailPageProps) {
  const issueId = pageData.issueId;
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDescriptionUpdate = async (newDescription: string) => {
    await handleUpdateIssue({ description: newDescription || null });
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

  const handleDeleteIssue = async () => {
    if (!issueId) return;

    try {
      setError("");
      setIsDeleting(true);
      await deleteIssue(issueId);
      navigate("dashboard");
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
      <Layout navigate={navigate}>
        <LoadingSpinner message="Loading issue..." />
      </Layout>
    );
  }

  if (!issue) {
    return (
      <Layout navigate={navigate}>
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
    <Layout navigate={navigate}>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <IssueHeader issue={issue} navigate={navigate} />
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              onClick={() => setIsEditing((editing) => !editing)}
              variant="secondary"
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            <Button
              onClick={handleDeleteIssue}
              disabled={isDeleting}
              variant="danger"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <IssueDescription
              description={issue.description}
              isEditing={isEditing}
              onUpdate={handleDescriptionUpdate}
              onCancel={() => setIsEditing(false)}
            />
            <CommentSection issueId={issue.id} />
          </div>
          <IssueSidebar issue={issue} />
        </div>
      </div>
    </Layout>
  );
}
