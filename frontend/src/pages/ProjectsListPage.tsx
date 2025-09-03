import { useState } from "react";
import { Plus } from "lucide-react";
import { Layout } from "../components/Layout";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ListCard } from "../components/ListCard";
import { SearchBar } from "../components/SearchBar";
import { useApi } from "../hooks/useApi";
import { getProjects } from "../services/api";
import type { Project } from "../types";
import { Button } from "../components/Button";

interface ProjectsListPageProps {
  navigate: (page: string, data?: any) => void;
}

export function ProjectsListPage({ navigate }: ProjectsListPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: projects, loading } = useApi<Project[]>(getProjects);

  const filteredProjects =
    projects?.filter(
      (project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading projects..." />
      </Layout>
    );
  }

  return (
    <Layout navigate={navigate}>
      <div className="w-full">
        {/* Header */}
        <div className="mb-4 px-4 md:px-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Projects</h1>
        </div>

        {/* Toolbar */}
        <div className="mb-6 px-4 md:px-0 flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-md">
            <SearchBar
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search projects..."
            />
          </div>
          <Button
            onClick={() => {}}
            disabled={true}
            className="flex items-center justify-center py-2.5 px-4 gap-2 w-full md:w-auto"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Projects List */}
        <div className="mx-4 md:mx-0 bg-white shadow-sm md:shadow rounded-lg overflow-hidden border border-gray-200 md:border-0">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {searchQuery ? "No projects found" : "No projects"}
              </h3>
              <p className="mt-2 text-gray-600">
                {searchQuery
                  ? `No projects match "${searchQuery}"`
                  : "You don't have access to any projects yet."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
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
    </Layout>
  );
}
