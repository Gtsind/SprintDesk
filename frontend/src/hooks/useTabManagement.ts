import { useState } from "react";
import type { ActiveFilters } from "../components/toolbar";

export function useTabManagement() {
  const [activeTab, setActiveTab] = useState<"issues" | "members">("issues");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});

  const switchTab = (tab: "issues" | "members") => {
    setActiveTab(tab);
    // Clear search and filters when switching tabs
    setSearchQuery("");
    setActiveFilters({});
  };

  return {
    activeTab,
    searchQuery,
    activeFilters,
    setSearchQuery,
    setActiveFilters,
    switchTab,
  };
}