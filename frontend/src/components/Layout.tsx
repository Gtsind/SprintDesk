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
        <main className="flex-1 w-full md:w-auto py-6 px-0 md:py-10 md:px-12 lg:px-20 md:mr-8 ml-0">{children}</main>
      </div>
    </div>
  );
}
