import { Home, FolderOpen, Plus, Settings, FileCode } from "lucide-react";

interface SideBarProps {
  navigate?: (page: string) => void;
}

export function SideBar({ navigate }: SideBarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      action: () => navigate?.("dashboard"),
      active: true,
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderOpen,
      action: () => navigate?.("projects-list"),
      active: true,
    },
    {
      id: "Issues",
      label: "Issues",
      icon: FileCode,
      action: () => navigate?.("issues-list"),
      active: true,
    },
    {
      id: "create",
      label: "Create",
      icon: Plus,
      action: () => {},
      active: false,
    },
  ];

  return (
    <div
      className="w-64 bg-white shadow-sm border-r border-gray-200 flex-col hidden md:flex"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      {/* Header Section */}
      <div className="ml-4 p-4 border-b border-gray-100 mb-5">
        <h3 className="text-sm font-medium text-gray-700">Your Work</h3>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={item.action}
                  disabled={!item.active}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.active
                      ? "text-gray-900 hover:bg-gray-100 cursor-pointer"
                      : "text-gray-400 cursor-not-allowed"
                  } justify-start`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="ml-3 truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings Button at Bottom */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {}} // Inactive for now
          disabled={true}
          className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-400 cursor-not-allowed justify-start"
        >
          <Settings className="h-5 w-5" />
          <span className="ml-3 truncate">Settings</span>
        </button>
      </div>
    </div>
  );
}
