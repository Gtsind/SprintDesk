import { useState, useEffect, type FormEvent } from "react";
import { MessageSquareText, ArrowUp } from "lucide-react";
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

  const handleSubmitComment = async (e?: FormEvent) => {
    e?.preventDefault();
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  if (loading)
    return <div className="text-center py-4">Loading comments...</div>;

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <MessageSquareText className="h-5 w-5 text-gray-400" />
        <h2 className="text-lg font-medium text-gray-900">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comments List */}
      <div className="space-y-4 mb-6">
        {comments.length > 0 &&
          comments.map((comment) => (
            <div
              key={comment.id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm"
            >
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
          ))}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment}>
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-gray-300 resize-none"
            placeholder="Leave a comment..."
            required
          />
          <button
            type="submit"
            disabled={submittingComment || !newComment.trim()}
            className={`absolute bottom-2 right-2 p-1 m-1 border rounded-full ${
              newComment.trim()
                ? "border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600"
                : "border-gray-400 text-black hover:bg-gray-500"
            }`}
            title="Submit comment (Ctrl+Enter)"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
