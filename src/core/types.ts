export interface Paginated<T> {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  items: T[];
}

export interface ClientOptions {
  apiKey: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  userAgent?: string;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  headers?: Record<string, string>;
}

export class TallyApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "TallyApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class TallyAuthError extends TallyApiError {
  constructor(message = "Unauthorized — check your TALLY_API_KEY") {
    super(401, "AUTH", message);
    this.name = "TallyAuthError";
  }
}

export class TallyNetworkError extends TallyApiError {
  constructor(message: string, cause?: unknown) {
    super(0, "NETWORK", message, cause);
    this.name = "TallyNetworkError";
  }
}
