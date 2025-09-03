import { LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  navigate?: (page: string) => void;
}

export function Header({ navigate }: HeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (navigate) navigate("login");
  };

  return (
    <nav className="bg-white shadow">
      <div className="flex justify-between h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate && navigate("dashboard")}
            className="flex-shrink-0"
          >
            <h1 className="text-xl font-bold text-gray-900">SprintDesk</h1>
          </button>
          <div className="hidden md:ml-6 md:flex md:space-x-8"></div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            {user?.firstname} {user?.lastname}
          </span>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-500"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
