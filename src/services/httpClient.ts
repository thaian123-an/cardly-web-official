const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const ACCESS_TOKEN_KEY = "cardly_access_token";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestConfig = {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  skipAuth?: boolean;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

function buildUrl(endpoint: string) {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }

  const normalizedBaseUrl = API_BASE_URL.replace(/\/$/, "");
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return `${normalizedBaseUrl}${normalizedEndpoint}`;
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function getErrorMessage(data: unknown) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data === "object" && data !== null) {
    const record = data as Record<string, unknown>;

    if (typeof record.message === "string") {
      return record.message;
    }

    if (typeof record.detail === "string") {
      return record.detail;
    }

    if (typeof record.error === "string") {
      return record.error;
    }

    if (
      typeof record.error === "object" &&
      record.error !== null &&
      "message" in record.error &&
      typeof (record.error as { message?: unknown }).message === "string"
    ) {
      return (record.error as { message: string }).message;
    }
  }

  return "Something went wrong. Please try again.";
}

function buildHeaders(config: RequestConfig) {
  const token = getAccessToken();

  return {
    "Content-Type": "application/json",
    ...(token && !config.skipAuth ? { Authorization: `Bearer ${token}` } : {}),
    ...config.headers,
  };
}

export async function httpClient<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const response = await fetch(buildUrl(endpoint), {
    method: config.method || "GET",
    headers: buildHeaders(config),
    body:
      config.body !== undefined && config.body !== null
        ? JSON.stringify(config.body)
        : undefined,
    signal: config.signal,
  });

  const data = await parseResponse(response).catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data), response.status, data);
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, config?: Omit<RequestConfig, "method" | "body">) =>
    httpClient<T>(endpoint, {
      ...config,
      method: "GET",
    }),

  post: <T>(
    endpoint: string,
    body?: unknown,
    config?: Omit<RequestConfig, "method" | "body">
  ) =>
    httpClient<T>(endpoint, {
      ...config,
      method: "POST",
      body,
    }),

  put: <T>(
    endpoint: string,
    body?: unknown,
    config?: Omit<RequestConfig, "method" | "body">
  ) =>
    httpClient<T>(endpoint, {
      ...config,
      method: "PUT",
      body,
    }),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    config?: Omit<RequestConfig, "method" | "body">
  ) =>
    httpClient<T>(endpoint, {
      ...config,
      method: "PATCH",
      body,
    }),

  delete: <T>(
    endpoint: string,
    config?: Omit<RequestConfig, "method" | "body">
  ) =>
    httpClient<T>(endpoint, {
      ...config,
      method: "DELETE",
    }),
};