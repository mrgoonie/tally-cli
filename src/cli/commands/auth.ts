import { Command } from "commander";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { resolveAuth, userConfigPath, redact } from "../../core/config.js";
import { TallyClient } from "../../core/client.js";
import * as users from "../../core/api/users.js";
import { emit } from "../output.js";

export function registerAuth(program: Command): void {
  program
    .command("login")
    .description("Save API key to user config (~/.config/tally/config.json)")
    .requiredOption("--api-key <key>", "Tally API key")
    .action(async (o) => {
      const path = userConfigPath();
      mkdirSync(dirname(path), { recursive: true });
      const existing = existsSync(path)
        ? JSON.parse(readFileSync(path, "utf8"))
        : {};
      existing.apiKey = o.apiKey;
      writeFileSync(path, JSON.stringify(existing, null, 2), { mode: 0o600 });
      process.stdout.write(`Saved API key to ${path}\n`);
    });

  program
    .command("logout")
    .description("Remove API key from user config")
    .action(() => {
      const path = userConfigPath();
      if (!existsSync(path)) {
        process.stdout.write("No saved key.\n");
        return;
      }
      const data = JSON.parse(readFileSync(path, "utf8"));
      delete data.apiKey;
      writeFileSync(path, JSON.stringify(data, null, 2), { mode: 0o600 });
      process.stdout.write("Removed.\n");
    });

  program
    .command("doctor")
    .description("Diagnose configuration and connectivity")
    .action(async (_o, c) => {
      const g = c.optsWithGlobals() as { apiKey?: string; baseUrl?: string };
      const auth = resolveAuth({ flagApiKey: g.apiKey });
      if (!auth) {
        process.stdout.write("auth: NOT FOUND\n");
        process.exit(2);
      }
      process.stdout.write(`auth: ok (source=${auth.source}, key=${redact(auth.apiKey)})\n`);
      try {
        const c2 = new TallyClient({
          apiKey: auth.apiKey,
          baseUrl: g.baseUrl,
        });
        const me = await users.me(c2);
        emit({ status: "ok", user: me });
      } catch (e) {
        process.stdout.write(`api: FAIL (${(e as Error).message})\n`);
        process.exit(3);
      }
    });
}
