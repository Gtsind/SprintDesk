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
        <main className="flex-1 py-6 md:py-10 px-4 md:px-16 lg:px-32 xl:px-48 md:mr-8">{children}</main>
      </div>
    </div>
  );
}
