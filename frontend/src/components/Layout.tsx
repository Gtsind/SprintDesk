import { type ReactNode } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "../contexts/NavigationContext";

export function Layout({ children }: { children: ReactNode }) {
  const { state, logout } = useAuth();
  const { navigateTo } = useNavigation();

  const handleLogout = () => {
    logout();
    navigateTo("login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigateTo("dashboard")}
                className="flex-shrink-0"
              >
                <h1 className="text-xl font-bold text-gray-900">SprintDesk</h1>
              </button>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <button
                  onClick={() => navigateTo("dashboard")}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {state.user?.firstname} {state.user?.lastname}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-500"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
