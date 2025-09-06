import { LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { BreadCrumbs } from "./BreadCrumbs";

export interface BreadCrumb {
  label: string;
  page: string;
  data?: unknown;
}

interface HeaderProps {
  navigate?: (page: string, data?: unknown) => void;
  breadcrumbs?: BreadCrumb[];
}

export function Header({ navigate, breadcrumbs = [] }: HeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (navigate) navigate("login");
  };

  return (
    <nav className="bg-gray-300 shadow sticky top-0 w-full z-50">
      <div className="max-w-screen px-6 lg:px-10">
        <div className="flex justify-between h-8 pt-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate && navigate("dashboard")}
              className="cursor-pointer"
            >
              <h1 className="text-xl font-bold text-gray-900">SprintDesk</h1>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user?.firstname} {user?.lastname}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-500 cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="py-4">
          <BreadCrumbs
            breadcrumbs={breadcrumbs}
            navigate={navigate ?? (() => {})}
          />
        </div>
      </div>
    </nav>
  );
}
