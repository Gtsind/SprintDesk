import { AlertCircle } from "lucide-react";
import { Layout } from "../components/Layout";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/Button";
import { IssueHeader } from "../components/IssueHeader";
import { IssueDescription } from "../components/IssueDescription";
import { CommentSection } from "../components/CommentSection";
import { IssueSidebar } from "../components/IssueSidebar";
import { useApi } from "../hooks/useApi";
import { getIssue } from "../services/api";
import type { Issue } from "../types";

interface IssueDetailPageProps {
  navigate: (page: string, data?: any) => void;
  pageData: { issueId?: number };
}

export function IssueDetailPage({ navigate, pageData }: IssueDetailPageProps) {
  const issueId = pageData.issueId;

  const { data: issue, loading: isLoading } = useApi<Issue>(
    () =>
      issueId ? getIssue(issueId) : Promise.reject(new Error("No issue ID")),
    [issueId]
  );

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
        <IssueHeader issue={issue} navigate={navigate} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <IssueDescription description={issue.description} />
            <CommentSection issueId={issue.id} />
          </div>
          <IssueSidebar issue={issue} />
        </div>
      </div>
    </Layout>
  );
}
