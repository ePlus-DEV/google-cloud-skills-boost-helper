# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Google Cloud Skills Boost Helper is a WXT browser extension for Chrome and Firefox. It enhances Google Cloud Skills Boost with Arcade point tracking, multi-account management, leaderboard data, and lab solution search.

## Commands

```bash
yarn install          # Install dependencies
yarn dev              # Start Chrome development build with hot reload
yarn dev:firefox      # Start Firefox development build with hot reload
yarn build            # Production Chrome build
yarn build:firefox    # Production Firefox build
yarn zip              # Package Chrome build
yarn zip:firefox      # Package Firefox build
yarn compile          # TypeScript type check
yarn test             # Run Vitest tests
yarn test:watch       # Watch mode
yarn test:coverage    # Coverage report (60% minimum)
```

## Architecture

### Entrypoints

WXT entrypoints live under `entrypoints/`:

- `background.ts` — service worker, runtime messages, badge updates, remote config
- `content.ts` — injects UI into Cloud Skills Boost pages
- `popup/` — extension popup
- `options/` — options and account management
- `changelog/` — release notes page
- `theme-studio/` — theme editor

### Services

Business logic lives under `services/`. Keep DOM/UI creation out of services where possible.

Key services:

- `accountService.ts` — account CRUD, active-account state, migration
- `storageService.ts` — storage helpers and badge refresh
- `searchService.ts` — lab title/GSP extraction and solution search
- `markdownService.ts` — remote markdown loading and rendering
- `popupService.ts`, `optionsService.ts` — page orchestration
- `arcadeApiService.ts`, `firebaseService.ts` — remote data

### Components and Utilities

- `components/` contains DOM element factories.
- `utils/` contains reusable pure helpers.
- `types/` contains shared TypeScript models.
- `tests/` mirrors services and utilities.

## Browser APIs

Use WXT's global `browser` polyfill instead of importing Chrome-specific APIs. Keep Firefox compatibility in mind when changing manifests, content-script match patterns, and extension storage behavior.

## Multi-account Rules

- Account-specific data must be keyed by account ID.
- Never store one account's history under a global key.
- Switching accounts must update active-account state before rendering dependent UI.
- Migrations must preserve existing account data and avoid duplicate accounts.

## Security

- Treat remote markdown and API content as untrusted.
- Sanitize HTML before assigning to `innerHTML`.
- Use `textContent` for account/profile values.
- Only open validated `http:` and `https:` links.
- Do not log secrets or full API tokens.

## Environment Variables

Copy `.env.example` → `.env.local`. Key vars:

```env
WXT_API_URL=                         # GraphQL solutions API endpoint
WXT_API_KEY=                         # Publication ID for solutions API
WXT_ARCADE_POINT_URL=                # Arcade points API endpoint

# Firebase Remote Config (optional)
WXT_FIREBASE_API_KEY=
WXT_FIREBASE_PROJECT_ID=
# ... other firebase vars

# Countdown config (overridden by Firebase Remote Config at runtime)
WXT_COUNTDOWN_DEADLINE_ARCADE=YYYY-MM-DDTHH:mm:ss+05:30 # Replace with active season deadline
WXT_COUNTDOWN_ENABLED_ARCADE=true
```

## Testing

- Framework: **Vitest** with jsdom environment
- Tests live in `tests/services/` and `tests/utils/`
- Setup file `tests/setup.ts` resets fake browser state before each test
- Coverage minimum: **60%** on lines/functions/branches/statements
- DOM-heavy services (`badgeService`, `labService`, `firebaseService`, etc.) are excluded from coverage targets

## Localization

UI strings belong in `public/_locales/<locale>/messages.json`. English is the source locale. Keep placeholders and message keys consistent across translations.

## Pull Requests

- Target `dev` for normal feature and bug-fix PRs.
- Keep changes focused.
- Run `yarn compile`, `yarn test:coverage`, and the relevant production build before pushing.
- Do not edit `CHANGELOG.md` manually; release automation updates it.
