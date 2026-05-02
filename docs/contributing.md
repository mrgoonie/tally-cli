# Contributing

## Dev loop

```bash
npm install
npm run typecheck
npm test
npm run build
node dist/cli/index.js me
```

## Layout

See [architecture.md](architecture.md).

## Tests

- `tests/client.test.ts` — HTTP layer, auth header, error mapping
- `tests/config.test.ts` — auth resolution chain
- `tests/api.test.ts` — per-route routing/encoding

Coverage target ≥80% on `src/core/**`. CLI commands are thin enough that core coverage is the meaningful metric.

## Release

1. Bump `version` in `package.json`.
2. `git tag v<version> && git push --tags`.
3. CI publishes via `release.yml` (`NPM_TOKEN` secret required, npm provenance enabled).

## Commit style

Conventional commits. Examples:

```
feat(forms): add --workspace filter
fix(client): retry on transient 502
docs(cli): document --base-url
```
