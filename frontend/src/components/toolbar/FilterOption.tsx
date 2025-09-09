import { useState, useEffect } from "react";
import type { FilterDefinition, FilterOption as FilterOptionType } from "../../types/toolbar";

interface FilterOptionProps {
  definition: FilterDefinition;
  activeValue: string | number | (string | number)[] | undefined;
  onValueChange: (key: string, value: string | number | (string | number)[] | undefined) => void;
}

export function FilterOption({ definition, activeValue, onValueChange }: FilterOptionProps) {
  const [options, setOptions] = useState<FilterOptionType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      if (Array.isArray(definition.options)) {
        setOptions(definition.options);
      } else {
        setLoading(true);
        try {
          const dynamicOptions = await definition.options();
          setOptions(dynamicOptions);
        } catch (error) {
          console.error(`Failed to load options for ${definition.key}:`, error);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadOptions();
  }, [definition]);

  const handleSingleSelect = (value: string | number) => {
    const newValue = activeValue === value ? undefined : value;
    onValueChange(definition.key, newValue);
  };

  const handleMultiSelect = (value: string | number) => {
    const currentValues = Array.isArray(activeValue) ? activeValue : [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onValueChange(definition.key, newValues.length > 0 ? newValues : undefined);
  };

  if (loading) {
    return (
      <div className="px-4 py-2 text-sm text-gray-500">
        Loading {definition.label.toLowerCase()}...
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="max-h-60 overflow-y-auto">
        {options.map((option) => {
          const isSelected = definition.type === "single" 
            ? activeValue === option.value
            : Array.isArray(activeValue) && activeValue.includes(option.value);
          
          return (
            <button
              key={option.value}
              onClick={() => definition.type === "single" 
                ? handleSingleSelect(option.value)
                : handleMultiSelect(option.value)
              }
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between transition-colors ${
                isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
              }`}
            >
              <span className="flex items-center">
                {definition.type === "multi" && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mr-2 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                )}
                {option.label}
              </span>
              {option.count !== undefined && (
                <span className="text-xs text-gray-500">
                  ({option.count})
                </span>
              )}
            </button>
          );
        })}
        {options.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No options available
          </div>
        )}
      </div>
    </div>
  );
}