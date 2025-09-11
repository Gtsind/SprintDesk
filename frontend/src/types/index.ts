export interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  title: string | null;
  role: "Admin" | "Project Manager" | "Contributor";
  is_active: boolean;
  projects?: {
    id: number;
    name: string;
    status: "Active" | "Completed" | "On Hold" | "Cancelled";
  }[];
  assigned_issues?: {
    id: number;
    title: string;
    description: string | null;
    status: "Open" | "In Progress" | "Review Ready" | "Closed" | "Blocked";
    priority: "Low" | "Medium" | "High" | "Critical";
    time_estimate: number | null;
  }[];
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: "Active" | "Completed" | "On Hold" | "Cancelled";
  created_at: string;
  creator: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
  };
  members?: User[];
  issues?: {
    id: number;
    title: string;
    description: string | null;
    status: "Open" | "In Progress" | "Review Ready" | "Closed" | "Blocked";
    priority: "Low" | "Medium" | "High" | "Critical";
    assignee_id: number | null;
  }[];
}

export interface Issue {
  id: number;
  title: string;
  description: string | null;
  status: "Open" | "In Progress" | "Review Ready" | "Closed" | "Blocked";
  priority: "Low" | "Medium" | "High" | "Critical";
  time_estimate: number | null;
  project_id: number;
  author_id: number;
  assignee_id: number | null;
  created_at: string;
  updated_at: string | null;
  closed_at?: string;
  author: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
  };
  assignee: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
  } | null;
  project: {
    id: number;
    name: string;
    status: string;
  };
  comments?: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  issue_id: number;
  author_id: number;
  created_at: string;
  author: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
  };
}

export interface UserRegistration {
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  email: string;
  title: string | null;
}

export interface ProjectCreate {
  name: string;
  description?: string | null;
}

export interface ProjectUpdate {
  name?: string;
  description?: string | null;
  status?: "Active" | "Completed" | "On Hold" | "Cancelled";
}

export interface IssueCreate {
  project_id: number;
  title: string;
  description?: string;
  status?: "Open" | "In Progress" | "Review Ready" | "Closed" | "Blocked";
  priority?: "Low" | "Medium" | "High" | "Critical";
  assignee_id?: number;
  time_estimate?: number;
}

export interface IssueUpdate {
  title?: string;
  description?: string;
  status?: "Open" | "In Progress" | "Review Ready" | "Closed" | "Blocked";
  priority?: "Low" | "Medium" | "High" | "Critical";
  assignee_id?: number;
  time_estimate?: number;
}

export interface Label {
  id: number;
  name: string;
  color_hash: number;
}

export interface LabelCreate {
  name: string;
  color_hash?: number;
}

export interface LabelUpdate {
  name?: string;
  color_hash?: number;
}

export interface ApiError {
  detail: string;
}
