import type { ApiError } from "../types";

/**
 * Safely extracts error message from various error types
 */
export function extractErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred";

  // Handle ApiError type (our standard API error format)
  if (typeof error === "object" && "detail" in error)
    return (error as ApiError).detail;

  // Handle Error instances
  if (error instanceof Error) return error.message;

  // Handle string errors
  if (typeof error === "string") return error;

  // Handle objects with common error properties
  if (typeof error === "object") {
    const errorObj = error as Record<string, unknown>;

    // Check for common error message properties
    if (typeof errorObj.message === "string") {
      return errorObj.message;
    }

    if (typeof errorObj.msg === "string") {
      return errorObj.msg;
    }
  }

  return "An unexpected error occurred";
}
