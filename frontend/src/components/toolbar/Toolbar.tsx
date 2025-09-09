import { SearchBar } from "./SearchBar";
import { FilterDropdown } from "./FilterDropdown";
import { ActiveFilterBadges } from "./ActiveFilterBadges";
import type { FilterConfig, ActiveFilters } from "../../types/toolbar";

interface ToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filterConfig?: FilterConfig;
  activeFilters?: ActiveFilters;
  onFiltersChange?: (filters: ActiveFilters) => void;
  rightContent?: React.ReactNode;
  className?: string;
}

export function Toolbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  filterConfig,
  activeFilters = {},
  onFiltersChange,
  rightContent,
  className = "",
}: ToolbarProps) {
  const handleFiltersChange = (newFilters: ActiveFilters) => {
    onFiltersChange?.(newFilters);
  };

  const hasFilters = filterConfig && filterConfig.filters.length > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:gap-2 flex-1 max-w-md">
          <SearchBar
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            searchPlaceholder={searchPlaceholder}
          />
          {hasFilters && (
            <FilterDropdown
              filterConfig={filterConfig}
              activeFilters={activeFilters}
              onFiltersChange={handleFiltersChange}
            />
          )}
        </div>

        <div className="flex items-center gap-4">{rightContent}</div>
      </div>

      {hasFilters && (
        <ActiveFilterBadges
          activeFilters={activeFilters}
          filterConfig={filterConfig}
          onFiltersChange={handleFiltersChange}
        />
      )}
    </div>
  );
}
