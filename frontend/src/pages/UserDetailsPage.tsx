import { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  User as UserIcon,
  Shield,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { generateBreadcrumbs } from "../utils/breadcrumbs";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/StatusBadge";
import { DeleteConfirmationModal } from "../components/modals/DeleteConfirmationModal";
import { EditableField } from "../components/user/EditableField";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import {
  getUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
} from "../services/api";
import { extractErrorMessage } from "../utils/errorHandling";
import { createUserFieldsConfig } from "../utils/userConfig.tsx";
import type { User, UserUpdate, UserRole } from "../types";

interface UserDetailsPageProps {
  navigate: (page: string, data?: unknown) => void;
  pageData: { userId?: number };
}

export function UserDetailsPage({ navigate, pageData }: UserDetailsPageProps) {
  const userId = pageData.userId;
  const { user: currentUser } = useAuth();
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const getUserData = useCallback(() => getUser(userId!), [userId]);
  const { data: user, loading: isLoading } = useApi<User>(getUserData);

  // Use local state to track the current user (for optimistic updates)
  const [currentUserData, setCurrentUserData] = useState<User | null>(user);

  // Sync currentUserData when user from API loads
  useEffect(() => {
    if (user) {
      setCurrentUserData(user);
    }
  }, [user]);

  // Permission checks
  const isOwnProfile = currentUser?.id === userId;
  const isAdmin = currentUser?.role === "Admin";
  const canEditBasic = isOwnProfile || isAdmin;
  const canEditRole = isAdmin && !isOwnProfile;
  const canDelete = isAdmin && !isOwnProfile;
  const canToggleStatus = isAdmin && !isOwnProfile;

  // User fields configuration
  const userFields = createUserFieldsConfig(canEditBasic, canEditRole);

  // Handle user update
  const handleUpdate = async (updateData: UserUpdate) => {
    if (!currentUserData) return;

    try {
      const updatedUser = await updateUser(currentUserData.id, updateData);
      setCurrentUserData(updatedUser);
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error) || "Failed to update user";
      setError(errorMessage);
      throw error; // Re-throw for useInlineEdit to handle
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!currentUserData) return;

    setIsDeleting(true);
    try {
      await deleteUser(currentUserData.id);
      navigate("users-list");
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error) || "Failed to delete user";
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Handle activate/deactivate
  const handleToggleStatus = async () => {
    if (!currentUserData) return;

    setIsToggling(true);
    try {
      const updatedUser = currentUserData.is_active
        ? await deactivateUser(currentUserData.id)
        : await activateUser(currentUserData.id);
      setCurrentUserData(updatedUser);
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error) || "Failed to update user status";
      setError(errorMessage);
    } finally {
      setIsToggling(false);
    }
  };


  const breadcrumbs = generateBreadcrumbs("user-detail", {
    userId,
    user: currentUserData || undefined,
    isOwnProfile,
  });

  if (isLoading) {
    return (
      <Layout navigate={navigate} breadcrumbs={breadcrumbs}>
        <LoadingSpinner message="Loading user..." />
      </Layout>
    );
  }

  if (!currentUserData) {
    return (
      <Layout navigate={navigate} breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            User not found
          </h3>
          <p className="mt-2 text-gray-600">
            The user you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("users-list")} className="mt-4">
            Back to Users
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout navigate={navigate} breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <UserIcon className="h-12 w-12 text-gray-400 bg-gray-100 rounded-full p-3" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-semibold text-gray-900">
                      {currentUserData.firstname} {currentUserData.lastname}
                    </h1>
                    <StatusBadge
                      status={currentUserData.is_active ? "Active" : "Inactive"}
                      type="user-status"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    @{currentUserData.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Status Toggle for Admins */}
                {canToggleStatus && (
                  <Button
                    onClick={handleToggleStatus}
                    disabled={isToggling}
                    variant={
                      currentUserData.is_active ? "secondary" : "primary"
                    }
                    className="flex items-center space-x-2 p-2"
                  >
                    {currentUserData.is_active ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                    <span>
                      {isToggling
                        ? "Updating..."
                        : currentUserData.is_active
                        ? "Deactivate"
                        : "Activate"}
                    </span>
                  </Button>
                )}

                {/* Delete Button for Admins */}
                {canDelete && (
                  <Button
                    onClick={() => setShowDeleteModal(true)}
                    variant="danger"
                    className="flex items-center space-x-2 p-2"
                  >
                    <span>Delete User</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-6 py-3 bg-red-50 border-l-4 border-red-400">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* User Information */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userFields.map((field) => (
                <EditableField
                  key={field.key}
                  field={field}
                  user={currentUserData}
                  onUpdate={handleUpdate}
                  onError={setError}
                />
              ))}

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="inline h-4 w-4 mr-1" />
                  Role
                </label>
                {canEditRole ? (
                  <select
                    value={currentUserData.role}
                    onChange={async (e) => {
                      await handleUpdate({ role: e.target.value as UserRole });
                    }}
                    className="w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Contributor">Contributor</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                ) : (
                  <div className="py-2">
                    <StatusBadge status={currentUserData.role} type="role" />
                  </div>
                )}
              </div>

              {/* Created Date */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Member Since
                </label>
                <p className="text-gray-900 py-2">
                  {new Date(currentUserData.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${currentUserData.firstname} ${currentUserData.lastname}?\n\nThis will permanently remove their account and cannot be undone.`}
        isLoading={isDeleting}
        confirmButtonText="Delete"
      />
    </Layout>
  );
}
