import { Command } from "commander";
import * as users from "../../core/api/users.js";
import * as invites from "../../core/api/invites.js";
import { GlobalOpts, makeClient, handleError } from "../context.js";
import { emit } from "../output.js";

export function registerUsers(program: Command): void {
  program
    .command("me")
    .description("Show authenticated user")
    .action(async (_o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts;
        emit(await users.me(makeClient(g)), { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });

  const org = program.command("org").description("Organization users & invites");

  org
    .command("users <orgId>")
    .description("List users in an organization")
    .action(async (orgId, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts;
        emit(await users.listOrgUsers(makeClient(g), orgId), { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });

  org
    .command("remove-user <orgId> <userId>")
    .option("--yes")
    .action(async (orgId, userId, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts & { yes?: boolean };
        if (!g.yes) {
          process.stderr.write("Refusing without --yes\n");
          process.exit(1);
        }
        await users.removeOrgUser(makeClient(g), orgId, userId);
        emit({ removed: userId }, { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });

  org
    .command("invites <orgId>")
    .action(async (orgId, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts;
        emit(await invites.list(makeClient(g), orgId), { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });

  org
    .command("invite <orgId>")
    .description("Invite users to workspaces")
    .requiredOption("--emails <list...>", "emails")
    .requiredOption("--workspaces <ids...>", "workspace ids")
    .option("--role <role>", "role")
    .action(async (orgId, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts & {
          emails: string[];
          workspaces: string[];
          role?: string;
        };
        emit(
          await invites.create(makeClient(g), orgId, {
            emails: g.emails,
            workspaceIds: g.workspaces,
            role: g.role,
          }),
          { json: g.json },
        );
      } catch (e) {
        handleError(e);
      }
    });

  org
    .command("cancel-invite <orgId> <inviteId>")
    .option("--yes")
    .action(async (orgId, inviteId, _o, c) => {
      try {
        const g = c.optsWithGlobals() as GlobalOpts & { yes?: boolean };
        if (!g.yes) {
          process.stderr.write("Refusing without --yes\n");
          process.exit(1);
        }
        await invites.cancel(makeClient(g), orgId, inviteId);
        emit({ cancelled: inviteId }, { json: g.json });
      } catch (e) {
        handleError(e);
      }
    });
}
