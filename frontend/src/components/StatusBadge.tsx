import {
  getPriorityColor,
  getProjectStatusColor,
  getStatusColor,
} from "../utils/colors";

interface StatusBadgeProps {
  status: string;
  type: "priority" | "status" | "project-status" | "role";
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
      case "role":
        return getRoleColor(status);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-800";
      case "Project Manager":
        return "bg-blue-100 text-blue-800";
      case "Contributor":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
