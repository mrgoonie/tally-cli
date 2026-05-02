import { TallyClient } from "../core/client.js";
import { resolveAuth } from "../core/config.js";
import { fail } from "./output.js";

export interface GlobalOpts {
  apiKey?: string;
  baseUrl?: string;
  json?: boolean;
}

export function makeClient(opts: GlobalOpts): TallyClient {
  const auth = resolveAuth({ flagApiKey: opts.apiKey });
  if (!auth) {
    fail(
      "No API key. Set TALLY_API_KEY env, pass --api-key, or run `tally login`.",
      2,
    );
  }
  return new TallyClient({
    apiKey: auth.apiKey,
    baseUrl: opts.baseUrl,
  });
}

export function handleError(err: unknown): never {
  const e = err as { name?: string; status?: number; message?: string };
  const msg = e?.message ?? String(err);
  if (e?.name === "TallyAuthError") fail(msg, 2);
  if (e?.name === "TallyNetworkError") fail(msg, 3);
  if (e?.status && e.status >= 400 && e.status < 500) fail(msg, 1);
  fail(msg, 4);
}
