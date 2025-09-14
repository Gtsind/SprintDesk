import { useInlineEdit } from "../../hooks/useInlineEdit";
import type { User, UserUpdate } from "../../types";

interface EditableUserField {
  key: keyof UserUpdate;
  label: string;
  required: boolean;
  canEdit: boolean;
  icon?: () => React.ReactNode;
  inputType?: 'text' | 'email';
  placeholder?: string;
  displayPrefix?: string;
  fallbackText?: string;
  getValue: (user: User) => string | null | undefined;
}

interface EditableFieldProps {
  field: EditableUserField;
  user: User;
  onUpdate: (updateData: UserUpdate) => Promise<void>;
  onError: (message: string) => void;
}

export function EditableField({ field, user, onUpdate, onError }: EditableFieldProps) {
  const currentValue = field.getValue(user) ?? "";

  const editor = useInlineEdit({
    initialValue: currentValue,
    onSave: async (value: string) => {
      const updateData: UserUpdate = {
        [field.key]: field.key === 'title' ? (value || null) : value
      };
      await onUpdate(updateData);
    },
    onError,
    placeholder: field.placeholder,
    validate: field.required ? (value: string) => {
      if (!value.trim()) {
        return `${field.label} cannot be empty`;
      }
      return null;
    } : undefined,
  });

  const hasValue = Boolean(currentValue);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.icon && <span className="inline">{field.icon()} </span>}
        {field.label}
      </label>
      {editor.isEditing && field.canEdit ? (
        <input
          type={field.inputType || 'text'}
          value={editor.value}
          onChange={(e) => editor.setValue(e.target.value)}
          onKeyDown={(e) => editor.handleKeyDown(e)}
          onBlur={editor.handleSave}
          className="w-full py-2 border-none focus:outline-none"
          placeholder={field.placeholder}
          autoFocus
          disabled={editor.isSaving}
        />
      ) : (
        <p
          className={`py-2 ${
            field.canEdit ? "cursor-pointer hover:bg-gray-50 rounded" : ""
          }`}
          onClick={field.canEdit ? editor.startEditing : undefined}
        >
          {hasValue ? (
            <>
              {field.displayPrefix}
              <span className="text-gray-900">{currentValue}</span>
            </>
          ) : (
            <span className="text-gray-500 italic">{field.fallbackText ?? ""}</span>
          )}
        </p>
      )}
    </div>
  );
}

export type { EditableUserField };