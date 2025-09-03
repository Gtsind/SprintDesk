import type {
  User,
  Project,
  Issue,
  Comment,
  UserRegistration,
  IssueUpdate,
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
    if (!response.ok) {
      const errorData = await response.json();

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
          .map((error: any) => error.msg)
          .join(", ");
        throw { detail: validationMessages } as ApiError;
      }

      // Handle regular API errors
      throw errorData as ApiError;
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
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

export const getProjects = async (): Promise<Project[]> => {
  return request<Project[]>("/projects/");
};

export const getProject = async (projectId: number): Promise<Project> => {
  return request<Project>(`/projects/${projectId}`);
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

export const updateIssue = async (
  issueId: number,
  updateData: IssueUpdate
): Promise<Issue> => {
  return request<Issue>(`/issues/${issueId}`, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });
};

export const deleteIssue = async (issueId: number): Promise<void> => {
  return request<void>(`/issues/${issueId}`, {
    method: "DELETE",
  });
};
