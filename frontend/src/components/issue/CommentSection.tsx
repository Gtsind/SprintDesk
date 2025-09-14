import { useState, useEffect, useCallback, type FormEvent } from "react";
import { MessageSquareText, ArrowUp, Edit2, Trash2, X, Check } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useCommentActions } from "../../hooks/useCommentActions";
import { getIssueComments } from "../../services/api";
import { DeleteConfirmationModal } from "../modals/DeleteConfirmationModal";
import type { Comment } from "../../types";

interface CommentSectionProps {
  issueId: number;
}

export function CommentSection({ issueId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  
  const {
    submittingComment,
    editingComment,
    deletingCommentById,
    handleSubmitComment,
    startEdit,
    cancelEdit,
    saveEdit,
    startDelete,
    cancelDelete,
    handleDeleteConfirm,
  } = useCommentActions(issueId);

  const getCommentsData = useCallback(() => getIssueComments(issueId), [issueId]);
  const { data: commentsData, loading } = useApi<Comment[]>(getCommentsData);

  // Update comments when data loads
  useEffect(() => {
    if (commentsData) {
      setComments(commentsData);
    }
  }, [commentsData]);

  const onSubmitComment = async (e?: FormEvent) => {
    e?.preventDefault();
    await handleSubmitComment(
      newComment,
      (comment) => setComments((prev) => [...prev, comment]),
      () => setNewComment("")
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      onSubmitComment();
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
              className="group border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {comment.author.firstname} {comment.author.lastname}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(comment)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="Edit comment"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => startDelete(comment.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="Delete comment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {editingComment?.id === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    defaultValue={comment.content}
                    className="w-full px-3 py-2 rounded-md focus:outline-none resize-none"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        cancelEdit();
                      }
                      if (e.key === "Enter" && e.ctrlKey) {
                        e.preventDefault();
                        saveEdit(
                          e.currentTarget.value,
                          (updatedComment) => setComments((prev) =>
                            prev.map((c) => (c.id === comment.id ? updatedComment : c))
                          )
                        );
                      }
                    }}
                    ref={(textarea) => {
                      if (textarea) {
                        textarea.focus();
                        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
                      }
                    }}
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement;
                        saveEdit(
                          textarea.value,
                          (updatedComment) => setComments((prev) =>
                            prev.map((c) => (c.id === comment.id ? updatedComment : c))
                          )
                        );
                      }}
                      className="p-1 text-green-600 hover:text-green-700 rounded"
                      title="Save"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </div>
          ))}
      </div>

      {/* Comment Form */}
      <form onSubmit={onSubmitComment}>
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-gray-400 resize-none"
            placeholder="Leave a comment..."
            required
          />
          <button
            type="submit"
            disabled={submittingComment || !newComment.trim()}
            className={`absolute bottom-2 right-2 p-1 m-1 border rounded-full ${
              newComment.trim()
                ? "border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600"
                : "border-gray-400 text-black hover:bg-gray-100"
            }`}
            title="Submit comment (Ctrl+Enter)"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deletingCommentById !== null}
        onClose={cancelDelete}
        onConfirm={() =>
          handleDeleteConfirm((deletedId) =>
            setComments((prev) => prev.filter((c) => c.id !== deletedId))
          )
        }
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmButtonText="Delete"
      />
    </div>
  );
}
