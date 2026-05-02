import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveAuth, redact } from "../src/core/config.js";

describe("resolveAuth", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "tally-test-"));
    delete process.env.TALLY_API_KEY;
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("prefers flag over env", () => {
    process.env.TALLY_API_KEY = "from-env";
    const r = resolveAuth({ flagApiKey: "from-flag", cwd: dir });
    expect(r?.apiKey).toBe("from-flag");
    expect(r?.source).toBe("flag");
  });

  it("falls back to env", () => {
    process.env.TALLY_API_KEY = "from-env";
    const r = resolveAuth({ cwd: dir });
    expect(r?.apiKey).toBe("from-env");
    expect(r?.source).toBe("env");
  });

  it("reads .env file", () => {
    writeFileSync(join(dir, ".env"), 'TALLY_API_KEY="from-dotenv"\n');
    const r = resolveAuth({ cwd: dir });
    expect(r?.apiKey).toBe("from-dotenv");
    expect(r?.source).toBe("dotenv");
  });

  it("reads .tallyrc.json project config", () => {
    writeFileSync(
      join(dir, ".tallyrc.json"),
      JSON.stringify({ apiKey: "from-project" }),
    );
    const r = resolveAuth({ cwd: dir });
    expect(r?.apiKey).toBe("from-project");
    expect(r?.source).toBe("project-config");
  });

  it("returns null when nothing configured", () => {
    expect(resolveAuth({ cwd: dir })).toBeNull();
  });
});

describe("redact", () => {
  it("masks long keys", () => {
    expect(redact("abcdefghijklmnop")).toBe("abcd…mnop");
  });
  it("fully masks short", () => {
    expect(redact("short")).toBe("****");
  });
});
