import { type ReactNode } from "react";
import { Header } from "./Header";
import type { BreadCrumb } from "./Header";
import { SideBar } from "./SideBar";

interface LayoutProps {
  children: ReactNode;
  navigate?: (page: string, data?: unknown) => void;
  breadcrumbs?: BreadCrumb[];
}

export function Layout({ children, navigate, breadcrumbs }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header navigate={navigate} breadcrumbs={breadcrumbs} />
      <div className="flex flex-1">
        <SideBar navigate={navigate} />
        <main className="flex-1 overflow-auto bg-white sm:ml-70 rounded-lg shadow-md p-6 md:p-10 mx-4 h-[calc(100vh-96px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
