import { useMemo } from "react";
import {
  applyFilters,
  issueFilterFunctions,
  userFilterFunctions,
} from "../utils/filterConfigs";
import type { Issue, User } from "../types";
import type { ActiveFilters } from "../components/toolbar";

export function useProjectFiltering(
  issues: Issue[],
  members: User[],
  searchQuery: string,
  activeFilters: ActiveFilters
) {
  // Filter issues by search
  const searchFilteredIssues = useMemo(() => {
    if (!searchQuery) return issues;
    return issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [issues, searchQuery]);

  // Filter members by search
  const searchFilteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    return members.filter(
      (member) =>
        `${member.firstname} ${member.lastname}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  // Apply additional filters
  const filteredIssues = useMemo(() => {
    return applyFilters(searchFilteredIssues, activeFilters, issueFilterFunctions);
  }, [searchFilteredIssues, activeFilters]);

  const filteredMembers = useMemo(() => {
    return applyFilters(searchFilteredMembers, activeFilters, userFilterFunctions);
  }, [searchFilteredMembers, activeFilters]);

  return {
    filteredIssues,
    filteredMembers,
  };
}