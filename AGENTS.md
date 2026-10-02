# AGENTS.md

Instructions for coding agents working in this repository.

## Read first

Before making a non-trivial change, read:

1. [ARCHITECTURE.md](ARCHITECTURE.md) — current implemented features, ownership, structure, storage, and runtime flows.
2. [ROADMAP.md](ROADMAP.md) — planned/future work. Do not treat roadmap items as already implemented.
3. [CONTRIBUTING.md](CONTRIBUTING.md) — branch, test, and PR requirements.
4. [CLAUDE.md](CLAUDE.md) only when Claude-specific workflow details are relevant.

## Branch and PR rules

- Target `dev`, not `main`, for normal feature/fix PRs.
- Keep one focused feature/fix per PR.
- Use Conventional Commits.
- Do not mix dependency churn or unrelated cleanup into a feature PR.

## Required validation

For code changes, run:

```bash
yarn compile
yarn test:coverage
yarn build
```

Run the Firefox build when the change can affect browser compatibility or release packaging:

```bash
yarn build:firefox
```

## Architecture boundaries

- `entrypoints/` owns WXT/browser entrypoints and page bootstrapping.
- `services/` owns business/domain logic.
- `components/` owns reusable/injected UI.
- `utils/` owns pure/shared helpers.
- `types/` owns shared TypeScript contracts.
- UI code should not become a second implementation of business rules already owned by services/API metadata.

## Arcade Calculator invariants

The Arcade Calculator is deterministic and is the source of truth for score-related extension behavior.

- Do not add a second scoring implementation in UI or AI code.
- Prefer API-provided Arcade/Facilitator metadata when available.
- Keep local Facilitator rules only as compatibility fallback.
- Do not double count Facilitator or Bonus Milestone points.
- A successful Arcade API response must not be discarded because optional UI/metadata synchronization fails.
- Cached/account data should remain usable when a non-critical badge/UI update fails.
- Future period/session state must be scoped so one period cannot overwrite another.

## Bonus Milestone invariants

- Current claim flow is self-reported extension state.
- Do not describe a local confirmation as Google verification.
- Do not auto-check, auto-confirm, or silently claim Bonus Milestone.
- Keep Bonus Milestone separate from the normal Facilitator milestone bonus.
- Respect profile/period scoping and API `bonusIncludedInTotal`-style protections against double counting.

## AI / Agent invariants

AI/Agent is a roadmap direction unless corresponding runtime code has actually landed.

When implementing it:

- Calculator/services perform all point and milestone arithmetic.
- AI consumes normalized Calculator facts and explains/plans from them.
- Never let a model invent an official score or missing point category.
- State-changing Agent actions require explicit user intent.
- Never send cookies, Skills Boost session tokens, HMAC secrets/signatures, or unrelated account data to a model/provider.
- Preserve a fully functional non-AI Calculator path.

## Solution search invariants

- Keep matching logic in services rather than DOM rendering code.
- Prefer exact/normalized identifiers before fuzzy title matching when available.
- Add a regression case for reported false-positive/false-negative matches.
- Preserve Google/YouTube fallback behavior when no trusted match exists.
- Treat upstream Skills Boost DOM as unstable and isolate selector/layout assumptions.

## Storage and account rules

- Use account-aware service APIs instead of raw storage from unrelated UI code.
- Preserve legacy reads/migrations only through compatibility layers.
- Scope account-specific data to the active/profile account.
- Scope period-specific data to a period identity when that feature is implemented.
- Do not silently migrate or overwrite unrelated historical data.

## Security and privacy

- Do not log API secrets, signature values, cookies, session data, or sensitive payloads.
- Treat extension-embedded build-time values as inspectable by users.
- Keep trusted enforcement (validation, rate limiting, replay protection) server-side.
- Sanitize untrusted strings/URLs before HTML injection.
- Avoid new browser permissions unless a feature clearly requires them.

## Internationalization

The extension ships 13 locales.

- Do not introduce hardcoded user-facing English when an i18n key is appropriate.
- Use `browser.i18n.getMessage()` / existing localization helpers.
- New important user-facing flows should be represented in all shipped locale catalogs.

## Documentation maintenance

When a change modifies current capabilities, ownership, storage, or data flow:

- update [ARCHITECTURE.md](ARCHITECTURE.md).

When a planned item becomes implemented:

- update [ROADMAP.md](ROADMAP.md) so future-state text does not contradict current state,
- update [ARCHITECTURE.md](ARCHITECTURE.md),
- include user-visible behavior in changelog/release notes.

Do not document planned behavior as current behavior.
