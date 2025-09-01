import { useState, useEffect, type FormEvent } from "react";
import { MessageSquare, AlertCircle } from "lucide-react";
import { Layout } from "../components/Layout";
import { useNavigation } from "../contexts/NavigationContext";
import { getIssue, getIssueComments, createComment } from "../services/api";
import { getPriorityColor, getStatusColor } from "../utils/colors";
import type { Issue, Comment } from "../types";

export function IssueDetailPage() {
  const { navigation, navigateTo } = useNavigation();
  const issueId = navigation.params.issueId;
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const loadIssueData = async () => {
      if (!issueId) return;

      try {
        const [issueData, commentsData] = await Promise.all([
          getIssue(parseInt(issueId)),
          getIssueComments(parseInt(issueId)),
        ]);
        setIssue(issueData);
        setComments(commentsData);
      } catch (error) {
        console.log("Failed to load issue data: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadIssueData();
  }, [issueId]);

  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !issueId) return;

    setSubmittingComment(true);

    try {
      const comment = await createComment(parseInt(issueId), newComment);
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
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading issue...</div>
        </div>
      </Layout>
    );
  }

  if (!issue) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Issue not found
          </h3>
          <p className="mt-2 text-gray-600">
            The issue you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigateTo("dashboard")}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={() =>
                  navigateTo("project-issues", {
                    projectId: issue.project_id.toString(),
                  })
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
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                issue.priority
              )}`}
            >
              {issue.priority}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                issue.status
              )}`}
            >
              {issue.status}
            </span>
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
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {submittingComment ? "Posting..." : "Post Comment"}
                </button>
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
