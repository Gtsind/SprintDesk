import { useState, useEffect, type FormEvent } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "./Button";
import { useApi } from "../hooks/useApi";
import { getIssueComments, createComment } from "../services/api";
import type { Comment } from "../types";

interface CommentSectionProps {
  issueId: number;
}

export function CommentSection({ issueId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const { data: commentsData, loading } = useApi<Comment[]>(
    () => getIssueComments(issueId),
    [issueId]
  );

  // Update comments when data loads
  useEffect(() => {
    if (commentsData) {
      setComments(commentsData);
    }
  }, [commentsData]);

  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

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

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-4">Loading comments...</div>
      </div>
    );
  }

  return (
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
          className="p-3 text-base sm:text-sm"
        >
          {submittingComment ? "Posting..." : "Post Comment"}
        </Button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet.</p>
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
  );
}
