# Architecture

```
src/
├── core/                # pure API SDK (no CLI deps)
│   ├── client.ts        # HTTP + auth + error mapping
│   ├── config.ts        # auth resolution chain
│   ├── types.ts         # Paginated, errors, options
│   └── api/             # one module per resource (forms, submissions, …)
└── cli/                 # commander adapter over core
    ├── index.ts         # entry; registers global flags + commands
    ├── context.ts       # makeClient(), error→exit-code mapping
    ├── output.ts        # table/json renderer + redaction
    └── commands/        # one file per resource group
```

## Boundary

- `core/` does no I/O beyond `fetch`. Tests inject `fetchImpl`.
- `cli/` is a thin shell: parse argv → resolve auth → call core → render.
- `cli/` can be deleted; `core/` is consumable as a library (`import { TallyClient } from "tally-cli"`).

## Adding a resource

1. Add types + functions to `src/core/api/<resource>.ts`.
2. Re-export in `src/core/index.ts`.
3. Add command file `src/cli/commands/<resource>.ts` and register in `src/cli/index.ts`.
4. Add tests in `tests/`.

## Error contract

| Class | When | CLI exit |
|---|---|---|
| `TallyAuthError` | 401/403 or missing key | 2 |
| `TallyNetworkError` | fetch threw | 3 |
| `TallyApiError` (4xx) | client error | 1 |
| `TallyApiError` (5xx) | server error | 4 |
