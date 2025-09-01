import {
  getPriorityColor,
  getProjectStatusColor,
  getStatusColor,
} from "../utils/colors";

interface StatusBadgeProps {
  status: string;
  type: "priority" | "status" | "project-status";
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const getColorClass = () => {
    switch (type) {
      case "priority":
        return getPriorityColor(status);
      case "status":
        return getStatusColor(status);
      case "project-status":
        return getProjectStatusColor(status);
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClass()}`}
    >
      {status}
    </span>
  );
}
