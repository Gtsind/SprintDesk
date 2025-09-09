import { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown, ChevronRight } from "lucide-react";
import { FilterOption } from "./FilterOption";
import type { FilterConfig, ActiveFilters } from "../../types/toolbar";

interface FilterDropdownProps {
  filterConfig: FilterConfig;
  activeFilters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
}

export function FilterDropdown({
  filterConfig,
  activeFilters,
  onFiltersChange,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHoveredFilter(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleValueChange = (
    key: string,
    value: string | number | (string | number)[] | undefined
  ) => {
    const newFilters = { ...activeFilters };

    if (value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }

    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(activeFilters).length;
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-2 py-2.5 border border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:border-indigo-500  ${
          hasActiveFilters
            ? "bg-indigo-50 text-indigo-700 border-indigo-300"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <Filter className="h-4 w-4" />
        {hasActiveFilters && (
          <span className="ml-1 bg-indigo-100 text-indigo-800 text-xs font-medium px-2 rounded-full">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-20">
          <div className="py-2">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-900">Filters</span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Clear all
                </button>
              )}
            </div>

            {filterConfig.filters.map((filter) => {
              const isActive = activeFilters[filter.key] !== undefined;
              return (
                <div
                  key={filter.key}
                  className="relative"
                  onMouseEnter={() => setHoveredFilter(filter.key)}
                  onMouseLeave={() => setHoveredFilter(null)}
                >
                  <div
                    className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-50 ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700"
                    }`}
                  >
                    <span className="font-medium">{filter.label}</span>
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Options panel that appears on hover */}
                  {hoveredFilter === filter.key && (
                    <div className="absolute left-56 top-0 w-72 bg-white rounded-md shadow-lg border border-gray-200 z-30">
                      <FilterOption
                        definition={filter}
                        activeValue={activeFilters[filter.key]}
                        onValueChange={handleValueChange}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {filterConfig.filters.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No filters available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
