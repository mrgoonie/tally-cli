import { Command } from "commander";
import { registerForms } from "./commands/forms.js";
import { registerSubmissions } from "./commands/submissions.js";
import { registerWebhooks } from "./commands/webhooks.js";
import { registerWorkspaces } from "./commands/workspaces.js";
import { registerUsers } from "./commands/users.js";
import { registerAuth } from "./commands/auth.js";

const program = new Command();

program
  .name("tally")
  .description("Command-line interface for the Tally API")
  .version("0.1.1")
  .option("--api-key <key>", "Tally API key (overrides env/config)")
  .option("--base-url <url>", "API base URL (default: https://api.tally.so)")
  .option("--json", "Emit machine-readable JSON instead of tables");

registerAuth(program);
registerForms(program);
registerSubmissions(program);
registerWebhooks(program);
registerWorkspaces(program);
registerUsers(program);

program.parseAsync(process.argv).catch((e: Error) => {
  process.stderr.write(`Fatal: ${e.message}\n`);
  process.exit(4);
});
