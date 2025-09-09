import { useEffect, useRef } from "react";
import type { User } from "../../types";

interface MemberDropdownProps {
  availableUsers: User[];
  onAddMember: (userId: number) => void;
  isAddingMember: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function MemberDropdown({
  availableUsers,
  onAddMember,
  isAddingMember,
  isOpen = false,
  onClose,
}: MemberDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleAddMember = (userId: number) => {
    onAddMember(userId);
    onClose?.();
  };

  if (!isOpen || availableUsers.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="absolute left-32 top-0 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
        <div className="max-h-60 overflow-y-auto">
          {availableUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleAddMember(user.id)}
              disabled={isAddingMember}
              className="w-full px-4 py-2 text-left text-sm border-b border-b-gray-200 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50"
            >
              <div className="font-medium">
                {user.firstname} {user.lastname}
              </div>
              {user.title && (
                <div className="text-gray-600 text-xs">{user.title}</div>
              )}
              <div className="text-gray-500 text-xs">@{user.username}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
