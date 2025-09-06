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
    <div className="min-h-screen bg-gray-50">
      <Header navigate={navigate} breadcrumbs={breadcrumbs} />
      <div className="flex">
        <SideBar navigate={navigate} />
        <main className="flex-1 overflow-auto sm:ml-64">{children}</main>
      </div>
    </div>
  );
}
