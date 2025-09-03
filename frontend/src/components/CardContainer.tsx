import { Card } from "./Card";
import type { Project, Issue, User } from "../types";

interface CardContainerProps {
  title: string;
  items: Project[] | Issue[] | User[] | null;
  emptyMessage: string;
  onItemClick: (item: Project | Issue | User) => void;
  showViewAll?: boolean;
  onViewAllClick?: () => void;
  limit?: number;
}

export function CardContainer({
  title,
  items,
  emptyMessage,
  onItemClick,
  showViewAll = false,
  onViewAllClick,
  limit
}: CardContainerProps) {
  const displayItems = limit && items ? items.slice(0, limit) : items;
  const hasMoreItems = limit && items && items.length > limit;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {title}
      </h2>
      <div className="space-y-3">
        {!items || items.length === 0 ? (
          <p className="text-gray-500">{emptyMessage}</p>
        ) : (
          displayItems?.map((item) => (
            <Card 
              key={item.id} 
              item={item} 
              onClick={onItemClick} 
            />
          ))
        )}
      </div>
      {hasMoreItems && showViewAll && onViewAllClick && (
        <div className="mt-4 text-center">
          <button
            onClick={onViewAllClick}
            className="text-indigo-600 hover:text-indigo-500 text-sm"
          >
            View all assigned issues
          </button>
        </div>
      )}
    </div>
  );
}