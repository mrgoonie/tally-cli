# Agentize Decisions — tally-cli

- Mode: `--cli --auto`
- Pkg: `tally-cli` (bin: `tally`)
- Lang: TS, Node ≥18
- CLI: commander v12
- HTTP: native fetch
- Build: tsup → ESM+CJS, `dist/`
- Tests: vitest, coverage ≥80% on core/
- License: MIT
- CI: ci.yml (test+typecheck on push), release.yml (npm publish on tag)
- Output: pretty table default, `--json` for machine
- Auth chain: --api-key flag → TALLY_API_KEY env → .env → ~/.config/tally/config.json
- Exit codes: 0 ok, 1 user, 2 auth, 3 network, 4 runtime
- Error mapping: 401→2, 4xx→1, 5xx/net→3
- No mutating confirmation prompts in v1 (CLI script-friendly); destructive cmds require `--yes` flag
- No MCP this round
- Companion skill: `/ck:tally` triggers on "tally form/submission/webhook"

## Capabilities → commands

forms: list/get/create/update/delete
forms questions: list/update
forms blocks: list/update
submissions: list/get/delete
webhooks: list/create/update/delete + events:list/retry
workspaces: list/get/create/update/delete
users: me + org:users:list/remove
invites: list/create/cancel

## Open questions

- Tally rate limits: not documented in scout. Add basic retry-after handling, document as TBD.
- Form `blocks` schema is rich; CLI accepts `--blocks-file <path.json>` rather than flag flattening.
