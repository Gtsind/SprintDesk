import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  FolderOpen,
  Briefcase,
  Plus,
  Settings,
} from "lucide-react";

interface SideBarProps {
  navigate?: (page: string) => void;
}

export function SideBar({ navigate }: SideBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      id: "my-work",
      label: "My Work",
      icon: Briefcase,
      action: () => {},
      active: false,
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
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-blue-200 shadow-sm border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col`}
      style={{ height: "calc(100vh - 4rem)" }}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
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
                  } ${isCollapsed ? "justify-center" : "justify-start"}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5" />
                  {!isCollapsed && (
                    <span className="ml-3 truncate">{item.label}</span>
                  )}
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
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-400 cursor-not-allowed ${
            isCollapsed ? "justify-center" : "justify-start"
          }`}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3 truncate">Settings</span>}
        </button>
      </div>
    </div>
  );
}
