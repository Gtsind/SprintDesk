import type { ChangeEvent } from "react";

interface FormInputProps {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export function FormInput({
  id,
  type,
  label,
  placeholder,
  value,
  onChange,
  required,
}: FormInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:border-indigo-500 focus:z-10 sm:text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}
