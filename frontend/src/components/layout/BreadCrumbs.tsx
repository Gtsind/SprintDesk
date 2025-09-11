import { ChevronRight } from "lucide-react";
import type { BreadCrumb } from "./Header";

interface BreadCrumbsProps {
  breadcrumbs: BreadCrumb[];
  navigate: (page: string, data?: unknown) => void;
}

export function BreadCrumbs({ breadcrumbs, navigate }: BreadCrumbsProps) {
  const items =
    breadcrumbs.length > 0
      ? breadcrumbs
      : [{ label: "My work", page: "dashboard" }];

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      {items.map((breadcrumb, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center">
            {isLast ? (
              <span className="text-gray-900 font-medium">
                {breadcrumb.label}
              </span>
            ) : (
              <button
                onClick={() => navigate(breadcrumb.page, breadcrumb.data)}
                className="hover:text-gray-700 transition-colors cursor-pointer"
              >
                {breadcrumb.label}
              </button>
            )}
            {!isLast && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
          </div>
        );
      })}
    </div>
  );
}
