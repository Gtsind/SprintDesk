import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Layout } from "../components/Layout";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ListCard } from "../components/ListCard";
import { Button } from "../components/Button";
import { useApi } from "../hooks/useApi";
import { getProjects } from "../services/api";
import type { Project } from "../types";

interface ProjectsListPageProps {
  navigate: (page: string, data?: any) => void;
}

export function ProjectsListPage({ navigate }: ProjectsListPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: projects, loading } = useApi<Project[]>(getProjects);

  const filteredProjects = projects?.filter(project =>
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
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <Button
            onClick={() => {}} // Inactive for now
            disabled={true}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
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
                  : "You don't have access to any projects yet."
                }
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