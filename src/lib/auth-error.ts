import { ConvexError } from "convex/values";

export type AuthErrorInfo = {
  code?: string;
  message: string;
};

export function readAuthError(err: unknown, fallback: string): AuthErrorInfo {
  if (err instanceof ConvexError) {
    const data = err.data;
    if (typeof data === "string") {
      return { message: data };
    }
    if (data && typeof data === "object" && "message" in data) {
      const message = data.message;
      const code = "code" in data ? data.code : undefined;
      if (typeof message === "string") {
        return {
          message,
          code: typeof code === "string" ? code : undefined,
        };
      }
    }
  }

  if (err instanceof Error) {
    const line = err.message
      .split("\n")
      .map((part) => part.trim())
      .find((part) => part.startsWith("Uncaught Error:"));
    if (line) {
      return { message: line.replace("Uncaught Error:", "").trim() };
    }
    if (err.message && !err.message.startsWith("[CONVEX")) {
      return { message: err.message };
    }
  }

  return { message: fallback };
}
