import { type ReactNode } from "react";
import { Header } from "./Header";
import { SideBar } from "./SideBar";

interface LayoutProps {
  children: ReactNode;
  navigate?: (page: string) => void;
}

export function Layout({ children, navigate }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header navigate={navigate} />
      <div className="flex">
        <SideBar navigate={navigate} />
        <main className="flex-1 py-10 px-8 sm:px-6 lg:px-20 mr-8 ">
          {children}
        </main>
      </div>
    </div>
  );
}
