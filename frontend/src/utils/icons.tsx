import {
  Circle,
  Loader,
  Eye,
  CheckCircle,
  Ban,
  Signal,
  SignalMedium,
  SignalHigh,
  CircleAlert,
  Play,
  Pause,
  X,
} from "lucide-react";

export function getStatusIcon(status: string) {
  switch (status) {
    case "Open":
      return <Circle className="h-4 w-4" />;
    case "In Progress":
      return <Loader className="h-4 w-4 text-yellow-500" />;
    case "Review Ready":
      return <Eye className="h-4 w-4 text-purple-500" />;
    case "Closed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "Blocked":
      return <Ban className="h-4 w-4 text-red-500" />;
    default:
      return <Circle className="h-4 w-4" />;
  }
}

export function getPriorityIcon(priority: string) {
  switch (priority) {
    case "Low":
      return <SignalMedium className="h-4 w-4" />;
    case "Medium":
      return <SignalHigh className="h-4 w-4" />;
    case "High":
      return <Signal className="h-4 w-4" />;
    case "Critical":
      return <CircleAlert className="h-4 w-4 text-red-600" />;
    default:
      return <SignalMedium className="h-4 w-4" />;
  }
}

export function getProjectStatusIcon(status: string) {
  switch (status) {
    case "Active":
      return <Play className="h-4 w-4 text-green-500" />;
    case "Completed":
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    case "On Hold":
      return <Pause className="h-4 w-4 text-yellow-500" />;
    case "Cancelled":
      return <X className="h-4 w-4 text-red-500" />;
    default:
      return <Circle className="h-4 w-4" />;
  }
}