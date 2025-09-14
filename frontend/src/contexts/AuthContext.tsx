import {
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  setAuthToken,
  setUnauthorizedHandler,
  login as apiLogin,
  getCurrentUser,
} from "../services/api";
import { AuthContext } from "./auth";
import type { User } from "../types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
  };

  useEffect(() => {
    // Set up the unauthorized handler for expired tokens
    setUnauthorizedHandler(logout);

    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
      getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("token");
          setAuthToken(null);
          setUser(null);
        });
    }
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiLogin(username, password);
      localStorage.setItem("token", response.access_token);
      setAuthToken(response.access_token);

      const userData = await getCurrentUser();
      setUser(userData);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext>
  );
}
