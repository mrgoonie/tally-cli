import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface ResolvedAuth {
  apiKey: string;
  source: "flag" | "env" | "dotenv" | "user-config" | "project-config";
}

export interface ResolveOptions {
  flagApiKey?: string;
  cwd?: string;
}

const ENV_KEY = "TALLY_API_KEY";

export function resolveAuth(opts: ResolveOptions = {}): ResolvedAuth | null {
  const cwd = opts.cwd ?? process.cwd();

  if (opts.flagApiKey) {
    return { apiKey: opts.flagApiKey, source: "flag" };
  }
  if (process.env[ENV_KEY]) {
    return { apiKey: process.env[ENV_KEY] as string, source: "env" };
  }

  const dotenvKey = readDotenv(cwd);
  if (dotenvKey) return { apiKey: dotenvKey, source: "dotenv" };

  const projectCfg = readJsonKey(join(cwd, ".tallyrc.json"), "apiKey");
  if (projectCfg) return { apiKey: projectCfg, source: "project-config" };

  const userCfg = readJsonKey(userConfigPath(), "apiKey");
  if (userCfg) return { apiKey: userCfg, source: "user-config" };

  return null;
}

export function userConfigPath(): string {
  if (process.platform === "win32") {
    const appdata = process.env.APPDATA ?? join(homedir(), "AppData", "Roaming");
    return join(appdata, "tally", "config.json");
  }
  const xdg = process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config");
  return join(xdg, "tally", "config.json");
}

function readJsonKey(path: string, key: string): string | null {
  if (!existsSync(path)) return null;
  try {
    const data = JSON.parse(readFileSync(path, "utf8"));
    if (data && typeof data[key] === "string") return data[key];
  } catch {
    /* ignore */
  }
  return null;
}

function readDotenv(cwd: string): string | null {
  for (const name of [".env.local", ".env"]) {
    const p = join(cwd, name);
    if (!existsSync(p)) continue;
    const content = readFileSync(p, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^\s*TALLY_API_KEY\s*=\s*(.*?)\s*$/);
      if (m && m[1]) return stripQuotes(m[1]);
    }
  }
  return null;
}

function stripQuotes(s: string): string {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1);
  }
  return s;
}

export function redact(value: string): string {
  if (!value) return "";
  if (value.length <= 8) return "****";
  return value.slice(0, 4) + "…" + value.slice(-4);
}
