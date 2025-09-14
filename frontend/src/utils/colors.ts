export function getPriorityColor(priority: string) {
  switch (priority) {
    case "Critical":
      return "text-red-600 bg-red-100";
    case "High":
      return "text-orange-600 bg-orange-100";
    case "Medium":
      return "text-yellow-600 bg-yellow-100";
    case "Low":
      return "text-green-600 bg-green-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case "Open":
      return "text-blue-600 bg-blue-100";
    case "In Progress":
      return "text-yellow-600 bg-yellow-100";
    case "Review Ready":
      return "text-purple-600 bg-purple-100";
    case "Closed":
      return "text-green-600 bg-green-100";
    case "Blocked":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

export function getProjectStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Completed":
      return "bg-blue-100 text-blue-800";
    case "On Hold":
      return "bg-yellow-100 text-yellow-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

const LABEL_COLORS = [
  "bg-gray-100 text-gray-800",
  "bg-gray-700 text-white",
  "bg-purple-100 text-purple-800",
  "bg-teal-100 text-teal-800",
  "bg-green-100 text-green-800",
  "bg-yellow-100 text-yellow-800",
  "bg-orange-100 text-orange-800",
  "bg-pink-100 text-pink-800",
  "bg-red-100 text-red-800",
] as const;

export function getLabelColor(index: number): string {
  return LABEL_COLORS[index % LABEL_COLORS.length];
}

export function getLabelColors(): readonly string[] {
  return LABEL_COLORS;
}

// Chart color mappings for pie charts
const CHART_STATUS_COLORS = {
  Open: "#60a5fa", // light blue
  "In Progress": "#ffc658", // yellow
  "Review Ready": "#8884d8", // purple
  Closed: "#82ca9d", // green
  Blocked: "#ef4444", // red
};

const CHART_PRIORITY_COLORS = {
  Low: "#82ca9d", // green
  Medium: "#ffc658", // yellow
  High: "#fb923c", // orange
  Critical: "#ef4444", // red
};

// Role chart colors
const ROLE_CHART_COLORS = {
  Admin: "#8884d8", // blue
  "Project Manager": "#82ca9d", // green
  Manager: "#82ca9d", // green (same as Project Manager for display)
  Contributor: "#ffc658", // yellow
};

const PROJECT_STATUS_CHART_COLORS = {
  Active: "#60a5fa", // light blue (ongoing work)
  Completed: "#82ca9d", // green (finished)
  "On Hold": "#ffc658", // yellow (paused/waiting)
  Cancelled: "#ef4444", // red (dropped/terminated)
};

const CHART_COLOR_MAP: Record<
  "status" | "priority" | "role" | "projectStatus",
  Record<string, string>
> = {
  status: CHART_STATUS_COLORS,
  priority: CHART_PRIORITY_COLORS,
  role: ROLE_CHART_COLORS,
  projectStatus: PROJECT_STATUS_CHART_COLORS,
};

export function getChartColor(
  type: "status" | "priority" | "role" | "projectStatus",
  value: string
): string {
  return CHART_COLOR_MAP[type][value] ?? "#6b7280"; // fallback gray
}
