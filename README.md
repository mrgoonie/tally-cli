# tally-cli

Command-line interface for the [Tally](https://tally.so) API. Manage forms, submissions, webhooks, and workspaces from your terminal or scripts.

## Install

```bash
npm i -g tally-cli
```

Requires Node ≥18.

## Authenticate

Get an API key from your Tally account, then either:

```bash
# one-shot
export TALLY_API_KEY=tly_xxx

# or save to user config (~/.config/tally/config.json)
tally login --api-key tly_xxx

# verify
tally doctor
```

Resolution order: `--api-key` flag → `TALLY_API_KEY` env → `.env` / `.env.local` → `./.tallyrc.json` → user config.

## Quick examples

```bash
tally me
tally forms list --limit 20
tally forms get <formId>
tally submissions list <formId> --start-date 2026-01-01 --json
tally webhooks create --form-id <id> --url https://example.com/hook --events FORM_RESPONSE
tally workspaces list --json | jq '.items[].name'
```

Add `--json` to any command for machine-readable output. Destructive commands require `--yes`.

See [docs/cli.md](docs/cli.md) for the full command reference.

## Library use

```ts
import { TallyClient, forms } from "tally-cli";

const c = new TallyClient({ apiKey: process.env.TALLY_API_KEY! });
const list = await forms.list(c, { limit: 50 });
```

## License

MIT
