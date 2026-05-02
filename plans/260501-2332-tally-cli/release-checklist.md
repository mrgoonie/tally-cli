# Release Checklist

## Pre-publish

- [ ] `npm install`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build` produces `dist/cli/index.js` (with shebang) and `dist/core/index.js`
- [ ] Smoke test: `node dist/cli/index.js --help`
- [ ] Smoke test against real API: `TALLY_API_KEY=… node dist/cli/index.js me`

## Publish (npm)

- [ ] Bump `version` in `package.json`
- [ ] `git tag v0.1.0 && git push --tags`
- [ ] CI release.yml publishes with provenance (requires `NPM_TOKEN` secret)

## Marketplace skill

- [ ] Verify `claude/skills/tally-cli/SKILL.md` and `plugin.json`
- [ ] Replace `homepage` placeholder in `plugin.json`
- [ ] Submit to Claude Plugins Marketplace per its current submission flow

## Open follow-ups

- Tally rate-limit headers — implement `Retry-After` handling once docs published
- Webhook signature verification helper (HMAC) — add to core when secret format documented
- Optional: keytar-backed `login` for OS keychain storage
- Optional: pagination auto-iterator (`forms.iter()`) once we confirm cursor vs page semantics
