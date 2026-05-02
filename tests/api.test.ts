import { describe, it, expect } from "vitest";
import { TallyClient } from "../src/core/client.js";
import * as forms from "../src/core/api/forms.js";
import * as submissions from "../src/core/api/submissions.js";
import * as webhooks from "../src/core/api/webhooks.js";

function recorder() {
  const calls: { url: string; method: string; body?: string }[] = [];
  const fetchImpl = (async (input: URL | RequestInfo, init?: RequestInit) => {
    const u = new URL(input instanceof URL ? input : String(input));
    calls.push({
      url: u.pathname + u.search,
      method: init?.method ?? "GET",
      body: init?.body ? String(init.body) : undefined,
    });
    return new Response('{"ok":true}', { status: 200 });
  }) as typeof fetch;
  return {
    calls,
    client: new TallyClient({ apiKey: "k", fetchImpl }),
  };
}

describe("api routes", () => {
  it("forms.list hits /forms with query", async () => {
    const { client, calls } = recorder();
    await forms.list(client, { page: 2, limit: 5 });
    expect(calls[0]?.url).toBe("/forms?page=2&limit=5");
  });

  it("forms.get encodes id", async () => {
    const { client, calls } = recorder();
    await forms.get(client, "a/b");
    expect(calls[0]?.url).toBe("/forms/a%2Fb");
  });

  it("forms.create POSTs body", async () => {
    const { client, calls } = recorder();
    await forms.create(client, { blocks: [], status: "DRAFT" });
    expect(calls[0]?.method).toBe("POST");
    expect(calls[0]?.body).toContain('"status":"DRAFT"');
  });

  it("submissions.list builds path", async () => {
    const { client, calls } = recorder();
    await submissions.list(client, "f1", { startDate: "2026-01-01" });
    expect(calls[0]?.url).toBe(
      "/forms/f1/submissions?startDate=2026-01-01",
    );
  });

  it("webhooks.create sends required fields", async () => {
    const { client, calls } = recorder();
    await webhooks.create(client, {
      formId: "f",
      url: "https://x",
      eventTypes: ["FORM_RESPONSE"],
    });
    expect(calls[0]?.method).toBe("POST");
    const body = calls[0]?.body ?? "";
    expect(body).toContain('"formId":"f"');
    expect(body).toContain('"FORM_RESPONSE"');
  });

  it("webhooks.retryEvent uses POST", async () => {
    const { client, calls } = recorder();
    await webhooks.retryEvent(client, "w", "e");
    expect(calls[0]?.method).toBe("POST");
    expect(calls[0]?.url).toBe("/webhooks/w/events/e");
  });
});
