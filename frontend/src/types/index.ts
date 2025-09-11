export type IssueStatus =
  | "Open"
  | "In Progress"
  | "Review Ready"
  | "Closed"
  | "Blocked";
export type IssuePriority = "Low" | "Medium" | "High" | "Critical";
export type UserRole = "Admin" | "Project Manager" | "Contributor";
export type ProjectStatus = "Active" | "Completed" | "On Hold" | "Cancelled";

export interface UserSummary {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
}

export interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  title: string | null;
  role: UserRole;
  is_active: boolean;
  projects?: {
    id: number;
    name: string;
    status: ProjectStatus;
  }[];
  assigned_issues?: {
    id: number;
    title: string;
    description: string | null;
    status: IssueStatus;
    priority: IssuePriority;
    time_estimate: number | null;
  }[];
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
  creator: UserSummary;
  members?: User[];
  issues?: {
    id: number;
    title: string;
    description: string | null;
    status: IssueStatus;
    priority: IssuePriority;
    assignee_id: number | null;
  }[];
}

export interface Issue {
  id: number;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  time_estimate: number | null;
  project_id: number;
  author_id: number;
  assignee_id: number | null;
  created_at: string;
  updated_at: string | null;
  closed_at?: string;
  author: UserSummary;
  assignee: UserSummary | null;
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
  author: UserSummary;
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
  status?: ProjectStatus;
}

export interface IssueCreate {
  project_id: number;
  title: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assignee_id?: number;
  time_estimate?: number;
}

export interface IssueUpdate {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
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
