import { AlertCircle } from "lucide-react";
import { ListCard } from "./ListCard";
import { EmptyState } from "./EmptyState";
import type { Issue } from "../types";
import type { ActiveFilters } from "./toolbar";

interface IssuesTabProps {
  issues: Issue[];
  searchQuery: string;
  activeFilters: ActiveFilters;
  onIssueClick: (issue: Issue) => void;
  onIssueDelete: (issue: Issue) => void;
}

export function IssuesTab({
  issues,
  searchQuery,
  activeFilters,
  onIssueClick,
  onIssueDelete,
}: IssuesTabProps) {
  const hasSearchOrFilters = searchQuery || Object.keys(activeFilters).length > 0;

  if (issues.length === 0) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No issues found"
        message={
          hasSearchOrFilters
            ? "Try adjusting your search or filters"
            : "This project doesn't have any issues yet."
        }
      />
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {issues.map((issue) => (
        <ListCard
          key={issue.id}
          type="issue"
          item={issue}
          onClick={onIssueClick}
          onRemove={onIssueDelete}
        />
      ))}
    </ul>
  );
}