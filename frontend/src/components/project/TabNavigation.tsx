import { FileCode, Users, Plus } from "lucide-react";

interface TabNavigationProps {
  activeTab: "issues" | "members";
  onTabChange: (tab: "issues" | "members") => void;
  issueCount: number;
  memberCount: number;
  onNewIssue: () => void;
  onAddMember: () => void;
}

export function TabNavigation({
  activeTab,
  onTabChange,
  issueCount,
  memberCount,
  onNewIssue,
  onAddMember,
}: TabNavigationProps) {
  const tabs = [
    {
      key: "issues" as const,
      icon: FileCode,
      label: `Issues (${issueCount})`,
      onAdd: onNewIssue,
    },
    {
      key: "members" as const,
      icon: Users,
      label: `Members (${memberCount})`,
      onAdd: onAddMember,
    },
  ];

  const handleAddClick = (e: React.MouseEvent, onAdd: () => void) => {
    e.stopPropagation();
    onAdd();
  };

  return (
    <div className="mb-6">
      <nav className="flex space-x-8">
        {tabs.map(({ key, icon: Icon, label, onAdd }) => (
          <div key={key} className="flex items-center group">
            <button
              onClick={() => onTabChange(key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === key
                  ? "border-indigo-300 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="h-4 w-4 mr-1" />
              {label}
            </button>
            <button
              onClick={(e) => handleAddClick(e, onAdd)}
              className="ml-2 p-1 rounded hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ))}
      </nav>
    </div>
  );
}
