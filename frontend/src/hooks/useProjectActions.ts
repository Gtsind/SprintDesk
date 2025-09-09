import { useState } from "react";
import {
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  deleteIssue,
} from "../services/api";
import type { ProjectUpdate, ApiError, Project, User, Issue } from "../types";

interface UseProjectActionProps {
  projectId?: number;
  refetchProject: () => void;
  refetchIssues: () => void;
  navigate: (page: string, data?: unknown) => void;
  initialName?: string;
  initialDescription?: string;
}

export function useProjectActions({
  projectId,
  refetchProject,
  refetchIssues,
  navigate,
  initialName = "",
  initialDescription = "",
}: UseProjectActionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: initialName,
    description: initialDescription,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [isDeletingIssue, setIsDeletingIssue] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const [deleteContext, setDeleteContext] = useState<{
    type: "project" | "member" | "issue";
    item: Project | User | Issue | null;
  }>({ type: "project", item: null });

  // Utility function to format errors
  const extractErrorMessage = (err: unknown) => {
    return err && typeof err === "object" && "detail" in err
      ? (err as ApiError).detail
      : "An unexpected error occurred.";
  };

  const handleUpdateProject = async (updateData: ProjectUpdate) => {
    if (!projectId) return;
    try {
      setError("");
      await updateProject(projectId, updateData);
      refetchProject();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleEditProject = (name: string, description: string) => {
    setIsEditing(true);
    setEditData({ name, description });
  };

  const handleSaveProject = async () => {
    if (!editData.name.trim()) return;

    await handleUpdateProject({
      name: editData.name.trim(),
      description: editData.description.trim(),
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({ name: initialName, description: initialDescription });
  };

  const handleCompleteProject = async () => {
    if (!projectId) return;
    try {
      setError("");
      setIsCompleting(true);
      await handleUpdateProject({ status: "Completed" });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;
    try {
      setError("");
      setIsDeleting(true);
      await deleteProject(projectId);
      navigate("projects-list");
    } catch (err) {
      setError(extractErrorMessage(err));
      setIsDeleting(false);
    }
  };

  const handleIssueCreated = () => {
    refetchIssues();
  };

  const handleAddMember = async (userId: number) => {
    if (!projectId) return;
    try {
      setError("");
      setIsAddingMember(true);
      await addProjectMember(projectId, userId);
      refetchProject();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!projectId) return;
    try {
      setError("");
      setIsRemovingMember(true);
      await removeProjectMember(projectId, userId);
      refetchProject();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsRemovingMember(false);
    }
  };

  const handleDeleteIssue = async (issueId: number) => {
    try {
      setError("");
      setIsDeletingIssue(true);
      await deleteIssue(issueId);
      refetchIssues(); // Refresh issues list
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsDeletingIssue(false);
    }
  };

  // Delete confirmation helpers
  const handleDeleteProjectClick = (project: Project) => {
    setDeleteContext({ type: "project", item: project });
    setShowDeleteConfirmationModal(true);
  };

  const handleRemoveMemberClick = (member: User) => {
    setDeleteContext({ type: "member", item: member });
    setShowDeleteConfirmationModal(true);
  };

  const handleDeleteIssueClick = (issue: Issue) => {
    setDeleteContext({ type: "issue", item: issue });
    setShowDeleteConfirmationModal(true);
  };

  const handleConfirmDelete = async () => {
    const { type, item } = deleteContext;
    if (!item) return;

    try {
      switch (type) {
        case "project":
          await handleDeleteProject();
          break;
        case "member":
          await handleRemoveMember(item.id);
          break;
        case "issue":
          await handleDeleteIssue(item.id);
          break;
      }
      setShowDeleteConfirmationModal(false);
    } catch {
      // Error is already handled by individual functions
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmationModal(false);
    setDeleteContext({ type: "project", item: null });
  };

  return {
    // states
    isEditing,
    isDeleting,
    isCompleting,
    isAddingMember,
    isRemovingMember,
    isDeletingIssue,
    editData,
    error,
    showDeleteConfirmationModal,
    deleteContext,

    // setter
    setEditData,

    // handlers
    handleEditProject,
    handleSaveProject,
    handleCancelEdit,
    handleCompleteProject,
    handleDeleteProject,
    handleIssueCreated,
    handleAddMember,
    handleRemoveMember,
    handleDeleteIssue,

    // delete confirmation handlers
    handleDeleteProjectClick,
    handleRemoveMemberClick,
    handleDeleteIssueClick,
    handleConfirmDelete,
    handleCancelDelete,
  };
}
