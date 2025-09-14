import { useState, useEffect, type KeyboardEvent } from "react";

interface UseInlineEditProps {
  initialValue: string | null;
  onSave: (value: string) => Promise<void>;
  onError?: (message: string) => void;
  validate?: (value: string) => string | null; // Return error message or null
  placeholder?: string;
}

export function useInlineEdit({
  initialValue,
  onSave,
  onError,
  validate,
  placeholder = "",
}: UseInlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue || "");
  const [isSaving, setIsSaving] = useState(false);

  // Sync internal state when initialValue changes
  useEffect(() => {
    if (!isEditing) {
      setValue(initialValue || "");
    }
  }, [initialValue, isEditing]);

  const startEditing = () => {
    setIsEditing(true);
    setValue(initialValue || "");
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setValue(initialValue || "");
  };

  const handleSave = async () => {
    if (isSaving) return;

    // Run validation if provided
    if (validate) {
      const validationError = validate(value);
      if (validationError) {
        onError?.(validationError);
        setValue(initialValue || ""); // Revert to original value
        setIsEditing(false);
        return;
      }
    }

    // Skip save if value hasn't changed
    const currentValue = initialValue || "";
    if (value.trim() === currentValue.trim()) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await onSave(value.trim());
      setIsEditing(false);
    } catch {
      // Revert to original value on error
      setValue(initialValue || "");
      // Error is handled by the onSave function and passed to parent
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, allowMultiline = false) => {
    if (e.key === "Enter") {
      if (allowMultiline && e.shiftKey) {
        // Allow Shift+Enter for new lines in textarea
        return;
      }
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEditing();
    }
  };

  return {
    // State
    isEditing,
    value,
    isSaving,
    
    // Actions
    startEditing,
    cancelEditing,
    handleSave,
    handleKeyDown,
    setValue,
    
    // Computed values
    displayValue: initialValue || placeholder,
    hasChanges: value.trim() !== (initialValue || "").trim(),
  };
}