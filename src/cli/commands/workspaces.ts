import { Command } from "commander";
import * as ws from "../../core/api/workspaces.js";
import { GlobalOpts, makeClient, handleError } from "../context.js";
import { emit } from "../output.js";

export function registerWorkspaces(program: Command): void {
  const cmd = program.command("workspaces").description("Manage workspaces");

  cmd
    .command("list")
    .option("--page <n>", "page", parseInt)
    .action(async (_o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts & { page?: number };
        emit(await ws.list(makeClient(g), { page: g.page }), { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command("get <id>")
    .action(async (id, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts;
        emit(await ws.get(makeClient(g), id), { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command("create")
    .requiredOption("--name <name>")
    .action(async (_o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts & { name: string };
        emit(await ws.create(makeClient(g), { name: g.name }), {
          json: g.json,
        });
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command("update <id>")
    .option("--name <name>")
    .action(async (id, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts & { name?: string };
        emit(await ws.update(makeClient(g), id, { name: g.name }), {
          json: g.json,
        });
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
        await ws.remove(makeClient(g), id);
        emit({ deleted: id }, { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });
}
