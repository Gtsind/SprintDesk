import { useState, type FormEvent } from "react";
import { MessageSquare, AlertCircle } from "lucide-react";
import { Layout } from "../components/Layout";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/Button";
import { useApi } from "../hooks/useApi";
import { getIssue, getIssueComments, createComment } from "../services/api";
import type { Issue, Comment } from "../types";
import { StatusBadge } from "../components/StatusBadge";

interface IssueDetailPageProps {
  navigate: (page: string, data?: any) => void;
  pageData: { issueId?: number };
}

export function IssueDetailPage({ navigate, pageData }: IssueDetailPageProps) {
  const issueId = pageData.issueId;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const { data: issue, loading: issueLoading } = useApi<Issue>(
    () =>
      issueId ? getIssue(issueId) : Promise.reject(new Error("No issue ID")),
    [issueId]
  );

  const { data: commentsData, loading: commentsLoading } = useApi<Comment[]>(
    () => (issueId ? getIssueComments(issueId) : Promise.resolve([])),
    [issueId]
  );

  // Update comments when data loads
  if (commentsData && comments.length === 0 && commentsData.length > 0) {
    setComments(commentsData);
  }

  const isLoading = issueLoading || commentsLoading;

  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !issueId) return;

    setSubmittingComment(true);

    try {
      const comment = await createComment(issueId, newComment);
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to create comment: ", error);
    } finally {
      setSubmittingComment(false);
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
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={() =>
                  navigate("project-issues", { projectId: issue.project_id })
                }
                className="text-indigo-600 hover:text-indigo-500 text-sm"
              >
                ← Back to {issue.project.name}
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {issue.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>#{issue.id}</span>
              <span>
                Created by {issue.author.firstname} {issue.author.lastname}
              </span>
              <span>{new Date(issue.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <StatusBadge status={issue.priority} type="priority" />
            <StatusBadge status={issue.status} type="status" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Description */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Description
              </h2>
              {issue.description ? (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {issue.description}
                </p>
              ) : (
                <p className="text-gray-500 italic">No description provided.</p>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900">
                  Comments ({comments.length})
                </h2>
              </div>

              {/* Comment Form */}
              <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add a comment..."
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                >
                  {submittingComment ? "Posting..." : "Post Comment"}
                </Button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No comments yet.
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.author.firstname} {comment.author.lastname}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Issue Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Details
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Assignee
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {issue.assignee
                      ? `${issue.assignee.firstname} ${issue.assignee.lastname}`
                      : "Unassigned"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Project</dt>
                  <dd className="text-sm text-gray-900">
                    {issue.project.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Time Estimate
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {issue.time_estimate
                      ? `${issue.time_estimate} hours`
                      : "Not set"}
                  </dd>
                </div>
                {issue.updated_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Last Updated
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(issue.updated_at).toLocaleString()}
                    </dd>
                  </div>
                )}
                {issue.closed_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Closed
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(issue.closed_at).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
