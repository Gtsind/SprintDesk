import { useState, useEffect, useCallback } from "react";
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
import { useIssueActions } from "../hooks/useIssueActions";
import { getIssue, getProjectMembers } from "../services/api";
import type { Issue, User } from "../types";
import { DisplayErrorModal } from "../components/modals/DisplayErrorModal";

interface IssueDetailPageProps {
  navigate: (page: string, data?: unknown) => void;
  pageData: { issueId?: number; fromPage?: string };
}

export function IssueDetailPage({ navigate, pageData }: IssueDetailPageProps) {
  const issueId = pageData.issueId;
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  const getIssueData = useCallback(() => getIssue(issueId!), [issueId]);
  const {
    data: issue,
    loading: isLoading,
    refetch,
  } = useApi<Issue>(getIssueData);

  // Use local state to track the current issue (for optimistic updates)
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(issue);

  // Sync currentIssue when issue from API loads
  useEffect(() => {
    if (issue) {
      setCurrentIssue(issue);
    }
  }, [issue]);

  const getProjectMembersData = useCallback(() =>
    issue?.project.id
      ? getProjectMembers(issue.project.id)
      : Promise.resolve([]),
    [issue?.project.id]
  );
  const { data: projectMembers = [] } = useApi<User[]>(getProjectMembersData);

  const handleErrorMessage = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setShowErrorModal(true);
  }, []);

  const { handleUpdate, handleClose, handleDelete, isClosing, isDeleting } =
    useIssueActions({
      issue: currentIssue!,
      onUpdate: (updatedIssue) => {
        if (updatedIssue) {
          setCurrentIssue(updatedIssue);
        } else {
          refetch();
        }
      },
      onError: handleErrorMessage,
      navigate,
    });

  const breadcrumbs = generateBreadcrumbs("issue-detail", {
    issueId,
    issue: currentIssue || undefined,
    fromPage: pageData.fromPage,
  });

  if (isLoading) {
    return (
      <Layout navigate={navigate} breadcrumbs={breadcrumbs}>
        <LoadingSpinner message="Loading issue..." />
      </Layout>
    );
  }

  if (!currentIssue) {
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
        issue={currentIssue}
        onUpdate={handleUpdate}
        onClose={handleClose}
        onDelete={handleDelete}
        onError={handleErrorMessage}
        isClosing={isClosing}
        isDeleting={isDeleting}
      />
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-4">
          <IssueDescription
            issue={currentIssue}
            onUpdate={handleUpdate}
            onError={handleErrorMessage}
          />

          <CommentSection issueId={currentIssue.id} />
        </div>
        <div className="col-span-1">
          <IssueSidebar
            issue={currentIssue}
            projectMembers={projectMembers || []}
            onUpdate={handleUpdate}
            onError={handleErrorMessage}
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
