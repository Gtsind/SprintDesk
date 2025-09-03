export interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  role: "Admin" | "Project Manager" | "Contributor";
  is_active: boolean;
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
  members?: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
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

export interface NavigationState {
  currentPage: "login" | "dashboard" | "project-issues" | "issue-detail";
  params: { [key: string]: string };
}

export interface UserRegistration {
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  email: string;
  title: string | null;
}

export interface IssueUpdate {
  title?: string;
  description: string | null;
  status?: "Open" | "In Progress" | "Review Ready" | "Closed" | "Blocked";
  priority?: "Low" | "Medium" | "High" | "Critical";
  assignee_id?: number | null;
  time_estimate?: number | null;
}

export interface ApiError {
  detail: string;
}
