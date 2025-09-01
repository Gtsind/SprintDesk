import type { User, Project, Issue, Comment } from "../types";

const BASE_URL = "http://localhost:8000/api/v1";

// Token state - using module-level variable for simplicity
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
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

export const getCurrentUser = async (): Promise<User> => {
  return request<User>("/users/me");
};

export const getProjects = async (): Promise<Project[]> => {
  return request<Project[]>("/projects/");
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
