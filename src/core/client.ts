import {
  ClientOptions,
  RequestOptions,
  TallyApiError,
  TallyAuthError,
  TallyNetworkError,
} from "./types.js";

const DEFAULT_BASE_URL = "https://api.tally.so";
const DEFAULT_UA = "tally-cli";

export class TallyClient {
  readonly baseUrl: string;
  readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;
  private readonly userAgent: string;

  constructor(opts: ClientOptions) {
    if (!opts.apiKey) {
      throw new TallyAuthError("Missing API key");
    }
    this.apiKey = opts.apiKey;
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch;
    this.userAgent = opts.userAgent ?? DEFAULT_UA;
  }

  async request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const url = new URL(this.baseUrl + path);
    if (opts.query) {
      for (const [k, v] of Object.entries(opts.query)) {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      }
    }
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "User-Agent": this.userAgent,
      Accept: "application/json",
      ...(opts.headers ?? {}),
    };
    let body: string | undefined;
    if (opts.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(opts.body);
    }

    let res: Response;
    try {
      res = await this.fetchImpl(url, {
        method: opts.method ?? "GET",
        headers,
        body,
      });
    } catch (err) {
      throw new TallyNetworkError(
        `Network error: ${(err as Error).message}`,
        err,
      );
    }

    if (res.status === 204) return undefined as T;

    const text = await res.text();
    let data: unknown = undefined;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new TallyAuthError(extractMessage(data) ?? "Unauthorized");
      }
      throw new TallyApiError(
        res.status,
        res.status >= 500 ? "SERVER" : "HTTP",
        extractMessage(data) ?? `HTTP ${res.status}`,
        data,
      );
    }

    return data as T;
  }
}

function extractMessage(data: unknown): string | undefined {
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (typeof o.message === "string") return o.message;
    if (typeof o.error === "string") return o.error;
  }
  return undefined;
}
