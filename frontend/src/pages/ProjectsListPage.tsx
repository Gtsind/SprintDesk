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
      <div className="px-4 py-6  ">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl p-1 font-bold text-gray-900">Projects</h1>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between ">
          <SearchBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search projects..."
          />
          <Button
            onClick={() => {}}
            disabled={true}
            className="flex py-2 px-2 gap-2"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Projects List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
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
