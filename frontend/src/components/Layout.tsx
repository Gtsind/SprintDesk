import { type ReactNode } from "react";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
  navigate?: (page: string) => void;
}

export function Layout({ children, navigate }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header navigate={navigate} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
