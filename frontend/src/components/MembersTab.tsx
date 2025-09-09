import { Users } from "lucide-react";
import { ListCard } from "./ListCard";
import { EmptyState } from "./EmptyState";
import type { User } from "../types";
import type { ActiveFilters } from "./toolbar";

interface MembersTabProps {
  members: User[];
  searchQuery: string;
  activeFilters: ActiveFilters;
  onMemberClick: (member: User) => void;
  onMemberRemove: (member: User) => void;
}

export function MembersTab({
  members,
  searchQuery,
  activeFilters,
  onMemberClick,
  onMemberRemove,
}: MembersTabProps) {
  const hasSearchOrFilters = searchQuery || Object.keys(activeFilters).length > 0;

  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No members found"
        message={
          hasSearchOrFilters
            ? "Try adjusting your search or filters"
            : "This project doesn't have any members yet."
        }
      />
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {members.map((member) => (
        <ListCard
          key={member.id}
          type="member"
          item={member}
          onClick={onMemberClick}
          onRemove={onMemberRemove}
        />
      ))}
    </ul>
  );
}