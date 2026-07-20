import { clearAuthSession, getAccessToken } from "../lib/authStorage";
import { ApiError, parseApiError } from "./errors";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://api.amuslimmatchmaker.com/api";

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  return `${base}${normalizedPath}`;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  auth?: boolean;
  body?: unknown;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { auth = false, body, headers: customHeaders, ...fetchOptions } = options;

  const headers = new Headers(customHeaders);
  const isFormDataBody = typeof FormData !== "undefined" && body instanceof FormData;

  if (body !== undefined && !isFormDataBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(buildUrl(path), {
    ...fetchOptions,
    headers,
    body:
      body === undefined
        ? undefined
        : isFormDataBody
          ? body
          : JSON.stringify(body),
  });

  let data: unknown = null;
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    const text = await response.text().catch(() => "");
    data = text ? { message: text } : null;
  }

  if (!response.ok) {
    if (auth && response.status === 401) {
      clearAuthSession();

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    throw new ApiError(parseApiError(data), response.status);
  }

  return data as T;
}
