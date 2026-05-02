# tally CLI Reference

Base URL default: `https://api.tally.so`. Override via `--base-url`.

## Global flags

| Flag | Description |
|---|---|
| `--api-key <key>` | Override resolved API key |
| `--base-url <url>` | API base URL |
| `--json` | Emit JSON (machine-readable) |
| `--help`, `--version` | Standard |

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | User error (bad input, 4xx) |
| 2 | Auth (missing key, 401/403) |
| 3 | Network (DNS, timeout, 5xx) |
| 4 | Runtime |

## Auth

```
tally login --api-key <key>     # write to user config
tally logout                    # remove from user config
tally doctor                    # diagnose key + connectivity
tally me                        # show authenticated user
```

## Forms

```
tally forms list [--page N] [--limit N] [--workspace <ids...>]
tally forms get <id>
tally forms create --blocks-file <path.json>
tally forms update <id> --file <patch.json>
tally forms delete <id> --yes
tally forms questions <id>
tally forms blocks <id>
```

## Submissions

```
tally submissions list <formId> [--page] [--limit] [--filter] [--start-date] [--end-date]
tally submissions get <formId> <submissionId>
tally submissions delete <formId> <submissionId> --yes
```

## Webhooks

```
tally webhooks list [--page] [--limit]
tally webhooks create --form-id <id> --url <url> --events <names...> [--disabled] [--secret <s>]
tally webhooks update <id> [--url] [--events] [--enable|--disable] [--secret]
tally webhooks delete <id> --yes
tally webhooks events <id> [--page]
tally webhooks retry <id> <eventId>
```

## Workspaces

```
tally workspaces list [--page]
tally workspaces get <id>
tally workspaces create --name <name>
tally workspaces update <id> [--name]
tally workspaces delete <id> --yes
```

## Organization

```
tally org users <orgId>
tally org remove-user <orgId> <userId> --yes
tally org invites <orgId>
tally org invite <orgId> --emails <list...> --workspaces <ids...> [--role <role>]
tally org cancel-invite <orgId> <inviteId> --yes
```

## Output format

Without `--json`, list endpoints render a table with `id`, `name`, `status`, etc. Pagination footer shows `page • shown/total • hasMore`.

With `--json`, the raw API response is printed.

## Configuration files

`./.tallyrc.json` (project) or user config (`~/.config/tally/config.json` on Linux/macOS, `%APPDATA%\tally\config.json` on Windows):

```json
{ "apiKey": "tly_xxx" }
```
