import type {
  User,
  Project,
  Issue,
  Comment,
  Label,
  UserRegistration,
  UserUpdate,
  ProjectCreate,
  ProjectUpdate,
  IssueCreate,
  IssueUpdate,
  LabelCreate,
  LabelUpdate,
  ApiError,
} from "../types";

const BASE_URL = "http://localhost:8000/api/v1";

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Check if response contains JSON
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");

    if (!response.ok) {
      const errorData = isJson
        ? await response.json()
        : { detail: "Unknown error" };

      // Handle expired/invalid token
      if (
        response.status === 401 &&
        errorData.detail === "Invalid or expired token." &&
        onUnauthorized
      ) {
        onUnauthorized();
        throw { detail: "Session expired. Please log in again." } as ApiError;
      }

      // Handle validation errors from FastAPI
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const validationMessages = errorData.detail
          .map((e: any) => e.msg)
          .join(", ");
        throw {
          detail: validationMessages,
        } as ApiError;
      }

      // Handle regular API errors
      throw { detail: errorData.detail || "Request failed" } as ApiError;
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return null as T;
    }

    return isJson ? await response.json() : (null as T);
  } catch (error: any) {
    // Re-throw if it's already our formatted error
    if (error && typeof error === "object" && "detail" in error) {
      throw error;
    }
    // Handle network errors or other unexpected errors
    throw { detail: "Network error occurred" } as ApiError;
  }
};

export const login = async (username: string, password: string) => {
  return request<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
};

export const register = async (userData: UserRegistration): Promise<User> => {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const getCurrentUser = async (): Promise<User> => {
  return request<User>("/users/me");
};

export const getAllUsers = async (): Promise<User[]> => {
  return request<User[]>("/users/");
};

export const getActiveUsers = async (): Promise<User[]> => {
  return request<User[]>("/users/active");
};

export const createUser = async (userData: UserRegistration): Promise<User> => {
  return request<User>("/users/", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (userId: number): Promise<void> => {
  return request<void>(`/users/${userId}`, {
    method: "DELETE",
  });
};

export const getUser = async (userId: number): Promise<User> => {
  return request<User>(`/users/${userId}`);
};

export const updateUser = async (userId: number, userData: UserUpdate): Promise<User> => {
  return request<User>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(userData),
  });
};

export const activateUser = async (userId: number): Promise<User> => {
  return request<User>(`/users/${userId}/activate`, {
    method: "PATCH",
  });
};

export const deactivateUser = async (userId: number): Promise<User> => {
  return request<User>(`/users/${userId}/deactivate`, {
    method: "PATCH",
  });
};

export const getProjects = async (): Promise<Project[]> => {
  return request<Project[]>("/projects/");
};

export const getIssues = async (): Promise<Issue[]> => {
  return request<Issue[]>("/issues/");
};

export const getProject = async (projectId: number): Promise<Project> => {
  return request<Project>(`/projects/${projectId}`);
};

export const createProject = async (
  projectData: ProjectCreate
): Promise<Project> => {
  return request<Project>("/projects/", {
    method: "POST",
    body: JSON.stringify(projectData),
  });
};

export const updateProject = async (
  projectId: number,
  updateData: ProjectUpdate
): Promise<Project> => {
  return request<Project>(`/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });
};

export const deleteProject = async (projectId: number): Promise<void> => {
  return request<void>(`/projects/${projectId}`, {
    method: "DELETE",
  });
};

export const createIssue = async (issueData: IssueCreate): Promise<Issue> => {
  return request<Issue>("/issues/", {
    method: "POST",
    body: JSON.stringify(issueData),
  });
};

export const getProjectIssues = async (projectId: number): Promise<Issue[]> => {
  return request<Issue[]>(`/issues/project/${projectId}`);
};

export const getUserIssues = async (userId: number): Promise<Issue[]> => {
  return request<Issue[]>(`/issues/assignee/${userId}`);
};

export const getIssue = async (issueId: number): Promise<Issue> => {
  return request<Issue>(`/issues/${issueId}`);
};

export const getIssueComments = async (issueId: number): Promise<Comment[]> => {
  return request<Comment[]>(`/comments/issue/${issueId}`);
};

export const createComment = async (
  issueId: number,
  content: string
): Promise<Comment> => {
  return request<Comment>("/comments/", {
    method: "POST",
    body: JSON.stringify({ issue_id: issueId, content }),
  });
};

export const updateComment = async (
  commentId: number,
  content: string
): Promise<Comment> => {
  return request<Comment>(`/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });
};

export const deleteComment = async (commentId: number): Promise<void> => {
  return request<void>(`/comments/${commentId}`, {
    method: "DELETE",
  });
};

export const updateIssue = async (
  issueId: number,
  updateData: IssueUpdate
): Promise<Issue> => {
  return request<Issue>(`/issues/${issueId}`, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });
};

export const closeIssue = async (issueId: number): Promise<Issue> => {
  return request<Issue>(`/issues/${issueId}/close`, {
    method: "PATCH",
  });
};

export const reopenIssue = async (issueId: number): Promise<Issue> => {
  return request<Issue>(`/issues/${issueId}/reopen`, {
    method: "PATCH",
  });
};

export const deleteIssue = async (issueId: number): Promise<void> => {
  return request<void>(`/issues/${issueId}`, {
    method: "DELETE",
  });
};

export const getProjectMembers = async (projectId: number): Promise<User[]> => {
  return request<User[]>(`/projects/${projectId}/members`);
};

export const addProjectMember = async (
  projectId: number,
  userId: number
): Promise<void> => {
  return request<void>(`/projects/${projectId}/members/${userId}`, {
    method: "POST",
  });
};

export const removeProjectMember = async (
  projectId: number,
  userId: number
): Promise<void> => {
  return request<void>(`/projects/${projectId}/members/${userId}`, {
    method: "DELETE",
  });
};

// Labels
export const getLabels = async (): Promise<Label[]> => {
  return request<Label[]>("/labels/");
};

export const getIssueLabels = async (issueId: number): Promise<Label[]> => {
  return request<Label[]>(`/labels/issue/${issueId}`);
};

export const createLabel = async (labelData: LabelCreate): Promise<Label> => {
  return request<Label>("/labels/", {
    method: "POST",
    body: JSON.stringify(labelData),
  });
};

export const updateLabel = async (
  labelId: number,
  labelData: LabelUpdate
): Promise<Label> => {
  return request<Label>(`/labels/${labelId}`, {
    method: "PATCH",
    body: JSON.stringify(labelData),
  });
};

export const deleteLabel = async (labelId: number): Promise<void> => {
  return request<void>(`/labels/${labelId}`, {
    method: "DELETE",
  });
};

export const addLabelToIssue = async (
  issueId: number,
  labelId: number
): Promise<void> => {
  return request<void>(`/issues/${issueId}/labels/${labelId}`, {
    method: "POST",
  });
};

export const removeLabelFromIssue = async (
  issueId: number,
  labelId: number
): Promise<void> => {
  return request<void>(`/issues/${issueId}/labels/${labelId}`, {
    method: "DELETE",
  });
};
