import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "./Button";
import type { User } from "../types";

interface MemberDropdownProps {
  availableUsers: User[];
  onAddMember: (userId: number) => void;
  isAddingMember: boolean;
  usersLoading: boolean;
}

export function MemberDropdown({
  availableUsers,
  onAddMember,
  isAddingMember,
  usersLoading,
}: MemberDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddMember = (userId: number) => {
    onAddMember(userId);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isAddingMember || usersLoading || availableUsers.length === 0}
        className="flex items-center justify-center gap-2 py-2.5 px-3 w-full md:w-auto"
      >
        <Plus className="h-4 w-4" />
        {isAddingMember ? "Adding..." : "Add Member"}
      </Button>

      {showDropdown && availableUsers.length > 0 && (
        <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <div className="py-1 max-h-60 overflow-y-auto">
            {availableUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleAddMember(user.id)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
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
      )}
    </div>
  );
}
