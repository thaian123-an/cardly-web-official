const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestConfig = {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
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

export async function httpClient<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const response = await fetch(buildUrl(endpoint), {
    method: config.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
    credentials: "include",
    body: config.body ? JSON.stringify(config.body) : undefined,
    signal: config.signal,
  });

  const data = await parseResponse(response).catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Something went wrong. Please try again.";

    throw new ApiError(message, response.status, data);
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