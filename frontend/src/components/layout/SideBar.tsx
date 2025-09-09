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
    <div className="fixed left-0 w-64 h-[calc(100vh-84px)] flex-col hidden md:flex ">
      {/* Navigation Items */}
      <nav className="flex-1 p-6">
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
                      ? "text-gray-900 hover:bg-gray-200 cursor-pointer"
                      : "text-gray-400 cursor-pointer"
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
      <div className="px-6">
        <button
          onClick={() => {}} // Inactive for now
          className="w-full flex items-center px-3 py-6 text-sm font-medium rounded-md transition-colors text-gray-900  cursor-pointer"
        >
          <Settings className="h-5 w-5 hover:bg-gray-100" />
          <span className="ml-3 truncate">Preferences</span>
        </button>
      </div>
    </div>
  );
}
