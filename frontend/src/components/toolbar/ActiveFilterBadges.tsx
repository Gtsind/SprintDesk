import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { ActiveFilters, FilterConfig } from "../../types/toolbar";

interface ActiveFilterBadgesProps {
  activeFilters: ActiveFilters;
  filterConfig: FilterConfig;
  onFiltersChange: (filters: ActiveFilters) => void;
}

export function ActiveFilterBadges({
  activeFilters,
  filterConfig,
  onFiltersChange,
}: ActiveFilterBadgesProps) {
  const [optionLabels, setOptionLabels] = useState<
    Record<string, Record<string | number, string>>
  >({});

  // Load all option labels when component mounts or filterConfig changes
  useEffect(() => {
    const loadAllOptionLabels = async () => {
      const labels: Record<string, Record<string | number, string>> = {};

      for (const filter of filterConfig.filters) {
        const options = Array.isArray(filter.options)
          ? filter.options
          : await filter.options().catch(() => []);

        labels[filter.key] = {};
        options.forEach((option) => {
          labels[filter.key][option.value] = option.label;
        });
      }

      setOptionLabels(labels);
    };

    loadAllOptionLabels();
  }, [filterConfig]);

  const removeFilter = (filterKey: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[filterKey];
    onFiltersChange(newFilters);
  };

  const getFilterLabel = (
    filterKey: string,
    value: string | number | (string | number)[]
  ) => {
    const filter = filterConfig.filters.find((f) => f.key === filterKey);
    if (!filter) return `${filterKey}: ${value}`;

    if (Array.isArray(value)) {
      // For multiple values, show first few values or count if too many
      if (value.length === 1) {
        return `${filter.label}: ${getOptionLabel(filterKey, value[0])}`;
      } else if (value.length <= 3) {
        const labels = value
          .map((v) => getOptionLabel(filterKey, v))
          .join(", ");
        return `${filter.label}: ${labels}`;
      } else {
        return `${filter.label}: ${value.length} selected`;
      }
    }

    return `${filter.label}: ${getOptionLabel(filterKey, value)}`;
  };

  const getOptionLabel = (
    filterKey: string,
    value: string | number
  ): string => {
    return optionLabels[filterKey]?.[value] || String(value);
  };

  const activeFilterEntries = Object.entries(activeFilters);

  if (activeFilterEntries.length === 0) {
    return null;
  }

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {activeFilterEntries.map(([key, value]) => (
        <div
          key={key}
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
        >
          {getFilterLabel(key, value)}
          <button
            onClick={() => removeFilter(key)}
            className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-indigo-200"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      {activeFilterEntries.length >= 2 && (
        <button
          onClick={clearAllFilters}
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
