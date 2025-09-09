// Shared types for toolbar components
export interface FilterOption {
  value: string | number;
  label: string;
  count?: number;
}

export interface FilterDefinition {
  key: string;
  label: string;
  type: "single" | "multi";
  options: FilterOption[] | (() => Promise<FilterOption[]>);
}

export interface FilterConfig {
  filters: FilterDefinition[];
}

export interface ActiveFilters {
  [filterKey: string]: string | number | (string | number)[];
}