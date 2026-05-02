import { Command } from "commander";
import * as submissions from "../../core/api/submissions.js";
import { GlobalOpts, makeClient, handleError } from "../context.js";
import { emit } from "../output.js";

export function registerSubmissions(program: Command): void {
  const cmd = program
    .command("submissions")
    .description("Manage Tally form submissions");

  cmd
    .command("list <formId>")
    .description("List submissions for a form")
    .option("--page <n>", "page", parseInt)
    .option("--limit <n>", "page size", parseInt)
    .option("--filter <s>", "filter expression")
    .option("--start-date <iso>", "start date filter")
    .option("--end-date <iso>", "end date filter")
    .action(async (formId, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts & {
          page?: number;
          limit?: number;
          filter?: string;
          startDate?: string;
          endDate?: string;
        };
        const r = await submissions.list(makeClient(g), formId, {
          page: g.page,
          limit: g.limit,
          filter: g.filter,
          startDate: g.startDate,
          endDate: g.endDate,
        });
        emit(r, { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command("get <formId> <submissionId>")
    .description("Get a single submission")
    .action(async (formId, submissionId, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts;
        emit(await submissions.get(makeClient(g), formId, submissionId), {
          json: g.json,
        });
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command("delete <formId> <submissionId>")
    .description("Delete a submission")
    .option("--yes", "skip confirmation")
    .action(async (formId, submissionId, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts & { yes?: boolean };
        if (!g.yes) {
          process.stderr.write("Refusing to delete without --yes\n");
          process.exit(1);
        }
        await submissions.remove(makeClient(g), formId, submissionId);
        emit({ deleted: submissionId }, { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });
}
