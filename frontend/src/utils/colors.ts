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
