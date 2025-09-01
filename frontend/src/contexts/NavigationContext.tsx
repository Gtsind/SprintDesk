import { createContext, useContext, useState, type ReactNode } from "react";
import type { NavigationState } from "../types";

interface NavigationContextType {
  navigation: NavigationState;
  navigateTo: (page: string, params?: { [key: string]: string }) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [navigation, setNavigation] = useState<NavigationState>({
    currentPage: "login",
    params: {},
  });

  const navigateTo = (page: string, params: { [key: string]: string } = {}) => {
    setNavigation({
      currentPage: page as NavigationState["currentPage"],
      params,
    });
  };

  return (
    <NavigationContext.Provider value={{ navigation, navigateTo }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider.");
  }
  return context;
}
