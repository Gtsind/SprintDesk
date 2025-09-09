import { FileCode, Users, Plus } from "lucide-react";
import { Button } from "./Button";
import { MemberDropdown } from "./MemberDropdown";
import type { User } from "../types";

interface TabNavigationProps {
  activeTab: "issues" | "members";
  onTabChange: (tab: "issues" | "members") => void;
  issueCount: number;
  memberCount: number;

  // Issues tab actions
  onNewIssue: () => void;

  // Members tab actions
  availableUsers: User[];
  onAddMember: (userId: number) => void;
  isAddingMember: boolean;
  usersLoading: boolean;
}

export function TabNavigation({
  activeTab,
  onTabChange,
  issueCount,
  memberCount,
  onNewIssue,
  availableUsers,
  onAddMember,
  isAddingMember,
  usersLoading,
}: TabNavigationProps) {
  const tabs = [
    {
      key: "issues" as const,
      icon: FileCode,
      label: `Issues (${issueCount})`,
    },
    {
      key: "members" as const,
      icon: Users,
      label: `Members (${memberCount})`,
    },
  ];

  return (
    <div className="mb-4 gap-4 flex flex-col md:flex-row md:justify-between ">
      <nav className="flex space-x-8">
        {tabs.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === key
                ? "border-indigo-300 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Icon className="inline h-4 w-4 mr-1" />
            {label}
          </button>
        ))}
      </nav>

      {activeTab === "issues" && (
        <Button
          onClick={onNewIssue}
          className="flex items-center justify-center gap-2 py-2.5 px-3 w-full md:w-auto"
        >
          <Plus className="h-4 w-4" /> New Issue
        </Button>
      )}

      {activeTab === "members" && (
        <MemberDropdown
          availableUsers={availableUsers}
          onAddMember={onAddMember}
          isAddingMember={isAddingMember}
          usersLoading={usersLoading}
        />
      )}
    </div>
  );
}
