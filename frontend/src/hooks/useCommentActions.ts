import { useState } from "react";
import { createComment, updateComment, deleteComment } from "../services/api";
import type { Comment } from "../types";

export function useCommentActions(issueId: number) {
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [deletingCommentById, setDeletingCommentById] = useState<number | null>(null);

  const handleSubmitComment = async (
    content: string,
    onSuccess: (comment: Comment) => void,
    onClear: () => void
  ) => {
    if (!content.trim()) return;

    setSubmittingComment(true);
    try {
      const comment = await createComment(issueId, content);
      onSuccess(comment);
      onClear();
    } finally {
      setSubmittingComment(false);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment);
  };

  const cancelEdit = () => {
    setEditingComment(null);
  };

  const saveEdit = async (
    newContent: string,
    onSuccess: (updatedComment: Comment) => void
  ) => {
    if (!editingComment) return;

    const updatedComment = await updateComment(editingComment.id, newContent);
    onSuccess(updatedComment);
    setEditingComment(null);
  };

  const startDelete = (commentId: number) => {
    setDeletingCommentById(commentId);
  };

  const cancelDelete = () => {
    setDeletingCommentById(null);
  };

  const handleDeleteConfirm = async (onSuccess: (deletedId: number) => void) => {
    if (!deletingCommentById) return;

    await deleteComment(deletingCommentById);
    onSuccess(deletingCommentById);
    setDeletingCommentById(null);
  };

  return {
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
  };
}