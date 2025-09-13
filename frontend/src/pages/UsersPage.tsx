import { useState } from "react";
import { Plus } from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { generateBreadcrumbs } from "../utils/breadcrumbs";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ListCard } from "../components/ui/ListCard";
import { Toolbar, type ActiveFilters } from "../components/toolbar";
import { Button } from "../components/ui/Button";
import { useApi } from "../hooks/useApi";
import { getAllUsers, deleteUser } from "../services/api";
import type { User } from "../types";
import { DeleteConfirmationModal } from "../components/modals/DeleteConfirmationModal";
import { UserCreateModal } from "../components/modals/UserCreateModal";
import {
  createUsersPageFilterConfig,
  applyFilters,
  userFilterFunctions,
} from "../utils/filterConfigs";

interface UsersPageProps {
  navigate: (page: string, data?: unknown) => void;
}

export function UsersPage({ navigate }: UsersPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: users, loading, refetch } = useApi<User[]>(getAllUsers);
  const breadcrumbs = generateBreadcrumbs("users-list");

  const handleUserClick = (user: User) => {
    navigate("user-detail", { userId: user.id });
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      refetch();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleUserCreated = () => {
    refetch();
    setIsCreateModalOpen(false);
  };

  // Apply search filter first
  const searchFilteredUsers =
    users?.filter(
      (user) =>
        user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.title &&
          user.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Then apply active filters
  const filteredUsers = applyFilters(
    searchFilteredUsers,
    activeFilters,
    userFilterFunctions
  );

  // Create filter configuration
  const filterConfig = createUsersPageFilterConfig(users || undefined);

  if (loading) {
    return (
      <Layout breadcrumbs={breadcrumbs}>
        <LoadingSpinner message="Loading users..." />
      </Layout>
    );
  }

  return (
    <Layout navigate={navigate} breadcrumbs={breadcrumbs}>
      <div className="w-full">
        {/* Header */}
        <div className="mb-4 px-4 md:px-0">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Users
          </h1>
        </div>

        {/* Toolbar */}
        <div className="mb-6 px-4 md:px-0">
          <Toolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search users..."
            filterConfig={filterConfig}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            rightContent={
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center justify-center py-2.5 px-4 gap-2 w-full md:w-auto"
              >
                <Plus className="h-4 w-4" />
                New User
              </Button>
            }
          />
        </div>

        {/* Users List */}
        <div className="mx-4 md:mx-0 bg-white rounded-lg overflow-hidden border-b-gray-300">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {searchQuery || Object.keys(activeFilters).length > 0
                  ? "No users found"
                  : "No users"}
              </h3>
              <p className="mt-2 text-gray-600">
                {searchQuery || Object.keys(activeFilters).length > 0
                  ? "Try adjusting your search or filters"
                  : "No users found in the system."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-300">
              {filteredUsers.map((user) => (
                <ListCard
                  key={user.id}
                  type="member"
                  item={user}
                  onClick={handleUserClick}
                  onRemove={handleDeleteClick}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Results Summary */}
        <div className="mt-4 px-4 md:px-0 text-sm text-gray-500">
          Showing {filteredUsers.length} of {users?.length || 0} users
          {searchQuery && ` matching "${searchQuery}"`}
          {Object.keys(activeFilters).length > 0 && " with active filters"}
        </div>
      </div>

      {/* User Create Modal */}
      <UserCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={
          userToDelete
            ? `Are you sure you want to delete ${userToDelete.firstname} ${userToDelete.lastname}?\n\nThis action cannot be undone.`
            : ""
        }
        isLoading={isDeleting}
        confirmButtonText="Delete"
      />
    </Layout>
  );
}
