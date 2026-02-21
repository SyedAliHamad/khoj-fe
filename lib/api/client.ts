import type { ApiResponse } from "./types"

/** API base URL - use this everywhere to ensure consistent env handling */
export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"
  return url.replace(/\/$/, "") // strip trailing slash to avoid // in paths
}

const BASE_URL = getApiBaseUrl()

// In-memory access token (never stored in localStorage)
let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

// Token refresh handler
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // sends httpOnly refresh token cookie
      headers: { "Content-Type": "application/json" },
    })
    const data: ApiResponse<{ accessToken: string }> = await res.json()
    if (data.code === 200 && data.data) {
      setAccessToken(data.data.accessToken)
      return data.data.accessToken
    }
    setAccessToken(null)
    return null
  } catch {
    setAccessToken(null)
    return null
  }
}

// Centralized fetch wrapper
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  })

  // Handle 401 -- attempt token refresh once
  if (res.status === 401 && accessToken) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken()
    }
    const newToken = await refreshPromise
    refreshPromise = null

    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`
      res = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      })
    } else {
      // Refresh failed, return unauthorized
      return {
        code: 401,
        data: null,
        message: "Session expired. Please login again.",
      }
    }
  }

  try {
    const data: ApiResponse<T> = await res.json()
    return data
  } catch {
    return {
      code: res.status,
      data: null,
      message: "An unexpected error occurred.",
    }
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string) => apiClient<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: "DELETE" }),
}
