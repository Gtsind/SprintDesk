import { useState } from "react";
import { Plus } from "lucide-react";
import { Layout } from "../components/Layout";
import { generateBreadcrumbs } from "../utils/breadcrumbs";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ListCard } from "../components/ListCard";
import { Toolbar, type ActiveFilters } from "../components/toolbar";
import { ProjectCreateModal } from "../components/ProjectCreateModal";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../contexts/AuthContext";
import { getProjects } from "../services/api";
import type { Project } from "../types";
import { Button } from "../components/Button";
import { createProjectsPageFilterConfig, applyFilters, projectFilterFunctions } from "../utils/filterConfigs";

interface ProjectsListPageProps {
  navigate: (page: string, data?: unknown) => void;
}

export function ProjectsPage({ navigate }: ProjectsListPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { data: projects, loading, refetch } = useApi<Project[]>(getProjects);
  const breadcrumbs = generateBreadcrumbs("projects-list");

  const canCreateProject =
    user?.role === "Admin" || user?.role === "Project Manager";

  const handleProjectCreated = (newProject: Project) => {
    refetch();
    navigate("project-details", { projectId: newProject.id });
  };

  // Apply search filter first
  const searchFilteredProjects = projects?.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Then apply active filters
  const filteredProjects = applyFilters(
    searchFilteredProjects,
    activeFilters,
    projectFilterFunctions
  );

  // Create filter configuration
  const filterConfig = createProjectsPageFilterConfig(projects || undefined);

  if (loading) {
    return (
      <Layout breadcrumbs={breadcrumbs}>
        <LoadingSpinner message="Loading projects..." />
      </Layout>
    );
  }

  return (
    <Layout navigate={navigate} breadcrumbs={breadcrumbs}>
      <div className="w-full">
        {/* Header */}
        <div className="mb-4 px-4 md:px-0">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Projects
          </h1>
        </div>

        {/* Toolbar */}
        <div className="mb-6 px-4 md:px-0">
          <Toolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search projects..."
            filterConfig={filterConfig}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            rightContent={
              <Button
                onClick={() => setIsModalOpen(true)}
                disabled={!canCreateProject}
                className="flex items-center justify-center py-2.5 px-4 gap-2 w-full md:w-auto"
              >
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            }
          />
        </div>

        {/* Projects List */}
        <div className="mx-4 md:mx-0 bg-white rounded-lg overflow-hidden border-b-gray-300">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {searchQuery ? "No projects found" : "No projects"}
              </h3>
              <p className="mt-2 text-gray-600">
                {searchQuery || Object.keys(activeFilters).length > 0
                  ? "Try adjusting your search or filters"
                  : "You don't have access to any projects yet."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-300">
              {filteredProjects.map((project) => (
                <ListCard
                  key={project.id}
                  type="project"
                  item={project}
                  onClick={(project) =>
                    navigate("project-details", { projectId: project.id })
                  }
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      <ProjectCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </Layout>
  );
}
