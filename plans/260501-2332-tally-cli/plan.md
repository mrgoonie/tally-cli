# Tally CLI — Implementation Plan

**Date:** 2026-05-01
**Mode:** `/ck:agentize --cli --auto`
**Target:** Wrap Tally API (https://api.tally.so) as a Node/TS CLI publishable on npm.

## Source

- Tally docs: https://developers.tally.so/llms.txt
- OpenAPI: https://developers.tally.so/api-reference/openapi.json
- Auth: `Authorization: Bearer <TALLY_API_KEY>`

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | Scout (external API) | done — see decisions doc |
| 2 | Analyze + capability map | done |
| 3 | Decide (CLI only, TS, commander) | done |
| 4 | Scaffold | in progress |
| 5 | Wrap (core + commands) | pending |
| 6 | Harden (tests, CI, docs, skill) | pending |
| 7 | Package | pending |

## Decisions

- **Mode:** CLI only (`--cli`). No MCP this round.
- **Lang:** TypeScript, Node ≥18 (native fetch).
- **CLI lib:** `commander`.
- **Build:** `tsup` → ESM + CJS.
- **Tests:** `vitest`.
- **HTTP:** native `fetch`.
- **Output:** human table by default, `--json` flag everywhere.
- **Auth resolution chain:** flag → env (`TALLY_API_KEY`) → `.env` → `~/.config/tally/config.json` → `login` keychain stub.

## Capability map

| Resource | Commands |
|---|---|
| forms | list, get, create, update, delete |
| forms/questions | list, update |
| forms/blocks | list, update |
| submissions | list, get, delete |
| webhooks | list, create, update, delete, events:list, events:retry |
| workspaces | list, get, create, update, delete |
| users | me, org:list, org:remove |
| invites | list, create, cancel |

Top-level grouping in CLI: `tally <resource> <verb>`.

## Files

- `src/core/client.ts` — HTTP client + auth + error mapping
- `src/core/config.ts` — auth resolution chain
- `src/core/types.ts` — types
- `src/core/api/*.ts` — per-resource functions
- `src/cli/index.ts` — entry, command registration
- `src/cli/commands/*.ts` — per-resource command groups
- `src/cli/output.ts` — table/json/redaction helpers
