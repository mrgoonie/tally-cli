import { Command } from "commander";
import * as webhooks from "../../core/api/webhooks.js";
import { GlobalOpts, makeClient, handleError } from "../context.js";
import { emit } from "../output.js";

export function registerWebhooks(program: Command): void {
  const cmd = program.command("webhooks").description("Manage form webhooks");

  cmd
    .command("list")
    .option("--page <n>", "page", parseInt)
    .option("--limit <n>", "page size", parseInt)
    .action(async (_o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts & {
          page?: number;
          limit?: number;
        };
        emit(
          await webhooks.list(makeClient(g), { page: g.page, limit: g.limit }),
          { json: g.json },
        );
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command("create")
    .requiredOption("--form-id <id>")
    .requiredOption("--url <url>")
    .requiredOption("--events <names...>", "event types (e.g. FORM_RESPONSE)")
    .option("--disabled", "create disabled")
    .option("--secret <s>", "signing secret")
    .action(async (_o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts & {
          formId: string;
          url: string;
          events: string[];
          disabled?: boolean;
          secret?: string;
        };
        emit(
          await webhooks.create(makeClient(g), {
            formId: g.formId,
            url: g.url,
            eventTypes: g.events,
            isEnabled: !g.disabled,
            signingSecret: g.secret,
          }),
          { json: g.json },
        );
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command("update <id>")
    .option("--url <url>")
    .option("--events <names...>")
    .option("--enable")
    .option("--disable")
    .option("--secret <s>")
    .action(async (id, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts & {
          url?: string;
          events?: string[];
          enable?: boolean;
          disable?: boolean;
          secret?: string;
        };
        const isEnabled = g.enable ? true : g.disable ? false : undefined;
        emit(
          await webhooks.update(makeClient(g), id, {
            url: g.url,
            eventTypes: g.events,
            isEnabled,
            signingSecret: g.secret,
          }),
          { json: g.json },
        );
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command("delete <id>")
    .option("--yes")
    .action(async (id, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts & { yes?: boolean };
        if (!g.yes) {
          process.stderr.write("Refusing to delete without --yes\n");
          process.exit(1);
        }
        await webhooks.remove(makeClient(g), id);
        emit({ deleted: id }, { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command("events <id>")
    .description("List delivery events for a webhook")
    .option("--page <n>", "page", parseInt)
    .action(async (id, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts & { page?: number };
        emit(await webhooks.listEvents(makeClient(g), id, { page: g.page }), {
          json: g.json,
        });
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command("retry <id> <eventId>")
    .description("Retry a failed webhook delivery")
    .action(async (id, eventId, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts;
        emit(await webhooks.retryEvent(makeClient(g), id, eventId), {
          json: g.json,
        });
      } catch (e) {
        handleError(e);
      }
    });
}
