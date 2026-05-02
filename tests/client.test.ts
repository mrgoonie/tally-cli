import { describe, it, expect } from "vitest";
import { TallyClient } from "../src/core/client.js";
import { TallyAuthError, TallyApiError } from "../src/core/types.js";

function mockFetch(
  handler: (url: URL, init: RequestInit) => Response | Promise<Response>,
): typeof fetch {
  return (async (input: URL | RequestInfo, init?: RequestInit) => {
    const url = new URL(input instanceof URL ? input : String(input));
    return handler(url, init ?? {});
  }) as typeof fetch;
}

describe("TallyClient", () => {
  it("throws on missing API key", () => {
    expect(() => new TallyClient({ apiKey: "" })).toThrow();
  });

  it("sends Authorization header", async () => {
    const seen: Record<string, string> = {};
    const c = new TallyClient({
      apiKey: "k1",
      fetchImpl: mockFetch((_u, init) => {
        const h = init.headers as Record<string, string>;
        Object.assign(seen, h);
        return new Response("{}", { status: 200 });
      }),
    });
    await c.request("/users/me");
    expect(seen["Authorization"]).toBe("Bearer k1");
  });

  it("appends query parameters", async () => {
    let url = "";
    const c = new TallyClient({
      apiKey: "k",
      fetchImpl: mockFetch((u) => {
        url = u.toString();
        return new Response("[]", { status: 200 });
      }),
    });
    await c.request("/forms", { query: { page: 2, limit: 10, x: undefined } });
    expect(url).toContain("page=2");
    expect(url).toContain("limit=10");
    expect(url).not.toContain("x=");
  });

  it("maps 401 to TallyAuthError", async () => {
    const c = new TallyClient({
      apiKey: "k",
      fetchImpl: mockFetch(
        () =>
          new Response(JSON.stringify({ message: "bad token" }), {
            status: 401,
          }),
      ),
    });
    await expect(c.request("/users/me")).rejects.toBeInstanceOf(TallyAuthError);
  });

  it("maps 500 to TallyApiError with SERVER code", async () => {
    const c = new TallyClient({
      apiKey: "k",
      fetchImpl: mockFetch(
        () => new Response(JSON.stringify({ message: "boom" }), { status: 500 }),
      ),
    });
    await expect(c.request("/forms")).rejects.toMatchObject({
      name: "TallyApiError",
      status: 500,
      code: "SERVER",
    });
  });

  it("returns undefined on 204", async () => {
    const c = new TallyClient({
      apiKey: "k",
      fetchImpl: mockFetch(() => new Response(null, { status: 204 })),
    });
    const r = await c.request("/forms/abc", { method: "DELETE" });
    expect(r).toBeUndefined();
  });

  it("serializes JSON body", async () => {
    let bodySeen = "";
    let ctype = "";
    const c = new TallyClient({
      apiKey: "k",
      fetchImpl: mockFetch((_u, init) => {
        bodySeen = String(init.body);
        ctype = (init.headers as Record<string, string>)["Content-Type"] ?? "";
        return new Response("{}", { status: 200 });
      }),
    });
    await c.request("/forms", { method: "POST", body: { name: "x" } });
    expect(bodySeen).toBe('{"name":"x"}');
    expect(ctype).toBe("application/json");
  });
});
