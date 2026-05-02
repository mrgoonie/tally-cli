import { Command } from "commander";
import { readFileSync } from "node:fs";
import * as forms from "../../core/api/forms.js";
import { GlobalOpts, makeClient, handleError } from "../context.js";
import { emit } from "../output.js";

export function registerForms(program: Command): void {
  const cmd = program.command("forms").description("Manage Tally forms");

  cmd
    .command("list")
    .description("List forms")
    .option("--page <n>", "page number", parseInt)
    .option("--limit <n>", "page size", parseInt)
    .option("--workspace <ids...>", "filter by workspace ids")
    .action(async (o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts & {
          page?: number;
          limit?: number;
          workspace?: string[];
        };
        const client = makeClient(g);
        const r = await forms.list(client, {
          page: g.page,
          limit: g.limit,
          workspaceIds: g.workspace,
        });
        emit(r, { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command("get <id>")
    .description("Get a form")
    .action(async (id, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts;
        emit(await forms.get(makeClient(g), id), { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command("create")
    .description("Create a form from a JSON file (--blocks-file)")
    .requiredOption("--blocks-file <path>", "JSON file with { blocks, status, workspaceId }")
    .action(async (_o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts & { blocksFile: string };
        const body = JSON.parse(
          readFileSync(g.blocksFile, "utf8"),
        ) as forms.CreateFormInput;
        emit(await forms.create(makeClient(g), body), { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command("update <id>")
    .description("Update a form from a JSON file")
    .requiredOption("--file <path>", "JSON patch file")
    .action(async (id, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts & { file: string };
        const body = JSON.parse(
          readFileSync(g.file, "utf8"),
        ) as forms.UpdateFormInput;
        emit(await forms.update(makeClient(g), id, body), { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command("delete <id>")
    .description("Delete a form (moves to trash)")
    .option("--yes", "skip confirmation")
    .action(async (id, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts & { yes?: boolean };
        if (!g.yes) {
          process.stderr.write("Refusing to delete without --yes\n");
          process.exit(1);
        }
        await forms.remove(makeClient(g), id);
        emit({ deleted: id }, { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command("questions <id>")
    .description("List questions in a form")
    .action(async (id, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts;
        emit(await forms.listQuestions(makeClient(g), id), { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command("blocks <id>")
    .description("List blocks in a form")
    .action(async (id, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts;
        emit(await forms.listBlocks(makeClient(g), id), { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });
}
