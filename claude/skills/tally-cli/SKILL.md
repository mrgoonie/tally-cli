---
name: tally-cli
description: Manage Tally forms, submissions, webhooks, and workspaces from the terminal via the `tally` CLI. Triggers on "tally form", "tally submission", "tally webhook", "Tally API", "list responses from Tally", "create Tally form", "export Tally submissions". Wraps https://api.tally.so.
---

# tally-cli

Use this skill when the user wants to interact with [Tally](https://tally.so) — listing forms, exporting submissions, managing webhooks, or scripting against the Tally API.

## Install & auth

```bash
npm i -g @mrgoonie/tally-cli
export TALLY_API_KEY=tly_xxx       # or: tally login --api-key tly_xxx
tally doctor                       # verify
```

Resolution order: `--api-key` → `TALLY_API_KEY` env → `.env` → `./.tallyrc.json` → user config.

## Common workflows

### 1. List forms in a workspace

```bash
tally forms list --workspace <wsId> --json
```

### 2. Export all submissions for a form

```bash
tally submissions list <formId> --start-date 2026-01-01 --limit 100 --json > out.json
```
Paginate by reading `hasMore` and incrementing `--page`.

### 3. Create a webhook

```bash
tally webhooks create \
  --form-id <id> \
  --url https://example.com/hook \
  --events FORM_RESPONSE
```

### 4. Retry a failed delivery

```bash
tally webhooks events <webhookId> --json | jq '.items[] | select(.status=="FAILED").id'
tally webhooks retry <webhookId> <eventId>
```

### 5. Bulk-create a form from JSON

```bash
tally forms create --blocks-file ./form.json
```
The file shape mirrors the Tally form payload: `{ "status": "DRAFT", "blocks": [...] }`.

## Output

Default: human table with key columns (`id`, `name`, `status`, …) plus pagination footer.
Add `--json` to any command for machine-readable output (pipe to `jq`).

## Destructive commands

`forms delete`, `submissions delete`, `webhooks delete`, `workspaces delete`, `org remove-user`, `org cancel-invite` all require explicit `--yes`.

## Exit codes

`0` ok • `1` user/4xx • `2` auth/401 • `3` network/5xx • `4` runtime.

## Reference

Full command reference: see `docs/cli.md` in this repo.
API reference: https://developers.tally.so
